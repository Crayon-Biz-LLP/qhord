"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockLeads = generateMockLeads;
exports.extractLeadsFromResponse = extractLeadsFromResponse;
exports.leadsToClayRows = leadsToClayRows;
exports.leadsToSmartleadList = leadsToSmartleadList;
exports.leadsToBetterContacts = leadsToBetterContacts;
exports.leadsToBrevoContacts = leadsToBrevoContacts;
exports.mergePipelineContext = mergePipelineContext;
function generateMockLeads(count, seed) {
    const titles = seed?.titles?.length ? seed.titles : ['Founder', 'CEO', 'VP Sales'];
    const industry = seed?.industry || 'SaaS';
    const leads = [];
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
function extractLeadsFromResponse(tool, action, response) {
    if (!response || typeof response !== 'object')
        return [];
    const data = response;
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
        const inner = nested;
        if (Array.isArray(inner.people))
            return normalizeLeadArray(inner.people);
        if (Array.isArray(inner.contacts))
            return normalizeLeadArray(inner.contacts);
    }
    if (tool === 'clay' && Array.isArray(data.enriched)) {
        return normalizeLeadArray(data.enriched);
    }
    if (action === 'search_leads' && data.mode === 'mock' && data.payload) {
        const limit = data.payload.limit;
        const n = typeof limit === 'number' ? limit : 10;
        const query = String(data.payload.query || '');
        return generateMockLeads(Math.min(n, 100), { industry: query.slice(0, 40) || 'B2B' });
    }
    return [];
}
function normalizeLeadArray(rows) {
    return rows
        .map((row) => normalizeOneLead(row))
        .filter((l) => Boolean(l && (l.email || l.linkedin_url)));
}
function normalizeOneLead(row) {
    if (!row || typeof row !== 'object')
        return null;
    const r = row;
    const org = r.organization && typeof r.organization === 'object'
        ? r.organization
        : null;
    const primaryEmail = r.primary_email && typeof r.primary_email === 'object'
        ? r.primary_email
        : null;
    const email = r.email ||
        r.email_address ||
        r.work_email ||
        primaryEmail?.email ||
        r.corporate_email ||
        '';
    const linkedin_url = r.linkedin_url ||
        r.linkedinUrl ||
        undefined;
    if (!email && !linkedin_url)
        return null;
    const first = r.first_name ||
        r.firstName ||
        r.first_name_obfuscated ||
        'Contact';
    const last = r.last_name ||
        r.lastName ||
        r.last_name_obfuscated ||
        '';
    return {
        first_name: first,
        last_name: last,
        email,
        company_name: r.company_name ||
            r.companyName ||
            r.organization_name ||
            org?.name ||
            undefined,
        title: r.title || r.job_title || undefined,
        linkedin_url,
        industry: r.industry || undefined,
    };
}
function leadsToClayRows(leads) {
    return leads.map((l) => ({
        first_name: l.first_name,
        last_name: l.last_name,
        email: l.email,
        company: l.company_name,
        title: l.title,
        linkedin_url: l.linkedin_url,
    }));
}
function leadsToSmartleadList(leads) {
    return leads.map((l) => ({
        first_name: l.first_name,
        last_name: l.last_name,
        email: l.email,
        company_name: l.company_name || 'Unknown',
        title: l.title,
    }));
}
function leadsToBetterContacts(leads) {
    return leads.map((l) => ({
        first_name: l.first_name,
        last_name: l.last_name,
        company: l.company_name || undefined,
        linkedin_url: l.linkedin_url,
    }));
}
function leadsToBrevoContacts(leads) {
    return leads
        .filter((l) => l.email)
        .map((l) => ({
        email: l.email,
        firstName: l.first_name,
        lastName: l.last_name,
    }));
}
function mergePipelineContext(ctx, tool, action, response) {
    const extracted = extractLeadsFromResponse(tool, action, response);
    const next = {
        ...ctx,
        leads: extracted.length > 0 ? extracted : ctx.leads,
        metadata: { ...ctx.metadata, lastTool: tool, lastAction: action },
    };
    if (response && typeof response === 'object') {
        const data = response;
        if (data.campaign_id != null) {
            next.campaignId = data.campaign_id;
        }
        if (data.id != null && tool === 'smartlead' && action === 'create_campaign') {
            next.campaignId = data.id;
        }
        if (data.job_id) {
            next.clayJobId = String(data.job_id);
        }
        if (tool === 'brevo' && data.list_id != null) {
            next.metadata = { ...next.metadata, brevoListId: data.list_id };
        }
        if (tool === 'brevo' && (data.campaign_id != null || data.id != null)) {
            const cid = data.campaign_id ?? data.id;
            next.campaignId = cid;
            next.metadata = { ...next.metadata, brevoCampaignId: cid };
        }
        if (tool === 'calendly') {
            const resource = data.resource;
            if (resource?.uri) {
                next.metadata = { ...next.metadata, calendlyUserUri: resource.uri };
            }
            const link = data.scheduling_link;
            if (link?.booking_url) {
                next.metadata = { ...next.metadata, calendlyBookingUrl: link.booking_url };
            }
        }
        if (tool === 'bettercontacts' && data.request_id) {
            next.metadata = { ...next.metadata, bettercontactsRequestId: data.request_id };
        }
    }
    return next;
}
