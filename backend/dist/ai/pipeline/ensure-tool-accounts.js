"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncToolKeysFromEnv = syncToolKeysFromEnv;
exports.ensureToolAccountsForPipeline = ensureToolAccountsForPipeline;
exports.findToolAccount = findToolAccount;
const prisma_1 = require("../../lib/prisma");
const encryption_1 = require("../../config/encryption");
const DEFAULT_TOOLS = ['Apollo', 'Clay', 'Smartlead', 'Hunter', 'Brevo', 'BetterContacts', 'Calendly', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'];
const ENV_TOOL_KEYS = [
    { toolName: 'Apollo', envVar: 'APOLLO_API_KEY' },
    { toolName: 'Hunter', envVar: 'HUNTER_API_KEY' },
    { toolName: 'Brevo', envVar: 'BREVO_API_KEY' },
    { toolName: 'BetterContacts', envVar: 'BETTERCONTACTS_API_KEY' },
    { toolName: 'Calendly', envVar: 'CALENDLY_API_KEY' },
    { toolName: 'Smartlead', envVar: 'SMARTLEAD_API_KEY' },
    { toolName: 'HeyReach', envVar: 'HEYREACH_API_KEY' },
    { toolName: 'Instantly', envVar: 'INSTANTLY_API_KEY' },
    { toolName: 'HubSpot', envVar: 'HUBSPOT_API_KEY' },
    { toolName: 'Salesforce', envVar: 'SALESFORCE_ACCESS_TOKEN' },
];
function displayToolName(tool) {
    const map = {
        apollo: 'Apollo',
        clay: 'Clay',
        smartlead: 'Smartlead',
        heyreach: 'HeyReach',
        hunter: 'Hunter',
        brevo: 'Brevo',
        bettercontacts: 'BetterContacts',
        calendly: 'Calendly',
        instantly: 'Instantly',
        hubspot: 'HubSpot',
        salesforce: 'Salesforce',
    };
    return map[tool.trim().toLowerCase()] || tool;
}
/** Sync API keys from env into ClientToolAccount (only fills empty / auto-mock rows). */
async function syncToolKeysFromEnv(clientId, operatorId) {
    for (const { toolName, envVar } of ENV_TOOL_KEYS) {
        const apiKey = process.env[envVar]?.trim();
        if (!apiKey)
            continue;
        const existing = await prisma_1.prisma.clientToolAccount.findFirst({
            where: {
                client_id: clientId,
                tool_name: { equals: toolName, mode: 'insensitive' },
            },
        });
        const encryptedKey = (0, encryption_1.encrypt)(apiKey);
        if (existing) {
            let current = '';
            try {
                current = (0, encryption_1.decrypt)(existing.api_key_encrypted).trim();
            }
            catch {
                current = '';
            }
            if (current === apiKey)
                continue;
            const isPlaceholder = !current || existing.account_label === 'Auto (mock-ready)';
            if (!isPlaceholder)
                continue;
            await prisma_1.prisma.clientToolAccount.update({
                where: { id: existing.id },
                data: {
                    api_key_encrypted: encryptedKey,
                    account_label: 'Live (from env)',
                },
            });
            continue;
        }
        await prisma_1.prisma.clientToolAccount.create({
            data: {
                client_id: clientId,
                tool_name: toolName,
                account_label: 'Live (from env)',
                api_key_encrypted: encryptedKey,
                created_by_operator_id: operatorId,
            },
        });
    }
}
/**
 * Ensures placeholder tool accounts exist so mock/auto execution can run
 * without the user configuring API keys yet.
 */
async function ensureToolAccountsForPipeline(clientId, operatorId, tools = DEFAULT_TOOLS) {
    await syncToolKeysFromEnv(clientId, operatorId);
    const wanted = [...new Set(tools.map(displayToolName).filter(Boolean))];
    for (const toolName of wanted) {
        const existing = await prisma_1.prisma.clientToolAccount.findFirst({
            where: {
                client_id: clientId,
                tool_name: { equals: toolName, mode: 'insensitive' },
            },
        });
        if (existing)
            continue;
        await prisma_1.prisma.clientToolAccount.create({
            data: {
                client_id: clientId,
                tool_name: toolName,
                account_label: 'Auto (mock-ready)',
                api_key_encrypted: (0, encryption_1.encrypt)(''),
                created_by_operator_id: operatorId,
            },
        });
    }
}
/** Case-insensitive tool account lookup */
async function findToolAccount(clientId, toolName) {
    const accounts = await prisma_1.prisma.clientToolAccount.findMany({
        where: { client_id: clientId },
    });
    const key = toolName.toLowerCase();
    return accounts.find((a) => a.tool_name.toLowerCase() === key) ?? null;
}
