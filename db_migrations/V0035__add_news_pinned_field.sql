-- Добавление поля is_pinned для закрепления новостей
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
