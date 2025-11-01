'''
Business: Manage referral system - generate codes, track referrals, get stats
Args: event with httpMethod (GET/POST), queryStringParameters, body
Returns: Referral code, stats, or error response
'''

import json
import os
import hashlib
import psycopg2
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def generate_referral_code(username: str) -> str:
    '''Generate unique referral code from username'''
    hash_obj = hashlib.md5(username.encode())
    return hash_obj.hexdigest()[:8].upper()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            # Get referral info and stats
            params = event.get('queryStringParameters', {})
            username = params.get('username')
            
            if not username:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Username required'})
                }
            
            # Get or create referral code
            safe_username = username.replace("'", "''")
            cur.execute(
                f"SELECT referral_code FROM referrals WHERE referrer_username = '{safe_username}' LIMIT 1"
            )
            result = cur.fetchone()
            
            if result:
                referral_code = result[0]
            else:
                # Create new referral code
                referral_code = generate_referral_code(username)
                cur.execute(
                    f"INSERT INTO referrals (referrer_username, referral_code) VALUES ('{safe_username}', '{referral_code}') ON CONFLICT (referral_code) DO NOTHING"
                )
                conn.commit()
            
            # Get stats
            cur.execute(
                f"""
                SELECT 
                    COUNT(*) FILTER (WHERE status = 'activated') as activated_count,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                    COALESCE(SUM(bonus_days) FILTER (WHERE status = 'activated'), 0) as total_bonus_days
                FROM referrals 
                WHERE referrer_username = '{safe_username}' AND referred_username IS NOT NULL
                """
            )
            stats = cur.fetchone()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'referral_code': referral_code,
                    'stats': {
                        'activated': stats[0] or 0,
                        'pending': stats[1] or 0,
                        'total_bonus_days': int(stats[2] or 0)
                    }
                })
            }
        
        elif method == 'POST':
            # Register referred user
            body = json.loads(event.get('body', '{}'))
            referral_code = body.get('referral_code')
            referred_username = body.get('username')
            
            if not referral_code or not referred_username:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Referral code and username required'})
                }
            
            # Find referrer by code
            safe_code = referral_code.replace("'", "''")
            cur.execute(
                f"SELECT referrer_username FROM referrals WHERE referral_code = '{safe_code}' LIMIT 1"
            )
            result = cur.fetchone()
            
            if not result:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid referral code'})
                }
            
            referrer = result[0]
            
            # Check if user already used a referral
            safe_referred = referred_username.replace("'", "''")
            cur.execute(
                f"SELECT id FROM referrals WHERE referred_username = '{safe_referred}'"
            )
            if cur.fetchone():
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'User already referred'})
                }
            
            # Add referred user
            safe_referrer = referrer.replace("'", "''")
            cur.execute(
                f"""
                INSERT INTO referrals (referrer_username, referral_code, referred_username, bonus_days, status)
                VALUES ('{safe_referrer}', '{safe_code}', '{safe_referred}', 7, 'pending')
                """
            )
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'success': True, 'message': 'Referral registered'})
            }
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }