"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLMClient = exports.getLLMConfig = void 0;
const groq_1 = require("@langchain/groq");
const getLLMConfig = () => {
    const provider = (process.env.LLM_PROVIDER || 'groq');
    return {
        provider,
        groq: {
            apiKey: process.env.GROQ_API_KEY || '',
            model: 'llama-3.3-70b-versatile'
        },
        openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            model: 'gpt-4'
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY || '',
            model: 'gemini-pro'
        },
        azure: {
            apiKey: process.env.AZURE_API_KEY || '',
            model: 'gpt-4',
            endpoint: process.env.AZURE_ENDPOINT || ''
        }
    };
};
exports.getLLMConfig = getLLMConfig;
const getLLMClient = () => {
    const config = (0, exports.getLLMConfig)();
    switch (config.provider) {
        case 'groq':
            if (!config.groq?.apiKey) {
                throw new Error('GROQ_API_KEY not configured');
            }
            return new groq_1.ChatGroq({
                apiKey: config.groq.apiKey,
                model: config.groq.model,
                temperature: 0.1, // Low temperature for consistent results
                maxTokens: 2000
            });
        case 'openai':
            // Would implement OpenAI client here
            throw new Error('OpenAI provider not implemented yet');
        case 'gemini':
            // Would implement Gemini client here
            throw new Error('Gemini provider not implemented yet');
        case 'azure':
            // Would implement Azure client here
            throw new Error('Azure provider not implemented yet');
        default:
            throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
};
exports.getLLMClient = getLLMClient;
