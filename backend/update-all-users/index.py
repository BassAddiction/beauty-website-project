import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обновление настроек всех пользователей (30GB лимит, ежедневный сброс, VLESS-Reality)
    Args: event - dict с httpMethod
    Returns: HTTP response dict с количеством обновлённых пользователей
    '''
    method: str = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
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
    
    if method == 'POST':
        remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        if not remnawave_url or not remnawave_token:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Remnawave API not configured'}),
                'isBase64Encoded': False
            }
        
        headers = {
            'Authorization': f'Bearer {remnawave_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Получаем список всех пользователей
            users_response = requests.get(
                f'{remnawave_url}/api/users',
                headers=headers,
                timeout=15
            )
            
            if users_response.status_code != 200:
                return {
                    'statusCode': users_response.status_code,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Failed to fetch users'}),
                    'isBase64Encoded': False
                }
            
            users_data = users_response.json()
            users = users_data.get('users', [])
            
            updated_count = 0
            failed_count = 0
            results = []
            
            # Обновляем каждого пользователя
            for user in users:
                username = user.get('username')
                if not username:
                    continue
                
                try:
                    update_payload = {
                        'data_limit': 32212254720,
                        'data_limit_reset_strategy': 'day',
                        'proxies': {
                            'vless-reality': {}
                        }
                    }
                    
                    update_response = requests.put(
                        f'{remnawave_url}/api/user/{username}',
                        headers=headers,
                        json=update_payload,
                        timeout=10
                    )
                    
                    if update_response.status_code == 200:
                        updated_count += 1
                        results.append({
                            'username': username,
                            'status': 'success'
                        })
                    else:
                        failed_count += 1
                        results.append({
                            'username': username,
                            'status': 'failed',
                            'error': update_response.text
                        })
                except Exception as e:
                    failed_count += 1
                    results.append({
                        'username': username,
                        'status': 'error',
                        'error': str(e)
                    })
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'total_users': len(users),
                    'updated': updated_count,
                    'failed': failed_count,
                    'results': results
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
