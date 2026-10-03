import express from "express";
import { WebSocketServer } from "ws";
import { execFile, spawn } from "child_process";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { listCommands, loadCommand } from "../commands/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const CLI_PATH = path.join(PROJECT_ROOT, "src", "cli", "index.js");

const app = express();

app.use(express.json());

// Enable CORS for frontend requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

const ALLOWED_COMMANDS = new Set([
    "connect",
    "open",
    "disconnect",
    "learn",
    "compile",
    "commands",
    "inspect",
    "run"
]);

// HTTP Health Check Endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        backend: "sitecmd-backend",
        wsPort: 3001,
        commands: Array.from(ALLOWED_COMMANDS)
    });
});

// HTTP Endpoint to List Learned Commands
app.get("/api/commands", async (req, res) => {
    try {
        const commands = await listCommands();
        res.json({ success: true, commands });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// HTTP Endpoint to Inspect a Specific Command
app.get("/api/commands/:name", async (req, res) => {
    try {
        const command = await loadCommand(req.params.name);
        res.json({ success: true, command });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});

const server = app.listen(3001, () => {
    console.log("Sitecmd backend running on http://localhost:3001 (WebSocket on ws://localhost:3001)");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");

    ws.send(JSON.stringify({
        type: "system",
        message: "Connected to sitecmd backend server"
    }));

    ws.on("message", (message) => {
        try {
            const payload = JSON.parse(message.toString());
            const { command, args = [] } = payload;

            if (!ALLOWED_COMMANDS.has(command)) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: `Unknown sitecmd command: ${command}`
                }));
                return;
            }

            if (!Array.isArray(args)) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Arguments must be an array"
                }));
                return;
            }

            console.log(`Executing: sitecmd ${command} ${args.join(" ")}`);

            const containerName = `sitecmd-${randomUUID()}`;
            const dockerArgs = [
                "run",
                "--rm",
                "--name",
                containerName,
                "--memory=1g",
                "--cpus=1",
                "sitecmd-engine",
                command,
                ...args
            ];

            let childProcess;
            let usedDocker = true;

            try {
                childProcess = execFile("docker", dockerArgs);
            } catch (err) {
                usedDocker = false;
                childProcess = spawn("node", [CLI_PATH, command, ...args]);
            }

            let dockerFailed = false;

            const setupProcessListeners = (proc) => {
                proc.stdout.on("data", (data) => {
                    ws.send(JSON.stringify({
                        type: "stdout",
                        data: data.toString()
                    }));
                });

                proc.stderr.on("data", (data) => {
                    ws.send(JSON.stringify({
                        type: "stderr",
                        data: data.toString()
                    }));
                });

                proc.on("close", (code) => {
                    ws.send(JSON.stringify({
                        type: "finished",
                        code: code ?? 0
                    }));
                });

                proc.on("error", (error) => {
                    if (usedDocker && !dockerFailed) {
                        dockerFailed = true;
                        console.log(`Docker execution failed (${error.message}). Falling back to local Node process...`);
                        const nodeProc = spawn("node", [CLI_PATH, command, ...args]);
                        setupProcessListeners(nodeProc);
                        return;
                    }
                    ws.send(JSON.stringify({
                        type: "error",
                        message: error.message
                    }));
                });
            };

            setupProcessListeners(childProcess);

        } catch (error) {
            ws.send(JSON.stringify({
                type: "error",
                message: "Invalid request payload format"
            }));
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});