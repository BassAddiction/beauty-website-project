'''
Business: API для управления кодами счётчиков и метатегов в админке
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными кодов или статусом операции
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = None
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'DATABASE_URL not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tracking_codes (
                id SERIAL PRIMARY KEY,
                head_code TEXT DEFAULT '',
                body_code TEXT DEFAULT '',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cur.execute("SELECT COUNT(*) FROM tracking_codes")
        count = cur.fetchone()[0]
        if count == 0:
            cur.execute("INSERT INTO tracking_codes (head_code, body_code) VALUES ('', '')")
        
        conn.commit()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            admin_password = params.get('admin_password', '')
            
            correct_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
            
            if admin_password != 'none' and admin_password != correct_password:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': False, 'error': 'Invalid admin password'})
                }
            
            cur.execute("SELECT head_code, body_code FROM tracking_codes LIMIT 1")
            row = cur.fetchone()
            
            head_code = row[0] if row else ''
            body_code = row[1] if row else ''
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'head_code': head_code,
                    'body_code': body_code
                })
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            admin_password = body_data.get('admin_password', '')
            
            correct_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
            if admin_password != correct_password:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': False, 'error': 'Invalid admin password'})
                }
            
            head_code = body_data.get('head_code', '')
            body_code = body_data.get('body_code', '')
            
            cur.execute("""
                UPDATE tracking_codes 
                SET head_code = %s, body_code = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            """, (head_code, body_code))
            
            if cur.rowcount == 0:
                cur.execute("""
                    INSERT INTO tracking_codes (id, head_code, body_code) 
                    VALUES (1, %s, %s)
                """, (head_code, body_code))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': str(e)})
        }
    finally:
        if conn:
            conn.close()