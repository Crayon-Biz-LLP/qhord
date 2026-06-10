import {
  InboxProvider,
  InboxProviderContext,
  ProviderConversation,
  ProviderMessage,
  MessageSendResult,
} from '../types';
import { buildMockConversations, mockSend } from './_mock';
import { httpJson, isLiveMode } from '../http';

const TOOL_ID = 'hubspot';
const BASE = 'https://api.hubapi.com';

// Uses the HubSpot Conversations API (private-app token). Verify scopes
// (conversations.read / conversations.write) and field mapping before live use.
async function liveFetch(apiKey: string): Promise<ProviderConversation[]> {
  const threads = await httpJson<any>(`${BASE}/conversations/v3/conversations/threads`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    query: { limit: 50 },
  });
  const results: any[] = threads?.results || [];
  const conversations: ProviderConversation[] = [];

  for (const t of results) {
    const threadId = String(t.id);
    let messages: ProviderMessage[] = [];
    try {
      const msgs = await httpJson<any>(
        `${BASE}/conversations/v3/conversations/threads/${threadId}/messages`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      messages = (msgs?.results || []).map((m: any) => ({
        externalMessageId: String(m.id),
        direction: m.direction === 'OUTGOING' ? 'outgoing' : 'incoming',
        sender: m.senders?.[0]?.deliveryIdentifier?.value,
        recipient: m.recipients?.[0]?.deliveryIdentifier?.value,
        body: m.text ?? '',
        status: 'Delivered',
        sentAt: m.createdAt,
      }));
    } catch {
      /* keep conversation even if messages fail */
    }
    const last = messages[messages.length - 1];
    conversations.push({
      externalConversationId: threadId,
      contactName: t.latestMessagePreview?.split('\n')?.[0],
      status: 'New Reply',
      lastMessage: t.latestMessagePreview,
      lastMessageAt: t.latestMessageTimestamp,
      unreadCount: t.status === 'OPEN' ? 1 : 0,
      messages,
    });
    void last;
  }
  return conversations;
}

export const hubspotProvider: InboxProvider = {
  toolId: TOOL_ID,
  displayName: 'HubSpot',
  canSend: true,

  async fetchConversations(ctx: InboxProviderContext): Promise<ProviderConversation[]> {
    if (!isLiveMode() || !ctx.apiKey) return buildMockConversations(TOOL_ID);
    try {
      return await liveFetch(ctx.apiKey);
    } catch (err) {
      console.error('[hubspot] live fetch failed, falling back to mock:', err);
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
      const data = await httpJson<any>(
        `${BASE}/conversations/v3/conversations/threads/${externalConversationId}/messages`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${ctx.apiKey}` },
          body: { type: 'MESSAGE', text: body },
        },
      );
      return { success: true, externalMessageId: String(data?.id ?? ''), status: 'Sent' };
    } catch (err: any) {
      console.error('[hubspot] live send failed:', err);
      return { success: false, error: err?.message || 'HubSpot send failed' };
    }
  },

  parseWebhook(payload: any): ProviderConversation | null {
    // HubSpot conversation webhooks arrive as an array of events.
    const ev = Array.isArray(payload) ? payload[0] : payload;
    if (!ev) return null;
    const convId = String(ev.objectId ?? ev.threadId ?? '');
    if (!convId) return null;
    return {
      externalConversationId: convId,
      status: 'New Reply',
      lastMessage: ev.message?.text ?? ev.text,
      lastMessageAt: ev.occurredAt ? new Date(ev.occurredAt).toISOString() : undefined,
      unreadCount: 1,
      messages: ev.message?.text || ev.text
        ? [
            {
              externalMessageId: String(ev.messageId ?? `${convId}-${Date.now()}`),
              direction: 'incoming',
              body: ev.message?.text ?? ev.text,
              status: 'Read',
              sentAt: ev.occurredAt ? new Date(ev.occurredAt).toISOString() : undefined,
            },
          ]
        : [],
    };
  },
};
