-- Phase 2: Approval Workflow Schema Updates

-- Add approval workflow to campaigns
ALTER TABLE campaigns 
ADD COLUMN approval_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN submitted_by_operator_id UUID REFERENCES operators(id),
ADD COLUMN approved_by_operator_id UUID REFERENCES operators(id),
ADD COLUMN submitted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN approved_at TIMESTAMP DEFAULT NULL,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN priority INTEGER DEFAULT 5;

-- Create approval history table
CREATE TABLE campaign_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES operators(id),
  action VARCHAR(50) NOT NULL, -- 'submitted', 'approved', 'rejected', 'executed'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create execution queue table
CREATE TABLE execution_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  priority INTEGER DEFAULT 5,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP DEFAULT NULL,
  completed_at TIMESTAMP DEFAULT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id),
  type VARCHAR(50) NOT NULL, -- 'campaign_pending', 'campaign_approved', 'campaign_rejected', 'campaign_executing'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_id UUID, -- campaign_id or other entity
  entity_type VARCHAR(50), -- 'campaign', 'client', etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_campaigns_approval_status ON campaigns(approval_status);
CREATE INDEX idx_campaigns_submitted_by ON campaigns(submitted_by_operator_id);
CREATE INDEX idx_campaigns_approved_by ON campaigns(approved_by_operator_id);
CREATE INDEX idx_execution_queue_status ON execution_queue(status);
CREATE INDEX idx_execution_queue_priority ON execution_queue(priority, scheduled_at);
CREATE INDEX idx_notifications_operator ON notifications(operator_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
