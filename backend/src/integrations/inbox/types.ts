// Unified Inbox — common provider adapter contract.
// Every tool (Smartlead, Instantly, HeyReach, HubSpot, …) implements this
// so the inbox route never hardcodes tool-specific logic.

export type MessageDirection = 'incoming' | 'outgoing';

// Message status options (spec): Draft | Sending | Sent | Delivered | Read | Failed
export type MessageStatus = 'Draft' | 'Sending' | 'Sent' | 'Delivered' | 'Read' | 'Failed';

// Conversation status options (spec):
// New Reply | Needs Response | Replied | AI Draft Ready | Closed | Failed
export type ConversationStatus =
  | 'New Reply'
  | 'Needs Response'
  | 'Replied'
  | 'AI Draft Ready'
  | 'Closed'
  | 'Failed';

// Normalized message coming back from a provider.
export interface ProviderMessage {
  externalMessageId: string;
  direction: MessageDirection;
  sender?: string;
  recipient?: string;
  body: string;
  status?: MessageStatus;
  sentAt?: string; // ISO timestamp
}

// Normalized conversation coming back from a provider.
export interface ProviderConversation {
  externalConversationId: string;
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  campaignName?: string;
  status?: ConversationStatus;
  lastMessage?: string;
  lastMessageAt?: string; // ISO timestamp
  unreadCount?: number;
  // Phase 1 mock providers seed the thread alongside the conversation.
  messages?: ProviderMessage[];
}

export interface MessageSendResult {
  success: boolean;
  externalMessageId?: string;
  status?: MessageStatus;
  error?: string;
}

// Per-call context. Credentials are decrypted from the client's encrypted
// integration record and passed in — providers never read the DB directly.
export interface InboxProviderContext {
  clientId: string;
  apiKey?: string;
  accountLabel?: string;
}

export interface InboxProvider {
  /** Stable tool id, e.g. "smartlead". Matches ClientToolAccount.tool_name. */
  readonly toolId: string;
  /** Human-friendly platform name shown in the UI. */
  readonly displayName: string;
  /** Whether replies can be sent back through this platform yet. */
  readonly canSend: boolean;

  fetchConversations(ctx: InboxProviderContext): Promise<ProviderConversation[]>;
  fetchMessages(
    ctx: InboxProviderContext,
    externalConversationId: string,
  ): Promise<ProviderMessage[]>;
  sendMessage(
    ctx: InboxProviderContext,
    externalConversationId: string,
    body: string,
  ): Promise<MessageSendResult>;

  /**
   * Optional: normalize an inbound webhook payload into a conversation (with its
   * new message). Return null if the payload isn't a relevant reply event.
   */
  parseWebhook?(
    payload: any,
    headers?: Record<string, string>,
  ): ProviderConversation | null;
}
