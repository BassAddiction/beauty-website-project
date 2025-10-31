'''
Business: Bruteforce protection for login attempts (admin and users)
Args: event - dict with httpMethod, body, headers
      context - object with request_id attribute
Returns: HTTP response with login check result or block status
'''

import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Настройки защиты
MAX_ATTEMPTS = 3
BLOCK_DURATION_MINUTES = 15
CLEANUP_HOURS = 24

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем IP из requestContext (Cloud Functions format)
        request_context = event.get('requestContext', {})
        identity = request_context.get('identity', {})
        ip_address = identity.get('sourceIp', 'unknown')
        
        # Fallback на headers если нет в requestContext
        if ip_address == 'unknown':
            headers = event.get('headers', {})
            ip_address = (
                headers.get('x-forwarded-for', '').split(',')[0].strip() or
                headers.get('x-real-ip', '') or
                headers.get('x-client-ip', '') or
                'unknown'
            )
        
        print(f'🔍 Detected IP: {ip_address}')
        
        # Парсим body
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')  # 'check' или 'record'
        username = body_data.get('username', '')
        success = body_data.get('success', False)
        login_type = body_data.get('login_type', 'user')  # 'admin' или 'user'
        
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        
        # Очистка старых записей (старше 24 часов)
        cleanup_old_attempts(conn)
        
        if action == 'check':
            # Проверка, заблокирован ли IP для конкретного типа логина
            blocked = is_ip_blocked(conn, ip_address, login_type)
            conn.close()
            
            if blocked:
                return {
                    'statusCode': 429,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'blocked': True,
                        'message': f'Слишком много неудачных попыток. Попробуйте через {BLOCK_DURATION_MINUTES} минут'
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'blocked': False}),
                'isBase64Encoded': False
            }
        
        elif action == 'record':
            # Запись попытки авторизации с типом логина
            record_attempt(conn, ip_address, username, success, login_type)
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'recorded': True}),
                'isBase64Encoded': False
            }
        
        else:
            conn.close()
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid action. Use "check" or "record"'}),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        print(f'❌ Auth check error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def is_ip_blocked(conn, ip_address: str, login_type: str = 'user') -> bool:
    '''Проверяет, заблокирован ли IP-адрес для конкретного типа логина'''
    cursor = conn.cursor()
    
    # Время начала блокировки (15 минут назад)
    block_start = datetime.utcnow() - timedelta(minutes=BLOCK_DURATION_MINUTES)
    
    # Считаем неудачные попытки за последние 15 минут для конкретного типа логина
    cursor.execute('''
        SELECT COUNT(*) 
        FROM t_p66544974_beauty_website_proje.login_attempts
        WHERE ip_address = %s 
          AND login_type = %s
          AND attempt_time >= %s
          AND success = FALSE
    ''', (ip_address, login_type, block_start))
    
    failed_count = cursor.fetchone()[0]
    cursor.close()
    
    print(f'🔍 IP block check: {ip_address} ({login_type}) - {failed_count}/{MAX_ATTEMPTS} failed attempts')
    
    return failed_count >= MAX_ATTEMPTS


def record_attempt(conn, ip_address: str, username: str, success: bool, login_type: str = 'user'):
    '''Записывает попытку авторизации с типом логина'''
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO t_p66544974_beauty_website_proje.login_attempts 
        (ip_address, username, success, login_type, attempt_time)
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
    ''', (ip_address, username or None, success, login_type))
    
    conn.commit()
    cursor.close()
    
    print(f'📝 Recorded login attempt: IP={ip_address}, user={username}, type={login_type}, success={success}')


def cleanup_old_attempts(conn):
    '''Удаляет старые записи (старше 24 часов)'''
    cursor = conn.cursor()
    
    cleanup_time = datetime.utcnow() - timedelta(hours=CLEANUP_HOURS)
    
    cursor.execute('''
        DELETE FROM t_p66544974_beauty_website_proje.login_attempts
        WHERE attempt_time < %s
    ''', (cleanup_time,))
    
    deleted = cursor.rowcount
    conn.commit()
    cursor.close()
    
    if deleted > 0:
        print(f'🧹 Cleaned up {deleted} old login attempts')