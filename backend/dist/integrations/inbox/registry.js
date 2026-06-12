"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INBOX_PROVIDER_IDS = void 0;
exports.getInboxProvider = getInboxProvider;
exports.canToolSend = canToolSend;
const smartlead_provider_1 = require("./providers/smartlead.provider");
const instantly_provider_1 = require("./providers/instantly.provider");
const heyreach_provider_1 = require("./providers/heyreach.provider");
const hubspot_provider_1 = require("./providers/hubspot.provider");
// Registry of inbox providers, keyed by tool id (matches ClientToolAccount.tool_name).
// Add a new tool by implementing InboxProvider and registering it here — no UI/route changes.
const PROVIDERS = [
    smartlead_provider_1.smartleadProvider,
    instantly_provider_1.instantlyProvider,
    heyreach_provider_1.heyreachProvider,
    hubspot_provider_1.hubspotProvider,
];
const registry = new Map(PROVIDERS.map((p) => [p.toolId.toLowerCase(), p]));
/** Tools that have an inbox provider implemented. */
exports.INBOX_PROVIDER_IDS = PROVIDERS.map((p) => p.toolId);
/** Resolve a provider by tool id, or null if that tool has no inbox support yet. */
function getInboxProvider(toolId) {
    if (!toolId)
        return null;
    return registry.get(toolId.toLowerCase()) ?? null;
}
/** True if the tool has a provider AND it supports sending replies. */
function canToolSend(toolId) {
    const provider = getInboxProvider(toolId);
    return !!provider && provider.canSend;
}
