-- Добавляем поле login_type для разделения блокировок админов и пользователей
ALTER TABLE t_p66544974_beauty_website_proje.login_attempts 
ADD COLUMN login_type VARCHAR(20) DEFAULT 'user';

-- Обновляем существующие записи с username='admin' как admin-логины
UPDATE t_p66544974_beauty_website_proje.login_attempts 
SET login_type = 'admin' 
WHERE username = 'admin';

-- Создаем новый индекс с учетом login_type
CREATE INDEX idx_login_attempts_ip_type ON t_p66544974_beauty_website_proje.login_attempts(ip_address, login_type, attempt_time);

-- Удаляем старый индекс
DROP INDEX IF EXISTS t_p66544974_beauty_website_proje.idx_login_attempts_ip;