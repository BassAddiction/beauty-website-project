'''
Business: Redirect from old domain (onproduct.pro) to new domain (speedvpn.io)
Args: event - dict with httpMethod, queryStringParameters
      context - object with request_id attribute
Returns: HTTP 301 permanent redirect response
'''

import json
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    path: str = params.get('path', '/')
    query: str = params.get('query', '')
    
    new_url: str = f"https://speedvpn.io{path}"
    if query:
        new_url += f"?{query}"
    
    return {
        'statusCode': 301,
        'headers': {
            'Location': new_url,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*'
        },
        'body': '',
        'isBase64Encoded': False
    }
