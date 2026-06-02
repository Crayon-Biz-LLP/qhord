export type OperatorRole = 'admin' | 'operator';

export interface Operator {
  id: string;
  email: string;
  name: string;
  role: OperatorRole;
  password_hash: string;
  created_at: string;
  two_factor_secret?: string | null;
}

export interface Client {
  id: string;
  name: string;
  description?: string | null;
  created_by_operator_id: string;
  created_at: string;
}

export type ToolName = 'apollo' | 'clay' | 'heyreach' | 'smartlead' | 'hunter' | 'brevo' | 'bettercontacts' | 'calendly' | 'instantly' | 'hubspot' | 'salesforce';

export interface ClientToolAccount {
  id: string;
  client_id: string;
  tool_name: ToolName;
  account_label: string;
  api_key_encrypted: string;
  created_by_operator_id: string;
  created_at: string;
}

export interface ExecutionContext {
  id: string;
  client_id: string;
  name: string;
  description?: string | null;
  context_data: any;
  created_by_operator_id: string;
  created_at: string;
}

export type ExecutionStatus = 'pending' | 'success' | 'error';

export interface Execution {
  id: string;
  client_id: string;
  tool_name: ToolName;
  tool_account_id: string;
  context_id?: string | null;
  action: string;
  status: ExecutionStatus;
  request_payload: any;
  response_payload: any;
  error_message?: string | null;
  triggered_by_operator_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: OperatorRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export interface ExecutionRequestPayload {
  clientId: string;
  tool: ToolName;
  toolAccountId: string;
  contextId?: string;
  action: string;
  payload: any;
}
