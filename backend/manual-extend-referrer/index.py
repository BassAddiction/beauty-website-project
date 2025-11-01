'''
Business: Manually extend referrer subscription based on activated referrals
Args: event with referrer_username
Returns: Extended subscription info
'''

import json
import os
import requests
import psycopg2
from typing import Dict, Any
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    try:
        body = json.loads(event.get('body', '{}'))
        referrer_username = body.get('referrer_username')
        
        if not referrer_username:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'referrer_username required'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get all activated referrals for this referrer
        safe_username = referrer_username.replace("'", "''")
        cur.execute(
            f"""
            SELECT referred_username, bonus_days, activated_at 
            FROM referrals 
            WHERE referrer_username = '{safe_username}' 
              AND status = 'activated' 
              AND referred_username IS NOT NULL
            ORDER BY activated_at DESC
            """
        )
        
        referrals = cur.fetchall()
        cur.close()
        conn.close()
        
        if not referrals:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'No activated referrals found'})
            }
        
        # Calculate total bonus days
        total_days = sum(r[1] for r in referrals)
        print(f'🎁 Found {len(referrals)} activated referrals, total bonus: {total_days} days')
        
        # Get Remnawave API credentials
        remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        if not remnawave_api_url or not remnawave_token:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Remnawave API not configured'})
            }
        
        # Get user info from Remnawave
        headers = {
            'Authorization': f'Bearer {remnawave_token}',
            'Content-Type': 'application/json'
        }
        
        users_response = requests.get(
            f'{remnawave_api_url}/api/users',
            headers=headers,
            timeout=10
        )
        
        if users_response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Failed to get users from Remnawave'})
            }
        
        users_data = users_response.json()
        users_list = users_data.get('response', {}).get('users', [])
        user_data = next((u for u in users_list if u.get('username') == referrer_username), None)
        
        if not user_data:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': f'User {referrer_username} not found in Remnawave'})
            }
        
        user_uuid = user_data.get('uuid')
        current_expire = user_data.get('expireAt', '')
        
        print(f'📅 Current expire: {current_expire}')
        
        # Parse current expire and add bonus days
        if current_expire:
            expire_dt = datetime.fromisoformat(current_expire.replace('Z', '+00:00'))
            current_timestamp = int(expire_dt.timestamp())
        else:
            current_timestamp = int(datetime.now().timestamp())
        
        # Add bonus days
        new_timestamp = current_timestamp + (total_days * 24 * 60 * 60)
        new_expire = datetime.fromtimestamp(new_timestamp).isoformat() + 'Z'
        
        print(f'📅 New expire: {new_expire} (+{total_days} days)')
        
        # Use remnawave function to extend subscription
        remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        
        extend_response = requests.post(
            remnawave_url,
            headers={'Content-Type': 'application/json'},
            json={
                'action': 'extend_subscription',
                'username': referrer_username,
                'uuid': user_uuid,
                'expire': new_timestamp,
                'internalSquads': user_data.get('internalSquads', [])
            },
            timeout=30
        )
        
        if extend_response.status_code == 200:
            print(f'✅ Extended {referrer_username} subscription by {total_days} days')
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'referrer': referrer_username,
                    'total_referrals': len(referrals),
                    'bonus_days': total_days,
                    'old_expire': current_expire,
                    'new_expire': new_expire
                })
            }
        else:
            print(f'⚠️ Failed to extend subscription: {extend_response.text}')
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': extend_response.text})
            }
            
    except Exception as e:
        print(f'❌ Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
