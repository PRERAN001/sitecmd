import fs from "fs/promises";
import path from "path";
import os from "os";

const PROFILES_DIR = path.join(os.homedir(), ".sitecmd", "profiles");

export async function initializeSessionStore() {
    await fs.mkdir(PROFILES_DIR, {
        recursive: true
    });
}

export function getProfilePath(profileId) {
    return path.join(PROFILES_DIR, profileId);
}

export async function sessionExists(profileId) {
    try {
        await fs.access(getProfilePath(profileId));
        return true;
    } catch {
        return false;
    }
}

export async function deleteSession(profileId) {
    await fs.rm(getProfilePath(profileId), {
        recursive: true,
        force: true
    });
}