"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveManifestSteps = resolveManifestSteps;
exports.applyPipelineToPayload = applyPipelineToPayload;
const pipeline_types_1 = require("./pipeline-types");
const demo_stack_1 = require("../../config/demo-stack");
const pipeline_leads_1 = require("./pipeline-leads");
/**
 * Translates LangGraph / manifest step names into ExecutionEngine actions.
 * When QHORD_USE_FREE_DEMO_STACK is on, Apollo/Clay/Smartlead map to Hunter/Brevo.
 */
function resolveManifestSteps(steps) {
    const sorted = [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const resolved = [];
    for (const step of sorted) {
        resolved.push(...resolveOneStep(step));
    }
    return resolved;
}
function resolveOneStep(step) {
    const rawTool = (0, pipeline_types_1.normalizeToolName)(step.tool);
    const action = step.action;
    const params = step.params || {};
    const id = step.id;
    if (!rawTool && step.tool.toLowerCase() === 'system') {
        const days = Number(params.days) || 0;
        return [
            {
                manifestStepId: id,
                tool: 'apollo',
                action: '__wait__',
                payload: params,
                label: `Wait ${days} day(s) (warmup)`,
                skipExecution: true,
                waitMs: Math.min(days * 200, 3000),
            },
        ];
    }
    if (!rawTool) {
        return [];
    }
    const tool = (0, demo_stack_1.mapManifestTool)(rawTool, action);
    // ── Hunter (free demo source + enrich) ─────────────────
    if (tool === 'hunter') {
        if (SOURCE_ACTIONS.has(action)) {
            const filters = params.filters || {};
            const query = String(params.query || buildQueryFromFilters(filters));
            return [
                {
                    manifestStepId: id,
                    tool: 'hunter',
                    action: 'search_leads',
                    payload: {
                        query,
                        limit: params.limit ?? 10,
                        max_domains: params.max_domains,
                    },
                    label: 'Hunter — discover & find emails',
                },
            ];
        }
        if (ENRICH_ACTIONS.has(action)) {
            return [
                {
                    manifestStepId: id,
                    tool: 'hunter',
                    action: 'verify_emails',
                    payload: { _from_pipeline: true, max: params.limit || 10 },
                    label: 'Hunter — verify emails',
                },
            ];
        }
        return [
            {
                manifestStepId: id,
                tool: 'hunter',
                action,
                payload: params,
                label: `Hunter — ${action}`,
            },
        ];
    }
    // ── Brevo (free demo send) ─────────────────────────────
    if (tool === 'brevo') {
        if (SEND_ACTIONS.has(action)) {
            const campaignName = String(params.campaign_name || params.name || params.subject || 'Qhord Outreach');
            const htmlContent = params.htmlContent || params.email_template || '';
            return [
                {
                    manifestStepId: id,
                    tool: 'brevo',
                    action: 'prepare_campaign',
                    payload: { name: campaignName, subject: params.subject, htmlContent },
                    label: 'Brevo — create list & campaign',
                },
                {
                    manifestStepId: id,
                    tool: 'brevo',
                    action: 'sync_contacts',
                    payload: { _from_pipeline: true },
                    label: 'Brevo — add contacts to list',
                },
                {
                    manifestStepId: id,
                    tool: 'brevo',
                    action: 'send_campaign_now',
                    payload: { _from_pipeline: true },
                    label: 'Brevo — send campaign',
                },
            ];
        }
        return [
            {
                manifestStepId: id,
                tool: 'brevo',
                action,
                payload: params,
                label: `Brevo — ${action}`,
            },
        ];
    }
    // ── Apollo (unchanged when not remapped) ───────────────
    if (tool === 'apollo') {
        if (SOURCE_ACTIONS.has(action)) {
            const filters = params.filters || {};
            const query = String(params.query || buildQueryFromFilters(filters));
            return [
                {
                    manifestStepId: id,
                    tool: 'apollo',
                    action: 'search_leads',
                    payload: {
                        query,
                        limit: params.limit ?? 50,
                        persona: filters.titles ? 'custom' : undefined,
                        industries: filters.industry ? String(filters.industry) : undefined,
                        ...filters,
                    },
                    label: 'Apollo — search leads',
                },
            ];
        }
        if (action === 'enrich_person' || action === 'bulk_people_enrich') {
            return [
                {
                    manifestStepId: id,
                    tool: 'apollo',
                    action: action === 'bulk_people_enrich' ? 'bulk_people_enrich' : 'enrich_person',
                    payload: params,
                    label: 'Apollo — enrich',
                },
            ];
        }
    }
    // ── Clay ─────────────────────────────────────────────
    if (tool === 'clay') {
        if (ENRICH_ACTIONS.has(action)) {
            return [
                {
                    manifestStepId: id,
                    tool: 'clay',
                    action: 'send_leads',
                    payload: {
                        workspace_id: params.workspace_id || process.env.CLAY_WORKSPACE_ID || 'mock_workspace',
                        table_id: params.table_id || process.env.CLAY_TABLE_ID || 'mock_table',
                        rows_json: '[]',
                        upsert_on: params.upsert_on || 'email',
                        _enrichment_fields: params.enrichment_fields,
                        _from_pipeline: true,
                    },
                    label: 'Clay — enrich contacts',
                },
                {
                    manifestStepId: id,
                    tool: 'clay',
                    action: 'fetch_enrichment_output',
                    payload: {
                        job_id: params.job_id || 'mock_job',
                        page: 1,
                        page_size: params.limit || 100,
                    },
                    label: 'Clay — fetch enrichment',
                },
            ];
        }
    }
    // ── Smartlead ────────────────────────────────────────
    if (tool === 'smartlead') {
        if (SEND_ACTIONS.has(action)) {
            const campaignName = String(params.campaign_name || params.name || params.subject || 'Qhord Outreach');
            return [
                {
                    manifestStepId: id,
                    tool: 'smartlead',
                    action: 'create_campaign',
                    payload: { name: campaignName },
                    label: 'Smartlead — create campaign',
                },
                {
                    manifestStepId: id,
                    tool: 'smartlead',
                    action: 'add_leads_to_campaign',
                    payload: {
                        campaign_id: params.campaign_id,
                        lead_list_json: '[]',
                        ignore_global_block_list: false,
                        ignore_unsubscribe_list: false,
                        _from_pipeline: true,
                    },
                    label: 'Smartlead — add leads',
                },
            ];
        }
        if (action === 'add_leads_to_campaign') {
            return [
                {
                    manifestStepId: id,
                    tool: 'smartlead',
                    action: 'add_leads_to_campaign',
                    payload: params,
                    label: 'Smartlead — add leads',
                },
            ];
        }
    }
    // ── BetterContacts (enrich) ──────────────────────────
    if (tool === 'bettercontacts') {
        if (ENRICH_ACTIONS.has(action)) {
            return [
                {
                    manifestStepId: id,
                    tool: 'bettercontacts',
                    action: 'enrich_contacts',
                    payload: { _from_pipeline: true, enrich_email: true, enrich_phone: false },
                    label: 'BetterContacts — enrich contacts',
                },
            ];
        }
        return [
            {
                manifestStepId: id,
                tool: 'bettercontacts',
                action,
                payload: params,
                label: `BetterContacts — ${action}`,
            },
        ];
    }
    // ── Calendly (scheduling) ────────────────────────────
    if (tool === 'calendly') {
        if (action === 'schedule_meeting' || action === 'create_scheduling_link' || action === 'share_scheduling_page') {
            return [
                {
                    manifestStepId: id,
                    tool: 'calendly',
                    action: 'create_scheduling_link',
                    payload: {
                        event_type: params.event_type,
                        max_event_count: params.max_event_count ?? 1,
                        owner: params.owner,
                    },
                    label: 'Calendly — create scheduling link',
                },
            ];
        }
        return [
            {
                manifestStepId: id,
                tool: 'calendly',
                action,
                payload: params,
                label: `Calendly — ${action}`,
            },
        ];
    }
    // ── Instantly (pass-through) ─────────────────────────
    if (tool === 'instantly') {
        return [
            {
                manifestStepId: id,
                tool: 'instantly',
                action,
                payload: params,
                label: `Instantly — ${action}`,
            },
        ];
    }
    // ── Salesforce (pass-through) ────────────────────────
    if (tool === 'salesforce') {
        return [
            {
                manifestStepId: id,
                tool: 'salesforce',
                action,
                payload: params,
                label: `Salesforce — ${action}`,
            },
        ];
    }
    // ── HubSpot (pass-through) ───────────────────────────
    if (tool === 'hubspot') {
        return [
            {
                manifestStepId: id,
                tool: 'hubspot',
                action,
                payload: params,
                label: `HubSpot — ${action}`,
            },
        ];
    }
    // ── HeyReach (pass-through) ──────────────────────────
    if (tool === 'heyreach') {
        const mapped = action === 'send_connection_requests' ? 'add_leads_to_campaign' : action;
        return [
            {
                manifestStepId: id,
                tool: 'heyreach',
                action: mapped,
                payload: params,
                label: `HeyReach — ${action}`,
            },
        ];
    }
    return [
        {
            manifestStepId: id,
            tool,
            action,
            payload: params,
            label: `${step.tool} — ${action}`,
        },
    ];
}
const SOURCE_ACTIONS = new Set(['search_people', 'search_leads', 'search_companies']);
const ENRICH_ACTIONS = new Set([
    'enrich_contacts',
    'send_leads',
    'run_workflow',
    'enrich_person',
    'bulk_people_enrich',
]);
const SEND_ACTIONS = new Set(['send_campaign', 'create_campaign', 'add_leads_to_campaign']);
const SCHEDULE_ACTIONS = new Set(['schedule_meeting', 'create_scheduling_link', 'share_scheduling_page']);
/** Inject pipeline leads into resolved step payloads */
function applyPipelineToPayload(resolved, ctx, manifestParams) {
    const payload = { ...resolved.payload };
    if (resolved.tool === 'clay' && resolved.action === 'send_leads' && payload._from_pipeline) {
        const rows = (0, pipeline_leads_1.leadsToClayRows)(ctx.leads);
        payload.rows_json = JSON.stringify(rows);
        delete payload._from_pipeline;
        delete payload._enrichment_fields;
    }
    if (resolved.tool === 'clay' && resolved.action === 'fetch_enrichment_output') {
        payload.job_id = ctx.clayJobId || payload.job_id || 'mock_job';
    }
    if (resolved.tool === 'smartlead' && resolved.action === 'add_leads_to_campaign') {
        const list = (0, pipeline_leads_1.leadsToSmartleadList)(ctx.leads);
        payload.lead_list = list;
        payload.lead_list_json = JSON.stringify(list);
        if (ctx.campaignId != null && !payload.campaign_id) {
            payload.campaign_id = ctx.campaignId;
        }
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'brevo' && resolved.action === 'sync_contacts' && payload._from_pipeline) {
        payload.list_id = ctx.metadata?.brevoListId ?? payload.list_id;
        payload.contacts = (0, pipeline_leads_1.leadsToBrevoContacts)(ctx.leads);
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'brevo' && resolved.action === 'send_campaign_now' && payload._from_pipeline) {
        payload.campaign_id = ctx.campaignId ?? ctx.metadata?.brevoCampaignId;
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'brevo' && resolved.action === 'prepare_campaign') {
        if (manifestParams.htmlContent && !payload.htmlContent) {
            payload.htmlContent = manifestParams.htmlContent;
        }
    }
    if (resolved.tool === 'hunter' && resolved.action === 'verify_emails' && payload._from_pipeline) {
        payload.emails = ctx.leads.map((l) => l.email).filter(Boolean);
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'apollo' && resolved.action === 'search_leads') {
        if (!payload.limit && manifestParams.limit) {
            payload.limit = manifestParams.limit;
        }
        if (!payload.query && manifestParams.query) {
            payload.query = manifestParams.query;
        }
    }
    if (resolved.tool === 'hunter' && resolved.action === 'search_leads') {
        if (!payload.limit && manifestParams.limit) {
            payload.limit = manifestParams.limit;
        }
        if (!payload.query && manifestParams.query) {
            payload.query = manifestParams.query;
        }
    }
    if (resolved.tool === 'bettercontacts' && resolved.action === 'enrich_contacts' && payload._from_pipeline) {
        payload.contacts = (0, pipeline_leads_1.leadsToBetterContacts)(ctx.leads);
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'instantly' && resolved.action === 'add_leads' && payload._from_pipeline) {
        payload.leads = ctx.leads.map((l) => ({
            email: l.email,
            first_name: l.first_name || '',
            last_name: l.last_name || '',
            company: l.company_name || '',
        }));
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'salesforce' && resolved.action === 'create_lead' && payload._from_pipeline) {
        const first = ctx.leads[0];
        if (first) {
            payload.properties = {
                FirstName: first.first_name || '',
                LastName: first.last_name || '',
                Company: first.company_name || '',
                Email: first.email,
                Title: first.title || '',
                LeadSource: 'Qhord',
            };
        }
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'hubspot' && resolved.action === 'create_contact' && payload._from_pipeline) {
        const first = ctx.leads[0];
        if (first) {
            payload.properties = {
                email: first.email,
                firstname: first.first_name || '',
                lastname: first.last_name || '',
                company: first.company_name || '',
                jobtitle: first.title || '',
            };
        }
        delete payload._from_pipeline;
    }
    if (resolved.tool === 'calendly' && resolved.action === 'create_scheduling_link') {
        if (!payload.owner && ctx.metadata?.calendlyUserUri) {
            payload.owner = ctx.metadata.calendlyUserUri;
        }
    }
    return payload;
}
function buildQueryFromFilters(filters) {
    const parts = [];
    if (filters.industry)
        parts.push(String(filters.industry));
    if (Array.isArray(filters.titles))
        parts.push(filters.titles.join(' OR '));
    return parts.join(' ') || 'B2B SaaS companies in the United States';
}
