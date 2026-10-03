export async function runCommand(page, command, parameters = {}) {
    for (const step of command.steps || []) {
        switch (step.action) {
            case "navigate":
                await executeNavigate(page, step, parameters, command.parameters);
                break;

            case "wait":
                await executeWait(page, step, parameters, command.parameters);
                break;

            case "click":
                await executeClick(
                    page,
                    step,
                    parameters,
                    command.parameters
                );
                break;

            case "input":
            case "change":
                await executeInput(
                    page,
                    step,
                    parameters,
                    command.parameters
                );
                break;

            default:
                console.log(
                    `Skipping unsupported action: ${step.action}`
                );
        }
    }
}

async function executeNavigate(page, step, parameters, commandParameters) {
    if (!step.url) {
        throw new Error("Navigate action has no URL");
    }

    const url = resolveTemplateString(step.url, parameters, commandParameters);
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "domcontentloaded" });
}

async function executeWait(page, step, parameters, commandParameters) {
    const timeout = step.timeout || 10000;
    let selector = step.target?.selector || step.selector;

    if (selector) {
        selector = resolveTemplateString(selector, parameters, commandParameters);
        console.log(`Waiting for selector: ${selector}...`);
        const locator = page.locator(selector).first();
        await locator.waitFor({ state: "visible", timeout });
    } else if (step.url) {
        const url = resolveTemplateString(step.url, parameters, commandParameters);
        console.log(`Waiting for URL: ${url}...`);
        await page.waitForURL(url, { timeout });
    } else if (step.duration) {
        console.log(`Waiting for duration: ${step.duration}ms...`);
        await page.waitForTimeout(step.duration);
    }
}

async function executeClick(page, step, parameters, commandParameters) {
    const target = step.target;

    console.log(
        "CLICK TARGET:",
        JSON.stringify(target, null, 2)
    );

    if (!target?.selector) {
        throw new Error(
            "Click action has no selector"
        );
    }

    const selector = resolveTemplateString(target.selector, parameters, commandParameters);

    console.log(
        "Using selector:",
        selector
    );

    const locator = page.locator(selector).first();

    console.log(`Waiting for element to be visible: ${selector}`);
    await locator.waitFor({ state: "visible", timeout: 10000 });

    await locator.click();

    console.log(
        "Click successful."
    );
}

async function executeInput(
    page,
    step,
    parameters,
    commandParameters = []
) {
    const value = resolveValue(
        step.value,
        parameters,
        commandParameters
    );

    const target = step.target;

    let locator = null;

    if (target?.selector) {
        const selector = resolveTemplateString(target.selector, parameters, commandParameters);
        locator = page.locator(selector).first();
    } else if (target?.name) {
        locator = page.locator(`[name="${target.name}"]`).first();
    } else if (target?.placeholder) {
        locator = page.getByPlaceholder(target.placeholder).first();
    } else if (target?.ariaLabel) {
        locator = page.getByLabel(target.ariaLabel).first();
    } else {
        throw new Error("Could not find a selector for input action");
    }

    console.log("Waiting for input element to be visible...");
    await locator.waitFor({ state: "visible", timeout: 10000 });

    await locator.fill(String(value));

    console.log("Input successful.");
}

export function resolveTemplateString(str, parameters = {}, commandParameters = []) {
    if (typeof str !== "string") return str;

    return str.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, paramName) => {
        if (paramName in parameters) {
            return String(parameters[paramName]);
        }

        const cmdParam = Array.isArray(commandParameters)
            ? commandParameters.find(p => p.name === paramName)
            : null;

        if (cmdParam && cmdParam.default !== undefined) {
            return String(cmdParam.default);
        }

        return match;
    });
}

export function resolveValue(value, parameters, commandParameters = []) {
    if (typeof value !== "string") {
        return value;
    }

    const match = value.match(/^\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}$/);

    if (!match) {
        return resolveTemplateString(value, parameters, commandParameters);
    }

    const parameterName = match[1].trim();

    if (parameterName in parameters) {
        return parameters[parameterName];
    }

    const cmdParam = Array.isArray(commandParameters)
        ? commandParameters.find(p => p.name === parameterName)
        : null;

    if (cmdParam && cmdParam.default !== undefined) {
        return cmdParam.default;
    }

    throw new Error(
        `Missing parameter: ${parameterName}`
    );
}