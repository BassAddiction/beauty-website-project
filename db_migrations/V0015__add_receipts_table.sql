-- Таблица для хранения данных чеков
CREATE TABLE IF NOT EXISTS t_p66544974_beauty_website_proje.receipts (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) NOT NULL,
    yookassa_receipt_id VARCHAR(255),
    tax_system_code INT NOT NULL DEFAULT 3,
    vat_code INT NOT NULL DEFAULT 4,
    amount NUMERIC(10, 2) NOT NULL,
    email VARCHAR(255) NOT NULL,
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_payment_id ON t_p66544974_beauty_website_proje.receipts(payment_id);
CREATE INDEX idx_receipts_created_at ON t_p66544974_beauty_website_proje.receipts(created_at DESC);