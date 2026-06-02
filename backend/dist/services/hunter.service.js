"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HunterService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = 'https://api.hunter.io';
class HunterService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL, timeout: 60000 });
    }
    params(extra = {}) {
        return { api_key: this.apiKey, ...extra };
    }
    /** Free Discover — find companies from natural language query */
    async discover(payload) {
        const body = {};
        if (payload.query)
            body.query = payload.query;
        const res = await this.client.post('/v2/discover', body, {
            params: this.params(),
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    }
    /** Domain search — returns emails for a company domain (uses credits) */
    async domainSearch(payload) {
        const res = await this.client.get('/v2/domain-search', {
            params: this.params({
                domain: payload.domain,
                company: payload.company,
                limit: Math.min(Number(payload.limit) || 5, 10),
                type: payload.type || 'personal',
            }),
        });
        return res.data;
    }
    async verifyEmail(payload) {
        const res = await this.client.get('/v2/email-verifier', {
            params: this.params({ email: payload.email }),
        });
        return res.data;
    }
    /**
     * Pipeline source: Discover companies → domain-search for emails.
     * Tuned for Hunter free plan (low domain/email caps).
     */
    async searchLeads(payload) {
        const query = String(payload.query || 'SaaS companies in the United States').trim();
        const maxDomains = Math.min(Number(payload.max_domains) || Number(process.env.HUNTER_MAX_DOMAINS) || 5, 10);
        const perDomain = Math.min(Number(payload.emails_per_domain) || 2, 5);
        const targetLeads = Math.min(Number(payload.limit) || 10, 25);
        const discoverRes = await this.discover({ query });
        const companies = discoverRes?.data || [];
        const domains = [];
        for (const row of companies) {
            if (domains.length >= maxDomains)
                break;
            const r = row;
            const domain = r.domain || '';
            if (domain && !domains.includes(domain))
                domains.push(domain);
        }
        const leads = [];
        const domainResults = [];
        for (const domain of domains) {
            if (leads.length >= targetLeads)
                break;
            try {
                const ds = await this.domainSearch({ domain, limit: perDomain, type: 'personal' });
                domainResults.push(ds);
                const emails = ds?.data?.emails || [];
                for (const em of emails) {
                    if (leads.length >= targetLeads)
                        break;
                    const e = em;
                    const email = e.value;
                    if (!email)
                        continue;
                    const parts = String(e.first_name || '').trim();
                    leads.push({
                        email,
                        first_name: e.first_name || parts || 'Contact',
                        last_name: e.last_name || '',
                        title: e.position || e.title,
                        company_name: ds?.data?.organization || domain,
                        linkedin_url: e.linkedin,
                        industry: undefined,
                        domain,
                        source: 'hunter',
                    });
                }
            }
            catch (err) {
                domainResults.push({ domain, error: err.message });
            }
        }
        return {
            provider: 'hunter',
            query,
            domains_searched: domains.length,
            leads,
            people: leads,
            total: leads.length,
            discover_meta: discoverRes?.meta,
            domain_results: domainResults,
        };
    }
    /** Verify emails on leads already in pipeline (Clay substitute) */
    async verifyEmails(payload) {
        const list = (payload.emails || []).slice(0, Math.min(Number(payload.max) || 10, 20));
        const results = [];
        const verified = [];
        for (const email of list) {
            if (!email)
                continue;
            try {
                const res = await this.verifyEmail({ email });
                results.push(res);
                const status = res?.data?.status;
                verified.push({
                    email,
                    status,
                    score: res?.data?.score,
                    verified: status === 'valid' || status === 'accept_all',
                });
            }
            catch (err) {
                results.push({ email, error: err.message });
            }
        }
        return {
            provider: 'hunter',
            verified,
            enriched: verified.filter((v) => v.verified).map((v) => ({
                email: v.email,
                verified: true,
            })),
            results,
        };
    }
}
exports.HunterService = HunterService;
