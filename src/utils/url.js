import crypto from "crypto";

export function normalizeUrl(input) {
    let value = input.trim();

    if (!/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
    }

    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Only HTTP and HTTPS websites are supported");
    }

    return url;
}

export function getProfileId(url) {
    return crypto
        .createHash("sha256")
        .update(url.host)
        .digest("hex")
        .slice(0, 32);
}