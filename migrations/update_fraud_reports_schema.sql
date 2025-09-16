-- Migration to update fraud_reports table schema
-- This migration changes from single identity fields to multiple identity fields

-- First, add the new columns
ALTER TABLE fraud_reports 
ADD COLUMN email VARCHAR(255) NULL,
ADD COLUMN phone VARCHAR(20) NULL,
ADD COLUMN facebook_id VARCHAR(255) NULL;

-- Migrate existing data from old schema to new schema
-- This assumes existing data has identity_type and identity_value columns
UPDATE fraud_reports 
SET 
  email = CASE WHEN identity_type = 'EMAIL' THEN identity_value ELSE NULL END,
  phone = CASE WHEN identity_type = 'PHONE' THEN identity_value ELSE NULL END,
  facebook_id = CASE WHEN identity_type = 'FACEBOOK' THEN identity_value ELSE NULL END;

-- Drop the old columns (uncomment when ready to remove old columns)
-- ALTER TABLE fraud_reports 
-- DROP COLUMN identity_type,
-- DROP COLUMN identity_value;

-- Add indexes for better search performance
CREATE INDEX idx_fraud_reports_email ON fraud_reports(email);
CREATE INDEX idx_fraud_reports_phone ON fraud_reports(phone);
CREATE INDEX idx_fraud_reports_facebook_id ON fraud_reports(facebook_id);
CREATE INDEX idx_fraud_reports_status ON fraud_reports(status);
