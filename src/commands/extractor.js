export function isSameTarget(t1, t2) {
    if (!t1 || !t2) return false;
    if (t1 === t2) return true;

    if (t1.selector && t2.selector && t1.selector === t2.selector) {
        return true;
    }
    if (t1.id && t2.id && t1.id === t2.id) {
        return true;
    }
    if (t1.name && t2.name && t1.name === t2.name) {
        return true;
    }
    if (
        t1.placeholder &&
        t2.placeholder &&
        t1.placeholder === t2.placeholder
    ) {
        return true;
    }
    if (
        t1.ariaLabel &&
        t2.ariaLabel &&
        t1.ariaLabel === t2.ariaLabel
    ) {
        return true;
    }
    return false;
}

export function extractParameters(actions) {
    const parameters = [];
    const targetMap = [];

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        if (
            action.type !== "input" &&
            action.type !== "change"
        ) {
            continue;
        }

        const target = action.target;
        if (!target) continue;

        const value = target.value;
        if (value === undefined || value === null || value === "") {
            continue;
        }

        let existingTargetEntry = targetMap.find(entry => isSameTarget(entry.target, target));

        if (existingTargetEntry) {
            const paramIndex = existingTargetEntry.paramIndex;
            parameters[paramIndex].default = normalizeValue(target, value);
            action._parameterName = existingTargetEntry.parameterName;

            replaceNavigationValue(
                actions,
                i,
                value,
                existingTargetEntry.parameterName
            );
            continue;
        }

        const rawName = extractRawParameterName(target);
        if (!rawName) continue;

        let parameterName = normalizeParameterName(rawName);

        let disambiguatedName = parameterName;
        let count = 2;
        while (parameters.some(p => p.name === disambiguatedName)) {
            disambiguatedName = `${parameterName}_${count++}`;
        }

        parameterName = disambiguatedName;
        action._parameterName = parameterName;

        const paramIndex = parameters.length;
        parameters.push({
            name: parameterName,
            type: inferType(target, value),
            default: normalizeValue(target, value)
        });

        targetMap.push({
            target,
            parameterName,
            paramIndex
        });

        replaceNavigationValue(
            actions,
            i,
            value,
            parameterName
        );
    }

    return {
        parameters,
        actions
    };
}

function extractRawParameterName(target) {
    if (!target) return null;

    const raw =
        target.name ||
        target.placeholder ||
        target.ariaLabel ||
        target.id;

    if (raw) return raw;

    if (target.selector) {
        const match = target.selector.match(/(?:#|\[name=["']?|\[data-testid=["']?)([a-zA-Z0-9_-]+)/);
        if (match) return match[1];
    }

    return null;
}

export function extractParameterName(target) {
    const raw = extractRawParameterName(target);
    if (!raw) return null;
    return normalizeParameterName(raw);
}

export function normalizeParameterName(value) {
    if (!value || typeof value !== "string") return "param";

    const cleanRaw = value.trim().toLowerCase();

    if (/search|find|query|lookup|seek/i.test(cleanRaw) || cleanRaw === "q") {
        return "query";
    }

    if (/address|delivery_address|street|location/i.test(cleanRaw)) {
        return "address";
    }

    if (/quantity|qty|count|amount/i.test(cleanRaw)) {
        return "quantity";
    }

    if (/rating|stars/i.test(cleanRaw)) {
        if (/min/i.test(cleanRaw)) return "min_rating";
        if (/max/i.test(cleanRaw)) return "max_rating";
        return "rating";
    }

    if (/price|cost|budget/i.test(cleanRaw)) {
        if (/max/i.test(cleanRaw)) return "max_price";
        if (/min/i.test(cleanRaw)) return "min_price";
        return "price";
    }

    if (/pincode|zip|postal/i.test(cleanRaw)) {
        return "pincode";
    }

    let normalized = cleanRaw
        .replace(/\b(enter|type|input|your|for|and|more|please|select|filter|by)\b/gi, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    if (!normalized) {
        normalized = cleanRaw
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }

    return normalized || "param";
}

function replaceNavigationValue(
    actions,
    startIndex,
    value,
    parameterName
) {
    const placeholder = `{{${parameterName}}}`;
    const valueStr = String(value);

    for (let i = startIndex + 1; i < actions.length; i++) {
        const action = actions[i];

        if (
            action.type !== "navigate" ||
            !action.url
        ) {
            continue;
        }

        try {
            const url = new URL(action.url);

            let changed = false;

            for (const [key, paramValue] of url.searchParams.entries()) {
                const decodedParam = decodeURIComponent(paramValue.replace(/\+/g, " "));
                if (paramValue === valueStr || decodedParam === valueStr) {
                    url.searchParams.set(key, placeholder);
                    changed = true;
                }
            }

            if (changed) {
                action.url = url.toString()
                    .replace(/%7B%7B/gi, "{{")
                    .replace(/%7D%7D/gi, "}}");
            }
        } catch {
            continue;
        }
    }
}

function inferType(target, value) {
    if (target.type === "number") {
        return "number";
    }

    if (target.type === "checkbox" || target.type === "radio") {
        return "boolean";
    }

    if (
        target.type === "date" ||
        target.type === "datetime-local"
    ) {
        return "date";
    }

    if (typeof value === "boolean") {
        return "boolean";
    }

    if (typeof value === "number") {
        return "number";
    }

    if (value !== "" && !Number.isNaN(Number(value)) && !isNaN(value)) {
        return "number";
    }

    return "string";
}

function normalizeValue(target, value) {
    if (target.type === "number") {
        return Number(value);
    }

    if (target.type === "checkbox" || target.type === "radio") {
        return Boolean(value);
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (
        value !== "" &&
        !Number.isNaN(Number(value)) &&
        !isNaN(value) &&
        typeof value !== "boolean"
    ) {
        return Number(value);
    }

    return value;
}