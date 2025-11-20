-- Восстановление всех пользователей из таблицы user_uuids
-- Создаем записи со стандартными значениями (тариф Стандарт 30 дней за 149р)

INSERT INTO t_p66544974_beauty_website_proje.payments 
  (payment_id, username, email, amount, plan_name, plan_days, status, created_at, updated_at)
SELECT 
  'restored_' || username,
  username,
  SUBSTRING(username FROM '^([^_]+)') || '@gmail.com',
  149.00,
  'Стандарт',
  30,
  'succeeded',
  created_at,
  NOW()
FROM t_p66544974_beauty_website_proje.user_uuids
WHERE NOT EXISTS (
  SELECT 1 FROM t_p66544974_beauty_website_proje.payments p 
  WHERE p.username = user_uuids.username
);