import {
  InboxProvider,
  InboxProviderContext,
  ProviderConversation,
  ProviderMessage,
  MessageSendResult,
} from '../types';
import { buildMockConversations, mockSend } from './_mock';
import { httpJson, isLiveMode } from '../http';

const TOOL_ID = 'heyreach';
const BASE = 'https://api.heyreach.io/api/public';

// HeyReach (LinkedIn) inbox/conversations. Verify endpoint/auth header and
// field mapping against current HeyReach API docs before enabling live.
async function liveFetch(apiKey: string): Promise<ProviderConversation[]> {
  const data = await httpJson<any>(`${BASE}/inbox/GetConversations`, {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey },
    body: { offset: 0, limit: 50 },
  });
  const rows: any[] = data?.items || data?.conversations || [];
  return rows.map((r: any) => ({
    externalConversationId: String(r.conversationId ?? r.id),
    contactName: r.correspondentName ?? r.leadName,
    companyName: r.companyName,
    campaignName: r.campaignName,
    status: 'New Reply',
    lastMessage: r.lastMessageText,
    lastMessageAt: r.lastMessageAt,
    unreadCount: r.unreadCount ?? 1,
    messages: (r.messages || []).map((m: any) => ({
      externalMessageId: String(m.id),
      direction: m.isFromMe ? 'outgoing' : 'incoming',
      sender: m.senderName,
      body: m.text ?? '',
      status: 'Delivered',
      sentAt: m.sentAt,
    })),
  }));
}

export const heyreachProvider: InboxProvider = {
  toolId: TOOL_ID,
  displayName: 'HeyReach',
  canSend: true,

  async fetchConversations(ctx: InboxProviderContext): Promise<ProviderConversation[]> {
    if (!isLiveMode() || !ctx.apiKey) return buildMockConversations(TOOL_ID);
    try {
      return await liveFetch(ctx.apiKey);
    } catch (err) {
      console.error('[heyreach] live fetch failed, falling back to mock:', err);
      return buildMockConversations(TOOL_ID);
    }
  },

  async fetchMessages(
    ctx: InboxProviderContext,
    externalConversationId: string,
  ): Promise<ProviderMessage[]> {
    const convo = (await this.fetchConversations(ctx)).find(
      (c) => c.externalConversationId === externalConversationId,
    );
    return convo?.messages ?? [];
  },

  async sendMessage(
    ctx: InboxProviderContext,
    externalConversationId: string,
    body: string,
  ): Promise<MessageSendResult> {
    if (!isLiveMode() || !ctx.apiKey) return mockSend(TOOL_ID);
    try {
      const data = await httpJson<any>(`${BASE}/inbox/SendMessage`, {
        method: 'POST',
        headers: { 'X-API-KEY': ctx.apiKey },
        body: { conversationId: externalConversationId, message: body },
      });
      return { success: true, externalMessageId: String(data?.messageId ?? ''), status: 'Sent' };
    } catch (err: any) {
      console.error('[heyreach] live send failed:', err);
      return { success: false, error: err?.message || 'HeyReach send failed' };
    }
  },

  parseWebhook(payload: any): ProviderConversation | null {
    if (!payload) return null;
    const convId = String(payload.conversationId ?? payload.threadId ?? '');
    if (!convId) return null;
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
