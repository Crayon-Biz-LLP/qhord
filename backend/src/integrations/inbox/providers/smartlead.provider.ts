import {
  InboxProvider,
  InboxProviderContext,
  ProviderConversation,
  ProviderMessage,
  MessageSendResult,
} from '../types';
import { buildMockConversations, mockSend } from './_mock';
import { httpJson, isLiveMode } from '../http';

const TOOL_ID = 'smartlead';
const BASE = 'https://server.smartlead.ai/api/v1';

// NOTE (Phase 2): Smartlead delivers replies primarily via webhooks (see
// inbox-webhooks route + parseWebhook below). The REST pull below is a
// best-effort fallback — verify the exact endpoint/fields against current
// Smartlead API docs before enabling INBOX_LIVE in production.
async function liveFetch(apiKey: string): Promise<ProviderConversation[]> {
  const data = await httpJson<any>(`${BASE}/master-inbox/messages`, {
    query: { api_key: apiKey },
  });
  const rows: any[] = data?.data || data?.messages || [];
  const byConvo = new Map<string, ProviderConversation>();
  for (const r of rows) {
    const convId = String(r.conversation_id ?? r.thread_id ?? r.lead_id ?? r.id);
    if (!byConvo.has(convId)) {
      byConvo.set(convId, {
        externalConversationId: convId,
        contactName: r.lead_name ?? r.to_name,
        contactEmail: r.lead_email ?? r.to_email,
        companyName: r.company_name,
        campaignName: r.campaign_name,
        status: 'New Reply',
        lastMessage: r.body ?? r.message,
        lastMessageAt: r.time ?? r.created_at,
        unreadCount: 1,
        messages: [],
      });
    }
    byConvo.get(convId)!.messages!.push({
      externalMessageId: String(r.message_id ?? r.id),
      direction: r.type === 'SENT' ? 'outgoing' : 'incoming',
      sender: r.from_email ?? r.lead_email,
      recipient: r.to_email,
      body: r.body ?? r.message ?? '',
      status: 'Delivered',
      sentAt: r.time ?? r.created_at,
    });
  }
  return [...byConvo.values()];
}

export const smartleadProvider: InboxProvider = {
  toolId: TOOL_ID,
  displayName: 'Smartlead',
  canSend: true,

  async fetchConversations(ctx: InboxProviderContext): Promise<ProviderConversation[]> {
    if (!isLiveMode() || !ctx.apiKey) return buildMockConversations(TOOL_ID);
    try {
      return await liveFetch(ctx.apiKey);
    } catch (err) {
      console.error('[smartlead] live fetch failed, falling back to mock:', err);
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
      // Verify endpoint/payload against Smartlead "reply to lead" API.
      const data = await httpJson<any>(`${BASE}/master-inbox/reply`, {
        method: 'POST',
        query: { api_key: ctx.apiKey },
        body: { conversation_id: externalConversationId, body },
      });
      return {
        success: true,
        externalMessageId: String(data?.message_id ?? data?.id ?? ''),
        status: 'Sent',
      };
    } catch (err: any) {
      console.error('[smartlead] live send failed:', err);
      return { success: false, error: err?.message || 'Smartlead send failed' };
    }
  },

  parseWebhook(payload: any): ProviderConversation | null {
    // Smartlead reply webhook → normalized conversation + message.
    if (!payload) return null;
    const convId = String(payload.conversation_id ?? payload.lead_id ?? payload.stats_id ?? '');
    if (!convId) return null;
    return {
      externalConversationId: convId,
      contactName: payload.lead_name ?? payload.to_name,
      contactEmail: payload.lead_email ?? payload.from_email,
      campaignName: payload.campaign_name,
      status: 'New Reply',
      lastMessage: payload.reply_body ?? payload.body ?? payload.message,
      lastMessageAt: payload.event_timestamp ?? payload.time,
      unreadCount: 1,
      messages: [
        {
          externalMessageId: String(payload.message_id ?? payload.id ?? `${convId}-${Date.now()}`),
          direction: 'incoming',
          sender: payload.lead_email ?? payload.from_email,
          body: payload.reply_body ?? payload.body ?? payload.message ?? '',
          status: 'Read',
          sentAt: payload.event_timestamp ?? payload.time,
        },
      ],
    };
  },
};
