export type OperatorRole = "admin" | "operator";

export interface Operator {
  id: string;
  email: string;
  name: string;
  role: OperatorRole;
}

export interface Client {
  id: string;
  name: string;
  description?: string | null;
  created_by_operator_id: string;
  created_at: string;
}

export type ToolName = "apollo" | "clay" | "heyreach" | "smartlead";

export interface ClientToolAccount {
  id: string;
  client_id: string;
  tool_name: ToolName;
  account_label: string;
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

export type ExecutionStatus = "pending" | "success" | "error";

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

