'''
Business: Manually extend user subscriptions with specified days
Args: event with username and days to add
Returns: Success status
'''

import json
import os
import requests
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        extensions = body.get('extensions', [])
        
        if not extensions:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'extensions array required'}),
                'isBase64Encoded': False
            }
        
        remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        headers = {
            'Authorization': f'Bearer {remnawave_token}',
            'Content-Type': 'application/json'
        }
        
        results = []
        
        for ext in extensions:
            username = ext.get('username')
            days = ext.get('days', 0)
            
            if not username or days <= 0:
                results.append({
                    'username': username,
                    'success': False,
                    'error': 'Invalid username or days'
                })
                continue
            
            print(f'🔧 Extending {username} by {days} days')
            
            # Get user info
            users_response = requests.get(
                f'{remnawave_api_url}/api/users',
                headers=headers,
                timeout=10
            )
            
            if users_response.status_code != 200:
                results.append({
                    'username': username,
                    'success': False,
                    'error': 'Failed to get users list'
                })
                continue
            
            users_data = users_response.json()
            users_list = users_data.get('response', {}).get('users', [])
            user_data = next((u for u in users_list if u.get('username') == username), None)
            
            if not user_data:
                results.append({
                    'username': username,
                    'success': False,
                    'error': 'User not found'
                })
                continue
            
            user_uuid = user_data.get('uuid')
            current_expire = user_data.get('expireAt', '')
            
            # Calculate new expiration
            if current_expire:
                expire_dt = datetime.fromisoformat(current_expire.replace('Z', '+00:00'))
                current_timestamp = int(expire_dt.timestamp())
            else:
                current_timestamp = int(datetime.now().timestamp())
            
            new_timestamp = current_timestamp + (days * 86400)
            new_expire_at = datetime.fromtimestamp(new_timestamp).isoformat() + 'Z'
            
            print(f'📅 {username}: current={current_expire}, adding {days} days, new={new_expire_at}')
            
            # Update via PATCH
            patch_response = requests.patch(
                f'{remnawave_api_url}/api/users/{user_uuid}',
                headers=headers,
                json={'expireAt': new_expire_at},
                timeout=10
            )
            
            if patch_response.status_code == 200:
                print(f'✅ Extended {username}')
                results.append({
                    'username': username,
                    'success': True,
                    'new_expire': new_expire_at
                })
            else:
                print(f'❌ Failed: {patch_response.status_code} - {patch_response.text}')
                results.append({
                    'username': username,
                    'success': False,
                    'error': patch_response.text
                })
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'results': results}),
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
