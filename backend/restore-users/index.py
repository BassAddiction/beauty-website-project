'''
Business: Восстановление удаленных пользователей в Remnawave из базы данных
Args: event с httpMethod POST, опционально username для восстановления одного пользователя
Returns: Результат восстановления пользователей
'''

import json
import os
import psycopg2
import requests
from typing import Dict, Any, List
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Проверка админского ключа
    headers = event.get('headers', {})
    admin_key = headers.get('X-Admin-Key', headers.get('x-admin-key', ''))
    expected_key = os.environ.get('ADMIN_PASSWORD', '')
    
    if not admin_key or admin_key != expected_key:
        return {
            'statusCode': 403,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    # Получаем username из body если нужно восстановить одного пользователя
    body_str = event.get('body', '{}')
    try:
        body_data = json.loads(body_str) if body_str else {}
    except:
        body_data = {}
    
    target_username = body_data.get('username', '')
    
    try:
        result = restore_users(target_username)
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def restore_users(target_username: str = '') -> Dict[str, Any]:
    '''Восстанавливает пользователей в Remnawave'''
    
    db_url = os.environ.get('DATABASE_URL', '')
    remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
    remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
    
    if not db_url or not remnawave_api_url or not remnawave_token:
        return {'error': 'Missing credentials'}
    
    # Получаем список существующих пользователей в Remnawave
    print('🔍 Fetching existing users from Remnawave...')
    try:
        response = requests.get(
            f'{remnawave_api_url}/api/users',
            headers={'Authorization': f'Bearer {remnawave_token}'},
            timeout=15
        )
        
        if response.status_code != 200:
            return {'error': f'Failed to fetch Remnawave users: {response.text}'}
        
        users_data = response.json()
        existing_users = users_data.get('response', {}).get('users', [])
        existing_usernames = {u.get('username') for u in existing_users}
        
        print(f'✅ Found {len(existing_usernames)} existing users in Remnawave')
        
    except Exception as e:
        return {'error': f'Failed to connect to Remnawave: {str(e)}'}
    
    # Получаем пользователей из БД
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    if target_username:
        # Восстанавливаем одного пользователя
        safe_username = target_username.replace("'", "''")
        cursor.execute(f"""
            SELECT 
                p.username, 
                p.email, 
                p.plan_name, 
                p.plan_days,
                p.created_at,
                uu.remnawave_uuid
            FROM t_p66544974_beauty_website_proje.payments p
            LEFT JOIN t_p66544974_beauty_website_proje.user_uuids uu ON p.username = uu.username
            WHERE p.username = '{safe_username}' AND p.status = 'succeeded'
            LIMIT 1
        """)
    else:
        # Восстанавливаем всех пользователей
        cursor.execute("""
            SELECT 
                p.username, 
                p.email, 
                p.plan_name, 
                p.plan_days,
                p.created_at,
                uu.remnawave_uuid
            FROM t_p66544974_beauty_website_proje.payments p
            LEFT JOIN t_p66544974_beauty_website_proje.user_uuids uu ON p.username = uu.username
            WHERE p.status = 'succeeded'
            ORDER BY p.created_at ASC
        """)
    
    users_to_restore = cursor.fetchall()
    cursor.close()
    conn.close()
    
    print(f'📋 Found {len(users_to_restore)} users in database')
    
    restored = []
    skipped = []
    errors = []
    
    for user_data in users_to_restore:
        username = user_data[0]
        email = user_data[1]
        plan_name = user_data[2]
        plan_days = user_data[3]
        created_at = user_data[4]
        old_uuid = user_data[5]
        
        # Пропускаем если пользователь уже существует в Remnawave
        if username in existing_usernames:
            print(f'⏭️  Skipping {username} - already exists in Remnawave')
            skipped.append(username)
            continue
        
        # Создаем пользователя в Remnawave
        print(f'🔄 Restoring user: {username}')
        
        result = create_user_in_remnawave(username, email, plan_days)
        
        if result.get('success'):
            restored.append({
                'username': username,
                'email': email,
                'subscription_url': result.get('subscription_url', ''),
                'old_uuid': old_uuid
            })
            print(f'✅ Restored: {username}')
        else:
            errors.append({
                'username': username,
                'error': result.get('error', 'Unknown error')
            })
            print(f'❌ Failed to restore {username}: {result.get("error")}')
    
    return {
        'success': True,
        'total_in_db': len(users_to_restore),
        'restored': len(restored),
        'skipped': len(skipped),
        'errors': len(errors),
        'restored_users': restored,
        'skipped_users': skipped,
        'error_details': errors
    }


def create_user_in_remnawave(username: str, email: str, plan_days: int) -> Dict[str, Any]:
    '''Создает пользователя в Remnawave'''
    try:
        remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        
        # Вычисляем дату окончания подписки
        expire_timestamp = int(datetime.now().timestamp()) + (plan_days * 86400)
        
        # Дефолтные настройки для восстановленных пользователей
        traffic_gb = 30
        data_limit = traffic_gb * 1024 * 1024 * 1024
        squad_uuids = ['e742f30b-82fb-431a-918b-1b4d22d6ba4d']  # дефолтный squad
        
        payload = {
            'action': 'create_user',
            'username': username,
            'email': email,
            'proxies': {
                'vless-reality': {}
            },
            'data_limit': data_limit,
            'expire': expire_timestamp,
            'data_limit_reset_strategy': 'day',
            'internalSquads': squad_uuids
        }
        
        print(f'🔹 Creating user in Remnawave: {username}')
        
        response = requests.post(
            remnawave_url,
            headers={'Content-Type': 'application/json'},
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            response_data = data.get('response', data)
            subscription_url = response_data.get('subscriptionUrl', response_data.get('subscription_url', ''))
            user_uuid = response_data.get('uuid', '')
            
            print(f'✅ User created: {subscription_url}, UUID: {user_uuid}')
            
            # Сохраняем UUID в базу данных
            if user_uuid:
                try:
                    db_url = os.environ.get('DATABASE_URL', '')
                    if db_url:
                        conn = psycopg2.connect(db_url)
                        cur = conn.cursor()
                        safe_username = username.replace("'", "''")
                        safe_uuid = user_uuid.replace("'", "''")
                        cur.execute(f"""
                            INSERT INTO t_p66544974_beauty_website_proje.user_uuids (username, remnawave_uuid, created_at)
                            VALUES ('{safe_username}', '{safe_uuid}', NOW())
                            ON CONFLICT (username, remnawave_uuid) DO UPDATE 
                            SET created_at = NOW()
                        """)
                        conn.commit()
                        cur.close()
                        conn.close()
                        print(f'💾 UUID saved to DB: {user_uuid}')
                except Exception as e:
                    print(f'⚠️ Failed to save UUID: {str(e)}')
            
            return {'success': True, 'subscription_url': subscription_url, 'uuid': user_uuid}
        else:
            print(f'❌ Remnawave error: {response.status_code} - {response.text}')
            return {'success': False, 'error': response.text}
        
    except Exception as e:
        print(f'❌ Error creating user: {str(e)}')
        return {'success': False, 'error': str(e)}
