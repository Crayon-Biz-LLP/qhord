import type { ToolName } from '../types';

/** When true, manifest steps for Apollo/Clay/Smartlead run via Hunter/Brevo instead. */
export function useFreeDemoStack(): boolean {
  const mode = (process.env.QHORD_USE_FREE_DEMO_STACK || 'auto').toLowerCase();
  if (mode === 'false' || mode === '0' || mode === 'off') return false;
  if (mode === 'true' || mode === '1' || mode === 'on') return true;
  const hunter = Boolean(process.env.HUNTER_API_KEY?.trim());
  const brevo = Boolean(process.env.BREVO_API_KEY?.trim());
  return hunter && brevo;
}

const SOURCE_ACTIONS = new Set(['search_people', 'search_leads', 'search_companies']);
const ENRICH_ACTIONS = new Set(['enrich_contacts', 'send_leads', 'run_workflow', 'enrich_person', 'bulk_people_enrich']);
const SEND_ACTIONS = new Set(['send_campaign', 'create_campaign', 'add_leads_to_campaign']);

/** Remap paid-tool manifest steps to free-stack providers when demo mode is on. */
export function mapManifestTool(tool: ToolName, action: string): ToolName {
  if (!useFreeDemoStack()) return tool;
  if (tool === 'apollo' && SOURCE_ACTIONS.has(action)) return 'hunter';
  if (tool === 'clay' && ENRICH_ACTIONS.has(action)) return 'bettercontacts';
  if (tool === 'smartlead' && SEND_ACTIONS.has(action)) return 'brevo';
  if (tool === 'heyreach' && SEND_ACTIONS.has(action)) return 'brevo';
  if (tool === 'instantly' && SEND_ACTIONS.has(action)) return 'brevo';
  return tool;
}

export function getEnvToolsForDemoStack(): string[] {
  const tools: string[] = [];
  if (process.env.HUNTER_API_KEY?.trim()) tools.push('Hunter');
  if (process.env.BREVO_API_KEY?.trim()) tools.push('Brevo');
  if (process.env.BETTERCONTACTS_API_KEY?.trim()) tools.push('BetterContacts');
  if (process.env.CALENDLY_API_KEY?.trim()) tools.push('Calendly');
  if (process.env.SMARTLEAD_API_KEY?.trim()) tools.push('Smartlead');
  if (process.env.HEYREACH_API_KEY?.trim()) tools.push('HeyReach');
  if (process.env.INSTANTLY_API_KEY?.trim()) tools.push('Instantly');
  if (process.env.HUBSPOT_API_KEY?.trim()) tools.push('HubSpot');
  if (process.env.SALESFORCE_ACCESS_TOKEN?.trim()) tools.push('Salesforce');
  return tools;
}
