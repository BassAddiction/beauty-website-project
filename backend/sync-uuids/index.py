'''
Business: Sync all user UUIDs from Remnawave to database
Args: event with httpMethod
Returns: Number of synced UUIDs
'''

import json
import os
import psycopg2
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    
    try:
        remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        db_url = os.environ.get('DATABASE_URL', '')
        
        if not all([remnawave_api_url, remnawave_token, db_url]):
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Missing configuration'}),
                'isBase64Encoded': False
            }
        
        print('📡 Fetching users from Remnawave...')
        response = requests.get(
            f'{remnawave_api_url}/api/users',
            headers={'Authorization': f'Bearer {remnawave_token}'},
            timeout=30
        )
        
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': f'Failed to fetch users: {response.status_code}'}),
                'isBase64Encoded': False
            }
        
        users_data = response.json()
        users_list = users_data.get('response', {}).get('users', [])
        
        print(f'📊 Found {len(users_list)} users in Remnawave')
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        synced_count = 0
        
        for user in users_list:
            username = user.get('username')
            user_uuid = user.get('uuid')
            
            if username and user_uuid:
                try:
                    safe_username = username.replace("'", "''")
                    safe_uuid = user_uuid.replace("'", "''")
                    
                    cur.execute(f"""
                        INSERT INTO user_uuids (username, remnawave_uuid, created_at)
                        VALUES ('{safe_username}', '{safe_uuid}', NOW())
                        ON CONFLICT (username, remnawave_uuid) DO NOTHING
                    """)
                    
                    if cur.rowcount > 0:
                        synced_count += 1
                        print(f'✅ {username}: {user_uuid}')
                except Exception as e:
                    print(f'⚠️ Failed {username}: {str(e)}')
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f'🎉 Synced {synced_count} new UUIDs')
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'success': True,
                'total_users': len(users_list),
                'synced_count': synced_count
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
