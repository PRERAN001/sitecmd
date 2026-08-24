#!/usr/bin/env node

import { Command } from "commander";
import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
    connectToWebsite,
    openWebsite
} from "../browser/manager.js";

import {
    normalizeUrl,
    getProfileId
} from "../utils/url.js";

import {
    deleteSession,
    sessionExists
} from "../session/store.js";

import { createRecorder } from "../discover/recorder.js";
import { compileRecording } from "../commands/compiler.js";

import {
    saveCommand,
    loadCommand,
    listCommands
} from "../commands/registry.js";

import { runCommand } from "../commands/runner.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../../");

const RECORDINGS_DIR = path.join(
    PROJECT_ROOT,
    "data",
    "recordings"
);

const program = new Command();

program
    .name("sitecmd")
    .description("Turn websites into programmable tools")
    .version("0.1.0");

function waitForEnter() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("", () => {
            rl.close();
            resolve();
        });
    });
}

async function saveRecording(site, trace) {
    await fs.mkdir(RECORDINGS_DIR, {
        recursive: true
    });

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    const filename = `${site}-${timestamp}.json`;

    const filePath = path.join(
        RECORDINGS_DIR,
        filename
    );

    await fs.writeFile(
        filePath,
        JSON.stringify(trace, null, 2),
        "utf8"
    );

    return filePath;
}

program
    .command("connect")
    .argument("<url>", "Website URL")
    .description("Connect and authenticate with a website")
    .action(async (input) => {
        try {
            const url = normalizeUrl(input);

            console.log(`\nConnecting to ${url.origin}...`);

            const { context } =
                await connectToWebsite(url);

            await waitForEnter();

            console.log("\nSession saved.");

            await context.close();

            console.log("Browser closed.");
            console.log(
                `Website connected: ${url.origin}\n`
            );

        } catch (error) {
            console.error("\nConnection failed:");
            console.error(error.message);
            process.exit(1);
        }
    });

program
    .command("open")
    .argument("<url>", "Website URL")
    .description("Open a previously connected website")
    .action(async (input) => {
        try {
            const url = normalizeUrl(input);
            const profileId = getProfileId(url);

            if (!(await sessionExists(profileId))) {
                console.log(
                    `\nNo saved session for ${url.origin}`
                );

                console.log(
                    `Run: sitecmd connect ${url.origin}\n`
                );

                return;
            }

            await openWebsite(url);

            console.log("\nBrowser is running.");
            console.log(
                "Close the browser when finished.\n"
            );

        } catch (error) {
            console.error(
                "\nFailed to open website:"
            );

            console.error(error.message);

            process.exit(1);
        }
    });

program
    .command("disconnect")
    .argument("<url>", "Website URL")
    .description("Delete the saved website session")
    .action(async (input) => {
        try {
            const url = normalizeUrl(input);
            const profileId = getProfileId(url);

            if (!(await sessionExists(profileId))) {
                console.log(
                    `\nNo saved session for ${url.origin}\n`
                );

                return;
            }

            await deleteSession(profileId);

            console.log(
                `\nDisconnected from ${url.origin}`
            );

        } catch (error) {
            console.error("\nFailed:");
            console.error(error.message);
            process.exit(1);
        }
    });

program
    .command("learn")
    .argument("<url>", "Website URL")
    .description("Learn a workflow from a website")
    .action(async (input) => {
        let context;
        let recorder;

        try {
            const url = normalizeUrl(input);
            const profileId = getProfileId(url);

            if (!(await sessionExists(profileId))) {
                console.log(
                    `\nNo saved session for ${url.origin}`
                );

                console.log(
                    `Run: sitecmd connect ${url.origin}\n`
                );

                return;
            }

            console.log(
                `\nOpening ${url.origin}...`
            );

            const result = await openWebsite(url);

            context = result.context;

            const page = result.page;

            console.log(
                "Starting recorder..."
            );

            recorder = await createRecorder(page);

            console.log("\n");
            console.log(
                "===================================="
            );
            console.log(
                "           RECORDING STARTED"
            );
            console.log(
                "===================================="
            );

            console.log(
                "\nPerform the task you want sitecmd to learn."
            );

            console.log(
                "When you are finished, return to the terminal"
            );

            console.log(
                "and press ENTER.\n"
            );

            await waitForEnter();

            console.log(
                "\nStopping recorder..."
            );

            const trace = await recorder.getTrace();

            recorder.stop();

            const site = url.hostname.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );

            const recording = {
                site: url.origin,
                recordedAt: new Date().toISOString(),
                actions: trace.actions,
                network: trace.network
            };

            const filePath = await saveRecording(
                site,
                recording
            );

            console.log("\n");
            console.log(
                "===================================="
            );
            console.log(
                "          RECORDING COMPLETE"
            );
            console.log(
                "===================================="
            );

            console.log(
                `\nActions recorded: ${trace.actions.length}`
            );

            console.log(
                `Network requests: ${trace.network.length}`
            );

            console.log(
                `\nSaved to:\n${filePath}`
            );

            console.log("\nACTIONS");
            console.log(
                "------------------------------------"
            );

            

            console.log("\nNETWORK");
            console.log(
                "------------------------------------"
            );

            for (const request of trace.network) {
                console.log(
                    `${request.method.padEnd(7)} ${request.url}`
                );

                if (request.status !== null) {
                    console.log(
                        `        ${request.status} ${request.statusText}`
                    );
                }
            }

            console.log();

            await context.close();

        } catch (error) {

            if (recorder) {
                recorder.stop();
            }

            if (context) {
                await context.close();
            }

            console.error(
                "\nLearning failed:"
            );

            console.error(error.message);

            process.exit(1);
        }
    });

function promptQuestion(query) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(query, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

program
    .command("compile")
    .argument("<recording>", "Recording JSON file")
    .option("-n, --name <name>", "Name of the command")
    .description("Compile a recording into a reusable command")
    .action(async (recordingPath, options) => {
        try {
            let commandName = options.name;

            if (!commandName) {
                if (process.stdin.isTTY) {
                    commandName = await promptQuestion("Enter command name (default: learned_command): ");
                }
                if (!commandName) {
                    commandName = "learned_command";
                }
            }

            commandName = commandName
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, "_")
                .replace(/^_+|_+$/g, "");

            if (!commandName) {
                commandName = "learned_command";
            }

            const data = await fs.readFile(
                recordingPath,
                "utf8"
            );

            const recording = JSON.parse(data);

            const command =
                compileRecording(recording, { name: commandName });

            const filePath =
                await saveCommand(command);

            console.log("\nCommand compiled.");
            console.log(`Name: ${command.name}`);
            console.log(`Site: ${command.site}`);

            console.log("\nParameters:");

            for (const parameter of command.parameters) {
                const defaultStr = parameter.default !== undefined ? ` [default: ${JSON.stringify(parameter.default)}]` : "";
                console.log(
                    `  ${parameter.name} (${parameter.type})${defaultStr}`
                );
            }

            console.log(
                `\nSaved to:\n${filePath}\n`
            );

        } catch (error) {
            console.error(
                "\nCompilation failed:"
            );

            console.error(error.message);

            process.exit(1);
        }
    });

program
    .command("inspect")
    .argument("<command>", "Command name")
    .description("Inspect a learned command details, parameters, and recorded steps")
    .action(async (commandName) => {
        try {
            const learnedCommand = await loadCommand(commandName);

            console.log(`\nCommand: ${learnedCommand.name}`);
            console.log(`Site:    ${learnedCommand.site}`);

            console.log("\nParameters:");
            if (!learnedCommand.parameters || learnedCommand.parameters.length === 0) {
                console.log("  (None)");
            } else {
                for (const param of learnedCommand.parameters) {
                    const defaultStr = param.default !== undefined ? ` [default: ${JSON.stringify(param.default)}]` : "";
                    console.log(`  - ${param.name} (${param.type})${defaultStr}`);
                }
            }

            console.log(`\nSteps (${learnedCommand.steps ? learnedCommand.steps.length : 0}):`);
            if (!learnedCommand.steps || learnedCommand.steps.length === 0) {
                console.log("  (None)");
            } else {
                learnedCommand.steps.forEach((step, idx) => {
                    const num = `${idx + 1}`.padStart(2, " ");
                    if (step.action === "navigate") {
                        console.log(`  ${num}. navigate: ${step.url}`);
                    } else if (step.action === "input" || step.action === "change") {
                        const targetDesc = getStepTargetDescription(step.target);
                        console.log(`  ${num}. ${step.action}: ${targetDesc} = ${step.value}`);
                    } else if (step.action === "click") {
                        const targetDesc = getStepTargetDescription(step.target);
                        console.log(`  ${num}. click: ${targetDesc}`);
                    } else if (step.action === "wait") {
                        const targetDesc = step.target?.selector || step.selector || step.url || `${step.duration || 0}ms`;
                        console.log(`  ${num}. wait: ${targetDesc}`);
                    } else {
                        console.log(`  ${num}. ${step.action}`);
                    }
                });
            }

            console.log();

        } catch (error) {
            console.error("\nFailed to inspect command:");
            console.error(error.message);
            process.exit(1);
        }
    });

function getStepTargetDescription(target) {
    if (!target) return "(unknown target)";
    if (target.selector) return target.selector;
    if (target.name) return `[name="${target.name}"]`;
    if (target.placeholder) return `placeholder="${target.placeholder}"`;
    if (target.ariaLabel) return `aria-label="${target.ariaLabel}"`;
    if (target.id) return `#${target.id}`;
    return target.tag || "(unknown target)";
}

program
    .command("commands")
    .description("List learned commands")
    .action(async () => {
        try {
            const commands =
                await listCommands();

            if (commands.length === 0) {
                console.log(
                    "\nNo learned commands.\n"
                );

                return;
            }

            console.log("\nLearned commands");
            console.log(
                "------------------------------------"
            );

            for (const command of commands) {
                console.log(
                    `\n${command.name}`
                );

                console.log(
                    `  site: ${command.site}`
                );

                if (
                    command.parameters?.length
                ) {
                    console.log(
                        "  parameters:"
                    );

                    for (
                        const parameter
                        of command.parameters
                    ) {
                        const defaultStr = parameter.default !== undefined ? ` [default: ${JSON.stringify(parameter.default)}]` : "";
                        console.log(
                            `    - ${parameter.name} (${parameter.type})${defaultStr}`
                        );
                    }
                }
            }

            console.log();

        } catch (error) {
            console.error(
                "\nFailed to list commands:"
            );

            console.error(error.message);

            process.exit(1);
        }
    });
function parseParameter(value) {
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    if (
        value !== "" &&
        !Number.isNaN(Number(value))
    ) {
        return Number(value);
    }

    return value;
}
program
    .command("run")
    .argument("<command>", "Command name")
    .allowUnknownOption()
    .allowExcessArguments()
    .description("Run a learned command")
    .action(async (commandName, options, command) => {
        let context;

        try {
            const learnedCommand =
                await loadCommand(commandName);

            const args = command.args;

            const parameters = {};

            for (let i = 1; i < args.length; i++) {
                const arg = args[i];

                if (!arg.startsWith("--")) {
                    continue;
                }

                const key = arg
                    .slice(2)
                    .replace(/-([a-z])/g, (_, char) =>
                        char.toUpperCase()
                    );

                const value = args[i + 1];

                if (
                    value === undefined ||
                    value.startsWith("--")
                ) {
                    throw new Error(
                        `Missing value for --${key}`
                    );
                }

                parameters[key] = parseParameter(
                    value
                );
            }

            const url =
                normalizeUrl(learnedCommand.site);

            const profileId =
                getProfileId(url);

            if (
                !(await sessionExists(profileId))
            ) {
                console.log(
                    `\nNo saved session for ${url.origin}`
                );

                console.log(
                    `Run: sitecmd connect ${url.origin}\n`
                );

                return;
            }

            console.log(
                `\nRunning ${learnedCommand.name}...`
            );

            const result =
                await openWebsite(url);

            context = result.context;

            const page = result.page;

            await runCommand(
                page,
                learnedCommand,
                parameters
            );

            console.log(
                "\nCommand completed."
            );

            await context.close();

        } catch (error) {
            if (context) {
                await context.close();
            }

            console.error(
                "\nCommand failed:"
            );

            console.error(error.message);

            process.exit(1);
        }
    });
program.parseAsync();