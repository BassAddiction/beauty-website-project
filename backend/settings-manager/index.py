import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление настройками проекта (секреты, подключения к БД, API)
    Args: event - dict с httpMethod, body, headers
          context - объект с request_id, function_name
    Returns: HTTP ответ с настройками или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    headers_data = event.get('headers', {})
    admin_password = headers_data.get('x-admin-password', '')
    
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
                'url': os.environ.get('DATABASE_URL', ''),
                'status': 'unknown'
            },
            'yookassa': {
                'shop_id': os.environ.get('YOOKASSA_SHOP_ID', ''),
                'secret_key_masked': mask_secret(os.environ.get('YOOKASSA_SECRET_KEY', '')),
                'has_secret': bool(os.environ.get('YOOKASSA_SECRET_KEY', ''))
            },
            'remnawave': {
                'api_url': os.environ.get('REMNAWAVE_API_URL', ''),
                'api_token_masked': mask_secret(os.environ.get('REMNAWAVE_API_TOKEN', '')),
                'has_token': bool(os.environ.get('REMNAWAVE_API_TOKEN', '')),
                'function_url': os.environ.get('REMNAWAVE_FUNCTION_URL', ''),
                'squad_uuids': os.environ.get('USER_SQUAD_UUIDS', ''),
                'traffic_limit_gb': os.environ.get('USER_TRAFFIC_LIMIT_GB', ''),
                'traffic_strategy': os.environ.get('USER_TRAFFIC_STRATEGY', '')
            },
            'email': {
                'resend_api_key_masked': mask_secret(os.environ.get('RESEND_API_KEY', '')),
                'has_resend': bool(os.environ.get('RESEND_API_KEY', '')),
                'unisender_api_key_masked': mask_secret(os.environ.get('UNISENDER_API_KEY', '')),
                'has_unisender': bool(os.environ.get('UNISENDER_API_KEY', ''))
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
            api_url = body_data.get('api_url') or os.environ.get('REMNAWAVE_API_URL', '')
            api_token = body_data.get('api_token') or os.environ.get('REMNAWAVE_API_TOKEN', '')
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
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Метод не поддерживается'})
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
