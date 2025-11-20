import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Проверка статуса платежа напрямую в ЮКассе
    Args: event с payment_id в query params
    Returns: Статус платежа из ЮКассы
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters', {})
    payment_id = query_params.get('payment_id')
    
    if not payment_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'payment_id required'}),
            'isBase64Encoded': False
        }
    
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YooKassa credentials not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        print(f'🔍 Checking payment status: {payment_id}')
        response = requests.get(
            f'https://api.yookassa.ru/v3/payments/{payment_id}',
            auth=(shop_id, secret_key),
            timeout=10
        )
        
        print(f'📋 YooKassa response: status_code={response.status_code}')
        
        if response.status_code != 200:
            print(f'❌ YooKassa error: {response.text}')
            return {
                'statusCode': response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to get payment status'}),
                'isBase64Encoded': False
            }
        
        payment_data = response.json()
        status = payment_data.get('status', 'unknown')
        paid = payment_data.get('paid', False)
        
        print(f'✅ Payment status: {status}, paid: {paid}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'payment_id': payment_id,
                'status': status,
                'paid': paid
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }