'''
Business: Отправка письма с извинениями клиенту за технический сбой
Args: event с email, username, subscription_url
Returns: Результат отправки письма
'''

import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
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
    
    # Проверка админского ключа
    headers = event.get('headers', {})
    admin_key = headers.get('X-Admin-Key', headers.get('x-admin-key', ''))
    expected_key = os.environ.get('ADMIN_PASSWORD', '')
    
    if not admin_key or admin_key != expected_key:
        return {
            'statusCode': 403,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    try:
        body_data = json.loads(body_str) if body_str else {}
    except:
        body_data = {}
    
    email = body_data.get('email', '')
    username = body_data.get('username', '')
    subscription_url = body_data.get('subscription_url', '')
    days = body_data.get('days', 180)
    
    if not email or not username:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Email and username required'}),
            'isBase64Encoded': False
        }
    
    try:
        result = send_apology_email(email, username, subscription_url, days)
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def send_apology_email(email: str, username: str, subscription_url: str, days: int) -> Dict[str, Any]:
    '''Отправляет письмо с извинениями'''
    try:
        smtp_host = os.environ.get('SMTP_HOST', '')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER', '')
        smtp_pass = os.environ.get('SMTP_PASS', '')
        from_email = os.environ.get('FROM_EMAIL', smtp_user)
        
        if not all([smtp_host, smtp_user, smtp_pass]):
            return {'success': False, 'error': 'SMTP not configured'}
        
        # Вычисляем дату окончания подписки
        expire_date = (datetime.now() + timedelta(days=days)).strftime('%d.%m.%Y')
        months = days // 30
        
        # Формируем письмо
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Извинения за технический сбой — Speed VPN'
        msg['From'] = f"Speed VPN <{from_email}>"
        msg['To'] = email
        
        # Копия на mistersvolk@yandex.ru
        msg['Cc'] = 'mistersvolk@yandex.ru'
        
        # HTML версия письма
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }}
        .highlight {{ background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }}
        .credentials {{ background: #e7f3ff; padding: 15px; border-radius: 5px; font-family: monospace; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
        .btn {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Speed VPN</h1>
        </div>
        <div class="content">
            <h2>Здравствуйте!</h2>
            
            <p>Приносим искренние извинения за произошедший технический сбой в нашей системе.</p>
            
            <div class="box">
                <p><strong>Что произошло:</strong></p>
                <p>В результате локального сбоя на серверах произошла временная потеря доступа к вашему аккаунту. 
                Мы вовремя обнаружили проблему и полностью восстановили все данные.</p>
            </div>
            
            <div class="highlight">
                <p><strong>🎁 В качестве извинений мы продлили вашу подписку до {months} месяцев ({days} дней)!</strong></p>
                <p>Ваш аккаунт полностью восстановлен и активен до <strong>{expire_date}</strong></p>
            </div>
            
            <div class="credentials">
                <p><strong>Ваши данные для входа:</strong></p>
                <p>Username: <strong>{username}</strong></p>
                <p>Подписка активна до: <strong>{expire_date}</strong></p>
            </div>
            
            {f'<p><a href="{subscription_url}" class="btn">Подключиться к VPN</a></p>' if subscription_url else ''}
            
            <p>Все ваши настройки и конфигурации сохранены. Вы можете сразу продолжить использование VPN.</p>
            
            <p><strong>Еще раз приносим извинения за доставленные неудобства.</strong></p>
            
            <p>С уважением,<br>Команда Speed VPN</p>
            
            <div class="footer">
                <p>Если у вас возникли вопросы, напишите нам: <a href="https://t.me/gospeedvpn">@gospeedvpn</a></p>
            </div>
        </div>
    </div>
</body>
</html>
        """
        
        # Текстовая версия
        text_body = f"""
Здравствуйте!

Приносим искренние извинения за произошедший технический сбой в нашей системе.

ЧТО ПРОИЗОШЛО:
В результате локального сбоя на серверах произошла временная потеря доступа к вашему аккаунту. 
Мы вовремя обнаружили проблему и полностью восстановили все данные.

🎁 В КАЧЕСТВЕ ИЗВИНЕНИЙ МЫ ПРОДЛИЛИ ВАШУ ПОДПИСКУ ДО {months} МЕСЯЦЕВ ({days} ДНЕЙ)!

Ваш аккаунт полностью восстановлен и активен до {expire_date}

ВАШИ ДАННЫЕ ДЛЯ ВХОДА:
Username: {username}
Подписка активна до: {expire_date}

{f'Ссылка для подключения: {subscription_url}' if subscription_url else ''}

Все ваши настройки и конфигурации сохранены. Вы можете сразу продолжить использование VPN.

Еще раз приносим извинения за доставленные неудобства.

С уважением,
Команда Speed VPN

Если у вас возникли вопросы, напишите нам: https://t.me/gospeedvpn
        """
        
        # Прикрепляем обе версии
        part1 = MIMEText(text_body, 'plain', 'utf-8')
        part2 = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(part1)
        msg.attach(part2)
        
        # Отправляем письмо
        print(f'📧 Sending apology email to {email} (copy to mistersvolk@yandex.ru)...')
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            # Отправляем и клиенту, и на mistersvolk@yandex.ru
            server.send_message(msg, from_addr=from_email, to_addrs=[email, 'mistersvolk@yandex.ru'])
        
        print(f'✅ Apology email sent to {email} with copy to mistersvolk@yandex.ru')
        
        return {
            'success': True,
            'message': f'Email sent to {email} with copy to mistersvolk@yandex.ru',
            'expire_date': expire_date,
            'days': days
        }
        
    except Exception as e:
        print(f'❌ Failed to send email: {str(e)}')
        return {'success': False, 'error': str(e)}
