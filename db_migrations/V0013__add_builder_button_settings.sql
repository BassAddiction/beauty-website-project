-- Добавляем таблицу для настроек сайта
CREATE TABLE IF NOT EXISTS t_p66544974_beauty_website_proje.site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем настройку для кнопки конструктора
INSERT INTO t_p66544974_beauty_website_proje.site_settings (setting_key, setting_value, description)
VALUES 
    ('builder_button', '{"show_on_register": true, "show_on_pricing": true}', 'Отображение кнопки "Создать свой тариф" на страницах')
ON CONFLICT (setting_key) DO NOTHING;