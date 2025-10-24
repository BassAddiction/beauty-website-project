import json
import os
import psycopg2
import requests
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получение информации о подписке пользователя из БД
    Args: event - dict с httpMethod, queryStringParameters (username)
    Returns: HTTP response dict с данными подписки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        username = params.get('username', '')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Username required'}),
                'isBase64Encoded': False
            }
        
        try:
            db_url = os.environ.get('DATABASE_URL', '')
            if not db_url:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Database not configured'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT payment_id, amount, plan_name, plan_days, status, created_at, updated_at
                FROM payments
                WHERE username = %s
                ORDER BY created_at DESC
            """, (username,))
            
            rows = cursor.fetchall()
            
            payments = []
            for row in rows:
                payments.append({
                    'payment_id': row[0],
                    'amount': float(row[1]),
                    'plan_name': row[2],
                    'plan_days': row[3],
                    'status': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'updated_at': row[6].isoformat() if row[6] else None
                })
            
            cursor.close()
            conn.close()
            
            # Получаем данные о подписке из Remnawave
            expire_timestamp = None
            days_left = None
            subscription_url = ''
            
            remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
            remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
            
            if remnawave_url and remnawave_token:
                try:
                    user_response = requests.get(
                        f'{remnawave_url}/api/user/{username}',
                        headers={'Authorization': f'Bearer {remnawave_token}'},
                        timeout=10
                    )
                    
                    if user_response.status_code == 200:
                        user_data = user_response.json()
                        expire_timestamp = user_data.get('expire', 0)
                        subscription_url = user_data.get('subscription_url', user_data.get('sub_url', ''))
                        
                        # Вычисляем количество дней до окончания
                        if expire_timestamp:
                            now = datetime.now().timestamp()
                            if expire_timestamp > now:
                                seconds_left = expire_timestamp - now
                                days_left = int(seconds_left / 86400)
                            else:
                                days_left = 0
                except Exception as e:
                    print(f'⚠️ Failed to fetch Remnawave data: {str(e)}')
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'username': username,
                    'payments': payments,
                    'total': len(payments),
                    'subscription': {
                        'days_left': days_left,
                        'expire_timestamp': expire_timestamp,
                        'subscription_url': subscription_url,
                        'is_active': days_left is not None and days_left > 0
                    }
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }