'''
Business: Manually extend 12mes_1762013429606 subscription by 7 days
Args: event
Returns: Success status
'''

import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
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
        from datetime import datetime
        
        remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        headers = {
            'Authorization': f'Bearer {remnawave_token}',
            'Content-Type': 'application/json'
        }
        
        # Get current user info
        users_response = requests.get(
            f'{remnawave_api_url}/api/users',
            headers=headers,
            timeout=10
        )
        
        users_data = users_response.json()
        users_list = users_data.get('response', {}).get('users', [])
        user_data = next((u for u in users_list if u.get('username') == '12mes_1762013429606'), None)
        
        if not user_data:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        user_uuid = user_data.get('uuid')
        current_expire = user_data.get('expireAt', '')
        
        # Calculate new expiration (current + 7 days)
        expire_dt = datetime.fromisoformat(current_expire.replace('Z', '+00:00'))
        current_timestamp = int(expire_dt.timestamp())
        new_timestamp = current_timestamp + (7 * 86400)
        
        # Extend via remnawave function
        remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        
        response = requests.post(
            remnawave_url,
            headers={'Content-Type': 'application/json'},
            json={
                'action': 'extend_subscription',
                'username': '12mes_1762013429606',
                'uuid': user_uuid,
                'expire': new_timestamp,
                'internalSquads': user_data.get('internalSquads', [])
            },
            timeout=30
        )
        
        return {
            'statusCode': response.status_code,
            'headers': cors_headers,
            'body': json.dumps({
                'success': response.status_code == 200,
                'old_expire': current_expire,
                'new_timestamp': new_timestamp,
                'response': response.text
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
