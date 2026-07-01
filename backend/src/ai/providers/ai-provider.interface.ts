export interface AiProviderConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AiChatRequest {
  messages: AiChatMessage[];
  system?: string;
  tools?: AiToolDefinition[];
  maxTokens?: number;
  temperature?: number;
}

export interface AiToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface AiChatResponse {
  content: string;
  toolCalls: AiToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AiProvider {
  readonly name: string;
  chat(request: AiChatRequest, config: AiProviderConfig): Promise<AiChatResponse>;
}
