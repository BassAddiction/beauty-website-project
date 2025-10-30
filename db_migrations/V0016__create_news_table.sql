-- Создаём таблицу новостей
CREATE TABLE IF NOT EXISTS news (
    news_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0
);

-- Индекс для быстрой сортировки активных новостей
CREATE INDEX idx_news_active_sort ON news(is_active, sort_order DESC, created_at DESC);
