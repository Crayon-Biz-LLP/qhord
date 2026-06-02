import { prisma } from '../../lib/prisma';
import { encrypt, decrypt } from '../../config/encryption';

const DEFAULT_TOOLS = ['Apollo', 'Clay', 'Smartlead', 'Hunter', 'Brevo', 'BetterContacts', 'Calendly', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'];

const ENV_TOOL_KEYS: { toolName: string; envVar: string }[] = [
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

function displayToolName(tool: string): string {
  const map: Record<string, string> = {
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
export async function syncToolKeysFromEnv(clientId: string, operatorId: string): Promise<void> {
  for (const { toolName, envVar } of ENV_TOOL_KEYS) {
    const apiKey = process.env[envVar]?.trim();
    if (!apiKey) continue;

    const existing = await prisma.clientToolAccount.findFirst({
      where: {
        client_id: clientId,
        tool_name: { equals: toolName, mode: 'insensitive' },
      },
    });

    const encryptedKey = encrypt(apiKey);

    if (existing) {
      let current = '';
      try {
        current = decrypt(existing.api_key_encrypted).trim();
      } catch {
        current = '';
      }
      if (current === apiKey) continue;
      const isPlaceholder =
        !current || existing.account_label === 'Auto (mock-ready)';
      if (!isPlaceholder) continue;

      await prisma.clientToolAccount.update({
        where: { id: existing.id },
        data: {
          api_key_encrypted: encryptedKey,
          account_label: 'Live (from env)',
        },
      });
      continue;
    }

    await prisma.clientToolAccount.create({
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
export async function ensureToolAccountsForPipeline(
  clientId: string,
  operatorId: string,
  tools: string[] = DEFAULT_TOOLS
): Promise<void> {
  await syncToolKeysFromEnv(clientId, operatorId);

  const wanted = [...new Set(tools.map(displayToolName).filter(Boolean))];

  for (const toolName of wanted) {
    const existing = await prisma.clientToolAccount.findFirst({
      where: {
        client_id: clientId,
        tool_name: { equals: toolName, mode: 'insensitive' },
      },
    });

    if (existing) continue;

    await prisma.clientToolAccount.create({
      data: {
        client_id: clientId,
        tool_name: toolName,
        account_label: 'Auto (mock-ready)',
        api_key_encrypted: encrypt(''),
        created_by_operator_id: operatorId,
      },
    });
  }
}

/** Case-insensitive tool account lookup */
export async function findToolAccount(clientId: string, toolName: string) {
  const accounts = await prisma.clientToolAccount.findMany({
    where: { client_id: clientId },
  });
  const key = toolName.toLowerCase();
  return accounts.find((a) => a.tool_name.toLowerCase() === key) ?? null;
}
