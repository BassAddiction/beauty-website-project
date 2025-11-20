import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Вручную завершить pending платёж (для тестирования)
    Args: event с payment_id в query params
    Returns: HTTP response
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method not in ['GET', 'POST']:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    query_params = event.get('queryStringParameters', {})
    payment_id = query_params.get('payment_id')
    
    if not payment_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'payment_id required'})
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute(f"UPDATE payments SET status = 'completed', updated_at = NOW() WHERE payment_id = '{payment_id}'")
    
    cur.execute(f"SELECT user_id, plan FROM payments WHERE payment_id = '{payment_id}'")
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Payment not found'})
        }
    
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
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'payment_id': payment_id,
            'user_id': user_id,
            'plan': plan,
            'days_added': days
        })
    }