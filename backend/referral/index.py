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
            cur.execute(
                "SELECT referral_code FROM referrals WHERE referrer_username = %s LIMIT 1",
                (username,)
            )
            result = cur.fetchone()
            
            if result:
                referral_code = result[0]
            else:
                # Create new referral code
                referral_code = generate_referral_code(username)
                cur.execute(
                    "INSERT INTO referrals (referrer_username, referral_code) VALUES (%s, %s) ON CONFLICT (referral_code) DO NOTHING",
                    (username, referral_code)
                )
                conn.commit()
            
            # Get stats
            cur.execute(
                """
                SELECT 
                    COUNT(*) FILTER (WHERE status = 'activated') as activated_count,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                    COALESCE(SUM(bonus_days) FILTER (WHERE status = 'activated'), 0) as total_bonus_days
                FROM referrals 
                WHERE referrer_username = %s AND referred_username IS NOT NULL
                """,
                (username,)
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
            cur.execute(
                "SELECT referrer_username FROM referrals WHERE referral_code = %s LIMIT 1",
                (referral_code,)
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
            cur.execute(
                "SELECT id FROM referrals WHERE referred_username = %s",
                (referred_username,)
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
            cur.execute(
                """
                INSERT INTO referrals (referrer_username, referral_code, referred_username, bonus_days, status)
                VALUES (%s, %s, %s, 7, 'pending')
                """,
                (referrer, referral_code, referred_username)
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
