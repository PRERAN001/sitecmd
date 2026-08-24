import { extractParameters, extractParameterName } from "./extractor.js";

export function compileRecording(recording, options = {}) {
    const parameters = extractParameters(recording.actions || []);

    const rawSteps = (recording.actions || []).map((action) => {
        if (action.type === "navigate") {
            return {
                action: "navigate",
                url: action.url
            };
        }

        if (
            action.type === "input" ||
            action.type === "change"
        ) {
            const parameter = findParameter(
                parameters,
                action
            );

            if (parameter) {
                return {
                    action: action.type,
                    target: action.target,
                    value: `{{${parameter.name}}}`
                };
            }
        }

        return {
            action: action.type,
            target: action.target
        };
    });

    // Collapse consecutive input/change steps on the same target element
    const steps = [];
    for (const step of rawSteps) {
        if (
            steps.length > 0 &&
            (step.action === "input" || step.action === "change") &&
            (steps[steps.length - 1].action === "input" || steps[steps.length - 1].action === "change")
        ) {
            const prevTarget = steps[steps.length - 1].target;
            const currentTarget = step.target;

            if (isSameTarget(prevTarget, currentTarget)) {
                // Keep the latest step for this target
                steps[steps.length - 1] = step;
                continue;
            }
        }

        steps.push(step);
    }

    const commandName = options.name || generateCommandName(recording);

    return {
        name: commandName,
        site: recording.site,
        parameters,
        steps
    };
}

function isSameTarget(t1, t2) {
    if (!t1 || !t2) return false;
    if (t1.selector && t2.selector && t1.selector === t2.selector) return true;
    if (t1.name && t2.name && t1.name === t2.name) return true;
    if (t1.id && t2.id && t1.id === t2.id) return true;
    if (t1.placeholder && t2.placeholder && t1.placeholder === t2.placeholder) return true;
    if (t1.ariaLabel && t2.ariaLabel && t1.ariaLabel === t2.ariaLabel) return true;
    return false;
}

function findParameter(parameters, action) {
    if (!action.target) return null;
    const name = extractParameterName(action.target);
    return parameters.find(parameter => parameter.name === name) || null;
}

function generateCommandName(recording) {
    return "learned_command";
}