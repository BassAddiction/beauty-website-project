-- Добавляем массив squad_uuid в таблицу plans
ALTER TABLE plans ADD COLUMN squad_uuids TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN plans.squad_uuids IS 'Массив UUID squad из Remnawave, которые будут назначены пользователю при покупке тарифа';