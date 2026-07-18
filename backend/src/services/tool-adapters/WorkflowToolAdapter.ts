export interface ToolContext {
    workspaceId: string;
    clientAccountId: string;
    workflowRunId: string;
    recordId?: string;
}

export interface ConnectionResult {
    isValid: boolean;
    error?: string;
}

export interface ToolActionDefinition {
    id: string;
    label: string;
    description?: string;
}

export interface InputSchema {
    fields: {
        name: string;
        type: string;
        required: boolean;
    }[];
}

export interface ToolExecutionResult {
    success: boolean;
    output?: Record<string, unknown>;
    error?: string;
    retryable?: boolean;
}

export interface NormalizedToolEvent {
    eventType: string;
    correlationId: string;
    payload: Record<string, unknown>;
}

export interface WorkflowToolAdapter {
    validateConnection(context: ToolContext): Promise<ConnectionResult>;
    listActions(): ToolActionDefinition[];
    getInputSchema(action: string): InputSchema;
    execute(
        action: string,
        input: Record<string, unknown>,
        context: ToolContext
    ): Promise<ToolExecutionResult>;
    normalizeWebhook?(
        event: unknown,
        context: ToolContext
    ): Promise<NormalizedToolEvent>;
}
