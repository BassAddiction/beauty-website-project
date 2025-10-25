import json
import os
import uuid
import base64
import requests
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta, timezone

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
        notification_type = body_data.get('type')  # ЮKassa webhook
        
        # Webhook от ЮKassa (приоритет выше)
        if notification_type == 'notification' or body_data.get('event') == 'payment.succeeded':
            webhook_data = body_data.get('object', {})
            payment_id = webhook_data.get('id')
            status = webhook_data.get('status')
            metadata = webhook_data.get('metadata', {})
            
            print(f'🔔 WEBHOOK: payment_id={payment_id}, status={status}')
            print(f'🔔 Metadata: {json.dumps(metadata, ensure_ascii=False)}')
            
            if status == 'succeeded':
                username = metadata.get('username')
                plan_days = int(metadata.get('plan_days', 30))
                email = webhook_data.get('receipt', {}).get('customer', {}).get('email', '')
                
                print(f'✅ Payment succeeded: username={username}, days={plan_days}')
                
                # Обновляем подписку пользователя через Remnawave API
                remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
                remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
                subscription_url = ''
                
                if remnawave_url and remnawave_token:
                    try:
                        # Получаем текущие данные пользователя
                        user_response = requests.get(
                            f'{remnawave_url}/api/user/{username}',
                            headers={'Authorization': f'Bearer {remnawave_token}'},
                            timeout=10
                        )
                        
                        now = datetime.now().timestamp()
                        new_expire = now + (plan_days * 86400)
                        
                        # Если пользователь НЕ существует (404) - создаём его
                        if user_response.status_code == 404:
                            print(f'🆕 Creating NEW user {username}')
                            
                            expire_iso = datetime.fromtimestamp(new_expire, tz=timezone.utc).isoformat().replace('+00:00', 'Z')
                            
                            create_response = requests.post(
                                f'{remnawave_url}/api/users',
                                headers={
                                    'Authorization': f'Bearer {remnawave_token}',
                                    'Content-Type': 'application/json'
                                },
                                json={
                                    'username': username,
                                    'dataLimit': 32212254720,
                                    'expireAt': expire_iso,
                                    'dataLimitResetStrategy': 'day',
                                    'proxies': {
                                        'vless-reality': {}
                                    }
                                },
                                timeout=10
                            )
                            
                            print(f'✅ User created: {create_response.status_code} - {create_response.text[:200]}')
                            
                            if create_response.status_code in [200, 201]:
                                user_data = create_response.json()
                                subscription_url = user_data.get('subscription_url', user_data.get('sub_url', ''))
                                update_response = create_response
                            else:
                                raise Exception(f'Failed to create user: {create_response.text}')
                        
                        # Если пользователь существует - продлеваем подписку
                        elif user_response.status_code == 200:
                            user_data = user_response.json()
                            current_expire = user_data.get('expire', 0)
                            subscription_url = user_data.get('subscription_url', user_data.get('sub_url', ''))
                            
                            # Продлеваем подписку
                            if current_expire > now:
                                new_expire = current_expire + (plan_days * 86400)
                            
                            print(f'🔄 Updating existing user {username}')
                            
                            update_response = requests.put(
                                f'{remnawave_url}/api/user/{username}',
                                headers={
                                    'Authorization': f'Bearer {remnawave_token}',
                                    'Content-Type': 'application/json'
                                },
                                json={
                                    'expire': int(new_expire),
                                    'data_limit': 32212254720,
                                    'data_limit_reset_strategy': 'day',
                                    'proxies': {
                                        'vless-reality': {}
                                    }
                                },
                                timeout=10
                            )
                            
                            print(f'✅ User updated: {update_response.status_code}')
                            
                            if update_response.status_code != 200:
                                raise Exception(f'Failed to update user: {update_response.text}')
                        
                        else:
                            raise Exception(f'Unexpected status: {user_response.status_code}')
                        
                        if update_response.status_code in [200, 201]:
                                # Обновляем статус платежа в БД
                                try:
                                    db_url = os.environ.get('DATABASE_URL', '')
                                    if db_url:
                                        conn = psycopg2.connect(db_url)
                                        cursor = conn.cursor()
                                        cursor.execute(
                                            "UPDATE payments SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE payment_id = %s",
                                            ('succeeded', payment_id)
                                        )
                                        conn.commit()
                                        cursor.close()
                                        conn.close()
                                except Exception as db_err:
                                    print(f'⚠️ DB update failed: {str(db_err)}')
                                
                                # Отправляем email с данными доступа
                                if email and subscription_url:
                                    try:
                                        email_response = requests.post(
                                            'https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7',
                                            headers={'Content-Type': 'application/json'},
                                            json={
                                                'email': email,
                                                'subscription_url': subscription_url,
                                                'username': username
                                            },
                                            timeout=10
                                        )
                                        print(f'📧 Email sent: {email_response.status_code}')
                                    except Exception as email_err:
                                        print(f'❌ Email send failed: {str(email_err)}')
                                
                                return {
                                    'statusCode': 200,
                                    'headers': cors_headers,
                                    'body': json.dumps({'status': 'subscription_updated', 'email_sent': bool(email and subscription_url)}),
                                    'isBase64Encoded': False
                                }
                    except Exception as e:
                        print(f'❌ Webhook processing error: {str(e)}')
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'status': 'received'}),
                'isBase64Encoded': False
            }
        
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
                email = body_data.get('email', 'noreply@speedvpn.ru')
                payment_payload = {
                    'amount': {
                        'value': str(amount),
                        'currency': 'RUB'
                    },
                    'capture': True,
                    'confirmation': {
                        'type': 'redirect',
                        'return_url': f'https://beauty-website-project--preview.poehali.dev/payment-success?email={email}&username={username}'
                    },
                    'description': f'Speed VPN - {plan_name}',
                    'receipt': {
                        'customer': {
                            'email': email
                        },
                        'items': [
                            {
                                'description': f'Подписка Speed VPN - {plan_name}',
                                'quantity': '1',
                                'amount': {
                                    'value': str(amount),
                                    'currency': 'RUB'
                                },
                                'vat_code': 1,
                                'payment_mode': 'full_payment',
                                'payment_subject': 'service'
                            }
                        ]
                    },
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
                    
                    # Сохраняем платеж в БД
                    try:
                        db_url = os.environ.get('DATABASE_URL', '')
                        if db_url:
                            conn = psycopg2.connect(db_url)
                            cursor = conn.cursor()
                            cursor.execute(
                                "INSERT INTO payments (payment_id, username, amount, status, plan_name, plan_days, metadata) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                                (
                                    payment_data.get('id'),
                                    username,
                                    float(amount),
                                    payment_data.get('status'),
                                    plan_name,
                                    plan_days,
                                    json.dumps({'email': email})
                                )
                            )
                            conn.commit()
                            cursor.close()
                            conn.close()
                    except Exception as db_err:
                        print(f'⚠️ DB save failed: {str(db_err)}')
                    
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