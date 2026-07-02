"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserNode = void 0;
const llm_config_1 = require("../../utils/llm-config");
const parser_prompt_1 = require("../../prompts/parser-prompt");
class ParserNode {
    async invoke(state) {
        try {
            let intent = null;
            if (!process.env.GROQ_API_KEY) {
                console.log('[Parser] GROQ_API_KEY not configured. Using rule-based fallback parser.');
                intent = this.parseRuleBased(state.userInput);
                if (!intent) {
                    throw new Error('Rule-based parser fallback failed to extract intent');
                }
            }
            else {
                const llm = (0, llm_config_1.getLLMClient)();
                const prompt = `${parser_prompt_1.PARSER_PROMPT}\n\nUser request: "${state.userInput}"\n\nReturn only valid JSON:`;
                const response = await llm.invoke(prompt);
                // Extract JSON from the response
                const content = response.content;
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No valid JSON found in LLM response');
                }
                intent = this.normalizeIntent(JSON.parse(jsonMatch[0]));
            }
            // Validate the intent structure
            this.validateIntent(intent);
            return {
                intent,
                error: undefined
            };
        }
        catch (error) {
            console.error('Parser node error:', error);
            return {
                intent: undefined,
                error: `Failed to parse request: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateIntent(intent) {
        // Validate required fields
        if (!intent.goal) {
            throw new Error('Intent must have a goal');
        }
        if (!intent.target) {
            throw new Error('Intent must have a target');
        }
        if (typeof intent.volume !== "number") {
            throw new Error('Intent must have a valid volume (positive number)');
        }
        if (!Array.isArray(intent.tools) || intent.tools.length === 0) {
            throw new Error('Intent must specify at least one tool');
        }
        if (!Array.isArray(intent.sequence) || intent.sequence.length === 0) {
            throw new Error('Intent must have a sequence');
        }
        if (intent.campaign_name !== undefined && intent.campaign_name !== null && typeof intent.campaign_name !== 'string') {
            throw new Error('campaign_name must be a string or null');
        }
        // Validate goal values
        const validGoals = ['source_leads', 'enrich_data', 'send_emails', 'schedule_meetings', 'crm_sync'];
        if (!validGoals.includes(intent.goal)) {
            throw new Error(`Invalid goal: ${intent.goal}. Must be one of: ${validGoals.join(', ')}`);
        }
        // Validate target type
        if (!['B2B', 'B2C'].includes(intent.target.type)) {
            throw new Error(`Invalid target type: ${intent.target.type}. Must be B2B or B2C`);
        }
        // Validate timing
        if (intent.timing) {
            if (intent.timing.warmup_days && intent.timing.warmup_days < 0) {
                throw new Error('Warmup days cannot be negative');
            }
        }
    }
    normalizeIntent(rawIntent) {
        const normalized = {
            goal: rawIntent?.goal,
            campaign_name: rawIntent?.campaign_name ?? null,
            target: {
                type: rawIntent?.target?.type || 'B2B',
                industry: rawIntent?.target?.industry ?? null,
                job_titles: Array.isArray(rawIntent?.target?.job_titles) ? rawIntent.target.job_titles : [],
                company_size: rawIntent?.target?.company_size ?? null
            },
            volume: typeof rawIntent?.volume === 'number' && rawIntent.volume > 0 ? rawIntent.volume : 100,
            tools: Array.isArray(rawIntent?.tools) ? rawIntent.tools : [],
            sequence: Array.isArray(rawIntent?.sequence) ? rawIntent.sequence : [],
            timing: {
                warmup_days: rawIntent?.timing?.warmup_days,
                send_schedule: rawIntent?.timing?.send_schedule ?? null
            }
        };
        return normalized;
    }
    parseRuleBased(prompt) {
        try {
            // Determine tools
            const toolsMatch = prompt.match(/Use these tools:\s*([^\.]+)/i);
            let tools = [];
            if (toolsMatch) {
                tools = toolsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
            }
            else {
                // Fallback detection by keywords
                if (prompt.toLowerCase().includes('apollo'))
                    tools.push('Apollo');
                if (prompt.toLowerCase().includes('clay'))
                    tools.push('Clay');
                if (prompt.toLowerCase().includes('smartlead'))
                    tools.push('Smartlead');
                if (prompt.toLowerCase().includes('brevo'))
                    tools.push('Brevo');
                if (prompt.toLowerCase().includes('hunter'))
                    tools.push('Hunter');
                if (prompt.toLowerCase().includes('bettercontacts'))
                    tools.push('BetterContacts');
                if (prompt.toLowerCase().includes('calendly'))
                    tools.push('Calendly');
            }
            // Default tools if none found
            if (tools.length === 0) {
                tools = ['Apollo', 'Clay', 'Smartlead'];
            }
            // Determine sequence
            const sequence = [];
            if (tools.some(t => ['Apollo', 'Hunter'].includes(t)) || prompt.toLowerCase().includes('source') || prompt.toLowerCase().includes('targeting')) {
                sequence.push('source');
            }
            if (tools.some(t => ['Clay', 'BetterContacts'].includes(t)) || prompt.toLowerCase().includes('enrich')) {
                sequence.push('enrich');
            }
            if (tools.some(t => ['Smartlead', 'Brevo', 'Instantly', 'Lemlist'].includes(t)) || prompt.toLowerCase().includes('email') || prompt.toLowerCase().includes('send') || prompt.toLowerCase().includes('outreach')) {
                sequence.push('send');
            }
            if (tools.includes('Calendly') || prompt.toLowerCase().includes('schedule')) {
                sequence.push('schedule');
            }
            // Determine goal
            let goal = 'send_emails';
            if (sequence.includes('send')) {
                goal = 'send_emails';
            }
            else if (sequence.includes('source') && !sequence.includes('enrich')) {
                goal = 'source_leads';
            }
            else if (sequence.includes('enrich')) {
                goal = 'enrich_data';
            }
            else if (sequence.includes('schedule')) {
                goal = 'schedule_meetings';
            }
            // Target details
            const titlesMatch = prompt.match(/targeting\s*"([^"]+)"/i);
            const job_titles = titlesMatch ? [titlesMatch[1]] : [];
            const industryMatch = prompt.match(/in\s+([a-zA-Z0-9\s]+?)(?:\s*\(|\.|$)/i);
            const industry = industryMatch ? industryMatch[1].trim() : undefined;
            // Warmup
            const warmupMatch = prompt.match(/Warm\s+up\s+over\s+(\d+)\s+days/i);
            const warmup_days = warmupMatch ? parseInt(warmupMatch[1], 10) : 2;
            // Campaign Name
            const campaign_name = `${industry || job_titles[0] || 'Outreach'} Campaign`;
            return {
                goal,
                campaign_name,
                target: {
                    type: 'B2B',
                    industry,
                    job_titles,
                },
                volume: 100,
                tools,
                sequence,
                timing: {
                    warmup_days,
                    send_schedule: 'business_hours'
                }
            };
        }
        catch (e) {
            console.error('[Parser] Rule-based parsing failed:', e);
            return null;
        }
    }
}
exports.ParserNode = ParserNode;
