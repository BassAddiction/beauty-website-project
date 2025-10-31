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
from typing import Dict, Any, Optional
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
    custom_plan_str = params.get('custom_plan', '')
    
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
    
    custom_plan = None
    if custom_plan_str:
        try:
            custom_plan = json.loads(custom_plan_str)
        except:
            pass
    
    plan_id = int(params.get('plan_id', 0)) if params.get('plan_id') else None
    payment_method = params.get('payment_method', 'sbp')
    domain = params.get('domain', 'speedvpn.io')
    return create_yookassa_payment(username, email, float(amount), plan_name, int(plan_days), plan_id, custom_plan, payment_method, domain, cors_headers)


def handle_create_payment_post(body_data: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Создание платежа через POST'''
    username = body_data.get('username', '')
    email = body_data.get('email', '')
    amount = body_data.get('amount', 0)
    plan_name = body_data.get('plan_name', '')
    plan_days = body_data.get('plan_days', 0)
    plan_id = body_data.get('plan_id')
    custom_plan = body_data.get('custom_plan')
    payment_method = body_data.get('payment_method', 'sbp')
    domain = body_data.get('domain', 'speedvpn.io')
    
    print(f'🌐 Domain received from frontend: {domain}')
    
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
    
    return create_yookassa_payment(username, email, float(amount), plan_name, int(plan_days), plan_id, custom_plan, payment_method, domain, cors_headers)


def create_yookassa_payment(username: str, email: str, amount: float, plan_name: str, plan_days: int, plan_id: Optional[int], custom_plan: Any, payment_method: str, domain: str, cors_headers: Dict[str, str]) -> Dict[str, Any]:
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
        
        # Определяем тип платёжного метода для YooKassa
        yookassa_payment_type = 'sbp'
        if payment_method == 'sberpay':
            yookassa_payment_type = 'sberbank'
        elif payment_method == 'tpay':
            yookassa_payment_type = 'tinkoff_bank'
        
        print(f'💳 Selected payment method: {payment_method} -> YooKassa type: {yookassa_payment_type}')
        
        # Создаём платёж в YooKassa
        payment_data = {
            'amount': {
                'value': f'{amount:.2f}',
                'currency': 'RUB'
            },
            'confirmation': {
                'type': 'redirect',
                'return_url': f'https://{domain}/payment-success',
                'confirmation_data': {
                    'color_scheme': 'dark',
                    'primary_color': '#ff0000',
                    'header_color': '#000000',
                    'button_color': '#ff0000'
                }
            },
            'payment_method_data': {
                'type': yookassa_payment_type
            },
            'capture': True,
            'description': f'Подписка {plan_name} для {username}',
            'metadata': {
                'username': username,
                'email': email,
                'plan_name': plan_name,
                'plan_days': str(plan_days),
                'plan_id': str(plan_id) if plan_id else '',
                'custom_plan': json.dumps(custom_plan) if custom_plan else ''
            },
            'receipt': {
                'customer': {
                    'email': email
                },
                'tax_system_code': 3,
                'items': [
                    {
                        'description': f'VPN подписка {plan_name}',
                        'quantity': '1.00',
                        'amount': {
                            'value': f'{amount:.2f}',
                            'currency': 'RUB'
                        },
                        'vat_code': 1,
                        'payment_subject': 'service',
                        'payment_mode': 'full_payment'
                    }
                ]
            }
        }
        
        print(f'📋 Sending receipt with tax_system_code=3 (УСН доходы-расходы), vat_code=1 (Без НДС)')
        
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
        
        # Логируем детали чека для контроля
        receipt_info = payment_response.get('receipt_registration', 'not_applicable')
        print(f'✅ Payment created: {payment_id}')
        print(f'📋 Receipt: tax_system=УСН_доходы-расходы(3), vat_code=БезНДС(4), status={receipt_info}')
        
        # Сохраняем платёж в БД со статусом pending
        save_payment_to_db(payment_id, username, email, amount, plan_name, plan_days, 'pending')
        
        # Сохраняем данные чека в БД
        save_receipt_to_db(payment_id, email, amount, plan_name, 3, 4)
        
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
        custom_plan_str = metadata.get('custom_plan', '')
        plan_id_str = metadata.get('plan_id', '')
        
        custom_plan = None
        if custom_plan_str:
            try:
                custom_plan = json.loads(custom_plan_str)
            except:
                pass
        
        plan_id = None
        if plan_id_str:
            try:
                plan_id = int(plan_id_str)
            except:
                pass
        
        # Получаем email из receipt если не в metadata
        if not email:
            receipt = payment_object.get('receipt', {})
            customer = receipt.get('customer', {})
            email = customer.get('email', '')
        
        print(f'🔔 Webhook received: {event_type}')
        print(f'📋 Payment ID: {payment_id}, Status: {payment_status}')
        print(f'👤 Username: {username}, Email: {email}')
        print(f'💰 Amount: {amount} RUB, Plan: {plan_name} ({plan_days} days), Plan ID: {plan_id}')
        if custom_plan:
            print(f'🎯 Custom plan: {custom_plan}')
        
        # Обновляем платёж в БД
        update_payment_status(payment_id, payment_status)
        
        # Если платёж успешен - создаём пользователя в Remnawave
        if event_type == 'payment.succeeded' or payment_status == 'succeeded':
            print(f'✅ Payment succeeded, creating user in Remnawave...')
            
            # Создаём пользователя в Remnawave
            remnawave_result = create_user_in_remnawave(username, email, plan_days, plan_id, plan_name, custom_plan)
            
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


def save_receipt_to_db(payment_id: str, email: str, amount: float, plan_name: str, tax_system: int, vat_code: int):
    '''Сохраняет данные чека в БД'''
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            print('⚠️ DATABASE_URL not configured')
            return
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        items_json = json.dumps([{
            'description': f'VPN подписка {plan_name}',
            'quantity': '1',
            'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
            'vat_code': vat_code
        }])
        
        cursor.execute("""
            INSERT INTO receipts (payment_id, tax_system_code, vat_code, amount, email, items, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (payment_id, tax_system, vat_code, amount, email, items_json, 'pending'))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f'📋 Receipt saved to DB: {payment_id}')
        
    except Exception as e:
        print(f'⚠️ Failed to save receipt to DB: {str(e)}')


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


def create_user_in_remnawave(username: str, email: str, plan_days: int, plan_id: Optional[int] = None, plan_name: str = '', custom_plan: Any = None) -> Dict[str, Any]:
    '''Создаёт или продлевает пользователя в Remnawave'''
    try:
        # ВАЖНО: используем актуальный URL из func2url.json
        remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        remnawave_api_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        print(f'🔑 Debug Remnawave Function URL: {remnawave_url}')
        
        # Проверяем, существует ли пользователь
        user_exists = False
        user_uuid = None
        current_expire_timestamp = None
        user_created_recently = False
        
        if remnawave_api_url and remnawave_token:
            try:
                check_response = requests.get(
                    f'{remnawave_api_url}/api/users',
                    headers={'Authorization': f'Bearer {remnawave_token}'},
                    timeout=10
                )
                print(f'🔍 Check users list response: status={check_response.status_code}')
                if check_response.status_code == 200:
                    users_response = check_response.json()
                    users_list = users_response.get('response', {}).get('users', [])
                    # Ищем пользователя по username
                    user_data = next((u for u in users_list if u.get('username') == username), None)
                    print(f'🔍 Found user: {user_data is not None}')
                    if user_data and user_data.get('uuid'):
                        user_exists = True
                        user_uuid = user_data.get('uuid')
                        expire_at_str = user_data.get('expireAt', '')
                        created_at_str = user_data.get('createdAt', '')
                        
                        if expire_at_str:
                            from datetime import datetime as dt
                            expire_dt = dt.fromisoformat(expire_at_str.replace('Z', '+00:00'))
                            current_expire_timestamp = int(expire_dt.timestamp())
                        
                        # Проверяем когда пользователь был создан
                        if created_at_str:
                            from datetime import datetime as dt
                            created_dt = dt.fromisoformat(created_at_str.replace('Z', '+00:00'))
                            created_timestamp = int(created_dt.timestamp())
                            now_ts = int(datetime.now().timestamp())
                            # Если пользователь создан меньше 5 минут назад - это первая оплата
                            if (now_ts - created_timestamp) < 300:
                                user_created_recently = True
                                print(f'🆕 User created recently ({now_ts - created_timestamp}s ago), skip extension')
                        
                        print(f'👤 User exists: uuid={user_uuid}, current_expire={current_expire_timestamp}')
            except Exception as e:
                print(f'⚠️ Could not check user existence: {str(e)}')
        
        # Вычисляем новый timestamp окончания подписки
        if user_exists and current_expire_timestamp and not user_created_recently:
            # Продлеваем от текущей даты окончания (или от сейчас, если срок истёк)
            now_ts = int(datetime.now().timestamp())
            base_ts = max(current_expire_timestamp, now_ts)
            expire_timestamp = base_ts + (plan_days * 86400)
            print(f'📅 Extending subscription: +{plan_days} days from {base_ts} to {expire_timestamp}')
        else:
            # Новый пользователь - считаем от сейчас
            expire_timestamp = int(datetime.now().timestamp()) + (plan_days * 86400)
            print(f'📅 New subscription: {plan_days} days, expire={expire_timestamp}')
        
        # Получаем traffic_gb и squad_uuid из custom_plan ИЛИ из тарифа
        squad_uuids = []
        traffic_gb = 30  # дефолтное значение
        
        if custom_plan and isinstance(custom_plan, dict):
            # Кастомный тариф - берём squad из локаций и traffic из плана
            traffic_gb = custom_plan.get('traffic_gb', 30)
            print(f'📊 Custom plan traffic: {traffic_gb} GB')
            
            locations_data = custom_plan.get('locations', [])
            if locations_data:
                location_ids = [loc.get('location_id') for loc in locations_data if loc.get('location_id')]
                if location_ids:
                    db_url = os.environ.get('DATABASE_URL', '')
                    if db_url:
                        import psycopg2
                        conn = psycopg2.connect(db_url)
                        cursor = conn.cursor()
                        placeholders = ','.join(['%s'] * len(location_ids))
                        cursor.execute(f"""
                            SELECT squad_uuid FROM t_p66544974_beauty_website_proje.locations 
                            WHERE location_id IN ({placeholders}) AND squad_uuid IS NOT NULL
                        """, location_ids)
                        squad_uuids = [row[0] for row in cursor.fetchall()]
                        cursor.close()
                        conn.close()
                        print(f'🎯 Custom plan squads from locations: {squad_uuids}')
        else:
            # Обычный тариф - берём squad_uuids и traffic_gb из таблицы plans
            db_url = os.environ.get('DATABASE_URL', '')
            if db_url:
                import psycopg2
                conn = psycopg2.connect(db_url)
                cursor = conn.cursor()
                
                # Если есть plan_id - используем его (точное совпадение)
                if plan_id:
                    cursor.execute("""
                        SELECT squad_uuids, traffic_gb FROM t_p66544974_beauty_website_proje.subscription_plans 
                        WHERE plan_id = %s AND is_active = true
                        LIMIT 1
                    """, (plan_id,))
                    print(f'🎯 Looking up plan by plan_id: {plan_id}')
                else:
                    # Fallback: ищем по name и days (может быть неточным!)
                    cursor.execute("""
                        SELECT squad_uuids, traffic_gb FROM t_p66544974_beauty_website_proje.subscription_plans 
                        WHERE name = %s AND days = %s AND is_active = true
                        LIMIT 1
                    """, (plan_name, plan_days))
                    print(f'⚠️ Looking up plan by name/days (fallback): {plan_name}, {plan_days}')
                
                row = cursor.fetchone()
                if row:
                    if row[0]:
                        squad_uuids = row[0]
                        print(f'🎯 Regular plan squads from plans table: {squad_uuids}')
                    if row[1]:
                        traffic_gb = row[1]
                        print(f'📊 Regular plan traffic: {traffic_gb} GB')
                cursor.close()
                conn.close()
        
        # Переводим GB в байты
        data_limit = traffic_gb * 1024 * 1024 * 1024
        print(f'📊 Final traffic limit: {traffic_gb} GB = {data_limit} bytes')
        
        # Если нет custom_plan, используем дефолтный squad
        if not squad_uuids:
            squad_uuids = ['e742f30b-82fb-431a-918b-1b4d22d6ba4d']
        
        # Если пользователь существует И НЕ только что создан - используем extend_subscription (DELETE + CREATE)
        if user_exists and user_uuid and not user_created_recently:
            payload = {
                'action': 'extend_subscription',
                'username': username,
                'uuid': user_uuid,
                'expire': expire_timestamp,
                'internalSquads': squad_uuids
            }
            print(f'🔄 Extending user subscription in Remnawave: {username}, squads: {squad_uuids}')
        else:
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
            print(f'🔹 Creating user in Remnawave: {username} with squads: {squad_uuids}')
        
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
            print(f'✅ User squads were set during creation: {squad_uuids}')
            
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