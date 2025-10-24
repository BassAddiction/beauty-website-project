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
            # Получаем всех пользователей с пагинацией
            all_users = []
            offset = 0
            limit = 25  # API возвращает максимум 25 за раз
            
            while True:
                users_url = f'{remnawave_url}/api/users?limit={limit}&offset={offset}'
                print(f'🔍 Fetching users from: {users_url}')
                users_response = requests.get(
                    users_url,
                    headers=headers,
                    timeout=15
                )
                
                print(f'📡 Response status: {users_response.status_code}')
                
                if users_response.status_code != 200:
                    return {
                        'statusCode': users_response.status_code,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Failed to fetch users', 'response': users_response.text}),
                        'isBase64Encoded': False
                    }
                
                users_data = users_response.json()
                
                # Извлекаем пользователей
                if 'response' in users_data and 'users' in users_data['response']:
                    page_users = users_data['response']['users']
                    total = users_data['response'].get('total', 0)
                elif 'users' in users_data:
                    page_users = users_data['users']
                    total = len(page_users)
                elif isinstance(users_data, list):
                    page_users = users_data
                    total = len(page_users)
                else:
                    page_users = []
                    total = 0
                
                all_users.extend(page_users)
                print(f'📄 Page: {len(page_users)} users, Total collected: {len(all_users)}/{total}')
                
                # Если получили меньше чем limit, значит это последняя страница
                if len(page_users) < limit:
                    break
                
                # Если собрали всех пользователей
                if len(all_users) >= total:
                    break
                
                offset += limit
            
            users = all_users
            print(f'👥 Total found {len(users)} users')
            
            updated_count = 0
            failed_count = 0
            results = []
            
            # Обновляем каждого пользователя
            print(f'🔄 Starting to update {len(users)} users')
            for idx, user in enumerate(users, 1):
                username = user.get('username')
                uuid = user.get('uuid')
                
                if not username or not uuid:
                    print(f'⚠️ User {idx} has no username or uuid, skipping')
                    continue
                
                print(f'🔄 [{idx}/{len(users)}] Updating user: {username} (UUID: {uuid})')
                
                try:
                    update_payload = {
                        'data_limit': 32212254720,
                        'data_limit_reset_strategy': 'day',
                        'proxies': {
                            'vless-reality': {}
                        },
                        'status': 'active'
                    }
                    
                    print(f'📤 Sending PUT to: {remnawave_url}/api/user/{username}')
                    print(f'📦 Payload: {json.dumps(update_payload)}')
                    update_response = requests.put(
                        f'{remnawave_url}/api/user/{username}',
                        headers=headers,
                        json=update_payload,
                        timeout=10
                    )
                    print(f'📥 Response status: {update_response.status_code}')
                    
                    if update_response.status_code == 200:
                        print(f'✅ User {username} updated successfully')
                        updated_count += 1
                        results.append({
                            'username': username,
                            'status': 'success'
                        })
                    else:
                        print(f'❌ User {username} failed: {update_response.status_code} - {update_response.text[:200]}')
                        failed_count += 1
                        results.append({
                            'username': username,
                            'status': 'failed',
                            'error': update_response.text
                        })
                except Exception as e:
                    print(f'💥 User {username} exception: {str(e)}')
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