-- Add referral_code column to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50);