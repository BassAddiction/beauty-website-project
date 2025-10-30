-- Добавляем Санкт-Петербург первой локацией в списке
INSERT INTO t_p66544974_beauty_website_proje.locations 
(name, country_code, flag_emoji, price_per_day, traffic_gb_per_day, is_active, sort_order)
VALUES ('Санкт-Петербург', 'RU', '🇷🇺', 100, 50, true, 1)
ON CONFLICT DO NOTHING;