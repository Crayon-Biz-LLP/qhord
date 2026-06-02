"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartToolMatcher = void 0;
const tool_registry_1 = require("./tool-registry");
class SmartToolMatcher {
    static analyzeUserIntent(userInput) {
        const input = userInput.toLowerCase();
        // Extract primary goal
        const primary_goal = this.extractPrimaryGoal(input);
        // Extract target audience
        const target_audience = this.extractTargetAudience(input);
        // Extract volume
        const volume = this.extractVolume(input);
        // Extract channels
        const channels = this.extractChannels(input);
        // Determine tools needed
        const tools_needed = this.determineToolsNeeded(primary_goal, channels);
        // Get recommended sequence
        const recommended_sequence = this.getRecommendedSequence(tools_needed, primary_goal);
        // Get alternatives
        const alternative_sequences = this.getAlternativeSequences(tools_needed, primary_goal);
        // Calculate total cost
        const total_cost = this.calculateTotalCost(recommended_sequence);
        return {
            primary_goal,
            target_audience,
            volume,
            channels,
            tools_needed,
            recommended_sequence,
            alternative_sequences,
            total_cost
        };
    }
    static extractPrimaryGoal(input) {
        const goal_patterns = {
            'generate leads': /\b(generate|find|source|get).*leads?\b/,
            'send emails': /\b(send|email|campaign|outreach)\b/,
            'enrich data': /\b(enrich|verify|validate|append)\b/,
            'send sms': /\b(sms|text|message)\b/,
            'book meetings': /\b(meetings|calls|appointments)\b/,
            'nurture leads': /\b(nurture|followup|sequence)\b/
        };
        for (const [goal, pattern] of Object.entries(goal_patterns)) {
            if (pattern.test(input)) {
                return goal;
            }
        }
        return 'generate leads'; // Default
    }
    static extractTargetAudience(input) {
        const audience_patterns = {
            'SaaS founders': /\b(saas|startup|founder|entrepreneur)\b/,
            'Marketing directors': /\b(marketing|cmo|director)\b/,
            'Sales managers': /\b(sales|manager|vp sales)\b/,
            'HR professionals': /\b(hr|human resources|recruiter)\b/,
            'Executives': /\b(executive|c-level|ceo|cto|cfo)\b/,
            'Developers': /\b(developer|engineer|programmer|tech)\b/
        };
        for (const [audience, pattern] of Object.entries(audience_patterns)) {
            if (pattern.test(input)) {
                return audience;
            }
        }
        return 'General business';
    }
    static extractVolume(input) {
        const volume_patterns = [
            { pattern: /\b(\d+)\s*(leads?|contacts?|people)\b/, multiplier: 1 },
            { pattern: /\b(\d+)\s*k\b/, multiplier: 1000 },
            { pattern: /\b(\d+)\s*m\b/, multiplier: 1000000 }
        ];
        for (const { pattern, multiplier } of volume_patterns) {
            const match = input.match(pattern);
            if (match) {
                return parseInt(match[1]) * multiplier;
            }
        }
        return 100; // Default
    }
    static extractChannels(input) {
        const channels = [];
        if (/\b(email|mail|outreach)\b/.test(input))
            channels.push('email');
        if (/\b(sms|text|message)\b/.test(input))
            channels.push('sms');
        if (/\b(linkedin|social)\b/.test(input))
            channels.push('social');
        if (/\b(call|phone)\b/.test(input))
            channels.push('call');
        return channels.length > 0 ? channels : ['email']; // Default
    }
    static determineToolsNeeded(goal, channels) {
        const tools = new Set();
        // Always need lead generation
        tools.add('Apollo');
        // Add tools based on goal
        if (goal.includes('enrich')) {
            tools.add('Clay');
        }
        // Add tools based on channels
        if (channels.includes('email')) {
            tools.add('Smartlead');
        }
        if (channels.includes('sms')) {
            tools.add('HeyReach');
        }
        return Array.from(tools);
    }
    static getRecommendedSequence(tools, goal) {
        // Find best matching sequence
        const availableSequences = tool_registry_1.TOOL_SEQUENCES.filter(seq => seq.tools.every(tool => tools.includes(tool)));
        // Score sequences based on goal match
        let bestSequence = availableSequences[0];
        let bestScore = 0;
        availableSequences.forEach(sequence => {
            let score = 0;
            const useCase = sequence.use_case.toLowerCase();
            const goalLower = goal.toLowerCase();
            if (goalLower.includes('email') && useCase.includes('email'))
                score += 3;
            if (goalLower.includes('sms') && useCase.includes('sms'))
                score += 3;
            if (goalLower.includes('enrich') && useCase.includes('enrich'))
                score += 3;
            if (goalLower.includes('multi') && useCase.includes('multi'))
                score += 3;
            if (goalLower.includes('lead') && useCase.includes('lead'))
                score += 2;
            if (score > bestScore) {
                bestScore = score;
                bestSequence = sequence;
            }
        });
        return bestSequence || this.createDefaultSequence(tools, goal);
    }
    static getAlternativeSequences(tools, goal) {
        const alternatives = tool_registry_1.TOOL_SEQUENCES.filter(seq => seq.tools.every(tool => tools.includes(tool)) && seq.name !== this.getRecommendedSequence(tools, goal).name);
        return alternatives.slice(0, 2); // Return top 2 alternatives
    }
    static createDefaultSequence(tools, goal) {
        const actions = [];
        tools.forEach(tool => {
            const toolCap = tool_registry_1.TOOL_REGISTRY[tool];
            if (toolCap) {
                actions.push(toolCap.actions[0]?.name || 'default_action');
            }
        });
        return {
            name: 'Custom Sequence',
            description: `Custom sequence for ${goal}`,
            tools,
            actions,
            total_credit_cost: tool_registry_1.ToolRegistry.calculateSequenceCost(tools),
            use_case: goal
        };
    }
    static calculateTotalCost(sequence) {
        return sequence.total_credit_cost;
    }
    static matchToolsToIntent(intent, availableTools) {
        const matches = [];
        const intentLower = intent.toLowerCase();
        availableTools.forEach(toolName => {
            const tool = tool_registry_1.TOOL_REGISTRY[toolName];
            if (!tool)
                return;
            let confidence = 0;
            let reason = '';
            // Check category matches
            if (intentLower.includes('lead') && tool.category === 'Lead Generation') {
                confidence += 0.8;
                reason = 'Lead generation intent matches tool category';
            }
            if (intentLower.includes('email') && tool.category === 'Email Marketing') {
                confidence += 0.8;
                reason = 'Email intent matches tool category';
            }
            if (intentLower.includes('enrich') && tool.category === 'Data Enrichment') {
                confidence += 0.8;
                reason = 'Data enrichment intent matches tool category';
            }
            if (intentLower.includes('sms') && tool.category === 'SMS Marketing') {
                confidence += 0.8;
                reason = 'SMS intent matches tool category';
            }
            // Check action matches
            tool.actions.forEach(action => {
                if (intentLower.includes(action.name.toLowerCase())) {
                    confidence += 0.3;
                    reason = `Intent matches action: ${action.name}`;
                }
            });
            // Check tool name matches
            if (intentLower.includes(toolName.toLowerCase())) {
                confidence += 0.5;
                reason = `Intent mentions tool: ${toolName}`;
            }
            if (confidence > 0) {
                matches.push({
                    tool: toolName,
                    confidence: Math.min(confidence, 1.0),
                    reason,
                    actions: tool.actions.map(action => action.name),
                    estimated_cost: tool.credit_cost
                });
            }
        });
        return matches.sort((a, b) => b.confidence - a.confidence);
    }
    static validateToolSequence(sequence, availableTools) {
        const errors = [];
        const warnings = [];
        // Check if all tools exist
        sequence.forEach(toolName => {
            if (!tool_registry_1.TOOL_REGISTRY[toolName]) {
                errors.push(`Tool ${toolName} not found in registry`);
            }
        });
        // Check if all tools are available to user
        sequence.forEach(toolName => {
            if (!availableTools.includes(toolName)) {
                errors.push(`Tool ${toolName} not available in user account`);
            }
        });
        // Check for logical sequences
        if (sequence.includes('Smartlead') && !sequence.includes('Apollo')) {
            warnings.push('Email campaign without lead generation - consider adding Apollo');
        }
        if (sequence.includes('HeyReach') && !sequence.includes('Apollo')) {
            warnings.push('SMS campaign without lead generation - consider adding Apollo');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    static suggestOptimalSequence(intent, availableTools) {
        const analysis = this.analyzeUserIntent(intent);
        const recommended = this.getRecommendedSequence(availableTools, analysis.primary_goal);
        const alternatives = this.getAlternativeSequences(availableTools, analysis.primary_goal);
        let reasoning = `Based on your intent to ${analysis.primary_goal}`;
        if (analysis.channels.length > 0) {
            reasoning += ` using ${analysis.channels.join(' and ')}`;
        }
        reasoning += `, I recommend the "${recommended.name}" sequence which includes ${recommended.tools.join(', ')}.`;
        if (alternatives.length > 0) {
            reasoning += ` Alternatives include ${alternatives.map(alt => alt.name).join(' and ')}.`;
        }
        return {
            recommended,
            alternatives,
            reasoning
        };
    }
}
exports.SmartToolMatcher = SmartToolMatcher;
