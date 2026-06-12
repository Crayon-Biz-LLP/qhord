"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heyreachProvider = void 0;
const _mock_1 = require("./_mock");
const http_1 = require("../http");
const TOOL_ID = 'heyreach';
const BASE = 'https://api.heyreach.io/api/public';
// HeyReach (LinkedIn) inbox/conversations. Verify endpoint/auth header and
// field mapping against current HeyReach API docs before enabling live.
async function liveFetch(apiKey) {
    const data = await (0, http_1.httpJson)(`${BASE}/inbox/GetConversations`, {
        method: 'POST',
        headers: { 'X-API-KEY': apiKey },
        body: { offset: 0, limit: 50 },
    });
    const rows = data?.items || data?.conversations || [];
    return rows.map((r) => ({
        externalConversationId: String(r.conversationId ?? r.id),
        contactName: r.correspondentName ?? r.leadName,
        companyName: r.companyName,
        campaignName: r.campaignName,
        status: 'New Reply',
        lastMessage: r.lastMessageText,
        lastMessageAt: r.lastMessageAt,
        unreadCount: r.unreadCount ?? 1,
        messages: (r.messages || []).map((m) => ({
            externalMessageId: String(m.id),
            direction: m.isFromMe ? 'outgoing' : 'incoming',
            sender: m.senderName,
            body: m.text ?? '',
            status: 'Delivered',
            sentAt: m.sentAt,
        })),
    }));
}
exports.heyreachProvider = {
    toolId: TOOL_ID,
    displayName: 'HeyReach',
    canSend: true,
    async fetchConversations(ctx) {
        if (!(0, http_1.isLiveMode)() || !ctx.apiKey)
            return (0, _mock_1.buildMockConversations)(TOOL_ID);
        try {
            return await liveFetch(ctx.apiKey);
        }
        catch (err) {
            console.error('[heyreach] live fetch failed, falling back to mock:', err);
            return (0, _mock_1.buildMockConversations)(TOOL_ID);
        }
    },
    async fetchMessages(ctx, externalConversationId) {
        const convo = (await this.fetchConversations(ctx)).find((c) => c.externalConversationId === externalConversationId);
        return convo?.messages ?? [];
    },
    async sendMessage(ctx, externalConversationId, body) {
        if (!(0, http_1.isLiveMode)() || !ctx.apiKey)
            return (0, _mock_1.mockSend)(TOOL_ID);
        try {
            const data = await (0, http_1.httpJson)(`${BASE}/inbox/SendMessage`, {
                method: 'POST',
                headers: { 'X-API-KEY': ctx.apiKey },
                body: { conversationId: externalConversationId, message: body },
            });
            return { success: true, externalMessageId: String(data?.messageId ?? ''), status: 'Sent' };
        }
        catch (err) {
            console.error('[heyreach] live send failed:', err);
            return { success: false, error: err?.message || 'HeyReach send failed' };
        }
    },
    parseWebhook(payload) {
        if (!payload)
            return null;
        const convId = String(payload.conversationId ?? payload.threadId ?? '');
        if (!convId)
            return null;
        return {
            externalConversationId: convId,
            contactName: payload.correspondentName ?? payload.leadName,
            status: 'New Reply',
            lastMessage: payload.text ?? payload.message,
            lastMessageAt: payload.sentAt ?? payload.timestamp,
            unreadCount: 1,
            messages: [
                {
                    externalMessageId: String(payload.messageId ?? payload.id ?? `${convId}-${Date.now()}`),
                    direction: 'incoming',
                    sender: payload.senderName,
                    body: payload.text ?? payload.message ?? '',
                    status: 'Read',
                    sentAt: payload.sentAt ?? payload.timestamp,
                },
            ],
        };
    },
};
