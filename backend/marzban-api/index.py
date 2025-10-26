import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Proxy API для работы с Marzban VPN panel
    Args: event с httpMethod, body; context с request_id
    Returns: HTTP response с данными пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    
    marzban_url = os.environ.get('MARZBAN_URL', '')
    marzban_username = os.environ.get('MARZBAN_USERNAME', '')
    marzban_password = os.environ.get('MARZBAN_PASSWORD', '')
    
    if not marzban_url or not marzban_username or not marzban_password:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Marzban credentials not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')
        
        # Получаем токен авторизации
        auth_response = requests.post(
            f'{marzban_url}/api/admin/token',
            data={
                'username': marzban_username,
                'password': marzban_password,
                'grant_type': 'password'
            },
            timeout=10
        )
        
        if not auth_response.ok:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Failed to authenticate with Marzban'}),
                'isBase64Encoded': False
            }
        
        token = auth_response.json().get('access_token')
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        if action == 'create_user':
            user_data = {
                'username': body_data['username'],
                'proxies': body_data.get('proxies', {}),
                'data_limit': body_data.get('data_limit', 0),
                'expire': body_data.get('expire', 0),
                'data_limit_reset_strategy': body_data.get('data_limit_reset_strategy', 'no_reset'),
                'status': 'active'
            }
            
            response = requests.post(
                f'{marzban_url}/api/user',
                headers=headers,
                json=user_data,
                timeout=10
            )
            
            if response.ok:
                user_info = response.json()
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'response': user_info,
                        'uuid': user_info.get('username', ''),
                        'subscription_url': user_info.get('subscription_url', '')
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
        
        elif action == 'update_user':
            uuid = body_data.get('uuid', '')
            update_data = {
                'inbounds': body_data.get('inbounds', {})
            }
            
            response = requests.put(
                f'{marzban_url}/api/user/{uuid}',
                headers=headers,
                json=update_data,
                timeout=10
            )
            
            if response.ok:
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': response.status_code,
                    'headers': cors_headers,
                    'body': response.text,
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        print(f'ERROR: {type(e).__name__}: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
