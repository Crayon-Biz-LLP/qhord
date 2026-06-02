-- Add campaign execution results table for tracking AI metrics
CREATE TABLE IF NOT EXISTS "campaign_execution_results" (
  "id" TEXT NOT NULL,
  "campaign_id" TEXT NOT NULL,
  "step_id" TEXT NOT NULL,
  "tool" TEXT NOT NULL,
  "emails_sent" INTEGER DEFAULT 0,
  "replies" INTEGER DEFAULT 0,
  "meetings_booked" INTEGER DEFAULT 0,
  "bounce_rate" REAL DEFAULT 0,
  "open_rate" REAL DEFAULT 0,
  "click_rate" REAL DEFAULT 0,
  "unsubscribes" INTEGER DEFAULT 0,
  "leads_found" INTEGER DEFAULT 0,
  "contacts_enriched" INTEGER DEFAULT 0,
  "emails_verified" INTEGER DEFAULT 0,
  "duplicate_rate" REAL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "campaign_execution_results_pkey" PRIMARY KEY ("id")
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "idx_campaign_execution_results_campaign_id" ON "campaign_execution_results"("campaign_id");
CREATE INDEX IF NOT EXISTS "idx_campaign_execution_results_tool" ON "campaign_execution_results"("tool");
CREATE INDEX IF NOT EXISTS "idx_campaign_execution_results_executed_at" ON "campaign_execution_results"("executed_at");
