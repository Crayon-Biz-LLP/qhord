import OpenAI from 'openai';
import { AiProvider, AiProviderConfig, AiChatRequest, AiChatResponse } from './ai-provider.interface';

export class OpenAIProvider implements AiProvider {
  readonly name = 'openai';

  async chat(request: AiChatRequest, config: AiProviderConfig): Promise<AiChatResponse> {
    const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });

    const tools = request.tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema as Record<string, unknown>,
      },
    }));

    const response = await client.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens || request.maxTokens || 4096,
      messages: [
        ...(request.system ? [{ role: 'system' as const, content: request.system }] : []),
        ...request.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      ...(tools ? { tools } : {}),
    });

    const choice = response.choices?.[0];
    const content = choice?.message?.content || '';
    const toolCalls = choice?.message?.tool_calls?.map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      input: JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>,
    })) || [];

    return {
      content,
      toolCalls,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}
