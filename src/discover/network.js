import crypto from "crypto";
const TRACKED_METHODS = new Set([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
]);

const TRACKED_RESOURCE_TYPES = new Set([
    "xhr",
    "fetch"
]);

export function createNetworkInspector(page) {
    const requests = new Map();

    function createKey(request) {
        return [
            request.method(),
            request.url(),
            request.postData() || ""
        ].join("|");
    }

    function shouldTrack(request) {
        return (
            TRACKED_METHODS.has(request.method()) &&
            TRACKED_RESOURCE_TYPES.has(request.resourceType())
        );
    }

    function sanitizeHeaders(headers) {
        const sensitiveHeaders = new Set([
            "authorization",
            "cookie",
            "set-cookie",
            "proxy-authorization",
            "x-api-key",
            "x-auth-token",
            "x-access-token"
        ]);

        return Object.fromEntries(
            Object.entries(headers).filter(
                ([key]) => !sensitiveHeaders.has(key.toLowerCase())
            )
        );
    }

    function captureRequest(request) {
        if (!shouldTrack(request)) {
            return;
        }

        const key = createKey(request);

        if (requests.has(key)) {
            return;
        }

        requests.set(key, {
            id: crypto.randomUUID(),
            method: request.method(),
            url: request.url(),
            resourceType: request.resourceType(),
            headers: sanitizeHeaders(request.headers()),
            postData: request.postData(),
            status: null,
            statusText: null,
            responseHeaders: null,
            timestamp: Date.now(),
            duration: null
        });
    }

    async function captureResponse(response) {
        const request = response.request();

        if (!shouldTrack(request)) {
            return;
        }

        const key = createKey(request);
        const entry = requests.get(key);

        if (!entry) {
            return;
        }

        entry.status = response.status();
        entry.statusText = response.statusText();
        entry.responseHeaders = sanitizeHeaders(
            await response.allHeaders()
        );
        entry.duration = Date.now() - entry.timestamp;
    }

    page.on("request", captureRequest);
    page.on("response", captureResponse);

    return {
        getRequests() {
            return Array.from(requests.values());
        },

        getByMethod(method) {
            return Array.from(requests.values()).filter(
                request =>
                    request.method === method.toUpperCase()
            );
        },

        getApiRequests() {
            return Array.from(requests.values()).filter(
                request =>
                    ["POST", "PUT", "PATCH", "DELETE"].includes(
                        request.method
                    )
            );
        },

        clear() {
            requests.clear();
        },

        stop() {
            page.off("request", captureRequest);
            page.off("response", captureResponse);
        }
    };
}