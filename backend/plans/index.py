'''
Business: API для получения активных тарифных планов из базы данных
Args: event - dict с httpMethod
      context - object с request_id
Returns: JSON с тарифными планами или ошибкой
'''
import json
import os
import psycopg
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = psycopg.connect(dsn, autocommit=True)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT plan_id, name, price, days, traffic_gb, features
        FROM t_p66544974_beauty_website_proje.subscription_plans
        WHERE is_active = true
        ORDER BY sort_order ASC
    ''')
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    plans: List[Dict[str, Any]] = []
    for row in rows:
        plans.append({
            'id': row[0],
            'name': row[1],
            'price': int(row[2]) if row[2] is not None else 0,
            'days': row[3],
            'traffic': int(row[4]) if row[4] is not None else 0,
            'features': row[5] or []
        })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'plans': plans})
    }