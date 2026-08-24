import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const PROFILES_DIR = path.join(PROJECT_ROOT, "data", "profiles");

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