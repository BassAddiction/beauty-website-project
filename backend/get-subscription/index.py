import json
import os
import psycopg2
import requests
from typing import Dict, Any
from datetime import datetime

def get_public_plans(cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить активные тарифы для публичного доступа'''
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
    
    try:
        cursor.execute("""
            SELECT plan_id, name, price, days, traffic_gb, is_custom, features
            FROM t_p66544974_beauty_website_proje.subscription_plans
            WHERE is_active = true
            ORDER BY sort_order, plan_id
        """)
        
        rows = cursor.fetchall()
        
        plans = []
        for row in rows:
            plans.append({
                'plan_id': row[0],
                'name': row[1],
                'price': float(row[2]),
                'days': row[3],
                'traffic': row[4],
                'custom': row[5],
                'features': row[6]
            })
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'plans': plans}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()

def handle_admin(event: Dict[str, Any], context: Any, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обработка админских запросов'''
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
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
    
    try:
        # GET /admin?action=plans - получить все тарифы
        if action == 'plans':
            cursor.execute("""
                SELECT plan_id, name, price, days, traffic_gb, is_active, is_custom, 
                       sort_order, features
                FROM t_p66544974_beauty_website_proje.subscription_plans
                ORDER BY sort_order, plan_id
            """)
            rows = cursor.fetchall()
            
            plans = []
            for row in rows:
                plans.append({
                    'plan_id': row[0],
                    'name': row[1],
                    'price': float(row[2]),
                    'days': row[3],
                    'traffic_gb': row[4],
                    'is_active': row[5],
                    'is_custom': row[6],
                    'sort_order': row[7],
                    'features': row[8]
                })
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'plans': plans}),
                'isBase64Encoded': False
            }
        
        # GET /admin?action=clients - получить всех клиентов
        elif action == 'clients':
            cursor.execute("""
                SELECT DISTINCT username, email, 
                       MAX(created_at) as last_payment,
                       SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_paid,
                       COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as payment_count
                FROM payments
                GROUP BY username, email
                ORDER BY last_payment DESC
            """)
            rows = cursor.fetchall()
            
            clients = []
            for row in rows:
                clients.append({
                    'username': row[0],
                    'email': row[1],
                    'last_payment': row[2].isoformat() if row[2] else None,
                    'total_paid': float(row[3]),
                    'payment_count': row[4]
                })
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'clients': clients, 'total': len(clients)}),
                'isBase64Encoded': False
            }
        
        # POST - создать/обновить тариф
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            plan_id = body.get('plan_id')
            
            if plan_id and plan_id > 0:
                # UPDATE
                cursor.execute("""
                    UPDATE t_p66544974_beauty_website_proje.subscription_plans
                    SET name = %s, price = %s, days = %s, traffic_gb = %s,
                        is_active = %s, is_custom = %s, sort_order = %s, features = %s
                    WHERE plan_id = %s
                """, (
                    body.get('name'),
                    body.get('price'),
                    body.get('days'),
                    body.get('traffic_gb'),
                    body.get('is_active'),
                    body.get('is_custom'),
                    body.get('sort_order'),
                    json.dumps(body.get('features', [])),
                    plan_id
                ))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'Plan updated'}),
                    'isBase64Encoded': False
                }
            else:
                # INSERT
                cursor.execute("""
                    INSERT INTO t_p66544974_beauty_website_proje.subscription_plans (name, price, days, traffic_gb, is_active, is_custom, sort_order, features)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING plan_id
                """, (
                    body.get('name'),
                    body.get('price'),
                    body.get('days'),
                    body.get('traffic_gb', 30),
                    body.get('is_active', True),
                    body.get('is_custom', False),
                    body.get('sort_order', 0),
                    json.dumps(body.get('features', []))
                ))
                new_plan_id = cursor.fetchone()[0]
                conn.commit()
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({'plan_id': new_plan_id, 'message': 'Plan created'}),
                    'isBase64Encoded': False
                }
        
        # DELETE - удалить тариф
        elif method == 'DELETE':
            plan_id = params.get('plan_id')
            if not plan_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'plan_id required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("DELETE FROM t_p66544974_beauty_website_proje.subscription_plans WHERE plan_id = %s", (plan_id,))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Plan deleted'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    finally:
        cursor.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для подписок и админки - получение данных и управление тарифами
    Args: event - dict с httpMethod, queryStringParameters (username, action)
    Returns: HTTP response dict с данными подписки или админки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Password',
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
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    headers = event.get('headers', {})
    
    # ПУБЛИЧНЫЙ ЗАПРОС ТАРИФОВ (без пароля)
    if action == 'get_plans':
        return get_public_plans(cors_headers)
    
    # Проверка админского пароля для POST/DELETE или админских action
    admin_password = headers.get('x-admin-password') or headers.get('X-Admin-Password')
    is_admin_request = (
        action in ['plans', 'clients', 'plan_update', 'plan_delete'] or 
        method in ['POST', 'PUT', 'DELETE']
    )
    
    if is_admin_request:
        expected_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        if admin_password != expected_password:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        return handle_admin(event, context, cors_headers)
    
    # ОБЫЧНЫЙ ЗАПРОС ПОДПИСКИ
    if method == 'GET':
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
            
            # Если пользователь не найден - возвращаем 404
            if not rows:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
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
            used_traffic_bytes = 0
            traffic_limit_bytes = 32212254720
            
            remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
            remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
            
            if remnawave_url and remnawave_token:
                try:
                    user_response = requests.get(
                        f'{remnawave_url}/api/users?username={username}',
                        headers={'Authorization': f'Bearer {remnawave_token}'},
                        timeout=10
                    )
                    
                    print(f'📡 Remnawave request URL: {remnawave_url}/api/users?username={username}')
                    print(f'📡 Remnawave response status: {user_response.status_code}')
                    
                    if user_response.status_code == 200:
                        response_data = user_response.json()
                        users_list = response_data.get('response', {}).get('users', [])
                        print(f'📊 Total users in response: {len(users_list)}')
                        
                        # Находим нужного пользователя по username
                        user_data = {}
                        for user in users_list:
                            if user.get('username') == username:
                                user_data = user
                                break
                        
                        if not user_data and users_list:
                            print(f'⚠️ User {username} not found in response, available: {[u.get("username") for u in users_list[:5]]}')
                        
                        print(f'👤 Full user data: {json.dumps(user_data)}')
                        
                        expire_at_str = user_data.get('expireAt', '')
                        subscription_url = user_data.get('subscriptionUrl', '')
                        used_traffic_bytes = user_data.get('usedTrafficBytes', 0)
                        lifetime_traffic = user_data.get('lifetimeUsedTrafficBytes', 0)
                        traffic_limit_bytes = user_data.get('trafficLimitBytes', 32212254720)
                        
                        print(f'📅 expireAt string: {expire_at_str}')
                        print(f'🔗 subscriptionUrl: {subscription_url}')
                        print(f'📊 Current traffic (daily): {used_traffic_bytes} bytes')
                        print(f'📊 Lifetime traffic (total): {lifetime_traffic} bytes')
                        print(f'📊 Traffic limit: {traffic_limit_bytes} bytes')
                        
                        # Используем lifetime вместо current для отображения
                        used_traffic_bytes = lifetime_traffic
                        
                        # Парсим дату из ISO формата
                        if expire_at_str:
                            expire_dt = datetime.fromisoformat(expire_at_str.replace('Z', '+00:00'))
                            expire_timestamp = int(expire_dt.timestamp())
                            
                            print(f'⏰ expire_timestamp: {expire_timestamp}')
                            
                            # Вычисляем количество дней до окончания
                            now = datetime.now().timestamp()
                            if expire_timestamp > now:
                                seconds_left = expire_timestamp - now
                                days_left = int(seconds_left / 86400)
                            else:
                                days_left = 0
                            
                            print(f'📆 days_left: {days_left}')
                except Exception as e:
                    print(f'⚠️ Failed to fetch Remnawave data: {str(e)}')
            
            # Если Remnawave не вернул данные, но есть платежи - вычисляем из БД
            if expire_timestamp is None and payments:
                # Берем последний платеж (любой статус)
                last_payment = payments[0] if payments else None
                if last_payment:
                    created_dt = datetime.fromisoformat(last_payment['created_at'])
                    expire_dt = created_dt.timestamp() + (last_payment['plan_days'] * 86400)
                    expire_timestamp = int(expire_dt)
                    
                    now = datetime.now().timestamp()
                    if expire_timestamp > now:
                        seconds_left = expire_timestamp - now
                        days_left = int(seconds_left / 86400)
                    else:
                        days_left = 0
                    
                    print(f'💾 Calculated from DB: expire_timestamp={expire_timestamp}, days_left={days_left}')
            
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
                        'is_active': days_left is not None and days_left > 0,
                        'used_traffic_bytes': used_traffic_bytes,
                        'traffic_limit_bytes': traffic_limit_bytes
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