'''
Business: Send VPN subscription access email via Unisender with configuration link
Args: event - dict with httpMethod, body containing email, username, and subscription_url
      context - object with request_id attribute
Returns: HTTP response dict with statusCode, headers, body
'''

import json
import os
import requests
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        email: str = body_data.get('email', '')
        username: str = body_data.get('username', '')
        subscription_url: str = body_data.get('subscription_url', '')
        
        if not email or not subscription_url:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Missing required fields',
                    'required': ['email', 'subscription_url']
                }),
                'isBase64Encoded': False
            }
        
        unisender_api_key = os.environ.get('UNISENDER_API_KEY')
        if not unisender_api_key:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'UNISENDER_API_KEY not configured'}),
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
                                <td style="padding: 35px 30px 25px 30px; text-align: center;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                        ✅ Оплата получена — VPN готов к работе
                                    </div>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="padding: 0 30px 25px 30px;">
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 10px 0;"><strong style="color: #ef4444;">Ваш Username:</strong></p>
                                        <p style="background: #000000; border: 1px solid #dc2626; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; color: #ffffff; font-size: 16px; margin: 0; word-break: break-all;">{username}</p>
                                    </div>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="padding: 0 30px 35px 30px;">
                                    <p style="color: #fca5a5; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
                                        Выберите приложение для вашего устройства:
                                    </p>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                        <h3 style="color: #ef4444; font-size: 20px; margin: 0 0 18px 0; font-weight: 700; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">
                                            📱 Happ для Android
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">Рекомендуемое приложение для Android</p>
                                        <a href="https://play.google.com/store/apps/details?id=com.happ.android" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                            📥 Скачать Happ
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                        <h3 style="color: #ef4444; font-size: 20px; margin: 0 0 18px 0; font-weight: 700; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">
                                            🍎 Happ для iOS
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">Рекомендуемое приложение для iPhone / iPad</p>
                                        <a href="https://apps.apple.com/app/happ-proxy-utility/id6738328087" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                            📥 Скачать Happ
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 20px; border-radius: 10px;">
                                        <h3 style="color: #ef4444; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">
                                            🔗 Ссылка для подключения
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 12px 0;">Скопируйте эту ссылку и добавьте в приложение:</p>
                                        <div style="background: #000000; border: 1px solid #dc2626; padding: 12px; border-radius: 6px; word-break: break-all;">
                                            <a href="{subscription_url}" style="color: #ef4444; text-decoration: none; font-family: 'Courier New', monospace; font-size: 13px;">{subscription_url}</a>
                                        </div>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #7f1d1d; padding: 20px; border-radius: 10px; text-align: center;">
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">
                                            <strong>💬 Нужна помощь?</strong><br>
                                            Напишите в нашу службу поддержки в Telegram
                                        </p>
                                        <a href="https://t.me/gospeedvpn" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                            Открыть Telegram
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="background-color: #000000; padding: 30px; text-align: center; border-top: 2px solid #dc2626;">
                                    <p style="color: #7f1d1d; font-size: 12px; margin: 0 0 10px 0;">© 2025 Speed VPN. Все права защищены.</p>
                                    <p style="color: #7f1d1d; font-size: 11px; margin: 0;">
                                        <a href="https://onproduct.pro" style="color: #dc2626; text-decoration: none;">onproduct.pro</a> | 
                                        <a href="https://t.me/gospeedvpn" style="color: #dc2626; text-decoration: none;">Поддержка</a>
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

Ваш Username: {username}

Ссылка для подключения:
{subscription_url}

Приложения для подключения:

Android (Happ): https://play.google.com/store/apps/details?id=com.happ.android
iOS (Happ): https://apps.apple.com/app/happ-proxy-utility/id6738328087

Поддержка: https://t.me/gospeedvpn
        '''
        
        unisender_data = {
            'format': 'json',
            'api_key': unisender_api_key,
            'email': email,
            'sender_name': 'Speed VPN',
            'sender_email': 'noreply@onproduct.pro',
            'subject': 'Speed VPN - Ваша подписка активирована!',
            'body': text_content,
            'list_id': '1'
        }
        
        response = requests.post(
            'https://api.unisender.com/ru/api/sendEmail',
            data=unisender_data,
            timeout=10
        )
        
        result = response.json()
        
        if result.get('error'):
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Unisender error',
                    'details': result.get('error')
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'success': True,
                'message': 'Email sent successfully',
                'email_id': result.get('result', {}).get('email_id', '')
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }