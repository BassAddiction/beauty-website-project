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
    
    # GET /inbounds - получить список inbounds (сквадов)
    if method == 'GET' and event.get('queryStringParameters', {}).get('action') == 'inbounds':
        endpoints_to_try = [
            '/api/inbounds',
            '/api/core/inbounds', 
            '/api/nodes',
            '/api/core/nodes',
            '/api/system/inbounds'
        ]
        
        results = {}
        for endpoint in endpoints_to_try:
            try:
                response = requests.get(f'{api_url}{endpoint}', headers=headers, timeout=5)
                results[endpoint] = {
                    'status': response.status_code,
                    'data': response.json() if response.status_code == 200 else response.text
                }
            except Exception as e:
                results[endpoint] = {'error': str(e)}
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(results, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    # GET /user/:username - получить данные пользователя
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        username = params.get('username')
        email_prefix = params.get('email_prefix')
        
        # Поиск по email префиксу
        if email_prefix:
            try:
                # Получаем всех пользователей
                response = requests.get(f'{api_url}/api/users', headers=headers, timeout=10)
                if response.status_code == 200:
                    users = response.json()
                    # Ищем пользователя с нужным префиксом
                    for user in users.get('users', []):
                        if user.get('username', '').startswith(email_prefix):
                            return {
                                'statusCode': 200,
                                'headers': cors_headers,
                                'body': json.dumps(user),
                                'isBase64Encoded': False
                            }
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Username or email_prefix required'}),
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
    
    # POST /user - создать пользователя
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        print(f'🔹 POST request - action: {action}, body keys: {list(body_data.keys())}')
        
        if action == 'create_user':
            # Вычисляем expireAt из timestamp expire
            expire_timestamp = body_data.get('expire')
            expire_at = None
            if expire_timestamp:
                from datetime import datetime
                expire_at = datetime.fromtimestamp(expire_timestamp).isoformat() + 'Z'
            
            proxies = body_data.get('proxies', {})
            
            user_payload = {
                'username': body_data.get('username'),
                'proxies': proxies,
                'expireAt': expire_at,
                'expire': expire_timestamp
            }
            
            print(f'🔹 Creating user with payload: {json.dumps(user_payload, indent=2)}')
            print(f'🔹 API URL: {api_url}/api/users')
            
            try:
                response = requests.post(
                    f'{api_url}/api/users',
                    headers=headers,
                    json=user_payload,
                    timeout=10
                )
                
                print(f'🔹 Response status: {response.status_code}')
                print(f'🔹 Response body: {response.text}')
                
                # Если создание успешно - обновляем лимиты и сквады через PATCH
                if response.status_code == 201:
                    created_user = response.json()
                    response_data = created_user.get('response', created_user)
                    user_uuid = response_data.get('uuid')
                    username = response_data.get('username')
                    
                    # Читаем настройки из переменных окружения
                    traffic_limit_gb = int(os.environ.get('USER_TRAFFIC_LIMIT_GB', 0))
                    traffic_strategy = os.environ.get('USER_TRAFFIC_STRATEGY', 'DAY').upper()
                    squad_uuids_str = os.environ.get('USER_SQUAD_UUIDS', '')
                    
                    print(f'🔹 Raw squad_uuids_str: {repr(squad_uuids_str)}')
                    squad_uuids = [s.strip() for s in squad_uuids_str.split(',') if s.strip()]
                    print(f'🔹 Parsed squad_uuids ({len(squad_uuids)}): {squad_uuids}')
                    
                    # Конвертируем GB в байты
                    traffic_limit_bytes = traffic_limit_gb * 1024 * 1024 * 1024 if traffic_limit_gb > 0 else 0
                    
                    # Формируем payload для PATCH
                    update_payload = {}
                    if traffic_limit_bytes > 0:
                        update_payload['trafficLimitBytes'] = traffic_limit_bytes
                        update_payload['trafficLimitStrategy'] = traffic_strategy
                    if squad_uuids:
                        update_payload['activeInternalSquads'] = squad_uuids
                    
                    if update_payload:
                        print(f'🔹 Auto-updating user {username} ({user_uuid}) with: {json.dumps(update_payload, indent=2)}')
                        
                        try:
                            # Используем PUT вместо PATCH - API возвращает 404 на PATCH
                            update_response = requests.put(
                                f'{api_url}/api/user/{user_uuid}',
                                headers=headers,
                                json=update_payload,
                                timeout=10
                            )
                            print(f'🔹 Auto-update response: {update_response.status_code}')
                            print(f'🔹 Auto-update body: {update_response.text[:300]}')
                            
                            # Возвращаем обновлённые данные
                            if update_response.status_code in [200, 201]:
                                return {
                                    'statusCode': 201,
                                    'headers': cors_headers,
                                    'body': update_response.text,
                                    'isBase64Encoded': False
                                }
                        except Exception as e:
                            print(f'⚠️ Auto-update failed: {str(e)}')
                            # Возвращаем данные без обновления
                
                return {
                    'statusCode': response.status_code,
                    'headers': cors_headers,
                    'body': response.text,
                    'isBase64Encoded': False
                }
            except Exception as e:
                print(f'❌ Error creating user: {str(e)}')
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Exception creating user: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        if action == 'update_user':
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
                    get_response = requests.get(f'{api_url}/api/user/{username}', headers=headers, timeout=10)
                    if get_response.status_code == 200:
                        user_data = get_response.json()
                        # UUID может быть в response или напрямую
                        response_data = user_data.get('response', user_data)
                        user_uuid = response_data.get('uuid')
                    else:
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
                
                # Удаляем None значения
                update_payload = {k: v for k, v in update_payload.items() if v is not None}
                
                print(f'🔹 Updating user {user_uuid} with payload: {json.dumps(update_payload, indent=2)}')
                
                response = requests.patch(
                    f'{api_url}/api/user/{user_uuid}',
                    headers=headers,
                    json=update_payload,
                    timeout=10
                )
                
                print(f'🔹 Update response: {response.status_code} - {response.text[:200]}')
                
                return {
                    'statusCode': response.status_code,
                    'headers': cors_headers,
                    'body': response.text,
                    'isBase64Encoded': False
                }
            except Exception as e:
                print(f'❌ Error updating user: {str(e)}')
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Exception updating user: {str(e)}'}),
                    'isBase64Encoded': False
                }
    
    # DELETE /user/:username - удалить пользователя
    if method == 'DELETE':
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
            response = requests.delete(f'{api_url}/api/user/{username}', headers=headers, timeout=10)
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
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }