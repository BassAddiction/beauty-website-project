'''
Business: Admin API for managing VPN users in database and RemnaWave
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with request_id attribute
Returns: HTTP response dict with user list, deletion results, or errors
'''

import json
import os
import psycopg2
import requests
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Проверяем admin ключ
    headers = event.get('headers', {})
    admin_key = headers.get('x-admin-key', '')
    expected_admin_key = os.environ.get('ADMIN_PASSWORD', '')
    
    if not admin_key or admin_key != expected_admin_key:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return get_users_list(cors_headers)
    
    if method == 'DELETE':
        return delete_user(event, cors_headers)
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def get_users_list(cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получает список всех пользователей из БД с их статусами'''
    try:
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
        
        cursor.execute('''
            SELECT 
                username, 
                email, 
                plan_name, 
                plan_days, 
                status, 
                created_at,
                updated_at
            FROM t_p66544974_beauty_website_proje.payments
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        
        users = []
        for row in rows:
            users.append({
                'username': row[0],
                'email': row[1],
                'plan_name': row[2],
                'plan_days': row[3],
                'status': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'updated_at': row[6].isoformat() if row[6] else None
            })
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'users': users, 'total': len(users)}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Error fetching users: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def delete_user(event: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Удаляет пользователя из БД и RemnaWave'''
    try:
        params = event.get('queryStringParameters', {})
        username = params.get('username', '')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Username is required'}),
                'isBase64Encoded': False
            }
        
        # Удаляем из RemnaWave
        remnawave_result = delete_from_remnawave(username)
        
        # Удаляем из БД
        db_result = delete_from_database(username)
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': f'User {username} deleted successfully',
                'remnawave': remnawave_result,
                'database': db_result
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Error deleting user: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def delete_from_remnawave(username: str) -> Dict[str, Any]:
    '''Удаляет пользователя из RemnaWave через API'''
    try:
        remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        if not remnawave_url or not remnawave_token:
            print('⚠️ RemnaWave API not configured, skipping')
            return {'status': 'skipped', 'reason': 'API not configured'}
        
        headers = {
            'Authorization': f'Bearer {remnawave_token}',
            'Content-Type': 'application/json'
        }
        
        # Сначала получаем UUID пользователя
        users_response = requests.get(
            f'{remnawave_url}/api/users',
            headers=headers,
            timeout=15
        )
        
        if users_response.status_code != 200:
            print(f'❌ Failed to fetch users from RemnaWave: {users_response.status_code}')
            return {'status': 'error', 'message': 'Failed to fetch users'}
        
        users_data = users_response.json()
        
        # Извлекаем список пользователей
        if 'response' in users_data and 'users' in users_data['response']:
            users_list = users_data['response']['users']
        elif 'users' in users_data:
            users_list = users_data['users']
        elif isinstance(users_data, list):
            users_list = users_data
        else:
            users_list = []
        
        # Ищем пользователя по username
        target_user = None
        for user in users_list:
            if user.get('username') == username:
                target_user = user
                break
        
        if not target_user:
            print(f'⚠️ User {username} not found in RemnaWave')
            return {'status': 'not_found', 'message': 'User not found in RemnaWave'}
        
        user_uuid = target_user.get('uuid')
        
        # Удаляем пользователя
        delete_response = requests.delete(
            f'{remnawave_url}/api/users/{user_uuid}',
            headers=headers,
            timeout=15
        )
        
        if delete_response.status_code in [200, 204]:
            print(f'✅ User {username} deleted from RemnaWave')
            return {'status': 'success', 'uuid': user_uuid}
        else:
            print(f'❌ Failed to delete from RemnaWave: {delete_response.status_code}')
            return {'status': 'error', 'message': delete_response.text}
        
    except Exception as e:
        print(f'❌ RemnaWave deletion error: {str(e)}')
        return {'status': 'error', 'message': str(e)}


def delete_from_database(username: str) -> Dict[str, Any]:
    '''Удаляет пользователя из базы данных'''
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return {'status': 'error', 'message': 'Database not configured'}
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Удаляем все записи пользователя
        cursor.execute('''
            DELETE FROM t_p66544974_beauty_website_proje.payments
            WHERE username = %s
        ''', (username,))
        
        deleted_count = cursor.rowcount
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'✅ Deleted {deleted_count} records for user {username} from database')
        return {'status': 'success', 'deleted_records': deleted_count}
        
    except Exception as e:
        print(f'❌ Database deletion error: {str(e)}')
        return {'status': 'error', 'message': str(e)}
