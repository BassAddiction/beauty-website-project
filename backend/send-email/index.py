import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка email с данными доступа к VPN через Resend
    Args: event - dict с httpMethod, body (email, subscription_url, username)
          context - объект с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    resend_api_key = os.environ.get('RESEND_API_KEY', '')
    
    print(f'📧 RESEND_API_KEY configured: {bool(resend_api_key)}')
    
    if not resend_api_key:
        print('❌ RESEND_API_KEY not found in environment')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'RESEND_API_KEY not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        email = body_data.get('email')
        subscription_url = body_data.get('subscription_url')
        username = body_data.get('username')
        
        print(f'📧 Sending email to: {email}')
        print(f'📧 Subscription URL: {subscription_url}')
        print(f'📧 Username: {username}')
        
        if not email or not subscription_url:
            print('❌ Missing email or subscription_url')
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'email and subscription_url required'}),
                'isBase64Encoded': False
            }
        
        # HTML шаблон письма
        html_content = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🚀 Speed VPN</h1>
                                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ваша подписка активирована!</p>
                                </td>
                            </tr>
                            
                            <!-- Success Badge -->
                            <tr>
                                <td style="padding: 30px 30px 20px 30px; text-align: center;">
                                    <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                        ✅ Оплата успешно получена
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 0 30px 30px 30px;">
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Здравствуйте!
                                    </p>
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Спасибо за покупку! Ваш VPN уже готов к использованию. Следуйте инструкциям ниже для подключения.
                                    </p>
                                    
                                    <!-- Instructions -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                                        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">📱 Как подключиться:</h2>
                                        <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;"><strong>Скачайте приложение:</strong><br>
                                                Windows: V2rayN | Android: V2rayNG | iOS: Streisand
                                            </li>
                                            <li style="margin-bottom: 8px;"><strong>Скопируйте ссылку подписки</strong> (ниже)</li>
                                            <li style="margin-bottom: 8px;"><strong>Добавьте подписку в приложении</strong> по этой ссылке</li>
                                            <li><strong>Подключитесь к VPN</strong> и наслаждайтесь быстрым интернетом! 🎉</li>
                                        </ol>
                                    </div>
                                    
                                    <!-- Subscription URL -->
                                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Ваша ссылка подписки:</p>
                                        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; word-break: break-all;">
                                            <code style="color: #667eea; font-size: 13px; font-family: 'Courier New', monospace;">{subscription_url}</code>
                                        </div>
                                    </div>
                                    
                                    <!-- Important Note -->
                                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                                        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                                            <strong>💡 Важно:</strong> Сохраните эту ссылку! Она понадобится для подключения VPN на всех ваших устройствах.
                                        </p>
                                    </div>
                                    
                                    <!-- Support -->
                                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                            Возникли вопросы? Мы всегда на связи!
                                        </p>
                                        <p style="margin: 0;">
                                            <a href="https://beauty-website-project.poehali.app/get-access" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                                Восстановить доступ
                                            </a>
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #9ca3af; font-size: 13px; margin: 0 0 5px 0;">
                                        Speed VPN - Быстрый и безопасный интернет
                                    </p>
                                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                        Это автоматическое письмо, пожалуйста, не отвечайте на него.
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
        
        # Отправка через Resend API
        print('📧 Sending request to Resend API...')
        resend_response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {resend_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'from': 'Speed VPN <noreply@speedvpn.io>',
                'to': [email],
                'subject': '🚀 Ваша подписка Speed VPN активирована!',
                'html': html_content
            },
            timeout=10
        )
        
        print(f'📧 Resend response status: {resend_response.status_code}')
        print(f'📧 Resend response body: {resend_response.text}')
        
        if resend_response.status_code in [200, 201]:
            print('✅ Email sent successfully!')
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'message': 'Email sent successfully',
                    'email_id': resend_response.json().get('id')
                }),
                'isBase64Encoded': False
            }
        else:
            print(f'❌ Failed to send email: {resend_response.text}')
            return {
                'statusCode': resend_response.status_code,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Failed to send email',
                    'details': resend_response.text
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