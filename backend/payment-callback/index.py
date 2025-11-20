'''
Business: Обработка webhook от YooKassa при успешном платеже
Args: event с httpMethod, body от Юкассы
Returns: HTTP response
'''

import json
import os
import psycopg2
import requests
from typing import Dict, Any, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    webhook_data = json.loads(body_str)
    
    # Используем ту же логику что и в payment/index.py
    return handle_yookassa_webhook(webhook_data, cors_headers)


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
                
                # Активируем реферала если есть
                activate_referral(username, payment_id)
                
                # Отправляем email с инструкциями
                send_welcome_email(email, subscription_url, username)
                
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


def update_payment_status(payment_id: str, status: str):
    '''Обновляет статус платежа в БД'''
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        safe_status = status.replace("'", "''")
        safe_payment_id = payment_id.replace("'", "''")
        
        cursor.execute(f"""
            UPDATE payments 
            SET status = '{safe_status}', updated_at = NOW()
            WHERE payment_id = '{safe_payment_id}'
        """)
        
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
                    cursor.execute(f"""
                        SELECT squad_uuids, traffic_gb FROM t_p66544974_beauty_website_proje.subscription_plans 
                        WHERE plan_id = {plan_id} AND is_active = true
                        LIMIT 1
                    """)
                    print(f'🎯 Looking up plan by plan_id: {plan_id}')
                else:
                    # Fallback: ищем по name и days (может быть неточным!)
                    safe_plan_name = plan_name.replace("'", "''")
                    cursor.execute(f"""
                        SELECT squad_uuids, traffic_gb FROM t_p66544974_beauty_website_proje.subscription_plans 
                        WHERE name = '{safe_plan_name}' AND days = {plan_days} AND is_active = true
                        LIMIT 1
                    """)
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
        
        # Если пользователь существует И НЕ только что создан - используем extend_subscription через remnawave function
        if user_exists and user_uuid and not user_created_recently:
            print(f'🔄 Extending user subscription via remnawave function: {username}, squads: {squad_uuids}')
            
            # Use remnawave cloud function with extend_subscription action
            extend_response = requests.post(
                remnawave_url,
                headers={'Content-Type': 'application/json'},
                json={
                    'action': 'extend_subscription',
                    'username': username,
                    'uuid': user_uuid,
                    'expire': expire_timestamp,
                    'internalSquads': squad_uuids
                },
                timeout=30
            )
            
            if extend_response.status_code == 200:
                print(f'✅ User subscription extended successfully')
                
                # Get subscription URL from response
                extend_data = extend_response.json()
                response_data = extend_data.get('response', extend_data)
                subscription_url = response_data.get('subscriptionUrl', response_data.get('subscription_url', ''))
                
                return {'success': True, 'subscription_url': subscription_url}
            else:
                print(f'❌ Extension failed: {extend_response.status_code} - {extend_response.text}')
                return {'success': False, 'error': extend_response.text}
        else:
            # Новый пользователь - создаём через remnawave function
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
                
                # Save UUID to database for referral system
                if user_uuid:
                    try:
                        import psycopg2
                        db_url = os.environ.get('DATABASE_URL', '')
                        if db_url:
                            conn = psycopg2.connect(db_url)
                            cur = conn.cursor()
                            safe_username = username.replace("'", "''")
                            safe_uuid = user_uuid.replace("'", "''")
                            cur.execute(f"""
                                INSERT INTO user_uuids (username, remnawave_uuid, created_at)
                                VALUES ('{safe_username}', '{safe_uuid}', NOW())
                                ON CONFLICT (username, remnawave_uuid) DO NOTHING
                            """)
                            conn.commit()
                            cur.close()
                            conn.close()
                            print(f'💾 UUID saved to DB: {user_uuid}')
                    except Exception as e:
                        print(f'⚠️ Failed to save UUID: {str(e)}')
                
                return {'success': True, 'subscription_url': subscription_url}
            else:
                print(f'❌ Remnawave error: {response.status_code} - {response.text}')
                return {'success': False, 'error': response.text}
            
    except Exception as e:
        print(f'❌ Error creating user in Remnawave: {str(e)}')
        return {'success': False, 'error': str(e)}


def activate_referral(username: str, payment_id: str):
    '''Активирует реферальный бонус после успешной оплаты'''
    try:
        import time
        
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Получаем реферальный код из платежа
        safe_payment_id = payment_id.replace("'", "''")
        cur.execute(f"SELECT referral_code FROM payments WHERE payment_id = '{safe_payment_id}'")
        result = cur.fetchone()
        
        if not result or not result[0]:
            cur.close()
            conn.close()
            return
        
        referral_code = result[0]
        print(f'🎁 Found referral code: {referral_code} for user {username}')
        
        # Ждём 3 секунды, чтобы Remnawave успел заиндексировать нового пользователя
        print(f'⏳ Waiting 3s for user {username} to be indexed in Remnawave...')
        time.sleep(3)
        
        # Вызываем функцию активации реферала
        activate_url = 'https://functions.poehali.dev/358b9593-075d-4262-9190-984599107ece'
        response = requests.post(
            activate_url,
            headers={'Content-Type': 'application/json'},
            json={
                'username': username,
                'referral_code': referral_code
            },
            timeout=15
        )
        
        if response.status_code == 200:
            print(f'✅ Referral activated for {username}')
        else:
            print(f'⚠️ Failed to activate referral: {response.text}')
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f'⚠️ Error activating referral: {str(e)}')


def send_welcome_email(email: str, subscription_url: str, username: str):
    '''Отправляет приветственное email с инструкциями'''
    try:
        send_email_url = 'https://functions.poehali.dev/b7df3121-2214-4658-b0d1-8af63a4ce471'
        
        response = requests.post(
            send_email_url,
            headers={'Content-Type': 'application/json'},
            json={
                'email': email,
                'subscription_url': subscription_url,
                'username': username
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f'📧 Email sent to {email}')
        else:
            print(f'⚠️ Failed to send email: {response.status_code} - {response.text}')
            
    except Exception as e:
        print(f'⚠️ Email error: {str(e)}')
