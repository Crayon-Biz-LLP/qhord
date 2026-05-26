"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyPipelineContext = emptyPipelineContext;
exports.normalizeToolName = normalizeToolName;
function emptyPipelineContext() {
    return { leads: [], metadata: {} };
}
function normalizeToolName(tool) {
    const key = tool.trim().toLowerCase();
    if (key === 'apollo')
        return 'apollo';
    if (key === 'clay')
        return 'clay';
    if (key === 'smartlead')
        return 'smartlead';
    if (key === 'heyreach')
        return 'heyreach';
    if (key === 'hunter')
        return 'hunter';
    if (key === 'brevo')
        return 'brevo';
    if (key === 'bettercontacts')
        return 'bettercontacts';
    if (key === 'calendly')
        return 'calendly';
    if (key === 'instantly')
        return 'instantly';
    if (key === 'hubspot')
        return 'hubspot';
    if (key === 'salesforce')
        return 'salesforce';
    return null;
}
