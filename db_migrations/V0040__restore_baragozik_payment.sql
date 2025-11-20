-- Восстановление платежа для пользователя baragozik00
INSERT INTO t_p66544974_beauty_website_proje.payments 
  (payment_id, username, email, amount, plan_name, plan_days, status, created_at, updated_at)
VALUES 
  ('restored_baragozik00_1763478309814', 'baragozik00_1763478309814', 'baragozik00@gmail.com', 149.00, 'Стандарт', 30, 'succeeded', '2025-11-18 15:05:55', NOW())
ON CONFLICT (payment_id) DO NOTHING;