-- Создание таблицы для хранения кодов счётчиков и метатегов
CREATE TABLE IF NOT EXISTS tracking_codes (
    id SERIAL PRIMARY KEY,
    head_code TEXT DEFAULT '',
    body_code TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальной записи, если таблица пустая
INSERT INTO tracking_codes (head_code, body_code)
SELECT '', ''
WHERE NOT EXISTS (SELECT 1 FROM tracking_codes);

-- Создание индекса для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tracking_codes_id ON tracking_codes(id);
