import fs from "fs/promises";
import path from "path";

import os from "os";



const SITECMD_DIR = path.join(os.homedir(), ".sitecmd");

const COMMANDS_DIR = path.join(
    SITECMD_DIR,
    "data",
    "commands"
);

export async function initializeCommandStore() {
    await fs.mkdir(COMMANDS_DIR, {
        recursive: true
    });
}

export async function saveCommand(command) {
    await initializeCommandStore();

    const filename = `${command.name}.json`;

    const filePath = path.join(
        COMMANDS_DIR,
        filename
    );

    await fs.writeFile(
        filePath,
        JSON.stringify(command, null, 2),
        "utf8"
    );

    return filePath;
}

export async function loadCommand(name) {
    await initializeCommandStore();

    const filePath = path.join(
        COMMANDS_DIR,
        `${name}.json`
    );

    const data = await fs.readFile(
        filePath,
        "utf8"
    );

    return JSON.parse(data);
}

export async function listCommands() {
    await initializeCommandStore();

    const files = await fs.readdir(
        COMMANDS_DIR
    );

    const commands = [];

    for (const file of files) {
        if (!file.endsWith(".json")) {
            continue;
        }

        const data = await fs.readFile(
            path.join(COMMANDS_DIR, file),
            "utf8"
        );

        commands.push(JSON.parse(data));
    }

    return commands;
}