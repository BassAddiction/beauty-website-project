-- Создаём тестовый платёж для разработки
INSERT INTO payments (payment_id, username, amount, status, plan_name, plan_days, created_at, updated_at)
VALUES (
  'test_dev_user_001',
  'test_dev_1234567890',
  10.00,
  'succeeded',
  'Тестовый 30 дней',
  30,
  NOW(),
  NOW()
)
ON CONFLICT (payment_id) DO NOTHING;