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
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); padding: 50px 30px; text-align: center; position: relative;">
                                <img src="https://cdn.poehali.dev/files/3a0045b1-8f62-461c-946f-ea67286d8040.png" alt="Speed VPN Logo" width="90" height="90" style="margin-bottom: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border: 3px solid rgba(255, 255, 255, 0.2);"/>
                                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">Speed VPN</h1>
                                <p style="color: rgba(255, 255, 255, 0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 600;">Подписка успешно активирована! 🎉</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 40px 35px 25px 35px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);">
                                <p style="color: #e2e8f0; font-size: 19px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
                                    Привет, <strong style="color: #a78bfa; font-size: 20px;">{username}</strong>! 👋
                                </p>
                                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 30px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); text-align: center; margin: 0 auto; max-width: 400px;">
                                    ✅ Оплата получена — VPN готов к работе
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 0 35px 40px 35px; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);">
                                <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                                    Спасибо за покупку! Ваш VPN уже работает.
                                </p>
                                
                                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border: 2px solid #475569; padding: 30px; margin-bottom: 30px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);">
                                    <h3 style="color: #a78bfa; font-size: 19px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">
                                        👤 Важная информация о вашем аккаунте
                                    </h3>
                                    <div style="background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%); padding: 24px; border-radius: 12px; border: 2px solid #6366f1; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);">
                                        <p style="color: #e0e7ff; font-size: 15px; margin: 0 0 8px 0; text-align: center; font-weight: 500;">
                                            Ваш Username
                                        </p>
                                        <p style="color: #ffffff; font-size: 22px; margin: 0; text-align: center; font-weight: 800; letter-spacing: 0.5px;">
                                            {username}
                                        </p>
                                    </div>
                                    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0; text-align: left;">
                                        <strong style="color: #fbbf24;">⚠️ Сохраните этот username!</strong><br><br>
                                        Он нужен для:<br>
                                        • Входа в личный кабинет<br>
                                        • Продления подписки<br>
                                        • Управления вашим VPN<br><br>
                                        <strong style="color: #fbbf24;">🔒 Не передавайте username третьим лицам!</strong><br>
                                        Это ваш персональный идентификатор.
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="https://speedvpn.io" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 14px; font-weight: 700; font-size: 17px; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5); letter-spacing: 0.3px; transition: all 0.3s ease;">
                                        🚀 Перейти в личный кабинет
                                    </a>
                                </div>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="{subscription_url}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 14px; font-weight: 700; font-size: 17px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.5); letter-spacing: 0.3px; transition: all 0.3s ease;">
                                        ⚡ Быстрое подключение
                                    </a>
                                </div>
                                
                                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border: 2px solid #475569; padding: 25px; margin: 30px 0; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);">
                                    <h3 style="color: #a78bfa; font-size: 17px; margin: 0 0 15px 0; font-weight: 700; text-align: center;">
                                        🔗 Ссылка для добавления в клиент
                                    </h3>
                                    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
                                        Скопируйте эту ссылку и вставьте в VPN-клиент в разделе "Профили" → "Импорт"
                                    </p>
                                    <div style="background: #0f172a; padding: 16px; border-radius: 10px; border: 2px solid #6366f1; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);">
                                        <p style="color: #a5b4fc; font-size: 13px; margin: 0 0 8px 0; text-align: center; font-weight: 600;">
                                            Ваша ссылка подписки:
                                        </p>
                                        <p style="color: #ffffff; font-size: 14px; margin: 0; text-align: center; word-break: break-all; font-family: 'Courier New', monospace; font-weight: 600; line-height: 1.5;">
                                            {subscription_url}
                                        </p>
                                    </div>
                                </div>
                                
                                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border: 2px solid #475569; padding: 28px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);">
                                    <h3 style="color: #a78bfa; font-size: 18px; margin: 0 0 18px 0; font-weight: 700;">
                                        📖 Как подключиться:
                                    </h3>
                                    <ol style="color: #cbd5e1; font-size: 15px; line-height: 1.9; margin: 0; padding-left: 22px;">
                                        <li style="margin-bottom: 12px;">Войдите в личный кабинет и следуйте инструкции</li>
                                        <li style="margin-bottom: 12px;">Нажмите кнопку "Быстрое подключение" и следуйте инструкции</li>
                                    </ol>
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 35px; text-align: center; border-top: 2px solid #475569;">
                                <p style="color: #a78bfa; font-size: 17px; margin: 0 0 25px 0; font-weight: 600;">
                                    Нужна помощь? Мы на связи! 💬
                                </p>
                                <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="padding: 0 10px;">
                                            <a href="https://t.me/shopspeedvpn_bot" style="display: inline-block; text-decoration: none;">
                                                <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%); border-radius: 12px; box-shadow: 0 6px 18px rgba(0, 136, 204, 0.4); width: 50px; height: 50px;">
                                                    <tr>
                                                        <td align="center" valign="middle">
                                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/></svg>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </a>
                                        </td>
                                        <td style="padding: 0 10px;">
                                            <a href="https://t.me/gospeedvpn" style="display: inline-block; text-decoration: none;">
                                                <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%); border-radius: 12px; box-shadow: 0 6px 18px rgba(0, 136, 204, 0.4); width: 50px; height: 50px;">
                                                    <tr>
                                                        <td align="center" valign="middle">
                                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </a>
                                        </td>
                                        <td style="padding: 0 10px;">
                                            <a href="https://t.me/speedvpn_io" style="display: inline-block; text-decoration: none;">
                                                <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%); border-radius: 12px; box-shadow: 0 6px 18px rgba(0, 136, 204, 0.4); width: 50px; height: 50px;">
                                                    <tr>
                                                        <td align="center" valign="middle">
                                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0 0; line-height: 1.6;">
                                    <a href="https://t.me/shopspeedvpn_bot" style="color: #60a5fa; text-decoration: none; font-weight: 600;">Бот для покупки</a> • 
                                    <a href="https://t.me/gospeedvpn" style="color: #60a5fa; text-decoration: none; font-weight: 600;">Поддержка</a> • 
                                    <a href="https://t.me/speedvpn_io" style="color: #60a5fa; text-decoration: none; font-weight: 600;">Новости</a>
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

⚡ Быстрое подключение:
{subscription_url}

🚀 Перейдите в личный кабинет для настройки:
https://speedvpn.io

📖 Как подключиться:
1. Войдите в личный кабинет и следуйте инструкции
2. Нажмите кнопку "Быстрое подключение" и следуйте инструкции

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