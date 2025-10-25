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
            from datetime import datetime, timezone
            
            username = body_data.get('username')
            days = int(body_data.get('days', 1))
            
            now = datetime.now(timezone.utc)
            expire_timestamp = now.timestamp() + (days * 86400)
            expire_at = datetime.fromtimestamp(expire_timestamp, timezone.utc).isoformat().replace('+00:00', 'Z')
            
            traffic_limit_gb = 30
            traffic_limit_bytes = traffic_limit_gb * 1024 * 1024 * 1024
            
            user_payload = {
                'username': username,
                'trafficLimitBytes': traffic_limit_bytes,
                'trafficLimitStrategy': 'MONTH',
                'expireAt': expire_at,
                'inboundUuids': ['9ef43f96-83c9-4252-ae57-bb17dc9b60a9']
            }
            
            print(f'🆕 Creating test user: {username} for {days} days')
            print(f'📦 Payload: {json.dumps(user_payload, indent=2)}')
            
            try:
                response = requests.post(
                    f'{api_url}/api/users',
                    headers=headers,
                    json=user_payload,
                    timeout=10
                )
                
                print(f'✅ Response: {response.status_code}')
                print(f'📥 Body: {response.text[:500]}')
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    user_data = data.get('response', {})
                    subscription_url = user_data.get('subscription_url', user_data.get('sub_url', ''))
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({
                            'success': True,
                            'username': username,
                            'subscription_url': subscription_url,
                            'days': days,
                            'expire_at': expire_at
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': response.status_code,
                        'headers': cors_headers,
                        'body': response.text,
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
            username = body_data.get('username')
            if not username:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Username required'}),
                    'isBase64Encoded': False
                }
            
            try:
                update_payload = {
                    'proxies': body_data.get('proxies'),
                    'dataLimit': body_data.get('data_limit'),
                    'expire': body_data.get('expire'),
                    'dataLimitResetStrategy': body_data.get('data_limit_reset_strategy', 'no_reset'),
                    'status': body_data.get('status', 'active')
                }
                
                print(f'🔹 Updating user {username} with payload: {json.dumps(update_payload, indent=2)}')
                
                response = requests.put(
                    f'{api_url}/api/users/{username}',
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