-- Восстановление оригинальных тарифов для главной страницы
UPDATE t_p66544974_beauty_website_proje.subscription_plans 
SET name = '1 месяц', price = 200, days = 30, traffic_gb = 30, sort_order = 1, 
    features = ARRAY['30 ГБ трафика в сутки', 'Без ограничений устройств', 'Любые локации', 'Базовая поддержка']
WHERE plan_id = 1;

UPDATE t_p66544974_beauty_website_proje.subscription_plans 
SET name = '3 месяца', price = 500, days = 90, traffic_gb = 30, sort_order = 2,
    features = ARRAY['30 ГБ трафика в сутки', 'Без ограничений устройств', 'Любые локации', 'Приоритетная поддержка']
WHERE plan_id = 2;

UPDATE t_p66544974_beauty_website_proje.subscription_plans 
SET name = '6 месяцев', price = 900, days = 180, traffic_gb = 30, sort_order = 3,
    features = ARRAY['30 ГБ трафика в сутки', 'Без ограничений устройств', 'Любые локации', 'Приоритетная поддержка', 'Скидка 25%']
WHERE plan_id = 3;

UPDATE t_p66544974_beauty_website_proje.subscription_plans 
SET name = '12 месяцев', price = 1200, days = 365, traffic_gb = 30, sort_order = 4,
    features = ARRAY['30 ГБ трафика в сутки', 'Без ограничений устройств', 'Любые локации', 'Приоритетная поддержка', 'Скидка 50%', 'VIP статус']
WHERE plan_id = 4;

-- Деактивируем лишние тарифы
UPDATE t_p66544974_beauty_website_proje.subscription_plans 
SET is_active = false 
WHERE plan_id IN (5, 6);
