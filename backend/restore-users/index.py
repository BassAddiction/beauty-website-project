'''
Business: Restore accidentally deleted users from referral bonus
Args: event with usernames to restore
Returns: Restoration status
'''

import json
import os
import requests
import psycopg2
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
        usernames = body.get('usernames', [])
        
        if not usernames:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'usernames array required'}),
                'isBase64Encoded': False
            }
        
        db_url = os.environ.get('DATABASE_URL', '')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        results = []
        
        for username in usernames:
            print(f'🔧 Restoring user: {username}')
            
            # Get payment info from DB
            cursor.execute("""
                SELECT email, plan_days, created_at
                FROM payments
                WHERE username = %s AND status = 'succeeded'
                ORDER BY created_at DESC
                LIMIT 1
            """, (username,))
            
            payment_row = cursor.fetchone()
            
            if not payment_row:
                results.append({
                    'username': username,
                    'success': False,
                    'error': 'No payment found'
                })
                continue
            
            email, plan_days, created_at = payment_row
            
            # Calculate expire timestamp
            expire_timestamp = int(created_at.timestamp()) + (plan_days * 86400)
            expire_at = datetime.fromtimestamp(expire_timestamp).isoformat() + 'Z'
            
            print(f'📧 Email: {email}, days: {plan_days}, expire: {expire_at}')
            
            # Create user via remnawave function
            remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
            
            response = requests.post(
                remnawave_url,
                headers={'Content-Type': 'application/json'},
                json={
                    'action': 'create_user',
                    'username': username,
                    'expire': expire_timestamp,
                    'data_limit': 32212254720,
                    'data_limit_reset_strategy': 'day',
                    'internalSquads': ['e742f30b-82fb-431a-918b-1b4d22d6ba4d'],
                    'proxies': {}
                },
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                print(f'✅ Restored {username}')
                results.append({
                    'username': username,
                    'success': True,
                    'expire_at': expire_at
                })
            else:
                print(f'❌ Failed to restore {username}: {response.text}')
                results.append({
                    'username': username,
                    'success': False,
                    'error': response.text
                })
        
        cursor.close()
        conn.close()
        
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
