"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INBOX_PROVIDER_IDS = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const registry_1 = require("../integrations/inbox/registry");
Object.defineProperty(exports, "INBOX_PROVIDER_IDS", { enumerable: true, get: function () { return registry_1.INBOX_PROVIDER_IDS; } });
const inbox_sync_service_1 = require("../services/inbox-sync.service");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// new prisma models aren't in the generated types until `prisma generate` runs
const db = prisma_1.prisma;
const CONVERSATION_STATUSES = [
    'New Reply',
    'Needs Response',
    'Replied',
    'AI Draft Ready',
    'Closed',
    'Failed',
];
function serializeConversation(c) {
    return {
        id: c.id,
        clientId: c.client_id,
        toolId: c.tool_id,
        sourcePlatform: c.source_platform,
        externalConversationId: c.external_conversation_id,
        contactName: c.contact_name,
        contactEmail: c.contact_email,
        companyName: c.company_name,
        campaignName: c.campaign_name,
        status: c.status,
        lastMessage: c.last_message,
        lastMessageAt: c.last_message_at,
        unreadCount: c.unread_count,
        canSend: (0, registry_1.canToolSend)(c.tool_id),
    };
}
function serializeMessage(m) {
    return {
        id: m.id,
        conversationId: m.conversation_id,
        clientId: m.client_id,
        toolId: m.tool_id,
        externalMessageId: m.external_message_id,
        direction: m.direction,
        sender: m.sender,
        recipient: m.recipient,
        body: m.body,
        status: m.status,
        sentAt: m.sent_at,
    };
}
// GET /api/clients/:clientId/inbox/conversations
router.get('/:clientId/inbox/conversations', async (req, res) => {
    const { clientId } = req.params;
    try {
        const connected = await (0, inbox_sync_service_1.getConnectedInboxProviders)(clientId);
        const conversations = await db.inboxConversation.findMany({
            where: { client_id: clientId },
            orderBy: { last_message_at: 'desc' },
        });
        res.json({
            success: true,
            hasIntegrations: connected.length > 0,
            connectedTools: connected.map((c) => c.provider.toolId),
            conversations: conversations.map(serializeConversation),
        });
    }
    catch (err) {
        console.error('[unified-inbox] list conversations error', err);
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
});
// GET /api/clients/:clientId/inbox/conversations/:conversationId/messages
router.get('/:clientId/inbox/conversations/:conversationId/messages', async (req, res) => {
    const { clientId, conversationId } = req.params;
    try {
        const conversation = await db.inboxConversation.findFirst({
            where: { id: conversationId, client_id: clientId },
        });
        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        const messages = await db.inboxConversationMessage.findMany({
            where: { conversation_id: conversationId, client_id: clientId },
            orderBy: { sent_at: 'asc' },
        });
        // mark as read on open
        if (conversation.unread_count > 0) {
            await db.inboxConversation.update({
                where: { id: conversationId },
                data: { unread_count: 0 },
            });
            conversation.unread_count = 0;
        }
        res.json({
            success: true,
            conversation: serializeConversation(conversation),
            messages: messages.map(serializeMessage),
        });
    }
    catch (err) {
        console.error('[unified-inbox] list messages error', err);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});
// POST /api/clients/:clientId/inbox/conversations/:conversationId/send
router.post('/:clientId/inbox/conversations/:conversationId/send', async (req, res) => {
    const { clientId, conversationId } = req.params;
    const { body } = req.body;
    if (!body || !body.trim()) {
        return res.status(400).json({ success: false, error: 'Message body is required' });
    }
    try {
        const conversation = await db.inboxConversation.findFirst({
            where: { id: conversationId, client_id: clientId },
        });
        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        const provider = (0, registry_1.getInboxProvider)(conversation.tool_id);
        if (!provider || !provider.canSend) {
            return res.status(400).json({
                success: false,
                error: 'Sending not supported for this source yet',
            });
        }
        // pull the decrypted credential for this tool (sending happens backend-only)
        const connected = await (0, inbox_sync_service_1.getConnectedInboxProviders)(clientId);
        const match = connected.find((c) => c.provider.toolId === conversation.tool_id);
        const ctx = {
            clientId,
            apiKey: match?.apiKey,
            accountLabel: match?.account?.account_label,
        };
        // record the outgoing message as "Sending" first
        const pending = await db.inboxConversationMessage.create({
            data: {
                conversation_id: conversationId,
                client_id: clientId,
                tool_id: conversation.tool_id,
                direction: 'outgoing',
                sender: 'you',
                recipient: conversation.contact_email || conversation.contact_name,
                body: body.trim(),
                status: 'Sending',
            },
        });
        try {
            const result = await provider.sendMessage(ctx, conversation.external_conversation_id, body.trim());
            if (!result.success) {
                await db.inboxConversationMessage.update({
                    where: { id: pending.id },
                    data: { status: 'Failed' },
                });
                console.error(`[unified-inbox] send failed via ${conversation.tool_id}:`, result.error);
                return res.status(502).json({
                    success: false,
                    error: result.error || 'Failed to send reply',
                    message: serializeMessage({ ...pending, status: 'Failed' }),
                });
            }
            const updated = await db.inboxConversationMessage.update({
                where: { id: pending.id },
                data: {
                    status: result.status || 'Sent',
                    external_message_id: result.externalMessageId,
                },
            });
            await db.inboxConversation.update({
                where: { id: conversationId },
                data: {
                    last_message: body.trim(),
                    last_message_at: new Date(),
                    status: 'Replied',
                },
            });
            res.json({ success: true, message: serializeMessage(updated) });
        }
        catch (sendErr) {
            await db.inboxConversationMessage.update({
                where: { id: pending.id },
                data: { status: 'Failed' },
            });
            console.error('[unified-inbox] send exception', sendErr);
            res.status(502).json({ success: false, error: 'Failed to send reply' });
        }
    }
    catch (err) {
        console.error('[unified-inbox] send error', err);
        res.status(500).json({ success: false, error: 'Failed to send reply' });
    }
});
// POST /api/clients/:clientId/inbox/sync
router.post('/:clientId/inbox/sync', async (req, res) => {
    const { clientId } = req.params;
    try {
        const result = await (0, inbox_sync_service_1.syncClientInbox)(clientId);
        res.json({ success: true, ...result });
    }
    catch (err) {
        console.error('[unified-inbox] sync error', err);
        res.status(500).json({ success: false, error: 'Failed to sync inbox' });
    }
});
// PATCH /api/clients/:clientId/inbox/conversations/:conversationId/status
router.patch('/:clientId/inbox/conversations/:conversationId/status', async (req, res) => {
    const { clientId, conversationId } = req.params;
    const { status } = req.body;
    if (!status || !CONVERSATION_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            error: `status must be one of: ${CONVERSATION_STATUSES.join(', ')}`,
        });
    }
    try {
        const existing = await db.inboxConversation.findFirst({
            where: { id: conversationId, client_id: clientId },
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }
        const updated = await db.inboxConversation.update({
            where: { id: conversationId },
            data: { status },
        });
        res.json({ success: true, conversation: serializeConversation(updated) });
    }
    catch (err) {
        console.error('[unified-inbox] update status error', err);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});
exports.default = router;
