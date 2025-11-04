-- Таблица пользователей Telegram бота
CREATE TABLE IF NOT EXISTS telegram_users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_users_telegram_id ON telegram_users(telegram_id);

-- Таблица платежей через Telegram бота
CREATE TABLE IF NOT EXISTS telegram_payments (
    id SERIAL PRIMARY KEY,
    telegram_user_id INTEGER REFERENCES telegram_users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(plan_id) ON DELETE SET NULL,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_payments_telegram_user_id ON telegram_payments(telegram_user_id);
CREATE INDEX idx_telegram_payments_payment_id ON telegram_payments(payment_id);
CREATE INDEX idx_telegram_payments_status ON telegram_payments(status);

COMMENT ON TABLE telegram_users IS 'Пользователи Telegram бота Speed VPN';
COMMENT ON TABLE telegram_payments IS 'Платежи через Telegram Payments API';
