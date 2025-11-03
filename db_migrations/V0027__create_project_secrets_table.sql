CREATE TABLE IF NOT EXISTS project_secrets (
    secret_key VARCHAR(255) PRIMARY KEY,
    secret_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

COMMENT ON TABLE project_secrets IS 'Переопределённые значения секретов проекта (приоритет над переменными окружения)';
COMMENT ON COLUMN project_secrets.secret_key IS 'Название секрета (например: YOOKASSA_SHOP_ID)';
COMMENT ON COLUMN project_secrets.secret_value IS 'Значение секрета (зашифровано в base64)';
COMMENT ON COLUMN project_secrets.description IS 'Описание секрета';
COMMENT ON COLUMN project_secrets.updated_at IS 'Дата последнего обновления';
COMMENT ON COLUMN project_secrets.updated_by IS 'Кто обновил (IP или admin)';
