-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_username VARCHAR(255) NOT NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    referred_username VARCHAR(255),
    bonus_days INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP,
    UNIQUE(referrer_username, referred_username)
);

-- Create index for faster lookups
CREATE INDEX idx_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrer_username ON referrals(referrer_username);