import { AiProviderFactory } from '../ai/providers/ai-provider.factory';
import { AiChatRequest, AiChatMessage } from '../ai/providers/ai-provider.interface';
import { MCP_TOOL_DEFINITIONS, McpToolSchema } from './mcp-tool-definitions';
import { McpToolTranslator, McpToolResult } from './mcp-tool-translator';

export interface McpChatRequest {
  clientId: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  provider?: string;
  model?: string;
}

export interface McpChatResponse {
  reply: string;
  toolCalls: Array<{ tool: string; args: Record<string, unknown>; result: McpToolResult }>;
}

const MCP_SYSTEM_PROMPT = 'You are an AI operations assistant integrated into the Qhord GTM platform. You can search for leads, enrich data, create campaigns, and manage outreach across connected tools. Use the available tools to fulfill the user\'s request. If a tool call fails, explain the error clearly.';

export class McpHostService {
  private translator = new McpToolTranslator();

  async chat(request: McpChatRequest): Promise<McpChatResponse> {
    const providerName = request.provider || 'auto';

    const messages: AiChatMessage[] = [
      ...(request.conversationHistory ?? []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: request.message },
    ];

    const aiRequest: AiChatRequest = {
      messages,
      system: MCP_SYSTEM_PROMPT,
      tools: MCP_TOOL_DEFINITIONS.map((t: McpToolSchema) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema as Record<string, unknown>,
      })),
      maxTokens: 4096,
    };

    const response = await AiProviderFactory.chat(providerName, aiRequest, request.model ? { model: request.model } : undefined);

    const toolCalls: McpChatResponse['toolCalls'] = [];
    for (const tc of response.toolCalls) {
      const result = await this.translator.execute(tc.name, tc.input, request.clientId);
      toolCalls.push({ tool: tc.name, args: tc.input, result });
    }

    return { reply: response.content || 'No text response.', toolCalls };
  }
}
