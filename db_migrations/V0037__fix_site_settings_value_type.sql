-- Изменение типа данных setting_value на TEXT для хранения строк
ALTER TABLE site_settings ALTER COLUMN setting_value TYPE TEXT;

-- Обновление существующих булевых значений в строки
UPDATE site_settings 
SET setting_value = CASE 
  WHEN setting_value::text = 't' OR setting_value::text = 'true' THEN 'true'
  ELSE 'false'
END
WHERE setting_key = 'new_year_theme';
