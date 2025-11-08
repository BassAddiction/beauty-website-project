'''
Business: Restore access by email - find all usernames purchased from this email
Args: event - dict with httpMethod, body containing email
      context - object with request_id attribute
Returns: HTTP response dict with list of usernames or sends email
'''

import json
import os
import psycopg2
from typing import Dict, Any, List
import requests

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
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        body_str = '{}'
    body_data = json.loads(body_str)
    email: str = body_data.get('email', '').strip().lower()
    
    if not email:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Missing required field',
                'required': ['email']
            }),
            'isBase64Encoded': False
        }
    
    if '@' not in email or '.' not in email:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Invalid email format'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    safe_email = email.replace("'", "''")
    cursor.execute(f"""
        SELECT DISTINCT username, created_at
        FROM t_p66544974_beauty_website_proje.payments 
        WHERE LOWER(email) = '{safe_email}'
        AND status = 'succeeded'
        ORDER BY created_at DESC
    """)
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    if not rows:
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'No purchases found for this email',
                'message': 'На этот email не найдено оплаченных подписок'
            }),
            'isBase64Encoded': False
        }
    
    usernames: List[str] = [row[0] for row in rows]
    
    print(f'📧 Found {len(usernames)} usernames for email {email}')
    
    send_restore_email(email, usernames)
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({
            'success': True,
            'message': f'Email sent to {email}',
            'usernames_count': len(usernames)
        }),
        'isBase64Encoded': False
    }


def send_restore_email(email: str, usernames: List[str]):
    '''Отправляет email со списком usernames'''
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_email, smtp_password]):
        print('⚠️ SMTP settings not configured')
        return
    
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    usernames_html = ''.join([
        f'<div style="background: #0a0a0a; padding: 15px; border-radius: 8px; border: 1px solid #7f1d1d; margin-bottom: 10px;">'
        f'<code style="color: #ef4444; font-size: 16px; font-family: \'Courier New\', monospace; font-weight: 600;">{username}</code>'
        f'</div>'
        for username in usernames
    ])
    
    usernames_text = '\n'.join([f'• {username}' for username in usernames])
    
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
                                <p style="color: #fca5a5; margin: 12px 0 0 0; font-size: 16px; font-weight: 500;">Восстановление доступа 🔑</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 35px 30px;">
                                <p style="color: #fca5a5; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
                                    Вы запросили восстановление доступа к вашим аккаунтам Speed VPN.
                                </p>
                                
                                <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                    <h3 style="color: #ef4444; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">
                                        👤 Ваши Username ({len(usernames)})
                                    </h3>
                                    <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">
                                        На этот email зарегистрированы следующие аккаунты:
                                    </p>
                                    {usernames_html}
                                </div>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="https://speedvpn.io/login" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                        🚀 Войти в личный кабинет
                                    </a>
                                </div>
                                
                                <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #7f1d1d; padding: 20px; border-radius: 10px; margin-top: 25px;">
                                    <p style="color: #fca5a5; font-size: 14px; line-height: 1.6; margin: 0;">
                                        <strong style="color: #ef4444;">⚠️ Важно:</strong><br><br>
                                        • Используйте любой из указанных username для входа<br>
                                        • Не передавайте username третьим лицам<br>
                                        • Если вы не запрашивали восстановление доступа, проигнорируйте это письмо
                                    </p>
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
Speed VPN - Восстановление доступа

Вы запросили восстановление доступа к вашим аккаунтам Speed VPN.

👤 ВАШИ USERNAME ({len(usernames)}):

{usernames_text}

🚀 Войти в личный кабинет:
https://speedvpn.io/login

⚠️ ВАЖНО:
• Используйте любой из указанных username для входа
• Не передавайте username третьим лицам
• Если вы не запрашивали восстановление доступа, проигнорируйте это письмо

Нужна помощь? Telegram: @gospeedvpn
    '''
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Speed VPN - Восстановление доступа 🔑'
    msg['From'] = smtp_email
    msg['To'] = email
    
    msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))
    
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
    
    print(f'✅ Restore email sent to {email}')