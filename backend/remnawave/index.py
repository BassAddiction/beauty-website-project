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
            # Используем ТОЛЬКО переданные squad_uuids (нет дефолтных)
            squad_uuids = internal_squads if internal_squads else []
            print(f'🎯 Final squad_uuids for creation: {squad_uuids}')
            
            create_payload = {
                'username': username,
                'proxies': proxies,
                'expireAt': expire_at,
                'expire': expire_timestamp,
                'trafficLimitBytes': data_limit,
                'trafficLimitStrategy': data_limit_reset_strategy.upper(),
                'activeInternalSquads': squad_uuids
            }
            
            print(f'🔹 Creating user with activeInternalSquads: {squad_uuids} (from payload: {internal_squads})')
            
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
        
        if action == 'extend_subscription':
            from datetime import datetime
            
            username = body_data.get('username')
            user_uuid = body_data.get('uuid')
            expire_timestamp = body_data.get('expire')
            internal_squads = body_data.get('internalSquads', [])
            
            if not expire_timestamp or not username:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'username and expire required'}),
                    'isBase64Encoded': False
                }
            
            expire_at = datetime.fromtimestamp(expire_timestamp).isoformat() + 'Z'
            
            print(f'📅 Extending subscription for {username} ({user_uuid}) until {expire_at}')
            print(f'🎯 Squads to assign: {internal_squads}')
            
            try:
                # Шаг 1: Удаляем старого пользователя
                print(f'🗑️ Deleting old user {user_uuid}...')
                delete_response = requests.delete(
                    f'{api_url}/api/users/{user_uuid}',
                    headers=headers,
                    timeout=10
                )
                
                print(f'🔹 DELETE response: {delete_response.status_code}')
                
                # Шаг 2: Создаём пользователя заново с новым expire и squad
                squad_uuids = internal_squads if internal_squads else ['e742f30b-82fb-431a-918b-1b4d22d6ba4d']
                
                create_payload = {
                    'username': username,
                    'expireAt': expire_at,
                    'trafficLimitBytes': 32212254720,
                    'trafficLimitStrategy': 'DAY',
                    'activeInternalSquads': squad_uuids,
                    'proxies': {}
                }
                
                print(f'🔹 Creating user with new expireAt: {expire_at}')
                
                create_response = requests.post(
                    f'{api_url}/api/users',
                    headers=headers,
                    json=create_payload,
                    timeout=10
                )
                
                print(f'🔹 POST /api/users response: {create_response.status_code} - {create_response.text[:300]}')
                
                if create_response.status_code in [200, 201]:
                    print(f'✅ Subscription extended successfully')
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': create_response.text,
                        'isBase64Encoded': False
                    }
                
                # Если не получилось - возвращаем ошибку
                print(f'❌ Failed to extend subscription')
                return {
                    'statusCode': create_response.status_code,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'error': 'Failed to extend subscription',
                        'details': create_response.text
                    }),
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
                
                # Обработка expire timestamp
                expire_at = None
                if body_data.get('expire'):
                    from datetime import datetime
                    expire_at = datetime.fromtimestamp(body_data['expire']).isoformat() + 'Z'
                
                update_payload = {
                    'trafficLimitBytes': body_data.get('data_limit'),
                    'trafficLimitStrategy': body_data.get('data_limit_reset_strategy', 'day').upper().replace('_', '_'),
                    'status': body_data.get('status', 'active').upper(),
                    'activeInternalSquads': body_data.get('internalSquads'),
                    'expireAt': expire_at
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
                
                # Формируем PATCH payload
                patch_payload = {}
                
                # Добавляем squads если есть
                if inbounds and 'activeInternalSquads' in update_payload:
                    squad_ids = update_payload['activeInternalSquads']
                    patch_payload['inboundUuids'] = squad_ids
                    print(f'🔹 Will update inboundUuids: {squad_ids}')
                elif 'activeInternalSquads' in update_payload and update_payload['activeInternalSquads']:
                    patch_payload['inboundUuids'] = update_payload['activeInternalSquads']
                    print(f'🔹 Will update inboundUuids from internalSquads: {update_payload["activeInternalSquads"]}')
                
                # Добавляем expireAt если есть
                if 'expireAt' in update_payload and update_payload['expireAt']:
                    patch_payload['expireAt'] = update_payload['expireAt']
                    print(f'🔹 Will update expireAt: {update_payload["expireAt"]}')
                
                # Если есть что обновлять - делаем PATCH
                if patch_payload:
                    print(f'🔹 PATCH /api/users/{user_uuid} with payload: {json.dumps(patch_payload)}')
                    
                    patch_response = requests.patch(
                        f'{api_url}/api/users/{user_uuid}',
                        headers=headers,
                        json=patch_payload,
                        timeout=10
                    )
                    
                    print(f'🔹 PATCH response: {patch_response.status_code}')
                    print(f'🔹 Response body: {patch_response.text[:500]}')
                    
                    if patch_response.status_code in [200, 201]:
                        print(f'✅ User updated via PATCH')
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
                                'error': 'Failed to update user',
                                'details': patch_response.text
                            }),
                            'isBase64Encoded': False
                        }
                
                # Если нечего обновлять - возвращаем успех
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'Nothing to update'}),
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
        
        if action == 'extend_user':
            from datetime import datetime
            
            username = body_data.get('username')
            days = body_data.get('days', 0)
            
            if not username or not days:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'username and days required'}),
                    'isBase64Encoded': False
                }
            
            try:
                print(f'📅 Extending {username} by {days} days')
                
                get_response = requests.get(f'{api_url}/api/user/{username}', headers=headers, timeout=10)
                
                if get_response.status_code != 200:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': f'User {username} not found'}),
                        'isBase64Encoded': False
                    }
                
                user_data = get_response.json()
                response_data = user_data.get('response', user_data)
                user_uuid = response_data.get('uuid')
                current_expire_str = response_data.get('expireAt', '')
                
                current_expire_ts = 0
                if current_expire_str:
                    try:
                        current_expire_dt = datetime.fromisoformat(current_expire_str.replace('Z', '+00:00'))
                        current_expire_ts = int(current_expire_dt.timestamp())
                    except:
                        pass
                
                now_ts = int(datetime.now().timestamp())
                base_ts = max(current_expire_ts, now_ts)
                new_expire_ts = base_ts + (days * 86400)
                new_expire_at = datetime.fromtimestamp(new_expire_ts).isoformat() + 'Z'
                
                print(f'🔹 Current expire: {current_expire_ts}, New expire: {new_expire_ts}')
                
                patch_payload = {'expireAt': new_expire_at}
                
                patch_response = requests.patch(
                    f'{api_url}/api/users/{user_uuid}',
                    headers=headers,
                    json=patch_payload,
                    timeout=10
                )
                
                if patch_response.status_code == 200:
                    print(f'✅ Extended {username} by {days} days')
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'success': True, 'new_expire': new_expire_at}),
                        'isBase64Encoded': False
                    }
                else:
                    print(f'❌ Failed to extend: {patch_response.text}')
                    return {
                        'statusCode': patch_response.status_code,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Failed to extend user', 'details': patch_response.text}),
                        'isBase64Encoded': False
                    }
                    
            except Exception as e:
                print(f'❌ Error extending user: {str(e)}')
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