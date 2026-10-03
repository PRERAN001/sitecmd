import { extractParameters, extractParameterName, isSameTarget } from "./extractor.js";

export function compileRecording(recording, options = {}) {
    const actions = (recording.actions || []).map(action => ({
        ...action,
        target: action.target
            ? { ...action.target }
            : action.target
    }));

    const {
        parameters,
        actions: parameterizedActions
    } = extractParameters(actions);

    const rawSteps = parameterizedActions.map((action) => {
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
            const paramName = action._parameterName || findParameterName(parameters, action);

            if (paramName) {
                return {
                    action: action.type,
                    target: action.target,
                    value: `{{${paramName}}}`
                };
            }

            return {
                action: action.type,
                target: action.target,
                value: action.target?.value ?? ""
            };
        }

        return {
            action: action.type,
            target: action.target
        };
    });

    const steps = [];

    for (const step of rawSteps) {
        if (
            steps.length > 0 &&
            (step.action === "input" || step.action === "change") &&
            (
                steps[steps.length - 1].action === "input" ||
                steps[steps.length - 1].action === "change"
            )
        ) {
            const prevTarget = steps[steps.length - 1].target;
            const currentTarget = step.target;

            if (isSameTarget(prevTarget, currentTarget)) {
                steps[steps.length - 1] = step;
                continue;
            }
        }

        steps.push(step);
    }

    const commandName =
        options.name || generateCommandName(recording);

    return {
        name: commandName,
        site: recording.site,
        parameters,
        steps
    };
}

function findParameterName(parameters, action) {
    if (!action.target) return null;

    const name = extractParameterName(action.target);
    if (!name) return null;

    const param = parameters.find(p => p.name === name);
    return param ? param.name : null;
}

function generateCommandName(recording) {
    return "learned_command";
}