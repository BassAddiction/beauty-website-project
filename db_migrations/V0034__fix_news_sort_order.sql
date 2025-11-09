-- Инициализация sort_order для существующих новостей
UPDATE news 
SET sort_order = news_id 
WHERE sort_order = 0 OR sort_order IS NULL;
