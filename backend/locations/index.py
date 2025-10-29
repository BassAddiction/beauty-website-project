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
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
