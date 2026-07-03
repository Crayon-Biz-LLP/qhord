import { AiProvider, AiProviderConfig, AiChatRequest, AiChatResponse } from './ai-provider.interface';
import { ClaudeProvider } from './claude.provider';
import { OpenAIProvider } from './openai.provider';
import { MockProvider } from './mock.provider';
import { prisma } from '../../lib/prisma';

interface AiLogContext {
  client_id?: string;
  campaign_id?: string;
  workspace_id?: string;
  lead_id?: string;
}

export type ProviderName = 'anthropic' | 'openai' | 'google';

const PROVIDER_MAP: Record<string, new () => AiProvider> = {
  anthropic: ClaudeProvider,
  openai: OpenAIProvider,
  mock: MockProvider,
};

export class AiProviderFactory {
  private static instances = new Map<string, AiProvider>();

  private static getEffectiveProvider(): string {
    const mode = process.env.EXECUTION_MODE || 'auto';
    if (mode === 'mock') return 'mock';
    return mode === 'live' ? 'anthropic' : 'anthropic';
  }

  static getProvider(name: string): AiProvider {
    const resolved = name === 'auto' ? this.getEffectiveProvider() : name;
    const existing = this.instances.get(resolved);
    if (existing) return existing;

    const ProviderClass = PROVIDER_MAP[resolved];
    if (!ProviderClass) {
      throw new Error(`Unknown AI provider: ${resolved}. Available: ${Object.keys(PROVIDER_MAP).join(', ')}`);
    }

    const instance = new ProviderClass();
    this.instances.set(resolved, instance);
    return instance;
  }

  static async getConfig(providerName: string): Promise<AiProviderConfig> {
    if (providerName === 'mock') {
      return { apiKey: 'mock', model: 'mock' };
    }

    const dbConfig = await prisma.aiProvider.findUnique({ where: { name: providerName } });

    if (dbConfig?.api_key_encrypted) {
      return {
        apiKey: dbConfig.api_key_encrypted,
        model: dbConfig.default_model,
        baseUrl: dbConfig.base_url || undefined,
      };
    }

    const envVarMap: Record<string, string> = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      google: 'GOOGLE_API_KEY',
    };

    const envKey = envVarMap[providerName];
    const apiKey = envKey ? process.env[envKey] : undefined;

    if (!apiKey) {
      throw new Error(`${providerName.toUpperCase()}_API_KEY is not configured`);
    }

    const defaultModels: Record<string, string> = {
      anthropic: 'claude-sonnet-4-20260506',
      openai: 'gpt-4o',
      google: 'gemini-2.0-flash',
    };

    return {
      apiKey,
      model: defaultModels[providerName] || 'claude-sonnet-4-20260506',
    };
  }

  static async chat(
    providerName: string,
    request: AiChatRequest,
    configOverride?: Partial<AiProviderConfig>,
    logContext?: AiLogContext,
  ): Promise<AiChatResponse> {
    const resolvedName = providerName === 'auto' ? this.getEffectiveProvider() : providerName;
    const provider = this.getProvider(resolvedName);
    const config = { ...(await this.getConfig(resolvedName)), ...configOverride };
    const start = Date.now();
    try {
      const response = await provider.chat(request, config);
      const latency = Date.now() - start;

      // Log AI execution
      if (prisma) {
        prisma.aiExecutionLog.create({
          data: {
            provider_id: resolvedName === 'mock' ? 'mock' : (await this.getProviderId(resolvedName)),
            model: config.model,
            prompt: request.system ? `${request.system}\n\n${request.messages.map(m => `${m.role}: ${m.content}`).join('\n')}` : request.messages.map(m => `${m.role}: ${m.content}`).join('\n'),
            response: response.content.substring(0, 2000),
            input_tokens: response.usage?.inputTokens ?? null,
            output_tokens: response.usage?.outputTokens ?? null,
            latency_ms: latency,
            cost_credits: Math.ceil(latency / 100),
            status: 'success',
            client_id: logContext?.client_id ?? null,
            campaign_id: logContext?.campaign_id ?? null,
            workspace_id: logContext?.workspace_id ?? null,
            lead_id: logContext?.lead_id ?? null,
          },
        }).catch((e: Error) => console.error('Failed to log AI execution:', e.message));
      }

      return response;
    } catch (error) {
      const latency = Date.now() - start;

      // Log failed execution
      if (prisma) {
        prisma.aiExecutionLog.create({
          data: {
            provider_id: resolvedName === 'mock' ? 'mock' : (await this.getProviderId(resolvedName)),
            model: config.model,
            prompt: request.system ? `${request.system}\n\n${request.messages.map(m => `${m.role}: ${m.content}`).join('\n')}` : request.messages.map(m => `${m.role}: ${m.content}`).join('\n'),
            response: null,
            latency_ms: latency,
            status: 'failed',
            error_message: (error as Error).message,
            client_id: logContext?.client_id ?? null,
            campaign_id: logContext?.campaign_id ?? null,
            workspace_id: logContext?.workspace_id ?? null,
            lead_id: logContext?.lead_id ?? null,
          },
        }).catch((e: Error) => console.error('Failed to log AI execution:', e.message));
      }

      throw error;
    }
  }

  private static async getProviderId(name: string): Promise<string> {
    if (name === 'mock') return 'mock';
    const entry = await prisma.aiProvider.findUnique({ where: { name } });
    return entry?.id ?? 'unknown';
  }
}
