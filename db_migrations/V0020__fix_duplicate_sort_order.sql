-- Исправление дублирующихся sort_order
-- Пересчитываем порядок для всех тарифов по возрастанию plan_id

WITH ordered_plans AS (
    SELECT 
        plan_id,
        ROW_NUMBER() OVER (ORDER BY sort_order ASC, plan_id ASC) - 1 as new_sort_order
    FROM t_p66544974_beauty_website_proje.subscription_plans
)
UPDATE t_p66544974_beauty_website_proje.subscription_plans sp
SET sort_order = op.new_sort_order
FROM ordered_plans op
WHERE sp.plan_id = op.plan_id;
