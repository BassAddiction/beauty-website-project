'''
Business: YooKassa payment integration for VPN subscriptions
Args: event - dict with httpMethod, body/queryStringParameters
      context - object with request_id attribute
Returns: HTTP response dict with payment URL or webhook confirmation
'''

import json
import os
import uuid
import psycopg2
import requests
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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
    
    # GET - создать платёж (старый способ через query params)
    if method == 'GET':
        return handle_create_payment_get(event, cors_headers)
    
    # POST - webhook от YooKassa или создание платежа
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        # Проверяем, это webhook или запрос на создание платежа
        if body_data.get('type') == 'notification':
            return handle_yookassa_webhook(body_data, cors_headers)
        else:
            return handle_create_payment_post(body_data, cors_headers)
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def handle_create_payment_get(event: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Создание платежа через GET параметры'''
    params = event.get('queryStringParameters', {})
    
    username = params.get('username', '')
    email = params.get('email', '')
    amount = params.get('amount', '')
    plan_name = params.get('plan_name', '')
    plan_days = params.get('plan_days', '')
    
    if not all([username, email, amount, plan_name, plan_days]):
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Missing required parameters',
                'required': ['username', 'email', 'amount', 'plan_name', 'plan_days']
            }),
            'isBase64Encoded': False
        }
    
    return create_yookassa_payment(username, email, float(amount), plan_name, int(plan_days), cors_headers)


def handle_create_payment_post(body_data: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Создание платежа через POST'''
    username = body_data.get('username', '')
    email = body_data.get('email', '')
    amount = body_data.get('amount', 0)
    plan_name = body_data.get('plan_name', '')
    plan_days = body_data.get('plan_days', 0)
    
    if not all([username, email, amount, plan_name, plan_days]):
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Missing required fields',
                'required': ['username', 'email', 'amount', 'plan_name', 'plan_days']
            }),
            'isBase64Encoded': False
        }
    
    return create_yookassa_payment(username, email, float(amount), plan_name, int(plan_days), cors_headers)


def create_yookassa_payment(username: str, email: str, amount: float, plan_name: str, plan_days: int, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Создаёт платёж в YooKassa'''
    try:
        shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
        secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
        
        print(f'🔑 Debug: shop_id={shop_id[:10] if shop_id else "EMPTY"}..., secret_key={secret_key[:10] if secret_key else "EMPTY"}...')
        
        if not shop_id or not secret_key:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'YooKassa credentials not configured', 'debug': f'shop_id={bool(shop_id)}, secret_key={bool(secret_key)}'}),
                'isBase64Encoded': False
            }
        
        # Генерируем уникальный ID платежа
        idempotence_key = str(uuid.uuid4())
        
        # Создаём платёж в YooKassa
        payment_data = {
            'amount': {
                'value': f'{amount:.2f}',
                'currency': 'RUB'
            },
            'confirmation': {
                'type': 'redirect',
                'return_url': 'https://onproduct.pro/payment-success'
            },
            'capture': True,
            'description': f'Подписка {plan_name} для {username}',
            'metadata': {
                'username': username,
                'email': email,
                'plan_name': plan_name,
                'plan_days': str(plan_days)
            },
            'receipt': {
                'customer': {
                    'email': email
                },
                'items': [
                    {
                        'description': f'VPN подписка {plan_name}',
                        'quantity': '1',
                        'amount': {
                            'value': f'{amount:.2f}',
                            'currency': 'RUB'
                        },
                        'vat_code': 1,
                        'payment_subject': 'service'
                    }
                ]
            }
        }
        
        print(f'🔹 Creating YooKassa payment for {username}: {amount} RUB, {plan_days} days')
        
        response = requests.post(
            'https://api.yookassa.ru/v3/payments',
            json=payment_data,
            headers={
                'Idempotence-Key': idempotence_key,
                'Content-Type': 'application/json'
            },
            auth=(shop_id, secret_key),
            timeout=10
        )
        
        if response.status_code != 200:
            print(f'❌ YooKassa error: {response.status_code} - {response.text}')
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Failed to create payment', 'details': response.text}),
                'isBase64Encoded': False
            }
        
        payment_response = response.json()
        payment_id = payment_response.get('id', '')
        confirmation_url = payment_response.get('confirmation', {}).get('confirmation_url', '')
        
        print(f'✅ Payment created: {payment_id}')
        
        # Сохраняем платёж в БД со статусом pending
        save_payment_to_db(payment_id, username, email, amount, plan_name, plan_days, 'pending')
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'payment_id': payment_id,
                'confirmation_url': confirmation_url,
                'status': 'pending'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Error creating payment: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_yookassa_webhook(webhook_data: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обработка webhook от YooKassa'''
    try:
        event_type = webhook_data.get('event', '')
        payment_object = webhook_data.get('object', {})
        
        payment_id = payment_object.get('id', '')
        payment_status = payment_object.get('status', '')
        amount_data = payment_object.get('amount', {})
        amount = float(amount_data.get('value', 0))
        metadata = payment_object.get('metadata', {})
        
        username = metadata.get('username', '')
        email = metadata.get('email', '')
        plan_name = metadata.get('plan_name', '')
        plan_days = int(metadata.get('plan_days', 0))
        
        # Получаем email из receipt если не в metadata
        if not email:
            receipt = payment_object.get('receipt', {})
            customer = receipt.get('customer', {})
            email = customer.get('email', '')
        
        print(f'🔔 Webhook received: {event_type}')
        print(f'📋 Payment ID: {payment_id}, Status: {payment_status}')
        print(f'👤 Username: {username}, Email: {email}')
        print(f'💰 Amount: {amount} RUB, Plan: {plan_name} ({plan_days} days)')
        
        # Обновляем платёж в БД
        update_payment_status(payment_id, payment_status)
        
        # Если платёж успешен - создаём пользователя в Remnawave
        if event_type == 'payment.succeeded' or payment_status == 'succeeded':
            print(f'✅ Payment succeeded, creating user in Remnawave...')
            
            # Создаём пользователя в Remnawave
            remnawave_result = create_user_in_remnawave(username, email, plan_days)
            
            if remnawave_result.get('success'):
                subscription_url = remnawave_result.get('subscription_url', '')
                print(f'✅ User created in Remnawave: {subscription_url}')
                
                # Отправляем email с инструкциями
                send_welcome_email(email, subscription_url)
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'status': 'ok',
                        'message': 'Payment processed successfully',
                        'user_created': True,
                        'subscription_url': subscription_url
                    }),
                    'isBase64Encoded': False
                }
            else:
                print(f'⚠️ Failed to create user in Remnawave: {remnawave_result.get("error")}')
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'status': 'ok',
                        'message': 'Payment received but user creation failed',
                        'error': remnawave_result.get('error')
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'status': 'ok'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Webhook error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def save_payment_to_db(payment_id: str, username: str, email: str, amount: float, plan_name: str, plan_days: int, status: str):
    '''Сохраняет платёж в БД'''
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            print('⚠️ DATABASE_URL not configured')
            return
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO payments (payment_id, username, email, amount, plan_name, plan_days, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (payment_id) DO UPDATE 
            SET status = EXCLUDED.status, updated_at = NOW()
        """, (payment_id, username, email, amount, plan_name, plan_days, status))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'💾 Payment saved to DB: {payment_id} - {status}')
        
    except Exception as e:
        print(f'⚠️ Failed to save payment to DB: {str(e)}')


def update_payment_status(payment_id: str, status: str):
    '''Обновляет статус платежа в БД'''
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE payments 
            SET status = %s, updated_at = NOW()
            WHERE payment_id = %s
        """, (status, payment_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'💾 Payment status updated: {payment_id} -> {status}')
        
    except Exception as e:
        print(f'⚠️ Failed to update payment status: {str(e)}')


def create_user_in_remnawave(username: str, email: str, plan_days: int) -> Dict[str, Any]:
    '''Создаёт пользователя в Remnawave'''
    try:
        remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        print(f'🔑 Debug Remnawave: URL={remnawave_url}, Token={remnawave_token[:20] if remnawave_token else "EMPTY"}...')
        
        if not remnawave_url or not remnawave_token:
            return {'success': False, 'error': 'Remnawave credentials not configured'}
        
        # Вычисляем timestamp окончания подписки
        expire_timestamp = int(datetime.now().timestamp()) + (plan_days * 86400)
        
        # 30 GB в байтах = 30 * 1024 * 1024 * 1024
        data_limit = 32212254720
        
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
            'internalSquads': []
        }
        
        print(f'🔹 Creating user in Remnawave: {username}')
        
        response = requests.post(
            remnawave_url,
            headers={'Content-Type': 'application/json'},
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            response_data = data.get('response', data)
            subscription_url = response_data.get('subscriptionUrl', response_data.get('subscription_url', ''))
            
            print(f'✅ User created: {subscription_url}')
            
            # Добавляем пользователя в squad
            try:
                update_payload = {
                    'action': 'update_user',
                    'username': username,
                    'inbounds': {
                        'vless-reality': ['e742f30b-82fb-431a-918b-1b4d22d6ba4d']
                    }
                }
                
                update_response = requests.post(
                    remnawave_url,
                    headers={'Content-Type': 'application/json'},
                    json=update_payload,
                    timeout=10
                )
                
                if update_response.status_code == 200:
                    print(f'✅ User added to squad')
                else:
                    print(f'⚠️ Failed to add user to squad: {update_response.text}')
                    
            except Exception as e:
                print(f'⚠️ Squad update error: {str(e)}')
            
            return {'success': True, 'subscription_url': subscription_url}
        else:
            print(f'❌ Remnawave error: {response.status_code} - {response.text}')
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        print(f'❌ Error creating user in Remnawave: {str(e)}')
        return {'success': False, 'error': str(e)}


def send_welcome_email(email: str, subscription_url: str):
    '''Отправляет приветственное email с инструкциями'''
    try:
        send_email_url = os.environ.get('SEND_EMAIL_URL', 'https://functions.poehali.dev/02f41dd7-0d1d-4506-828c-64a917a7dda7')
        
        response = requests.post(
            send_email_url,
            headers={'Content-Type': 'application/json'},
            json={
                'email': email,
                'subscription_url': subscription_url
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f'📧 Email sent to {email}')
        else:
            print(f'⚠️ Failed to send email: {response.status_code} - {response.text}')
            
    except Exception as e:
        print(f'⚠️ Email error: {str(e)}')