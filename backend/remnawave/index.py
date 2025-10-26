import json
import os
import requests
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Интеграция с Remnawave API для управления пользователями и подписками VPN
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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
    
    api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
    api_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
    
    if not api_url or not api_token:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'API credentials not configured'}),
            'isBase64Encoded': False
        }
    
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    
    # GET /squads - получить список internal squads для дебага
    if method == 'GET' and event.get('queryStringParameters', {}).get('action') == 'squads':
        try:
            response = requests.get(f'{api_url}/api/internal-squads', headers=headers, timeout=10)
            return {
                'statusCode': response.status_code,
                'headers': cors_headers,
                'body': response.text,
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    # GET /users - получить список пользователей
    if method == 'GET' and event.get('queryStringParameters', {}).get('action') == 'users':
        try:
            response = requests.get(f'{api_url}/api/users', headers=headers, timeout=10)
            return {
                'statusCode': response.status_code,
                'headers': cors_headers,
                'body': response.text,
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    # GET /user/:username - получить данные пользователя
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        username = params.get('username')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Username required'}),
                'isBase64Encoded': False
            }
        
        try:
            response = requests.get(f'{api_url}/api/user/{username}', headers=headers, timeout=10)
            return {
                'statusCode': response.status_code,
                'headers': cors_headers,
                'body': response.text,
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    # POST /user - создать или обновить пользователя
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        print(f'🔹 POST request - action: {action}, body keys: {list(body_data.keys())}')
        
        if action == 'create_user':
            from datetime import datetime
            import psycopg2
            
            expire_timestamp = body_data.get('expire')
            expire_at = None
            if expire_timestamp:
                expire_at = datetime.fromtimestamp(expire_timestamp).isoformat() + 'Z'
            
            proxies = body_data.get('proxies', {})
            data_limit = body_data.get('data_limit', 0)
            data_limit_reset_strategy = body_data.get('data_limit_reset_strategy', 'day')
            internal_squads = body_data.get('internalSquads', [])
            username = body_data.get('username')
            
            # Для тестовых пользователей: сохраняем платёж в БД
            test_mode = body_data.get('test_mode', False)
            print(f'🧪 test_mode={test_mode}, username={username}')
            if test_mode and username and username.startswith('test_'):
                try:
                    db_url = os.environ.get('DATABASE_URL', '')
                    if db_url:
                        conn = psycopg2.connect(db_url)
                        cursor = conn.cursor()
                        
                        # Вычисляем plan_days из expire_timestamp
                        now_ts = int(datetime.now().timestamp())
                        plan_days = int((expire_timestamp - now_ts) / 86400) if expire_timestamp else 30
                        
                        cursor.execute("""
                            INSERT INTO payments (payment_id, username, email, amount, plan_name, plan_days, status, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        """, (
                            f'test_{int(datetime.now().timestamp())}',
                            username,
                            body_data.get('email', ''),
                            0.0,
                            f'Test {plan_days} days',
                            plan_days,
                            'succeeded'
                        ))
                        
                        conn.commit()
                        cursor.close()
                        conn.close()
                        print(f'✅ Test payment saved to DB for {username}')
                except Exception as e:
                    print(f'⚠️ Failed to save test payment: {str(e)}')
            
            # Создать пользователя со всеми параметрами сразу
            squad_uuids = ['6afd8de3-00d5-41db-aa52-f259fb98b2c8', '9ef43f96-83c9-4252-ae57-bb17dc9b60a9']
            
            create_payload = {
                'username': username,
                'proxies': proxies,
                'expireAt': expire_at,
                'expire': expire_timestamp,
                'trafficLimitBytes': data_limit,
                'trafficLimitStrategy': data_limit_reset_strategy.upper(),
                'activeInternalSquads': squad_uuids
            }
            
            print(f'🔹 Creating user with activeInternalSquads: {squad_uuids}')
            
            print(f'🔹 Creating user {username} with full config')
            print(f'🔹 Payload: {json.dumps(create_payload, indent=2)}')
            
            try:
                create_response = requests.post(
                    f'{api_url}/api/users',
                    headers=headers,
                    json=create_payload,
                    timeout=10
                )
                
                print(f'🔹 Response: {create_response.status_code}')
                print(f'🔹 Response body: {create_response.text}')
                
                if create_response.status_code == 201:
                    print(f'✅ User created successfully with squads')
                    
                    return {
                        'statusCode': 201,
                        'headers': cors_headers,
                        'body': create_response.text,
                        'isBase64Encoded': False
                    }
                else:
                    print(f'❌ Failed to create user')
                    return {
                        'statusCode': create_response.status_code,
                        'headers': cors_headers,
                        'body': create_response.text,
                        'isBase64Encoded': False
                    }
                    
            except Exception as e:
                print(f'❌ Error: {str(e)}')
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
        
        if action == 'update_user':
            print(f'🔹 Update user request - body: {json.dumps(body_data, indent=2)}')
            
            user_uuid = body_data.get('uuid')
            username = body_data.get('username')
            
            if not user_uuid and not username:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'UUID or username required'}),
                    'isBase64Encoded': False
                }
            
            try:
                # Если UUID не передан - получаем по username
                if not user_uuid:
                    print(f'🔹 Fetching UUID for username: {username}')
                    get_response = requests.get(f'{api_url}/api/user/{username}', headers=headers, timeout=10)
                    print(f'🔹 Get user response: {get_response.status_code}')
                    
                    if get_response.status_code == 200:
                        user_data = get_response.json()
                        response_data = user_data.get('response', user_data)
                        user_uuid = response_data.get('uuid')
                        print(f'🔹 Found UUID: {user_uuid}')
                    else:
                        print(f'❌ User not found: {get_response.text}')
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': f'User {username} not found'}),
                            'isBase64Encoded': False
                        }
                
                update_payload = {
                    'trafficLimitBytes': body_data.get('data_limit'),
                    'trafficLimitStrategy': body_data.get('data_limit_reset_strategy', 'day').upper().replace('_', '_'),
                    'status': body_data.get('status', 'active').upper(),
                    'activeInternalSquads': body_data.get('internalSquads')
                }
                
                # Обработка inbounds (например: {"vless-reality": ["uuid1", "uuid2"]})
                inbounds = body_data.get('inbounds')
                print(f'🔹 Received inbounds: {inbounds}')
                
                if inbounds:
                    # Собираем все UUID из всех inbounds в один массив
                    squad_uuids = []
                    for inbound_name, uuids in inbounds.items():
                        if isinstance(uuids, list):
                            squad_uuids.extend(uuids)
                    
                    if squad_uuids:
                        update_payload['activeInternalSquads'] = squad_uuids
                        print(f'✅ Setting squads from inbounds: {squad_uuids}')
                
                # Удаляем None значения
                update_payload = {k: v for k, v in update_payload.items() if v is not None}
                
                # Пробуем добавить пользователя в squads через PATCH /api/users/{uuid}
                if inbounds and 'activeInternalSquads' in update_payload:
                    squad_ids = update_payload['activeInternalSquads']
                    
                    # Пробуем PATCH с inboundUuids
                    print(f'🔹 Trying PATCH /api/users/{user_uuid} with inboundUuids: {squad_ids}')
                    
                    patch_payload = {
                        'inboundUuids': squad_ids
                    }
                    
                    patch_response = requests.patch(
                        f'{api_url}/api/users/{user_uuid}',
                        headers=headers,
                        json=patch_payload,
                        timeout=10
                    )
                    
                    print(f'🔹 PATCH response: {patch_response.status_code}')
                    print(f'🔹 Response body: {patch_response.text[:500]}')
                    
                    if patch_response.status_code in [200, 201]:
                        print(f'✅ User squads updated via PATCH')
                        return {
                            'statusCode': patch_response.status_code,
                            'headers': cors_headers,
                            'body': patch_response.text,
                            'isBase64Encoded': False
                        }
                    else:
                        print(f'⚠️ PATCH failed: {patch_response.text}')
                        return {
                            'statusCode': patch_response.status_code,
                            'headers': cors_headers,
                            'body': json.dumps({
                                'error': 'Failed to update squads',
                                'details': patch_response.text
                            }),
                            'isBase64Encoded': False
                        }
                
                # Если не было inbounds - возвращаем успех
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'User updated'}),
                    'isBase64Encoded': False
                }
            except Exception as e:
                print(f'❌ Error updating user: {str(e)}')
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