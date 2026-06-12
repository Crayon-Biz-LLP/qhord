"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectedInboxProviders = getConnectedInboxProviders;
exports.ingestConversation = ingestConversation;
exports.syncClientInbox = syncClientInbox;
exports.getClientsWithInboxIntegrations = getClientsWithInboxIntegrations;
const prisma_1 = require("../lib/prisma");
const encryption_1 = require("../config/encryption");
const registry_1 = require("../integrations/inbox/registry");
// New models aren't in the generated Prisma types until `prisma generate` runs.
const db = prisma_1.prisma;
/** Resolve a client's connected tools that have an inbox provider implemented. */
async function getConnectedInboxProviders(clientId) {
    const accounts = await prisma_1.prisma.clientToolAccount.findMany({
        where: { client_id: clientId },
    });
    const result = [];
    for (const account of accounts) {
        const provider = (0, registry_1.getInboxProvider)(account.tool_name);
        if (!provider)
            continue;
        let apiKey;
        try {
            apiKey = (0, encryption_1.decrypt)(account.api_key_encrypted);
        }
        catch {
            apiKey = undefined;
        }
        result.push({ account, provider, apiKey });
    }
    return result;
}
/**
 * Find-or-create a conversation from a normalized provider conversation,
 * then append any not-yet-stored messages. Returns how many were new.
 * Shared by manual sync, background sync, and webhook ingestion.
 */
async function ingestConversation(clientId, provider, pc) {
    let conversation = await db.inboxConversation.findFirst({
        where: {
            client_id: clientId,
            tool_id: provider.toolId,
            external_conversation_id: pc.externalConversationId,
        },
    });
    const baseData = {
        contact_name: pc.contactName ?? null,
        contact_email: pc.contactEmail ?? null,
        company_name: pc.companyName ?? null,
        campaign_name: pc.campaignName ?? null,
        last_message: pc.lastMessage ?? null,
        last_message_at: pc.lastMessageAt ? new Date(pc.lastMessageAt) : null,
    };
    let isNewConversation = false;
    if (!conversation) {
        conversation = await db.inboxConversation.create({
            data: {
                client_id: clientId,
                tool_id: provider.toolId,
                source_platform: provider.displayName,
                external_conversation_id: pc.externalConversationId,
                status: pc.status || 'New Reply',
                unread_count: pc.unreadCount ?? 0,
                ...baseData,
            },
        });
        isNewConversation = true;
    }
    else {
        conversation = await db.inboxConversation.update({
            where: { id: conversation.id },
            data: baseData,
        });
    }
    let newMessages = 0;
    for (const pm of pc.messages ?? []) {
        if (await messageExists(conversation.id, pm.externalMessageId))
            continue;
        await createMessage(clientId, conversation.id, provider.toolId, pm);
        newMessages += 1;
    }
    return { conversation, isNewConversation, newMessages };
}
async function messageExists(conversationId, externalMessageId) {
    if (!externalMessageId)
        return false;
    const existing = await db.inboxConversationMessage.findFirst({
        where: { conversation_id: conversationId, external_message_id: externalMessageId },
    });
    return !!existing;
}
async function createMessage(clientId, conversationId, toolId, pm) {
    await db.inboxConversationMessage.create({
        data: {
            conversation_id: conversationId,
            client_id: clientId,
            tool_id: toolId,
            external_message_id: pm.externalMessageId ?? null,
            direction: pm.direction,
            sender: pm.sender ?? null,
            recipient: pm.recipient ?? null,
            body: pm.body,
            status: pm.status || 'Delivered',
            sent_at: pm.sentAt ? new Date(pm.sentAt) : new Date(),
        },
    });
}
/**
 * Sync a single client's inbox across all its connected tools.
 * Logs and continues if one tool fails (one failure shouldn't block the rest).
 */
async function syncClientInbox(clientId) {
    const connected = await getConnectedInboxProviders(clientId);
    if (connected.length === 0) {
        return { hasIntegrations: false, syncedConversations: 0, newMessages: 0 };
    }
    let syncedConversations = 0;
    let newMessages = 0;
    for (const { provider, apiKey, account } of connected) {
        const ctx = {
            clientId,
            apiKey,
            accountLabel: account?.account_label,
        };
        try {
            const providerConversations = await provider.fetchConversations(ctx);
            for (const pc of providerConversations) {
                const r = await ingestConversation(clientId, provider, pc);
                if (r.isNewConversation)
                    syncedConversations += 1;
                newMessages += r.newMessages;
            }
        }
        catch (err) {
            console.error(`[inbox-sync] sync failed for tool ${provider.toolId} (client ${clientId}):`, err);
        }
    }
    return { hasIntegrations: true, syncedConversations, newMessages };
}
/** All clients that have at least one connected inbox-capable tool (for background scan). */
async function getClientsWithInboxIntegrations() {
    const accounts = await prisma_1.prisma.clientToolAccount.findMany({
        select: { client_id: true, tool_name: true },
    });
    const ids = new Set();
    for (const a of accounts) {
        if ((0, registry_1.getInboxProvider)(a.tool_name))
            ids.add(a.client_id);
    }
    return [...ids];
}
