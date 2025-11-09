'''
Business: Управление новостями в админ-панели
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    admin_password = headers.get('X-Admin-Password') or headers.get('x-admin-password')
    query_params = event.get('queryStringParameters') or {}
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            public_access = query_params.get('public') == 'true'
            
            if not public_access:
                correct_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
                if admin_password != correct_password:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'})
                    }
                
                cur.execute('''
                    SELECT news_id, title, content, is_active, created_at, updated_at, sort_order
                    FROM news
                    ORDER BY sort_order DESC, created_at DESC
                ''')
            else:
                cur.execute('''
                    SELECT news_id, title, content, is_active, created_at, updated_at, sort_order
                    FROM news
                    WHERE is_active = true
                    ORDER BY sort_order DESC, created_at DESC
                ''')
            
            rows = cur.fetchall()
            news_list = []
            for row in rows:
                news_list.append({
                    'news_id': row[0],
                    'title': row[1],
                    'content': row[2],
                    'is_active': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'updated_at': row[5].isoformat() if row[5] else None,
                    'sort_order': row[6]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'news': news_list})
            }
        
        correct_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        if admin_password != correct_password:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            news_id = body_data.get('news_id')
            title = body_data.get('title', '')
            content = body_data.get('content', '')
            is_active = body_data.get('is_active', True)
            sort_order = body_data.get('sort_order')
            
            if news_id:
                cur.execute('''
                    UPDATE news
                    SET title = %s, content = %s, is_active = %s, sort_order = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE news_id = %s
                ''', (title, content, is_active, sort_order, news_id))
            else:
                if sort_order is None:
                    cur.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM news')
                    sort_order = cur.fetchone()[0]
                
                cur.execute('''
                    INSERT INTO news (title, content, is_active, sort_order)
                    VALUES (%s, %s, %s, %s)
                    RETURNING news_id
                ''', (title, content, is_active, sort_order))
                news_id = cur.fetchone()[0]
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'news_id': news_id})
            }
        
        if method == 'DELETE':
            news_id = query_params.get('news_id')
            if not news_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'news_id required'})
                }
            
            cur.execute('DELETE FROM news WHERE news_id = %s', (news_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()