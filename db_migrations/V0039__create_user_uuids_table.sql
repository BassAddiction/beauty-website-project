-- Create table for storing Remnawave user UUIDs
CREATE TABLE IF NOT EXISTS user_uuids (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    remnawave_uuid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(username, remnawave_uuid)
);

CREATE INDEX IF NOT EXISTS idx_user_uuids_username ON user_uuids(username);
CREATE INDEX IF NOT EXISTS idx_user_uuids_created_at ON user_uuids(created_at DESC);