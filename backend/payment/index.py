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
                        now = datetime.now().timestamp()
                        new_expire = now + (plan_days * 86400)
                        expire_iso = datetime.fromtimestamp(new_expire, tz=timezone.utc).isoformat().replace('+00:00', 'Z')
                        
                        # Пробуем создать пользователя
                        print(f'🆕 Attempting to create user {username}')
                        
                        payload = {
                            'username': username,
                            'trafficLimitBytes': 32212254720,
                            'trafficLimitStrategy': 'DAY',
                            'expireAt': expire_iso,
                            'inboundUuids': [
                                '6afd8de3-00d5-41db-aa52-f259fb98b2c8',
                                '9ef43f96-83c9-4252-ae57-bb17dc9b60a9'
                            ]
                        }
                        
                        print(f'📦 Creating user payload: {json.dumps(payload, ensure_ascii=False)}')
                        
                        create_response = requests.post(
                            f'{remnawave_url}/api/users',
                            headers={
                                'Authorization': f'Bearer {remnawave_token}',
                                'Content-Type': 'application/json'
                            },
                            json=payload,
                            timeout=10
                        )
                        
                        print(f'📥 Create response: {create_response.status_code}')
                        print(f'📄 Response body: {create_response.text[:1000]}')
                        
                        # Если создан успешно (201)
                        if create_response.status_code in [200, 201]:
                            print(f'✅ User created successfully')
                            user_data = create_response.json().get('response', {})
                            subscription_url = user_data.get('subscription_url', user_data.get('sub_url', ''))
                            print(f'🔗 Subscription URL: {subscription_url}')
                            
                            update_response = create_response
                        
                        # Если пользователь уже существует (400 + errorCode A019)
                        elif create_response.status_code == 400:
                            error_data = create_response.json()
                            if error_data.get('errorCode') == 'A019':
                                print(f'🔄 User exists (A019), trying direct update for {username}')
                                
                                # Раз API говорит что пользователь существует - пробуем обновить напрямую
                                # используя стандартное время expire (30 дней от сейчас)
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
                                        'inbounds': {
                                            'vless-reality': ['6afd8de3-00d5-41db-aa52-f259fb98b2c8', '9ef43f96-83c9-4252-ae57-bb17dc9b60a9']
                                        }
                                    },
                                    timeout=10
                                )
                                
                                print(f'📝 Update response: {update_response.status_code}')
                                
                                if update_response.status_code == 200:
                                    print(f'✅ User updated successfully')
                                    # Успешно обновили
                                    pass
                                else:
                                    error_text = update_response.text
                                    print(f'❌ Update failed: {error_text}')
                                    raise Exception(f'Failed to update user: {error_text}')
                            else:
                                raise Exception(f'Creation failed: {create_response.text}')
                        else:
                            raise Exception(f'Unexpected response: {create_response.status_code} - {create_response.text}')
                        
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