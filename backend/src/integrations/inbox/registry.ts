import { InboxProvider } from './types';
import { smartleadProvider } from './providers/smartlead.provider';
import { instantlyProvider } from './providers/instantly.provider';
import { heyreachProvider } from './providers/heyreach.provider';
import { hubspotProvider } from './providers/hubspot.provider';

// Registry of inbox providers, keyed by tool id (matches ClientToolAccount.tool_name).
// Add a new tool by implementing InboxProvider and registering it here — no UI/route changes.
const PROVIDERS: InboxProvider[] = [
  smartleadProvider,
  instantlyProvider,
  heyreachProvider,
  hubspotProvider,
];

const registry = new Map<string, InboxProvider>(
  PROVIDERS.map((p) => [p.toolId.toLowerCase(), p]),
);

/** Tools that have an inbox provider implemented. */
export const INBOX_PROVIDER_IDS = PROVIDERS.map((p) => p.toolId);

/** Resolve a provider by tool id, or null if that tool has no inbox support yet. */
export function getInboxProvider(toolId: string): InboxProvider | null {
  if (!toolId) return null;
  return registry.get(toolId.toLowerCase()) ?? null;
}

/** True if the tool has a provider AND it supports sending replies. */
export function canToolSend(toolId: string): boolean {
  const provider = getInboxProvider(toolId);
  return !!provider && provider.canSend;
}
