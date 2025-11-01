'''
Business: Quick fix to extend mister_1762018677494 subscription
Args: event
Returns: Success status
'''

import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Fix mister subscription - set correct expire date (Dec 8, 2025)
        # 30 days base + 7 days referral bonus = Dec 8, 2025
        from datetime import datetime
        correct_expire_timestamp = int(datetime(2025, 12, 8, 17, 38, 39).timestamp())
        
        remnawave_url = 'https://functions.poehali.dev/4e61ec57-0f83-4c68-83fb-8b3049f711ab'
        
        response = requests.post(
            remnawave_url,
            headers={'Content-Type': 'application/json'},
            json={
                'action': 'update_user',
                'username': 'mister_1762018677494',
                'uuid': 'b8e4535a-2aea-4076-9af0-fdc198988eab',
                'expire': correct_expire_timestamp
            },
            timeout=30
        )
        
        return {
            'statusCode': response.status_code,
            'headers': cors_headers,
            'body': json.dumps({
                'success': response.status_code == 200,
                'response': response.text
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