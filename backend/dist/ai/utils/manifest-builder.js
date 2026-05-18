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
        const goalMap = {
            'source_leads': 'Lead Generation',
            'enrich_data': 'Data Enrichment',
            'send_emails': 'Email Outreach',
            'schedule_meetings': 'Meeting Booking',
            'crm_sync': 'CRM Integration'
        };
        const goal = goalMap[intent.goal] || 'GTM Campaign';
        const volume = intent.volume > 0 ? `${intent.volume} ` : '';
        const target = intent.target.type || 'Targeted';
        return `${target} ${goal} Campaign`;
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
        // Source step (if needed)
        if (intent.sequence.includes('source') && activeTools.includes('Apollo')) {
            steps.push({
                id: 'source_leads',
                order: order++,
                tool: 'Apollo',
                action: 'search_people',
                params: {
                    query: this.buildSearchQuery(intent),
                    limit: intent.volume,
                    filters: this.buildFilters(intent)
                },
                dependencies: [],
                estimated_time: 5
            });
        }
        // Enrichment step (if needed)
        if (intent.sequence.includes('enrich') && activeTools.includes('Clay')) {
            const deps = steps.length > 0 ? [steps[steps.length - 1].id] : [];
            steps.push({
                id: 'enrich_data',
                order: order++,
                tool: 'Clay',
                action: 'enrich_contacts',
                params: {
                    enrichment_fields: ['company', 'title', 'email', 'phone'],
                    verification: true
                },
                dependencies: deps,
                estimated_time: 10
            });
        }
        // Warmup delay (if specified)
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
                estimated_time: intent.timing.warmup_days * 24 * 60 // Convert days to minutes
            });
        }
        // Delivery step
        if (intent.sequence.includes('send') || intent.sequence.includes('deliver')) {
            const deps = steps.length > 0 ? [steps[steps.length - 1].id] : [];
            if (activeTools.includes('Smartlead')) {
                steps.push({
                    id: 'send_emails',
                    order: order++,
                    tool: 'Smartlead',
                    action: 'send_campaign',
                    params: {
                        subject: 'Personalized B2B Outreach',
                        template: 'professional_outreach',
                        schedule: intent.timing.send_schedule || 'business_hours',
                        follow_up_sequence: true
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
            'Apollo': { 'search_people': 0.05 }, // $0.05 per lead
            'Clay': { 'enrich_contacts': 0.02 }, // $0.02 per contact
            'Smartlead': { 'send_campaign': 0.10 }, // $0.10 per email
            'HeyReach': { 'send_connection_requests': 0.15 } // $0.15 per connection
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
