"use strict";
// Minimal HTTP helper for inbox providers (Node 18+ global fetch).
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.httpJson = httpJson;
exports.isLiveMode = isLiveMode;
class HttpError extends Error {
    constructor(status, body, message) {
        super(message || `HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}
exports.HttpError = HttpError;
async function httpJson(url, opts = {}) {
    const u = new URL(url);
    if (opts.query) {
        for (const [k, v] of Object.entries(opts.query)) {
            if (v !== undefined)
                u.searchParams.set(k, String(v));
        }
    }
    const res = await fetch(u.toString(), {
        method: opts.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(opts.headers || {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const text = await res.text();
    let parsed = undefined;
    try {
        parsed = text ? JSON.parse(text) : undefined;
    }
    catch {
        parsed = text;
    }
    if (!res.ok) {
        throw new HttpError(res.status, parsed, `Request to ${u.pathname} failed (${res.status})`);
    }
    return parsed;
}
/**
 * Live mode is OFF by default so dev/demo stays on deterministic mock data.
 * Set INBOX_LIVE=true (and provide real API keys) to hit real provider APIs.
 */
function isLiveMode() {
    return process.env.INBOX_LIVE === 'true';
}
