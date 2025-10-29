-- Добавляем массив squad_uuid в таблицу subscription_plans (правильную таблицу)
ALTER TABLE t_p66544974_beauty_website_proje.subscription_plans ADD COLUMN squad_uuids TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN t_p66544974_beauty_website_proje.subscription_plans.squad_uuids IS 'Массив UUID squad из Remnawave, которые будут назначены пользователю при покупке тарифа';