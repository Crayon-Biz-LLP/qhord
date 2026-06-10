import {
  InboxProvider,
  InboxProviderContext,
  ProviderConversation,
  ProviderMessage,
  MessageSendResult,
} from '../types';
import { buildMockConversations, mockSend } from './_mock';
import { httpJson, isLiveMode } from '../http';

const TOOL_ID = 'instantly';
const BASE = 'https://api.instantly.ai/api/v2';

// Verify endpoints/fields against the current Instantly v2 API before enabling live.
async function liveFetch(apiKey: string): Promise<ProviderConversation[]> {
  const data = await httpJson<any>(`${BASE}/emails`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    query: { limit: 50 },
  });
  const rows: any[] = data?.items || data?.data || [];
  const byConvo = new Map<string, ProviderConversation>();
  for (const r of rows) {
    const convId = String(r.thread_id ?? r.conversation_id ?? r.lead ?? r.id);
    if (!byConvo.has(convId)) {
      byConvo.set(convId, {
        externalConversationId: convId,
        contactName: r.lead_name,
        contactEmail: r.lead ?? r.to_address,
        campaignName: r.campaign_name,
        status: 'New Reply',
        lastMessage: r.body_text ?? r.body ?? r.subject,
        lastMessageAt: r.timestamp_created ?? r.created_at,
        unreadCount: 1,
        messages: [],
      });
    }
    byConvo.get(convId)!.messages!.push({
      externalMessageId: String(r.id),
      direction: r.message_type === 'sent' ? 'outgoing' : 'incoming',
      sender: r.from_address ?? r.lead,
      recipient: r.to_address,
      body: r.body_text ?? r.body ?? '',
      status: 'Delivered',
      sentAt: r.timestamp_created ?? r.created_at,
    });
  }
  return [...byConvo.values()];
}

export const instantlyProvider: InboxProvider = {
  toolId: TOOL_ID,
  displayName: 'Instantly',
  canSend: true,

  async fetchConversations(ctx: InboxProviderContext): Promise<ProviderConversation[]> {
    if (!isLiveMode() || !ctx.apiKey) return buildMockConversations(TOOL_ID);
    try {
      return await liveFetch(ctx.apiKey);
    } catch (err) {
      console.error('[instantly] live fetch failed, falling back to mock:', err);
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
      const data = await httpJson<any>(`${BASE}/emails/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${ctx.apiKey}` },
        body: { thread_id: externalConversationId, body: { text: body } },
      });
      return { success: true, externalMessageId: String(data?.id ?? ''), status: 'Sent' };
    } catch (err: any) {
      console.error('[instantly] live send failed:', err);
      return { success: false, error: err?.message || 'Instantly send failed' };
    }
  },

  parseWebhook(payload: any): ProviderConversation | null {
    if (!payload) return null;
    const convId = String(payload.thread_id ?? payload.conversation_id ?? payload.lead ?? '');
    if (!convId) return null;
    return {
      externalConversationId: convId,
      contactName: payload.lead_name,
      contactEmail: payload.lead ?? payload.from_address,
      campaignName: payload.campaign_name,
      status: 'New Reply',
      lastMessage: payload.body_text ?? payload.body ?? payload.message,
      lastMessageAt: payload.timestamp ?? payload.created_at,
      unreadCount: 1,
      messages: [
        {
          externalMessageId: String(payload.id ?? `${convId}-${Date.now()}`),
          direction: 'incoming',
          sender: payload.from_address ?? payload.lead,
          body: payload.body_text ?? payload.body ?? payload.message ?? '',
          status: 'Read',
          sentAt: payload.timestamp ?? payload.created_at,
        },
      ],
    };
  },
};
