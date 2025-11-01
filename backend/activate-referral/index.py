'''
Business: Activate referral bonuses after successful payment
Args: event with payment_id and username
Returns: Success status with bonus days added
'''

import json
import os
import psycopg2
from typing import Dict, Any

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
        username = body.get('username')
        referral_code = body.get('referral_code')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Username required'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # If referral code provided, register the referral
        if referral_code:
            print(f'🎁 Processing referral: {username} with code {referral_code}')
            
            # Find referrer by code
            safe_code = referral_code.replace("'", "''")
            cur.execute(
                f"SELECT referrer_username FROM referrals WHERE referral_code = '{safe_code}' LIMIT 1"
            )
            result = cur.fetchone()
            
            if result:
                referrer = result[0]
                
                # Check if already referred
                safe_username = username.replace("'", "''")
                cur.execute(
                    f"SELECT id FROM referrals WHERE referred_username = '{safe_username}'"
                )
                if not cur.fetchone():
                    # Try to update existing referral record (where referred_username is NULL)
                    safe_referrer = referrer.replace("'", "''")
                    cur.execute(
                        f"""
                        UPDATE referrals 
                        SET referred_username = '{safe_username}', 
                            bonus_days = 7, 
                            status = 'activated', 
                            activated_at = NOW()
                        WHERE referrer_username = '{safe_referrer}' 
                          AND referral_code = '{safe_code}' 
                          AND referred_username IS NULL
                        """
                    )
                    
                    # If no rows updated, insert new record
                    if cur.rowcount == 0:
                        cur.execute(
                            f"""
                            INSERT INTO referrals (referrer_username, referral_code, referred_username, bonus_days, status, activated_at)
                            VALUES ('{safe_referrer}', '{safe_code}', '{safe_username}', 7, 'activated', NOW())
                            """
                        )
                    
                    # Extend referrer subscription by 7 days via Remnawave
                    extend_subscription(referrer, 7)
                    
                    conn.commit()
                    print(f'✅ Referral activated: {referrer} gets +7 days for referring {username}')
                else:
                    print(f'⚠️ User {username} already has a referral')
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'success': True})
        }
        
    except Exception as e:
        print(f'❌ Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }

def extend_subscription(username: str, days: int):
    '''Extend user subscription via Remnawave function'''
    try:
        import requests
        
        remnawave_function_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        
        response = requests.post(
            remnawave_function_url,
            headers={'Content-Type': 'application/json'},
            json={
                'action': 'extend_user',
                'username': username,
                'days': days
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f'✅ Extended {username} subscription by {days} days via Remnawave function')
            else:
                print(f'⚠️ Remnawave function returned error: {result.get("error")}')
        else:
            print(f'⚠️ Failed to call Remnawave function: {response.status_code} - {response.text}')
            
    except Exception as e:
        print(f'❌ Error extending subscription: {str(e)}')