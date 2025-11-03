import json
import os
import psycopg2
import base64
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление настройками проекта (секреты, подключения к БД, API)
    Args: event - dict с httpMethod, body, headers
          context - объект с request_id, function_name
    Returns: HTTP ответ с настройками или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    headers_data = event.get('headers', {})
    admin_password = headers_data.get('x-admin-password', '') or headers_data.get('X-Admin-Password', '')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    expected_password = os.environ.get('ADMIN_PASSWORD', '')
    print(f'🔐 Проверка пароля: получен={bool(admin_password)}, ожидается={bool(expected_password)}, headers={list(headers_data.keys())}')
    
    if admin_password != expected_password:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Неверный пароль администратора'})
        }
    
    if method == 'GET':
        settings = {
            'database': {
                'url': get_secret_value('DATABASE_URL'),
                'status': 'unknown'
            },
            'yookassa': {
                'shop_id': get_secret_value('YOOKASSA_SHOP_ID'),
                'secret_key_masked': mask_secret(get_secret_value('YOOKASSA_SECRET_KEY')),
                'has_secret': bool(get_secret_value('YOOKASSA_SECRET_KEY'))
            },
            'remnawave': {
                'api_url': get_secret_value('REMNAWAVE_API_URL'),
                'api_token_masked': mask_secret(get_secret_value('REMNAWAVE_API_TOKEN')),
                'has_token': bool(get_secret_value('REMNAWAVE_API_TOKEN')),
                'function_url': get_secret_value('REMNAWAVE_FUNCTION_URL'),
                'squad_uuids': get_secret_value('USER_SQUAD_UUIDS'),
                'traffic_limit_gb': get_secret_value('USER_TRAFFIC_LIMIT_GB'),
                'traffic_strategy': get_secret_value('USER_TRAFFIC_STRATEGY')
            },
            'email': {
                'resend_api_key_masked': mask_secret(get_secret_value('RESEND_API_KEY')),
                'has_resend': bool(get_secret_value('RESEND_API_KEY')),
                'unisender_api_key_masked': mask_secret(get_secret_value('UNISENDER_API_KEY')),
                'has_unisender': bool(get_secret_value('UNISENDER_API_KEY'))
            }
        }
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'isBase64Encoded': False,
            'body': json.dumps(settings)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')
        
        if action == 'test_database':
            db_url = body_data.get('database_url') or os.environ.get('DATABASE_URL', '')
            result = test_database_connection(db_url)
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        
        if action == 'test_yookassa':
            shop_id = body_data.get('shop_id') or os.environ.get('YOOKASSA_SHOP_ID', '')
            secret_key = body_data.get('secret_key') or os.environ.get('YOOKASSA_SECRET_KEY', '')
            result = test_yookassa_connection(shop_id, secret_key)
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        
        if action == 'test_remnawave':
            api_url = body_data.get('api_url') or get_secret_value('REMNAWAVE_API_URL')
            api_token = body_data.get('api_token') or get_secret_value('REMNAWAVE_API_TOKEN')
            result = test_remnawave_connection(api_url, api_token)
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Неизвестное действие'})
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        updates = body_data.get('secrets', {})
        
        if not updates:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Нет данных для обновления'})
            }
        
        result = update_secrets(updates)
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'isBase64Encoded': False,
            'body': json.dumps(result)
        }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }


def get_secret_value(key: str) -> str:
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return os.environ.get(key, '')
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        cursor.execute(
            'SELECT secret_value FROM project_secrets WHERE secret_key = %s',
            (key,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result:
            encoded_value = result[0]
            return base64.b64decode(encoded_value).decode('utf-8')
    except Exception as e:
        print(f'❌ Ошибка чтения секрета {key} из БД: {e}')
    
    return os.environ.get(key, '')


def update_secrets(updates: Dict[str, str]) -> Dict[str, Any]:
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return {'success': False, 'message': 'DATABASE_URL не настроен'}
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        updated_keys = []
        
        for key, value in updates.items():
            if not value:
                continue
            
            encoded_value = base64.b64encode(value.encode('utf-8')).decode('utf-8')
            
            cursor.execute(
                '''INSERT INTO project_secrets (secret_key, secret_value, updated_at)
                   VALUES (%s, %s, CURRENT_TIMESTAMP)
                   ON CONFLICT (secret_key) 
                   DO UPDATE SET secret_value = EXCLUDED.secret_value, 
                                 updated_at = CURRENT_TIMESTAMP''',
                (key, encoded_value)
            )
            updated_keys.append(key)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'success': True,
            'message': f'Обновлено секретов: {len(updated_keys)}',
            'updated_keys': updated_keys
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'Ошибка обновления: {str(e)}'
        }


def mask_secret(secret: str) -> str:
    if not secret or len(secret) < 8:
        return '***' if secret else ''
    return secret[:4] + '***' + secret[-4:]


def test_database_connection(db_url: str) -> Dict[str, Any]:
    if not db_url:
        return {'success': False, 'message': 'DATABASE_URL не указан'}
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return {
            'success': True,
            'message': 'Подключение успешно',
            'version': version[:50]
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'Ошибка подключения: {str(e)}'
        }


def test_yookassa_connection(shop_id: str, secret_key: str) -> Dict[str, Any]:
    if not shop_id or not secret_key:
        return {'success': False, 'message': 'Shop ID или Secret Key не указаны'}
    
    try:
        import requests
        import base64
        
        auth_string = f"{shop_id}:{secret_key}"
        auth_bytes = auth_string.encode('utf-8')
        auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
        
        response = requests.get(
            'https://api.yookassa.ru/v3/payments',
            headers={
                'Authorization': f'Basic {auth_b64}',
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'message': 'Подключение к ЮKassa успешно',
                'shop_id': shop_id
            }
        else:
            return {
                'success': False,
                'message': f'Ошибка: HTTP {response.status_code}'
            }
    except Exception as e:
        return {
            'success': False,
            'message': f'Ошибка подключения: {str(e)}'
        }


def test_remnawave_connection(api_url: str, api_token: str) -> Dict[str, Any]:
    if not api_url or not api_token:
        return {'success': False, 'message': 'API URL или Token не указаны'}
    
    try:
        import requests
        
        response = requests.get(
            f"{api_url.rstrip('/')}/api/admin/users",
            headers={
                'Authorization': f'Bearer {api_token}',
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'message': 'Подключение к Remnawave успешно',
                'api_url': api_url
            }
        else:
            return {
                'success': False,
                'message': f'Ошибка: HTTP {response.status_code}'
            }
    except Exception as e:
        return {
            'success': False,
            'message': f'Ошибка подключения: {str(e)}'
        }