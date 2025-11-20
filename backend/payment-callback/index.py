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
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute(f"UPDATE payments SET status = 'completed', updated_at = NOW() WHERE payment_id = '{payment_id}'")
    
    cur.execute(f"SELECT user_id, plan FROM payments WHERE payment_id = '{payment_id}'")
    row = cur.fetchone()
    
    if row:
        user_id, plan = row
        
        if plan == '1month':
            days = 30
        elif plan == '3months':
            days = 90
        elif plan == '6months':
            days = 180
        else:
            days = 30
        
        cur.execute(f"UPDATE subscriptions SET status = 'active', expires_at = NOW() + INTERVAL '{days} days', updated_at = NOW() WHERE user_id = '{user_id}'")
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'status': 'ok'})
    }
