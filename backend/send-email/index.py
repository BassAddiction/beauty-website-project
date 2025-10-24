'''
Business: Send VPN subscription access email with configuration link
Args: event - dict with httpMethod, body containing email and subscription_url
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
        
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'RESEND_API_KEY not configured'}),
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
                                <td style="padding: 0 30px 35px 30px;">
                                    <p style="color: #fca5a5; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
                                        Спасибо за покупку! Ваш VPN уже работает.<br>Выберите приложение для вашего устройства:
                                    </p>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                        <h3 style="color: #ef4444; font-size: 20px; margin: 0 0 18px 0; font-weight: 700; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">
                                            📱 Happ для Android
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">Рекомендуемое приложение для Android</p>
                                        <a href="https://play.google.com/store/apps/details?id=com.happ.android" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                            📥 Скачать Happ для Android
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #dc2626; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                        <h3 style="color: #ef4444; font-size: 20px; margin: 0 0 18px 0; font-weight: 700; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">
                                            🍎 Happ для iOS
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">Рекомендуемое приложение для iPhone / iPad</p>
                                        <a href="https://apps.apple.com/app/happ-proxy-utility/id6738328087" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                            📥 Скачать Happ для iOS
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #7f1d1d; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(127, 29, 29, 0.3);">
                                        <h3 style="color: #dc2626; font-size: 20px; margin: 0 0 18px 0; font-weight: 700;">
                                            📱 V2rayTun для Android
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">Альтернативное приложение для Android</p>
                                        <a href="https://play.google.com/store/apps/details?id=com.v2raytun.android" style="display: inline-block; background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; border: 1px solid #991b1b;">
                                            📥 Скачать V2rayTun для Android
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #7f1d1d; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(127, 29, 29, 0.3);">
                                        <h3 style="color: #dc2626; font-size: 20px; margin: 0 0 18px 0; font-weight: 700;">
                                            🍎 V2rayTun для iOS
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 14px; margin: 0 0 15px 0;">Альтернативное приложение для iPhone / iPad</p>
                                        <a href="https://apps.apple.com/app/v2raytun/id6476628951" style="display: inline-block; background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; border: 1px solid #991b1b;">
                                            📥 Скачать V2rayTun для iOS
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #7f1d1d; padding: 25px; margin-bottom: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(127, 29, 29, 0.3);">
                                        <h3 style="color: #dc2626; font-size: 20px; margin: 0 0 18px 0; font-weight: 700;">
                                            💻 Windows
                                        </h3>
                                        <p style="color: #fca5a5; font-size: 15px; margin: 0 0 12px 0;">Скачайте V2rayN с официального GitHub:</p>
                                        <a href="https://github.com/2dust/v2rayN/releases" style="display: inline-block; background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; border: 1px solid #991b1b;">
                                            📥 GitHub: V2rayN Releases
                                        </a>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #dc2626; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                        <p style="color: #ef4444; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; text-shadow: 0 0 5px rgba(220, 38, 38, 0.5);">🔗 Ваша ссылка подписки:</p>
                                        <div style="background-color: #000000; padding: 18px; border-radius: 8px; border: 2px solid #dc2626;">
                                            <code style="color: #fca5a5; font-size: 13px; font-family: 'Courier New', monospace; word-break: break-all; line-height: 1.6;">{subscription_url}</code>
                                        </div>
                                        <p style="color: #fca5a5; font-size: 13px; margin: 15px 0 0 0; line-height: 1.6;">
                                            После установки приложения откройте его и вставьте эту ссылку в раздел "Подписка" или "Subscription"
                                        </p>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%); border-left: 5px solid #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #991b1b;">
                                        <p style="color: #fca5a5; font-size: 15px; margin: 0; line-height: 1.7; font-weight: 600;">
                                            💡 <strong style="color: #ef4444;">Сохраните эту ссылку!</strong> Она понадобится для всех устройств.
                                        </p>
                                    </div>
                                    
                                    <div style="text-align: center; padding-top: 25px; border-top: 2px solid #dc2626;">
                                        <p style="color: #fca5a5; font-size: 15px; margin: 0 0 15px 0; font-weight: 500;">
                                            Возникли вопросы? Мы всегда на связи!
                                        </p>
                                        <a href="https://beauty-website-project.poehali.app/get-access" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 1px solid #ef4444;">
                                            🔄 Восстановить доступ
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="background-color: #000000; padding: 35px 30px; text-align: center; border-top: 2px solid #dc2626;">
                                    <p style="color: #dc2626; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
                                        Speed VPN — Быстрый и безопасный интернет 🚀
                                    </p>
                                    <p style="color: #7f1d1d; font-size: 12px; margin: 0;">
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
            
    except json.JSONDecodeError as e:
        print(f'❌ JSON decode error: {str(e)}')
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'}),
            'isBase64Encoded': False
        }
    except requests.RequestException as e:
        print(f'❌ Request exception: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Network error: {str(e)}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'❌ Unexpected error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }