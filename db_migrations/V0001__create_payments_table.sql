-- Создание таблицы для хранения платежей
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    status VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100),
    plan_days INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Индексы для быстрого поиска
CREATE INDEX idx_payments_username ON payments(username);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Комментарии
COMMENT ON TABLE payments IS 'История платежей пользователей VPN';
COMMENT ON COLUMN payments.payment_id IS 'ID платежа из ЮKassa';
COMMENT ON COLUMN payments.username IS 'Имя пользователя в Remnawave';
COMMENT ON COLUMN payments.status IS 'Статус платежа: pending, succeeded, canceled';
