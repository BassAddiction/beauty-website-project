-- Добавление тарифа Persona
UPDATE t_p66544974_beauty_website_proje.subscription_plans 
SET 
  name = 'Persona', 
  price = 2000, 
  days = 30, 
  traffic_gb = 100, 
  sort_order = 5,
  is_active = true,
  features = ARRAY['Индивидуальные условия', 'Подключение через поддержку', 'Персональный менеджер', 'Максимальная скорость', 'VIP поддержка 24/7']
WHERE plan_id = 5;
