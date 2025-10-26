CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    days INTEGER NOT NULL,
    traffic_gb INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_custom BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 1,
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    plan_id INTEGER REFERENCES subscription_plans(plan_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (name, price, days, traffic_gb, sort_order, features) VALUES
('Starter', 150, 30, 30, 1, ARRAY['30 ГБ трафика', '1 месяц', 'Высокая скорость']),
('Basic', 300, 90, 100, 2, ARRAY['100 ГБ трафика', '3 месяца', 'Высокая скорость', 'Приоритетная поддержка']),
('Pro', 500, 180, 200, 3, ARRAY['200 ГБ трафика', '6 месяцев', 'Максимальная скорость', 'Приоритетная поддержка', 'Безлимитные устройства']),
('Premium', 800, 365, 500, 4, ARRAY['500 ГБ трафика', '12 месяцев', 'Максимальная скорость', 'Приоритетная поддержка', 'Безлимитные устройства', 'Выделенный сервер']),
('Ultimate', 1500, 730, 1000, 5, ARRAY['1000 ГБ трафика', '24 месяца', 'Максимальная скорость', 'Приоритетная поддержка', 'Безлимитные устройства', 'Выделенный сервер', 'Персональный менеджер']);

CREATE INDEX IF NOT EXISTS idx_payments_username ON payments(username);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_plans_active ON subscription_plans(is_active);
