-- Таблица для хранения тарифов VPN
CREATE TABLE IF NOT EXISTS plans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    days INTEGER NOT NULL,
    traffic_gb INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    is_custom BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем текущие тарифы
INSERT INTO plans (name, price, days, traffic_gb, is_active, is_custom, sort_order, features) VALUES
('1 Месяц', 200, 30, 30, true, false, 1, '["30 ГБ трафика в сутки", "Без ограничений устройств", "Любые локации", "Базовая поддержка"]'::jsonb),
('3 Месяца', 500, 90, 30, true, false, 2, '["30 ГБ трафика в сутки", "Без ограничений устройств", "Любые локации", "Приоритетная поддержка 24/7"]'::jsonb),
('6 Месяцев', 900, 180, 30, true, false, 3, '["30 ГБ трафика в сутки", "Без ограничений устройств", "Любые локации", "Приоритетная поддержка 24/7"]'::jsonb),
('12 Месяцев', 1200, 365, 30, true, false, 4, '["30 ГБ трафика в сутки", "Без ограничений устройств", "Любые локации", "VIP поддержка 24/7"]'::jsonb),
('Persona', 2000, 365, 999, true, true, 5, '["Безлимитный трафик", "Выделенный сервер", "Персональные настройки", "Личный менеджер 24/7"]'::jsonb);

-- Индекс для быстрого поиска активных тарифов
CREATE INDEX idx_plans_active ON plans(is_active, sort_order);