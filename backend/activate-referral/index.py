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
                    
                    # Get UUIDs from DB for both users
                    safe_ref = referrer.replace("'", "''")
                    cur.execute(f"SELECT remnawave_uuid FROM user_uuids WHERE username = '{safe_ref}' ORDER BY created_at DESC LIMIT 1")
                    referrer_uuid_row = cur.fetchone()
                    referrer_uuid = referrer_uuid_row[0] if referrer_uuid_row else None
                    
                    cur.execute(f"SELECT remnawave_uuid FROM user_uuids WHERE username = '{safe_username}' ORDER BY created_at DESC LIMIT 1")
                    referred_uuid_row = cur.fetchone()
                    referred_uuid = referred_uuid_row[0] if referred_uuid_row else None
                    
                    print(f'🔑 Referrer UUID: {referrer_uuid}, Referred UUID: {referred_uuid}')
                    
                    # Extend referrer subscription by 7 days via Remnawave
                    extend_subscription(referrer, 7, referrer_uuid)
                    
                    # Also give 7 days to the referred user (new user bonus)
                    extend_subscription(username, 7, referred_uuid)
                    
                    conn.commit()
                    print(f'✅ Referral activated: {referrer} gets +7 days for referring {username}, {username} gets +7 days as referral bonus')
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

def extend_subscription(username: str, days: int, user_uuid: str = None):
    '''Extend user subscription using UUID from DB (more reliable than API search)'''
    try:
        import requests
        import os
        import psycopg2
        from datetime import datetime
        
        remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        remnawave_function_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        
        # Если UUID не передан - ищем в БД
        if not user_uuid:
            db_url = os.environ.get('DATABASE_URL', '')
            if db_url:
                conn = psycopg2.connect(db_url)
                cur = conn.cursor()
                safe_username = username.replace("'", "''")
                cur.execute(f"SELECT remnawave_uuid FROM user_uuids WHERE username = '{safe_username}' ORDER BY created_at DESC LIMIT 1")
                result = cur.fetchone()
                if result:
                    user_uuid = result[0]
                    print(f'🔑 Found UUID in DB: {user_uuid}')
                cur.close()
                conn.close()
        
        if not user_uuid:
            print(f'⚠️ No UUID found for {username}, cannot extend')
            return
        
        print(f'📅 Extending {username} (UUID: {user_uuid}) by {days} days')
        
        # Получаем текущую дату истечения
        get_response = requests.get(
            f'{remnawave_api_url}/api/users',
            headers={'Authorization': f'Bearer {remnawave_token}'},
            timeout=10
        )
        
        if get_response.status_code != 200:
            print(f'⚠️ Failed to get users list: {get_response.status_code}')
            return
        
        users_data = get_response.json()
        users_list = users_data.get('response', {}).get('users', [])
        user_data = next((u for u in users_list if u.get('uuid') == user_uuid), None)
        
        if not user_data:
            print(f'⚠️ User {username} not found by UUID {user_uuid}')
            return
        
        current_expire_str = user_data.get('expireAt', '')
        current_expire_ts = 0
        
        if current_expire_str:
            try:
                current_expire_dt = datetime.fromisoformat(current_expire_str.replace('Z', '+00:00'))
                current_expire_ts = int(current_expire_dt.timestamp())
            except:
                pass
        
        # Считаем новую дату
        now_ts = int(datetime.now().timestamp())
        base_ts = max(current_expire_ts, now_ts)
        new_expire_ts = base_ts + (days * 86400)
        
        print(f'📅 Current: {current_expire_ts}, New: {new_expire_ts} (+{days} days)')
        
        # Используем extend_subscription action с UUID
        response = requests.post(
            remnawave_function_url,
            headers={'Content-Type': 'application/json'},
            json={
                'action': 'extend_subscription',
                'username': username,
                'uuid': user_uuid,
                'expire': new_expire_ts,
                'internalSquads': user_data.get('activeInternalSquads', [])
            },
            timeout=30
        )
        
        if response.status_code == 200:
            print(f'✅ Extended {username} subscription by {days} days')
        else:
            print(f'⚠️ Failed to extend {username}: {response.status_code} - {response.text}')
            
    except Exception as e:
        print(f'❌ Error extending subscription: {str(e)}')