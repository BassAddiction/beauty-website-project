import json
import os
import psycopg2
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обработка callback от Юкассы при успешном платеже
    Args: event с httpMethod, body от Юкассы
    Returns: HTTP response
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    notification = json.loads(body_str)
    
    print(f'🔔 Webhook received from Yookassa')
    
    payment_object = notification.get('object', {})
    payment_id = payment_object.get('id')
    status = payment_object.get('status')
    paid = payment_object.get('paid', False)
    
    print(f'📋 Payment: {payment_id}, status: {status}, paid: {paid}')
    
    if not (paid and status == 'succeeded'):
        print(f'⚠️ Payment not succeeded, ignoring')
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ignored'})
        }
    
    # Получаем metadata из Юкассы
    metadata = payment_object.get('metadata', {})
    username = metadata.get('username')
    email = metadata.get('email')
    plan_name = metadata.get('plan_name')
    plan_days_str = metadata.get('plan_days', '30')
    plan_id_str = metadata.get('plan_id', '')
    custom_plan_str = metadata.get('custom_plan', '')
    
    print(f'👤 User: {username}, email: {email}, plan: {plan_name}, days: {plan_days_str}')
    
    if not username or not email:
        print(f'❌ Missing username or email')
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing metadata'})
        }
    
    try:
        plan_days = int(plan_days_str)
    except:
        plan_days = 30
    
    plan_id = None
    if plan_id_str:
        try:
            plan_id = int(plan_id_str)
        except:
            pass
    
    custom_plan = None
    if custom_plan_str:
        try:
            custom_plan = json.loads(custom_plan_str)
        except:
            pass
    
    amount_value = float(payment_object.get('amount', {}).get('value', '0'))
    
    # Обновляем статус платежа в БД (если он там есть)
    try:
        db_url = os.environ.get('DATABASE_URL')
        if db_url:
            conn = psycopg2.connect(db_url)
            conn.autocommit = True
            cur = conn.cursor()
            
            safe_payment_id = payment_id.replace("'", "''")
            safe_username = username.replace("'", "''")
            safe_plan = plan_name.replace("'", "''")
            
            cur.execute(f"UPDATE payments SET status = 'succeeded', updated_at = NOW() WHERE payment_id = '{safe_payment_id}'")
            
            cur.close()
            conn.close()
            print(f'💾 Payment status updated in DB')
    except Exception as e:
        print(f'⚠️ Failed to update payment in DB: {str(e)}')
    
    # Создаём пользователя в Remnawave
    print(f'🚀 Creating user in Remnawave...')
    try:
        remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        response = requests.post(
            remnawave_url,
            headers={'Content-Type': 'application/json'},
            json={
                'action': 'create_user',
                'username': username,
                'email': email,
                'plan_days': plan_days,
                'plan_id': plan_id,
                'plan_name': plan_name,
                'custom_plan': custom_plan
            },
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            subscription_url = data.get('subscription_url', '')
            print(f'✅ User created in Remnawave: {subscription_url}')
            
            # Отправляем email
            try:
                send_email_url = 'https://functions.poehali.dev/b7df3121-2214-4658-b0d1-8af63a4ce471'
                email_response = requests.post(
                    send_email_url,
                    headers={'Content-Type': 'application/json'},
                    json={
                        'email': email,
                        'subscription_url': subscription_url,
                        'username': username
                    },
                    timeout=10
                )
                
                if email_response.status_code == 200:
                    print(f'📧 Email sent to {email}')
                else:
                    print(f'⚠️ Failed to send email: {email_response.status_code}')
            except Exception as e:
                print(f'⚠️ Email error: {str(e)}')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ok', 'user_created': True})
            }
        else:
            print(f'❌ Remnawave error: {response.status_code} - {response.text}')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ok', 'error': 'Failed to create user'})
            }
    except Exception as e:
        print(f'❌ Error creating user: {str(e)}')
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ok', 'error': str(e)})
        }