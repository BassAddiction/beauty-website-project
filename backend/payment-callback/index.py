import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обработка callback от Юкассы при успешном платеже
    Args: event с httpMethod, body от Юкассы
    Returns: HTTP response
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    notification = json.loads(body_str)
    
    payment_object = notification.get('object', {})
    payment_id = payment_object.get('id')
    status = payment_object.get('status')
    paid = payment_object.get('paid', False)
    
    if not (paid and status == 'succeeded'):
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ignored'})
        }
    
    # Получаем metadata из Юкассы
    metadata = payment_object.get('metadata', {})
    username = metadata.get('username')
    email = metadata.get('email')
    plan_name = metadata.get('plan_name')
    plan_days_str = metadata.get('plan_days', '30')
    
    if not username or not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing metadata'})
        }
    
    try:
        plan_days = int(plan_days_str)
    except:
        plan_days = 30
    
    amount_value = payment_object.get('amount', {}).get('value', '0')
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    # СОЗДАЁМ платёж в БД (а не обновляем!)
    cur.execute(f"INSERT INTO payments (payment_id, user_id, amount, plan, status, created_at, updated_at) VALUES ('{payment_id}', '{username}', {amount_value}, '{plan_name}', 'completed', NOW(), NOW())")
    
    # Активируем подписку
    cur.execute(f"UPDATE subscriptions SET status = 'active', expires_at = NOW() + INTERVAL '{plan_days} days', updated_at = NOW() WHERE user_id = '{username}'")
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'status': 'ok'})
    }