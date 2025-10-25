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
            
            expire_timestamp = body_data.get('expire')
            expire_at = None
            if expire_timestamp:
                expire_at = datetime.fromtimestamp(expire_timestamp).isoformat() + 'Z'
            
            proxies = body_data.get('proxies', {})
            data_limit = body_data.get('data_limit', 0)
            data_limit_reset_strategy = body_data.get('data_limit_reset_strategy', 'day')
            internal_squads = body_data.get('internalSquads', [])
            username = body_data.get('username')
            
            # Шаг 1: Создать пользователя с базовыми данными
            create_payload = {
                'username': username,
                'proxies': proxies,
                'expireAt': expire_at,
                'expire': expire_timestamp
            }
            
            print(f'🔹 Step 1: Creating user {username}')
            print(f'🔹 Create payload: {json.dumps(create_payload, indent=2)}')
            
            try:
                create_response = requests.post(
                    f'{api_url}/api/users',
                    headers=headers,
                    json=create_payload,
                    timeout=10
                )
                
                print(f'🔹 Create response: {create_response.status_code}')
                
                if create_response.status_code != 201:
                    print(f'❌ Failed to create user: {create_response.text}')
                    return {
                        'statusCode': create_response.status_code,
                        'headers': cors_headers,
                        'body': create_response.text,
                        'isBase64Encoded': False
                    }
                
                # Получаем UUID созданного пользователя
                created_data = create_response.json()
                response_data = created_data.get('response', created_data)
                user_uuid = response_data.get('uuid')
                
                print(f'🔹 User created with UUID: {user_uuid}')
                
                # Шаг 2: Обновить лимиты и сквады
                update_payload = {
                    'trafficLimitBytes': data_limit,
                    'trafficLimitStrategy': data_limit_reset_strategy.upper().replace('_', '_'),
                    'activeInternalSquads': internal_squads
                }
                
                print(f'🔹 Step 2: Updating user {user_uuid}')
                print(f'🔹 Update payload: {json.dumps(update_payload, indent=2)}')
                
                update_response = requests.patch(
                    f'{api_url}/api/users/{user_uuid}',
                    headers=headers,
                    json=update_payload,
                    timeout=10
                )
                
                print(f'🔹 Update response: {update_response.status_code}')
                
                if update_response.status_code == 200:
                    print(f'✅ User updated successfully')
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': update_response.text,
                        'isBase64Encoded': False
                    }
                else:
                    print(f'⚠️ Update failed: {update_response.text}')
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
                    f'{api_url}/api/users/{user_uuid}',
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
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }