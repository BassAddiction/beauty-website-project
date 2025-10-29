'''
Business: Синхронизация локаций из Remnawave internal squads в базу данных
Args: event - dict с httpMethod
Returns: HTTP response dict с результатами синхронизации
'''

import json
import os
import psycopg2
import requests
from typing import Dict, Any, List

COUNTRY_FLAGS = {
    'RU': '🇷🇺', 'US': '🇺🇸', 'DE': '🇩🇪', 'FR': '🇫🇷', 'GB': '🇬🇧', 
    'JP': '🇯🇵', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NL': '🇳🇱', 'SG': '🇸🇬',
    'SE': '🇸🇪', 'CH': '🇨🇭', 'FI': '🇫🇮', 'NO': '🇳🇴', 'DK': '🇩🇰',
    'PL': '🇵🇱', 'IT': '🇮🇹', 'ES': '🇪🇸', 'BR': '🇧🇷', 'IN': '🇮🇳',
    'KR': '🇰🇷', 'HK': '🇭🇰', 'TW': '🇹🇼', 'TR': '🇹🇷', 'UA': '🇺🇦'
}

def parse_country_from_name(name: str) -> tuple:
    '''Извлечь код страны и название из имени сквада'''
    name_upper = name.upper()
    
    for code, flag in COUNTRY_FLAGS.items():
        if code in name_upper:
            country_name = name.split('-')[0].strip() if '-' in name else name
            return code, flag, country_name
    
    return 'XX', '🌍', name

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    headers_in = event.get('headers', {})
    
    if isinstance(headers_in, str):
        admin_password = ''
    else:
        admin_password = headers_in.get('X-Admin-Password', '') if headers_in else ''
    
    cors_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    correct_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    if admin_password != correct_password:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
    api_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
    db_url = os.environ.get('DATABASE_URL', '')
    
    if not api_url or not api_token:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Remnawave API not configured'}),
            'isBase64Encoded': False
        }
    
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        print(f'Fetching squads from {api_url}/api/internal-squads')
        response = requests.get(
            f'{api_url}/api/internal-squads',
            headers={'Authorization': f'Bearer {api_token}'},
            timeout=10
        )
        
        print(f'Remnawave API response: {response.status_code}')
        
        if response.status_code != 200:
            error_body = response.text[:200]
            print(f'Error from Remnawave: {error_body}')
            return {
                'statusCode': response.status_code,
                'headers': cors_headers,
                'body': json.dumps({'error': f'Failed to fetch squads: {error_body}'}),
                'isBase64Encoded': False
            }
        
        squads_data = response.json()
        print(f'Raw response type: {type(squads_data)}')
        print(f'Raw response sample: {str(squads_data)[:500]}')
        
        # Extract internalSquads from response
        if isinstance(squads_data, dict) and 'response' in squads_data:
            response_obj = squads_data['response']
            squads = response_obj.get('internalSquads', [])
        elif isinstance(squads_data, dict):
            squads = squads_data.get('squads', squads_data.get('data', []))
        else:
            squads = squads_data
        
        print(f'Received {len(squads)} squads from Remnawave')
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        synced = 0
        updated = 0
        skipped = 0
        
        for idx, squad in enumerate(squads):
            # Check if squad is a dict or has get method
            if isinstance(squad, str):
                print(f'Skipping squad {idx}: squad is a string, not dict')
                skipped += 1
                continue
                
            squad_id = squad.get('uuid') or squad.get('id')
            squad_name = squad.get('name', '')
            
            if not squad_id or not squad_name:
                print(f'Skipping squad {idx}: missing id or name. Squad: {squad}')
                skipped += 1
                continue
            
            country_code, flag, country_name = parse_country_from_name(squad_name)
            print(f'Squad: {squad_name} -> {country_code} {flag} {country_name}')
            
            cursor.execute("""
                SELECT location_id FROM t_p66544974_beauty_website_proje.locations
                WHERE country_code = %s
            """, (country_code,))
            
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute("""
                    UPDATE t_p66544974_beauty_website_proje.locations
                    SET name = %s, flag_emoji = %s
                    WHERE country_code = %s
                """, (country_name, flag, country_code))
                updated += 1
            else:
                cursor.execute("""
                    INSERT INTO t_p66544974_beauty_website_proje.locations
                    (name, country_code, flag_emoji, price_per_day, traffic_gb_per_day, is_active, sort_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (country_name, country_code, flag, 5.0, 1, True, idx + 1))
                synced += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'Sync completed: synced={synced}, updated={updated}, skipped={skipped}')
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Sync completed',
                'total_squads': len(squads),
                'synced': synced,
                'updated': updated,
                'skipped': skipped
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f'Sync error: {str(e)}')
        print(f'Traceback: {error_trace}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e), 'trace': error_trace[:500]}),
            'isBase64Encoded': False
        }