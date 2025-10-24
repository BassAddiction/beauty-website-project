import json
import os
import uuid
import base64
import requests
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Создание и обработка платежей через ЮKassa для продления VPN подписок
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Не настроены данные ЮKassa',
                'message': 'Добавьте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в секреты проекта'
            }),
            'isBase64Encoded': False
        }
    
    auth_string = f'{shop_id}:{secret_key}'
    auth_token = base64.b64encode(auth_string.encode()).decode()
    
    yookassa_headers = {
        'Authorization': f'Basic {auth_token}',
        'Content-Type': 'application/json',
        'Idempotence-Key': str(uuid.uuid4())
    }
    
    # POST - создать платеж
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create_payment':
            username = body_data.get('username')
            amount = body_data.get('amount')
            plan_name = body_data.get('plan_name')
            plan_days = body_data.get('plan_days')
            
            if not all([username, amount, plan_name, plan_days]):
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            try:
                payment_payload = {
                    'amount': {
                        'value': str(amount),
                        'currency': 'RUB'
                    },
                    'capture': True,
                    'confirmation': {
                        'type': 'redirect',
                        'return_url': f'https://beauty-website-project.poehali.app/dashboard?payment=success'
                    },
                    'description': f'Speed VPN - {plan_name}',
                    'metadata': {
                        'username': username,
                        'plan_name': plan_name,
                        'plan_days': str(plan_days)
                    }
                }
                
                response = requests.post(
                    'https://api.yookassa.ru/v3/payments',
                    headers=yookassa_headers,
                    json=payment_payload,
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    payment_data = response.json()
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({
                            'payment_id': payment_data.get('id'),
                            'confirmation_url': payment_data.get('confirmation', {}).get('confirmation_url'),
                            'status': payment_data.get('status')
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': response.status_code,
                        'headers': cors_headers,
                        'body': response.text,
                        'isBase64Encoded': False
                    }
                    
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
        
        # Webhook от ЮKassa
        if action == 'webhook':
            webhook_data = body_data.get('object', {})
            payment_id = webhook_data.get('id')
            status = webhook_data.get('status')
            metadata = webhook_data.get('metadata', {})
            
            if status == 'succeeded':
                username = metadata.get('username')
                plan_days = int(metadata.get('plan_days', 30))
                
                # Обновляем подписку пользователя через Remnawave API
                remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
                remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
                
                if remnawave_url and remnawave_token:
                    try:
                        # Получаем текущие данные пользователя
                        user_response = requests.get(
                            f'{remnawave_url}/api/user/{username}',
                            headers={'Authorization': f'Bearer {remnawave_token}'},
                            timeout=10
                        )
                        
                        if user_response.status_code == 200:
                            user_data = user_response.json()
                            current_expire = user_data.get('expire', 0)
                            
                            # Продлеваем подписку
                            now = datetime.now().timestamp()
                            if current_expire > now:
                                new_expire = current_expire + (plan_days * 86400)
                            else:
                                new_expire = now + (plan_days * 86400)
                            
                            update_response = requests.put(
                                f'{remnawave_url}/api/user/{username}',
                                headers={
                                    'Authorization': f'Bearer {remnawave_token}',
                                    'Content-Type': 'application/json'
                                },
                                json={'expire': int(new_expire)},
                                timeout=10
                            )
                            
                            if update_response.status_code == 200:
                                return {
                                    'statusCode': 200,
                                    'headers': cors_headers,
                                    'body': json.dumps({'status': 'subscription_updated'}),
                                    'isBase64Encoded': False
                                }
                    except Exception as e:
                        pass
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'status': 'received'}),
                'isBase64Encoded': False
            }
    
    # GET - проверить статус платежа
    if method == 'GET':
        payment_id = event.get('queryStringParameters', {}).get('payment_id')
        
        if not payment_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Payment ID required'}),
                'isBase64Encoded': False
            }
        
        try:
            response = requests.get(
                f'https://api.yookassa.ru/v3/payments/{payment_id}',
                headers={'Authorization': f'Basic {auth_token}'},
                timeout=10
            )
            
            return {
                'statusCode': response.status_code,
                'headers': cors_headers,
                'body': response.text,
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }