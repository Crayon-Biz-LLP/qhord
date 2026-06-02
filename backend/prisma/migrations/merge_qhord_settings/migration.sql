-- Run once against your database after pulling merged integration
-- Or use: npx prisma db push

ALTER TABLE "operators" ADD COLUMN IF NOT EXISTS "two_factor_secret" TEXT;
ALTER TABLE "operators" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "timezone" TEXT DEFAULT 'Eastern (EST)',
    "logo_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operator_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "operator_id" UUID NOT NULL,
    "ai_tone" TEXT DEFAULT 'Professional',
    "ai_personalization" TEXT DEFAULT 'Medium',
    "auto_reply" BOOLEAN NOT NULL DEFAULT true,
    "auto_pause" BOOLEAN NOT NULL DEFAULT true,
    "auto_optimize" BOOLEAN NOT NULL DEFAULT false,
    "auto_score" BOOLEAN NOT NULL DEFAULT true,
    "notifications" JSONB NOT NULL DEFAULT '[]',
    "daily_send_limit" INTEGER NOT NULL DEFAULT 200,
    "inbox_rotation" TEXT DEFAULT 'Round Robin',
    "auto_pause_threshold" TEXT DEFAULT '5% bounce rate',
    "safety_mode" BOOLEAN NOT NULL DEFAULT true,
    "daily_connection_limit" INTEGER NOT NULL DEFAULT 25,
    "daily_message_limit" INTEGER NOT NULL DEFAULT 50,
    "linkedin_account" TEXT DEFAULT 'sarah.linkedin',
    "default_crm" TEXT DEFAULT 'hubspot',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "operator_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "operator_settings_operator_id_key" ON "operator_settings"("operator_id");

ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "account_owner" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "industry" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'Medium';
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Active';
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "website" TEXT;

ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';

DO $$ BEGIN
    ALTER TABLE "operators" ADD CONSTRAINT "operators_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "operator_settings" ADD CONSTRAINT "operator_settings_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
