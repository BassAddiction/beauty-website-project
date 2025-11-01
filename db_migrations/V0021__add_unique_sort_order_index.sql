-- Создание уникального индекса для sort_order чтобы предотвратить дубли
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_plans_sort_order 
ON t_p66544974_beauty_website_proje.subscription_plans(sort_order);
