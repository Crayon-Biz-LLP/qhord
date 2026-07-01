import Anthropic from '@anthropic-ai/sdk';
import { AiProvider, AiProviderConfig, AiChatRequest, AiChatResponse } from './ai-provider.interface';

export class ClaudeProvider implements AiProvider {
  readonly name = 'anthropic';

  async chat(request: AiChatRequest, config: AiProviderConfig): Promise<AiChatResponse> {
    const client = new Anthropic({ apiKey: config.apiKey, baseURL: config.baseUrl });

    const tools = request.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Messages.Tool.InputSchema,
    }));

    const response = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens || request.maxTokens || 4096,
      system: request.system,
      messages: request.messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role as 'user' | 'assistant',
        content: m.content,
      })),
      ...(tools ? { tools } : {}),
    });

    const textBlocks = response.content.filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text');
    const toolUseBlocks = response.content.filter((b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use');

    return {
      content: textBlocks.map((b) => b.text).join('\n'),
      toolCalls: toolUseBlocks.map((b) => ({
        id: b.id,
        name: b.name,
        input: b.input as Record<string, unknown>,
      })),
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      },
    };
  }
}
