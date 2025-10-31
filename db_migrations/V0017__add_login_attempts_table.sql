-- Таблица для отслеживания попыток авторизации
CREATE TABLE IF NOT EXISTS t_p66544974_beauty_website_proje.login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(255),
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE
);

-- Индекс для быстрого поиска по IP
CREATE INDEX idx_login_attempts_ip ON t_p66544974_beauty_website_proje.login_attempts(ip_address, attempt_time);

-- Индекс для быстрой очистки старых записей
CREATE INDEX idx_login_attempts_time ON t_p66544974_beauty_website_proje.login_attempts(attempt_time);