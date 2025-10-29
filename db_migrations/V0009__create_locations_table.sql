-- Создание таблицы локаций (стран/сквадов)
CREATE TABLE IF NOT EXISTS t_p66544974_beauty_website_proje.locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    flag_emoji VARCHAR(10),
    price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
    traffic_gb_per_day INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем несколько начальных локаций
INSERT INTO t_p66544974_beauty_website_proje.locations (name, country_code, flag_emoji, price_per_day, traffic_gb_per_day, is_active, sort_order) VALUES
('Россия', 'RU', '🇷🇺', 5, 1, true, 1),
('США', 'US', '🇺🇸', 10, 1, true, 2),
('Германия', 'DE', '🇩🇪', 8, 1, true, 3),
('Франция', 'FR', '🇫🇷', 8, 1, true, 4),
('Великобритания', 'GB', '🇬🇧', 9, 1, true, 5),
('Япония', 'JP', '🇯🇵', 12, 1, true, 6),
('Канада', 'CA', '🇨🇦', 10, 1, true, 7),
('Австралия', 'AU', '🇦🇺', 11, 1, true, 8);