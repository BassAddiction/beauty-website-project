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
    
    # GET - создать платёж
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        amount = params.get('amount')
        plan_name = params.get('plan_name')
        plan_days = params.get('plan_days')
        username = params.get('username')
        email = params.get('email', '')
        
        if not all([amount, plan_name, plan_days, username]):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Missing: amount, plan_name, plan_days, username'}),
                'isBase64Encoded': False
            }
        
        try:
            from requests.auth import HTTPBasicAuth
            
            payment_id = str(uuid.uuid4())
            host = event.get('headers', {}).get('host', 'localhost')
            
            return_url = 'https://speedvpn.poehali.dev/payment-success' if 'localhost' in host else f'https://{host}/payment-success'
            
            amount_formatted = f'{float(amount):.2f}'
            
            print(f'💳 Creating payment: amount={amount} -> {amount_formatted}, plan={plan_name}, days={plan_days}, user={username}')
            print(f'🔙 Return URL: {return_url}')
            
            payment_data = {
                'amount': {'value': amount_formatted, 'currency': 'RUB'},
                'confirmation': {
                    'type': 'redirect',
                    'return_url': return_url
                },
                'capture': True,
                'description': f'{plan_name} - {username}',
                'metadata': {
                    'username': username,
                    'plan_name': plan_name,
                    'plan_days': str(plan_days)
                }
            }
            
            if email:
                payment_data['receipt'] = {
                    'customer': {'email': email},
                    'items': [{
                        'description': f'VPN подписка {plan_name}',
                        'quantity': '1',
                        'amount': {'value': amount_formatted, 'currency': 'RUB'},
                        'vat_code': 1,
                        'payment_subject': 'service',
                        'payment_mode': 'full_payment'
                    }]
                }
            
            print(f'📦 Payment data: {json.dumps(payment_data, indent=2)}')
            
            response = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payment_data,
                auth=HTTPBasicAuth(shop_id, secret_key),
                headers={'Idempotence-Key': payment_id, 'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f'🔔 YooKassa response: status={response.status_code}, body={response.text[:300]}')
            
            if response.status_code != 200:
                return {
                    'statusCode': response.status_code,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'YooKassa error: {response.text[:200]}'}),
                    'isBase64Encoded': False
                }
            
            result = response.json()
            yookassa_payment_id = result.get('id')
            
            db_url = os.environ.get('DATABASE_URL', '')
            if db_url:
                try:
                    conn = psycopg2.connect(db_url)
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO payments (payment_id, username, email, amount, currency, status, plan_name, plan_days, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        ON CONFLICT (payment_id) DO NOTHING
                    """, (
                        yookassa_payment_id,
                        username,
                        email,
                        float(amount),
                        'RUB',
                        'pending',
                        plan_name,
                        int(plan_days)
                    ))
                    conn.commit()
                    cursor.close()
                    conn.close()
                    print(f'💾 Payment saved to DB: {yookassa_payment_id}')
                except Exception as db_err:
                    print(f'⚠️ Failed to save payment to DB: {str(db_err)}')
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'payment_id': yookassa_payment_id,
                    'confirmation_url': result.get('confirmation', {}).get('confirmation_url'),
                    'status': result.get('status')
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
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
                        
                        squad_uuids = ['6afd8de3-00d5-41db-aa52-f259fb98b2c8', '9ef43f96-83c9-4252-ae57-bb17dc9b60a9']
                        
                        payload = {
                            'username': username,
                            'trafficLimitBytes': 32212254720,
                            'trafficLimitStrategy': 'DAY',
                            'expireAt': expire_iso,
                            'activeInternalSquads': squad_uuids,
                            'inbounds': {
                                'vless-reality': squad_uuids
                            }
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
                            user_uuid = user_data.get('uuid')
                            subscription_url = user_data.get('subscription_url', user_data.get('sub_url', ''))
                            print(f'🔗 User UUID: {user_uuid}')
                            print(f'🔗 Subscription URL: {subscription_url}')
                            
                            # Проверяем сквады в ответе
                            active_squads = user_data.get('activeInternalSquads', [])
                            print(f'📊 Active squads: {active_squads}')
                            
                            if len(active_squads) > 0:
                                print(f'✅ User added to {len(active_squads)} squads!')
                            else:
                                print(f'⚠️ User created but not added to any squad')
                            
                            update_response = create_response
                        
                        # Если пользователь уже существует (400 + errorCode A019)
                        elif create_response.status_code == 400:
                            error_data = create_response.json()
                            if error_data.get('errorCode') == 'A019':
                                print(f'🔄 User exists (A019), trying direct update for {username}')
                                
                                # Обновляем пользователя и добавляем в оба squad
                                update_payload = {
                                    'expire': int(new_expire),
                                    'data_limit': 32212254720,
                                    'data_limit_reset_strategy': 'day'
                                }
                                
                                print(f'📦 Update payload: {json.dumps(update_payload, ensure_ascii=False)}')
                                
                                update_response = requests.put(
                                    f'{remnawave_url}/api/user/{username}',
                                    headers={
                                        'Authorization': f'Bearer {remnawave_token}',
                                        'Content-Type': 'application/json'
                                    },
                                    json=update_payload,
                                    timeout=10
                                )
                                
                                print(f'📝 Update user response: {update_response.status_code}')
                                
                                # Теперь добавляем в squad через отдельный запрос
                                if update_response.status_code == 200:
                                    squad_payload = {
                                        'inbounds': {
                                            'vless-reality': ['6afd8de3-00d5-41db-aa52-f259fb98b2c8', '9ef43f96-83c9-4252-ae57-bb17dc9b60a9']
                                        }
                                    }
                                    
                                    print(f'🔧 Adding to squads: {json.dumps(squad_payload, ensure_ascii=False)}')
                                    
                                    squad_response = requests.put(
                                        f'{remnawave_url}/api/user/{username}',
                                        headers={
                                            'Authorization': f'Bearer {remnawave_token}',
                                            'Content-Type': 'application/json'
                                        },
                                        json=squad_payload,
                                        timeout=10
                                    )
                                    
                                    print(f'✅ Squad update response: {squad_response.status_code}')
                                
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