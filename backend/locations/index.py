'''
Business: API для управления локациями (странами/сквадами) для конструктора подписок
Args: event - dict с httpMethod, queryStringParameters
Returns: HTTP response dict со списком локаций
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    admin_mode = params.get('admin', 'false') == 'true'
    headers = event.get('headers', {})
    admin_password = headers.get('X-Admin-Password', '')
    
    cors_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if admin_mode or method in ['POST', 'DELETE']:
        correct_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        if admin_password != correct_password:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
    
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            if admin_mode:
                cursor.execute("""
                    SELECT location_id, name, country_code, flag_emoji, 
                           price_per_day, traffic_gb_per_day, is_active, sort_order
                    FROM t_p66544974_beauty_website_proje.locations
                    ORDER BY sort_order, location_id
                """)
            else:
                cursor.execute("""
                    SELECT location_id, name, country_code, flag_emoji, 
                           price_per_day, traffic_gb_per_day, is_active, sort_order
                    FROM t_p66544974_beauty_website_proje.locations
                    WHERE is_active = true
                    ORDER BY sort_order, location_id
                """)
            
            rows = cursor.fetchall()
            locations = []
            
            for row in rows:
                locations.append({
                    'location_id': row[0],
                    'name': row[1],
                    'country_code': row[2],
                    'flag': row[3],
                    'price_per_day': float(row[4]),
                    'traffic_gb_per_day': row[5],
                    'is_active': row[6],
                    'sort_order': row[7]
                })
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'locations': locations}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            location_id = body.get('location_id')
            
            if location_id and location_id > 0:
                cursor.execute("""
                    UPDATE t_p66544974_beauty_website_proje.locations
                    SET name = %s, country_code = %s, flag_emoji = %s,
                        price_per_day = %s, traffic_gb_per_day = %s,
                        is_active = %s, sort_order = %s
                    WHERE location_id = %s
                """, (
                    body.get('name'),
                    body.get('country_code'),
                    body.get('flag'),
                    body.get('price_per_day'),
                    body.get('traffic_gb_per_day'),
                    body.get('is_active'),
                    body.get('sort_order'),
                    location_id
                ))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'Location updated'}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute("""
                    INSERT INTO t_p66544974_beauty_website_proje.locations 
                    (name, country_code, flag_emoji, price_per_day, traffic_gb_per_day, is_active, sort_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING location_id
                """, (
                    body.get('name'),
                    body.get('country_code'),
                    body.get('flag'),
                    body.get('price_per_day', 0),
                    body.get('traffic_gb_per_day', 1),
                    body.get('is_active', True),
                    body.get('sort_order', 0)
                ))
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({'location_id': new_id, 'message': 'Location created'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            location_id = params.get('location_id')
            if not location_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'location_id required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("DELETE FROM t_p66544974_beauty_website_proje.locations WHERE location_id = %s", (location_id,))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Location deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()