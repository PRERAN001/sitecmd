import { chromium } from "playwright";
import {
    initializeSessionStore,
    getProfilePath
} from "../session/store.js";
import { getProfileId } from "../utils/url.js";

export async function connectToWebsite(url) {
    await initializeSessionStore();

    const profileId = getProfileId(url);
    const profilePath = getProfilePath(profileId);

    console.log("\nStarting browser...");
    console.log(`Profile: ${profileId}\n`);

    const context = await chromium.launchPersistentContext(
        profilePath,
        {
            channel: "chrome",
            headless: false,
            viewport: null
        }
    );

    const pages = context.pages();

    const page = pages.length
        ? pages[0]
        : await context.newPage();

    await page.goto(url.toString(), {
        waitUntil: "domcontentloaded"
    });

    console.log("Browser opened.");
    console.log("Log in to the website manually.");
    console.log("Complete MFA/CAPTCHA if required.");
    console.log("\nPress ENTER after you are logged in.\n");

    return {
        context,
        page
    };
}

export async function openWebsite(url) {
    await initializeSessionStore();

    const profileId = getProfileId(url);
    const profilePath = getProfilePath(profileId);

    console.log(`\nUsing profile: ${profileId}`);

    const context = await chromium.launchPersistentContext(
        profilePath,
        {
            channel: "chrome",
            headless: false,
            viewport: null
        }
    );

    const pages = context.pages();

    const page = pages.length
        ? pages[0]
        : await context.newPage();

    await page.goto(url.toString(), {
        waitUntil: "domcontentloaded"
    });

    console.log(`Opened ${url}`);

    return {
        context,
        page
    };
}