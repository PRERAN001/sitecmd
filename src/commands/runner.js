export async function runCommand(page, command, parameters = {}) {
    for (const step of command.steps || []) {
        switch (step.action) {
            case "navigate":
                await executeNavigate(page, step);
                break;

            case "wait":
                await executeWait(page, step);
                break;

            case "click":
                await executeClick(
                    page,
                    step,
                    parameters
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

async function executeNavigate(page, step) {
    if (!step.url) {
        throw new Error("Navigate action has no URL");
    }

    console.log(`Navigating to ${step.url}...`);
    await page.goto(step.url, { waitUntil: "domcontentloaded" });
}

async function executeWait(page, step) {
    const timeout = step.timeout || 10000;
    const selector = step.target?.selector || step.selector;

    if (selector) {
        console.log(`Waiting for selector: ${selector}...`);
        const locator = page.locator(selector).first();
        await locator.waitFor({ state: "visible", timeout });
    } else if (step.url) {
        console.log(`Waiting for URL: ${step.url}...`);
        await page.waitForURL(step.url, { timeout });
    } else if (step.duration) {
        console.log(`Waiting for duration: ${step.duration}ms...`);
        await page.waitForTimeout(step.duration);
    }
}

async function executeClick(page, step) {
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

    console.log(
        "Using selector:",
        target.selector
    );

    const locator = page.locator(
        target.selector
    ).first();

    console.log(`Waiting for element to be visible: ${target.selector}`);
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
        locator = page.locator(target.selector).first();
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

function resolveValue(value, parameters, commandParameters = []) {
    if (
        typeof value !== "string"
    ) {
        return value;
    }

    const match = value.match(
        /^\{\{(.+)\}\}$/
    );

    if (!match) {
        return value;
    }

    const parameterName =
        match[1].trim();

    if (parameterName in parameters) {
        return parameters[parameterName];
    }

    // Check if default value exists in command definition
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