CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Operators: internal users of the GTM Command Center
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator', -- e.g. 'admin', 'operator'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients: end clients managed by the agency
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by_operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client tool accounts: API credentials per client per tool
CREATE TABLE IF NOT EXISTS client_tool_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL, -- 'apollo' | 'clay' | 'heyreach' | 'smartlead'
    account_label TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    created_by_operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Execution contexts: reusable configuration/state for executions
CREATE TABLE IF NOT EXISTS execution_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    context_data JSONB,
    created_by_operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Executions: log of every operation sent to external tools
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_account_id UUID NOT NULL REFERENCES client_tool_accounts(id) ON DELETE RESTRICT,
    context_id UUID REFERENCES execution_contexts(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'error'
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    triggered_by_operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by_operator_id);
CREATE INDEX IF NOT EXISTS idx_client_tool_accounts_client ON client_tool_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_execution_contexts_client ON execution_contexts(client_id);
CREATE INDEX IF NOT EXISTS idx_executions_client ON executions(client_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
