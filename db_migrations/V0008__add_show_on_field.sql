-- Добавление поля show_on для выбора страниц отображения тарифа
ALTER TABLE t_p66544974_beauty_website_proje.subscription_plans 
ADD COLUMN show_on TEXT[] DEFAULT ARRAY['register', 'pricing'];

COMMENT ON COLUMN t_p66544974_beauty_website_proje.subscription_plans.show_on 
IS 'Массив страниц где показывать тариф: register, pricing';
