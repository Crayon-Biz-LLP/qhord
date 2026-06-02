import type { PipelineContext, PipelineLead } from './pipeline-types';

export function generateMockLeads(count: number, seed?: { titles?: string[]; industry?: string }): PipelineLead[] {
  const titles = seed?.titles?.length ? seed.titles : ['Founder', 'CEO', 'VP Sales'];
  const industry = seed?.industry || 'SaaS';
  const leads: PipelineLead[] = [];

  for (let i = 0; i < count; i++) {
    const title = titles[i % titles.length];
    leads.push({
      first_name: `Lead${i + 1}`,
      last_name: 'Demo',
      email: `lead${i + 1}@example.com`,
      company_name: `${industry} Co ${i + 1}`,
      title,
      linkedin_url: `https://linkedin.com/in/lead${i + 1}`,
      industry,
    });
  }

  return leads;
}

/** Pull leads from Apollo / Clay / mock execution responses */
export function extractLeadsFromResponse(tool: string, action: string, response: unknown): PipelineLead[] {
  if (!response || typeof response !== 'object') return [];

  const data = response as Record<string, unknown>;

  if (Array.isArray(data.leads)) {
    return normalizeLeadArray(data.leads);
  }

  if (Array.isArray(data.people)) {
    return normalizeLeadArray(data.people);
  }

  if (Array.isArray(data.contacts)) {
    return normalizeLeadArray(data.contacts);
  }

  const nested = data.people ?? data.contacts ?? data.data;
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>;
    if (Array.isArray(inner.people)) return normalizeLeadArray(inner.people);
    if (Array.isArray(inner.contacts)) return normalizeLeadArray(inner.contacts);
  }

  if (tool === 'clay' && Array.isArray(data.enriched)) {
    return normalizeLeadArray(data.enriched);
  }

  if (action === 'search_leads' && data.mode === 'mock' && data.payload) {
    const limit = (data.payload as Record<string, unknown>).limit;
    const n = typeof limit === 'number' ? limit : 10;
    const query = String((data.payload as Record<string, unknown>).query || '');
    return generateMockLeads(Math.min(n, 100), { industry: query.slice(0, 40) || 'B2B' });
  }

  return [];
}

function normalizeLeadArray(rows: unknown[]): PipelineLead[] {
  return rows
    .map((row) => normalizeOneLead(row))
    .filter((l): l is PipelineLead => Boolean(l && (l.email || l.linkedin_url)));
}

function normalizeOneLead(row: unknown): PipelineLead | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;

  const org =
    r.organization && typeof r.organization === 'object'
      ? (r.organization as Record<string, unknown>)
      : null;

  const primaryEmail =
    r.primary_email && typeof r.primary_email === 'object'
      ? (r.primary_email as Record<string, unknown>)
      : null;

  const email =
    (r.email as string) ||
    (r.email_address as string) ||
    (r.work_email as string) ||
    (primaryEmail?.email as string) ||
    (r.corporate_email as string) ||
    '';

  const linkedin_url =
    (r.linkedin_url as string) ||
    (r.linkedinUrl as string) ||
    undefined;

  if (!email && !linkedin_url) return null;

  const first =
    (r.first_name as string) ||
    (r.firstName as string) ||
    (r.first_name_obfuscated as string) ||
    'Contact';

  const last =
    (r.last_name as string) ||
    (r.lastName as string) ||
    (r.last_name_obfuscated as string) ||
    '';

  return {
    first_name: first,
    last_name: last,
    email,
    company_name:
      (r.company_name as string) ||
      (r.companyName as string) ||
      (r.organization_name as string) ||
      (org?.name as string) ||
      undefined,
    title: (r.title as string) || (r.job_title as string) || undefined,
    linkedin_url,
    industry: (r.industry as string) || undefined,
  };
}

export function leadsToClayRows(leads: PipelineLead[]): Record<string, unknown>[] {
  return leads.map((l) => ({
    first_name: l.first_name,
    last_name: l.last_name,
    email: l.email,
    company: l.company_name,
    title: l.title,
    linkedin_url: l.linkedin_url,
  }));
}

export function leadsToSmartleadList(leads: PipelineLead[]): Record<string, unknown>[] {
  return leads.map((l) => ({
    first_name: l.first_name,
    last_name: l.last_name,
    email: l.email,
    company_name: l.company_name || 'Unknown',
    title: l.title,
  }));
}

export function leadsToBetterContacts(leads: PipelineLead[]): Array<{
  first_name?: string;
  last_name?: string;
  company?: string;
  company_domain?: string;
  linkedin_url?: string;
}> {
  return leads.map((l) => ({
    first_name: l.first_name,
    last_name: l.last_name,
    company: l.company_name || undefined,
    linkedin_url: l.linkedin_url,
  }));
}

export function leadsToBrevoContacts(leads: PipelineLead[]): Array<{
  email: string;
  firstName?: string;
  lastName?: string;
}> {
  return leads
    .filter((l) => l.email)
    .map((l) => ({
      email: l.email,
      firstName: l.first_name,
      lastName: l.last_name,
    }));
}

export function mergePipelineContext(
  ctx: PipelineContext,
  tool: string,
  action: string,
  response: unknown
): PipelineContext {
  const extracted = extractLeadsFromResponse(tool, action, response);
  const next: PipelineContext = {
    ...ctx,
    leads: extracted.length > 0 ? extracted : ctx.leads,
    metadata: { ...ctx.metadata, lastTool: tool, lastAction: action },
  };

  if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;
    if (data.campaign_id != null) {
      next.campaignId = data.campaign_id as number | string;
    }
    if (data.id != null && tool === 'smartlead' && action === 'create_campaign') {
      next.campaignId = data.id as number | string;
    }
    if (data.job_id) {
      next.clayJobId = String(data.job_id);
    }
    if (tool === 'brevo' && data.list_id != null) {
      next.metadata = { ...next.metadata, brevoListId: data.list_id };
    }
    if (tool === 'brevo' && (data.campaign_id != null || data.id != null)) {
      const cid = data.campaign_id ?? data.id;
      next.campaignId = cid as number | string;
      next.metadata = { ...next.metadata, brevoCampaignId: cid };
    }
    if (tool === 'calendly') {
      const resource = data.resource as Record<string, unknown> | undefined;
      if (resource?.uri) {
        next.metadata = { ...next.metadata, calendlyUserUri: resource.uri as string };
      }
      const link = data.scheduling_link as Record<string, unknown> | undefined;
      if (link?.booking_url) {
        next.metadata = { ...next.metadata, calendlyBookingUrl: link.booking_url as string };
      }
    }
    if (tool === 'bettercontacts' && data.request_id) {
      next.metadata = { ...next.metadata, bettercontactsRequestId: data.request_id };
    }
  }

  return next;
}
