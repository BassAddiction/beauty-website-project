-- Добавление настройки новогоднего оформления
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (setting_key, setting_value)
VALUES ('new_year_theme', 'false')
ON CONFLICT (setting_key) DO NOTHING;
