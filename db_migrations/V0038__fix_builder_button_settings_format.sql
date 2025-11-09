-- Fix corrupted builder_button settings - restore clean JSONB format
UPDATE site_settings 
SET setting_value = '{"show_on_pricing": false, "show_on_register": false, "show_referral_block": false}'::jsonb
WHERE setting_key = 'builder_button';