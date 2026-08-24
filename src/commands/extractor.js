export function extractParameterName(target) {
    if (!target) {
        return "param";
    }

    const rawLabel =
        target.ariaLabel ||
        target.placeholder ||
        target.name ||
        target.text ||
        target.id ||
        "";

    const cleanText = String(rawLabel).trim();
    if (!cleanText) {
        return "param";
    }

    const lower = cleanText.toLowerCase();

    // 1. Search / Query heuristics
    if (
        lower.includes("search") ||
        lower.includes("find ") ||
        lower.includes("lookup") ||
        lower === "q" ||
        lower === "query" ||
        lower === "keywords"
    ) {
        return "query";
    }

    // 2. Address / Location heuristics
    if (
        lower.includes("address") ||
        lower.includes("street") ||
        lower.includes("delivery")
    ) {
        return "address";
    }

    if (
        lower.includes("pincode") ||
        lower.includes("pin code") ||
        lower.includes("zip") ||
        lower.includes("postal")
    ) {
        return "pincode";
    }

    if (lower.includes("city")) return "city";
    if (lower.includes("state")) return "state";
    if (lower.includes("country")) return "country";

    // 3. Quantity / Count heuristics
    if (
        lower.includes("quantity") ||
        lower.includes("qty") ||
        lower.includes("how many") ||
        lower.includes("count")
    ) {
        return "quantity";
    }

    // 4. Rating / Price heuristics
    if (lower.includes("rating") || lower.includes("stars")) {
        if (
            lower.includes("min") ||
            lower.includes("lowest") ||
            lower.includes("from")
        ) {
            return "min_rating";
        }
        if (
            lower.includes("max") ||
            lower.includes("highest") ||
            lower.includes("to")
        ) {
            return "max_rating";
        }
        return "rating";
    }

    if (
        lower.includes("price") ||
        lower.includes("cost") ||
        lower.includes("amount")
    ) {
        if (
            lower.includes("min") ||
            lower.includes("lowest") ||
            lower.includes("from")
        ) {
            return "min_price";
        }
        if (
            lower.includes("max") ||
            lower.includes("highest") ||
            lower.includes("to")
        ) {
            return "max_price";
        }
        return "price";
    }

    // 5. User details heuristics
    if (lower.includes("email") || lower.includes("e-mail")) return "email";
    if (lower.includes("username") || lower.includes("user name")) return "username";
    if (lower.includes("password") || lower.includes("passcode")) return "password";
    if (lower.includes("phone") || lower.includes("mobile")) return "phone";
    if (lower.includes("first name") || lower.includes("firstname")) return "first_name";
    if (lower.includes("last name") || lower.includes("lastname")) return "last_name";

    // 6. Generic cleaning fallback
    let sanitized = lower
        .replace(/^(enter|input|type|select|provide|write|choose|search\s+for|search)\s+/gi, "")
        .replace(/\s+(and\s+more|etc|here|please|\.\.\.)$/gi, "")
        .trim();

    if (!sanitized) {
        sanitized = lower;
    }

    let normalized = sanitized
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    normalized = normalized
        .replace(/^minimum_/, "min_")
        .replace(/^maximum_/, "max_");

    return normalized || "param";
}

export function extractParameters(actions) {
    const parameters = [];
    const paramMap = new Map();

    for (const action of actions) {
        if (
            action.type !== "input" &&
            action.type !== "change"
        ) {
            continue;
        }

        const target = action.target;
        if (!target) {
            continue;
        }

        const value = target.value;
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            continue;
        }

        const parameterName = extractParameterName(target);

        if (paramMap.has(parameterName)) {
            const existingParam = paramMap.get(parameterName);
            existingParam.default = normalizeValue(target, value);
        } else {
            const newParam = {
                name: parameterName,
                type: inferType(target, value),
                default: normalizeValue(target, value)
            };
            paramMap.set(parameterName, newParam);
            parameters.push(newParam);
        }
    }

    return parameters;
}

function inferType(target, value) {
    if (target.type === "number") {
        return "number";
    }

    if (target.type === "checkbox") {
        return "boolean";
    }

    if (
        target.type === "date" ||
        target.type === "datetime-local"
    ) {
        return "date";
    }

    if (!Number.isNaN(Number(value)) && value !== "") {
        return "number";
    }

    return "string";
}

function normalizeValue(target, value) {
    if (target.type === "number") {
        return Number(value);
    }

    if (target.type === "checkbox") {
        return Boolean(value);
    }

    if (
        !Number.isNaN(Number(value)) &&
        value !== ""
    ) {
        return Number(value);
    }

    return value;
}