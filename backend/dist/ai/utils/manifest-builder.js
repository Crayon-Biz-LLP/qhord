"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestBuilder = void 0;
class ManifestBuilder {
    static buildFromIntent(intent, activeTools) {
        const name = this.generateCampaignName(intent);
        const description = this.generateDescription(intent);
        const steps = this.buildSteps(intent, activeTools);
        const estimated_cost = this.calculateCost(steps);
        const estimated_duration = this.calculateDuration(steps);
        return {
            name,
            description,
            estimated_cost,
            estimated_duration,
            steps
        };
    }
    static generateCampaignName(intent) {
        if (intent.campaign_name && intent.campaign_name.trim().length > 0) {
            return intent.campaign_name.trim();
        }
        const goalMap = {
            'source_leads': 'Lead Generation',
            'enrich_data': 'Data Enrichment',
            'send_emails': 'Email Outreach',
            'schedule_meetings': 'Meeting Booking',
            'crm_sync': 'CRM Integration'
        };
        const goal = goalMap[intent.goal] || 'GTM Campaign';
        const industry = intent.target.industry?.trim();
        const title = intent.target.job_titles?.[0]?.trim();
        const target = intent.target.type || 'Targeted';
        const scope = industry || title || target;
        return `${scope} ${goal} Campaign`;
    }
    static generateDescription(intent) {
        const descriptions = {
            'source_leads': `Generate ${intent.volume} high-quality leads using automated prospecting tools`,
            'enrich_data': `Enrich and verify ${intent.volume} contact records with additional data points`,
            'send_emails': `Execute personalized email campaign to ${intent.volume} prospects with automated follow-up`,
            'schedule_meetings': `Book qualified meetings with ${intent.volume} decision makers`,
            'crm_sync': `Synchronize ${intent.volume} records with CRM system for sales team`
        };
        return descriptions[intent.goal] || `Execute ${intent.goal} campaign for ${intent.volume} targets`;
    }
    static buildSteps(intent, activeTools) {
        const steps = [];
        let order = 1;
        // Source step — prefer Hunter over Apollo
        const hasSource = activeTools.includes('Apollo') || activeTools.includes('Hunter');
        const hasEnrich = activeTools.includes('Clay') || activeTools.includes('Hunter') || activeTools.includes('BetterContacts');
        const hasEmailSend = activeTools.includes('Smartlead') || activeTools.includes('Brevo');
        const hasSchedule = activeTools.includes('Calendly');
        if (intent.sequence.includes('source') && hasSource) {
            const useHunter = activeTools.includes('Hunter');
            steps.push({
                id: 'source_leads',
                order: order++,
                tool: useHunter ? 'Hunter' : 'Apollo',
                action: 'search_leads',
                params: {
                    query: this.buildSearchQuery(intent),
                    limit: intent.volume,
                    filters: this.buildFilters(intent)
                },
                dependencies: [],
                estimated_time: 5
            });
        }
        // Enrichment step
        if (intent.sequence.includes('enrich') && hasEnrich) {
            const deps = steps.length > 0 ? [steps[steps.length - 1].id] : [];
            const useBC = activeTools.includes('BetterContacts');
            steps.push({
                id: 'enrich_data',
                order: order++,
                tool: useBC ? 'BetterContacts' : 'Clay',
                action: 'enrich_contacts',
                params: {
                    enrichment_fields: ['company', 'title', 'email', 'phone'],
                    verification: true
                },
                dependencies: deps,
                estimated_time: 10
            });
        }
        // Warmup delay
        if (intent.timing.warmup_days && intent.timing.warmup_days > 0) {
            const deps = steps.length > 0 ? [steps[steps.length - 1].id] : [];
            steps.push({
                id: 'warmup_delay',
                order: order++,
                tool: 'System',
                action: 'wait',
                params: {
                    days: intent.timing.warmup_days,
                    reason: 'Email warmup to improve deliverability'
                },
                dependencies: deps,
                estimated_time: intent.timing.warmup_days * 24 * 60
            });
        }
        // Send/delivery step
        if (intent.sequence.includes('send') || intent.sequence.includes('deliver')) {
            const deps = steps.length > 0 ? [steps[steps.length - 1].id] : [];
            if (hasEmailSend) {
                steps.push({
                    id: 'send_emails',
                    order: order++,
                    tool: 'Brevo',
                    action: 'send_campaign',
                    params: {
                        subject: 'Personalized B2B Outreach',
                        template: 'professional_outreach',
                        schedule: intent.timing.send_schedule || 'business_hours',
                    },
                    dependencies: deps,
                    estimated_time: 30
                });
            }
            else if (activeTools.includes('HeyReach')) {
                steps.push({
                    id: 'linkedin_outreach',
                    order: order++,
                    tool: 'HeyReach',
                    action: 'send_connection_requests',
                    params: {
                        message_template: 'professional_introduction',
                        follow_up_enabled: true
                    },
                    dependencies: deps,
                    estimated_time: 25
                });
            }
        }
        // Schedule meeting step
        if (intent.sequence.includes('schedule') && hasSchedule) {
            const deps = steps.length > 0 ? [steps[steps.length - 1].id] : [];
            steps.push({
                id: 'schedule_meeting',
                order: order++,
                tool: 'Calendly',
                action: 'create_scheduling_link',
                params: {
                    max_event_count: 1,
                },
                dependencies: deps,
                estimated_time: 2
            });
        }
        return steps;
    }
    static buildSearchQuery(intent) {
        const parts = [];
        if (intent.target.type)
            parts.push(intent.target.type);
        if (intent.target.industry)
            parts.push(intent.target.industry);
        if (intent.target.job_titles && intent.target.job_titles.length > 0) {
            parts.push(intent.target.job_titles.join(' OR '));
        }
        if (intent.target.company_size)
            parts.push(intent.target.company_size);
        return parts.join(' ') || 'B2B decision makers';
    }
    static buildFilters(intent) {
        const filters = {};
        if (intent.target.job_titles && intent.target.job_titles.length > 0) {
            filters.titles = intent.target.job_titles;
        }
        if (intent.target.industry) {
            filters.industry = intent.target.industry;
        }
        if (intent.target.company_size) {
            filters.company_size = intent.target.company_size;
        }
        return filters;
    }
    static calculateCost(steps) {
        let totalCost = 0;
        const costMap = {
            'Apollo': { 'search_leads': 0.05 },
            'Hunter': { 'search_leads': 0.01 },
            'Clay': { 'enrich_contacts': 0.02 },
            'BetterContacts': { 'enrich_contacts': 0.01 },
            'Smartlead': { 'send_campaign': 0.10 },
            'Brevo': { 'send_campaign': 0.02 },
            'HeyReach': { 'add_leads_to_campaign': 0.15, 'send_message': 0.10 },
            'Instantly': { 'create_campaign': 0.05, 'add_leads': 0.03 },
            'HubSpot': { 'create_contact': 0.02, 'create_deal': 0.02 },
            'Salesforce': { 'create_lead': 0.02, 'create_opportunity': 0.02 },
            'Calendly': { 'create_scheduling_link': 0.00 }
        };
        for (const step of steps) {
            const toolCosts = costMap[step.tool];
            if (toolCosts && toolCosts[step.action]) {
                // Estimate based on volume (would be passed in real implementation)
                totalCost += toolCosts[step.action] * 100; // Assume 100 for estimation
            }
        }
        return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
    }
    static calculateDuration(steps) {
        return steps.reduce((total, step) => total + step.estimated_time, 0);
    }
}
exports.ManifestBuilder = ManifestBuilder;
