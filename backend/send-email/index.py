'''
Business: Send VPN subscription access email with configuration link via REG.RU SMTP
Args: event - dict with httpMethod, body containing email and subscription_url
      context - object with request_id attribute
Returns: HTTP response dict with statusCode, headers, body
'''

import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Content-Type': 'application/json'
    }
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
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
    
    body_data = json.loads(event.get('body', '{}'))
    email: str = body_data.get('email', '')
    subscription_url: str = body_data.get('subscription_url', '')
    username: str = body_data.get('username', '')
    
    if not email or not subscription_url or not username:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Missing required fields',
                'required': ['email', 'subscription_url', 'username']
            }),
            'isBase64Encoded': False
        }
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_email, smtp_password]):
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'SMTP settings not configured'}),
            'isBase64Encoded': False
        }
    
    html_content = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(220, 38, 38, 0.3); border: 2px solid #dc2626;">
                        <tr>
                            <td style="background: linear-gradient(135deg, #1a0000 0%, #dc2626 50%, #1a0000 100%); padding: 50px 30px; text-align: center;">
                                <img src="https://cdn.poehali.dev/files/3a0045b1-8f62-461c-946f-ea67286d8040.png" alt="Speed VPN Logo" width="80" height="80" style="margin-bottom: 20px; border-radius: 12px; box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);"/>
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">Speed VPN</h1>
                                <p style="color: #fca5a5; margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Подписка успешно активирована! 🎉</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 35px 30px 25px 30px;">
                                <p style="color: #fca5a5; font-size: 18px; line-height: 1.7; margin: 0 0 15px 0; text-align: center;">
                                    Привет, <strong style="color: #ef4444;">{username}</strong>! 👋
                                </p>
                                <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444; width: 100%; text-align: center;">
                                    ✅ Оплата получена — VPN готов к работе
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 0 30px 35px 30px;">
                                <p style="color: #fca5a5; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
                                    Спасибо за покупку! Ваш VPN уже работает.
                                </p>
                                
                                <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                    <h3 style="color: #ef4444; font-size: 18px; margin: 0 0 15px 0; font-weight: 700; text-align: center;">
                                        👤 Важная информация о вашем аккаунте
                                    </h3>
                                    <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border: 1px solid #7f1d1d; margin-bottom: 15px;">
                                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 10px 0; text-align: center;">
                                            Ваш Username: <strong style="color: #ef4444; font-size: 18px;">{username}</strong>
                                        </p>
                                    </div>
                                    <p style="color: #fca5a5; font-size: 14px; line-height: 1.6; margin: 0;">
                                        <strong style="color: #ef4444;">⚠️ Сохраните этот username!</strong><br><br>
                                        Он нужен для:<br>
                                        • Входа в личный кабинет<br>
                                        • Продления подписки<br>
                                        • Управления вашим VPN<br><br>
                                        <strong style="color: #ef4444;">🔒 Не передавайте username третьим лицам!</strong><br>
                                        Это ваш персональный идентификатор.
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="https://speedvpn.io" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                        🚀 Перейти в личный кабинет
                                    </a>
                                </div>
                                
                                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 25px; margin: 25px 0; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); text-align: center; border: 2px solid #ef4444;">
                                    <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">
                                        🔑 Ваша ссылка для подключения
                                    </h3>
                                    <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">
                                        Скопируйте эту ссылку и вставьте в приложение:
                                    </p>
                                    <div style="background: #1a0000; padding: 15px; border-radius: 8px; border: 1px solid #7f1d1d; word-break: break-all; max-width: 100%; overflow: hidden;">
                                        <code style="color: #fca5a5; font-size: 13px; font-family: 'Courier New', monospace;">{subscription_url}</code>
                                    </div>
                                </div>
                                
                                <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; border-radius: 10px;">
                                    <h3 style="color: #ef4444; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">
                                        📖 Как подключиться:
                                    </h3>
                                    <ol style="color: #fca5a5; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                        <li style="margin-bottom: 10px;">Скачайте одно из приложений выше</li>
                                        <li style="margin-bottom: 10px;">Откройте приложение и найдите кнопку "Добавить подписку" или "Import"</li>
                                        <li style="margin-bottom: 10px;">Вставьте вашу ссылку для подключения</li>
                                        <li style="margin-bottom: 10px;">Нажмите "Подключиться" — готово! 🚀</li>
                                    </ol>
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="background-color: #1a0000; padding: 30px; text-align: center; border-top: 2px solid #7f1d1d;">
                                <p style="color: #dc2626; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                                    Нужна помощь? Мы на связи! 💬
                                </p>
                                <p style="color: #fca5a5; font-size: 14px; margin: 0;">
                                    Telegram: <a href="https://t.me/gospeedvpn" style="color: #ef4444; text-decoration: none; font-weight: 600;">@gospeedvpn</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    '''
    
    text_content = f'''
Speed VPN - Подписка активирована!

Привет, {username}! 👋

Спасибо за покупку! Ваш VPN готов к работе.

👤 ВАЖНАЯ ИНФОРМАЦИЯ О ВАШЕМ АККАУНТЕ

Ваш Username: {username}

⚠️ Сохраните этот username!

Он нужен для:
• Входа в личный кабинет
• Продления подписки
• Управления вашим VPN

🔒 Не передавайте username третьим лицам!
Это ваш персональный идентификатор.

🔑 Ваша ссылка для подключения:
{subscription_url}

🚀 Перейдите в личный кабинет для настройки:
https://speedvpn.io

📖 В личном кабинете вы найдете:
- Инструкции по подключению
- Список рекомендуемых приложений
- Информацию о вашей подписке
- Настройки аккаунта

Нужна помощь? Telegram: @gospeedvpn
    '''
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Speed VPN - Ваша подписка активирована! 🚀'
    msg['From'] = smtp_email
    msg['To'] = email
    
    msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))
    
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({
            'success': True,
            'message': f'Email sent to {email}'
        }),
        'isBase64Encoded': False
    }