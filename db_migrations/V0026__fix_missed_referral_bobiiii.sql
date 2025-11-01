-- Activate missed referral for bobiiii_1762016209164
UPDATE referrals 
SET referred_username = 'pomytkinserdj_1762016438656', 
    bonus_days = 7, 
    status = 'activated', 
    activated_at = NOW()
WHERE referrer_username = 'bobiiii_1762016209164' 
  AND referral_code = 'EDE12CE5' 
  AND referred_username IS NULL;