'''
Business: Get receipts from database for admin panel
Args: event - dict with httpMethod, queryStringParameters
      context - object with request_id attribute
Returns: HTTP response dict with receipts list
'''

import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return get_receipts(event, cors_headers)
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def get_receipts(event: Dict[str, Any], cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получает список чеков из БД'''
    try:
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                'isBase64Encoded': False
            }
        
        params = event.get('queryStringParameters', {}) or {}
        limit = int(params.get('limit', 100))
        offset = int(params.get('offset', 0))
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Получаем чеки с данными платежей
        cursor.execute("""
            SELECT 
                r.id,
                r.payment_id,
                r.yookassa_receipt_id,
                r.tax_system_code,
                r.vat_code,
                r.amount,
                r.email,
                r.items,
                r.status,
                r.receipt_url,
                r.created_at,
                p.username,
                p.plan_name,
                p.status as payment_status
            FROM receipts r
            LEFT JOIN payments p ON r.payment_id = p.payment_id
            ORDER BY r.created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        
        rows = cursor.fetchall()
        
        receipts: List[Dict[str, Any]] = []
        for row in rows:
            receipts.append({
                'id': row[0],
                'payment_id': row[1],
                'yookassa_receipt_id': row[2],
                'tax_system_code': row[3],
                'tax_system_name': get_tax_system_name(row[3]),
                'vat_code': row[4],
                'vat_name': get_vat_name(row[4]),
                'amount': float(row[5]),
                'email': row[6],
                'items': row[7],
                'status': row[8],
                'receipt_url': row[9],
                'created_at': row[10].isoformat() if row[10] else None,
                'username': row[11],
                'plan_name': row[12],
                'payment_status': row[13]
            })
        
        # Получаем общее количество чеков
        cursor.execute("SELECT COUNT(*) FROM receipts")
        total = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'receipts': receipts,
                'total': total,
                'limit': limit,
                'offset': offset
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ Error getting receipts: {str(e)}')
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_tax_system_name(code: int) -> str:
    '''Возвращает название системы налогообложения'''
    systems = {
        1: 'ОСН (общая)',
        2: 'УСН доходы',
        3: 'УСН доходы минус расходы',
        4: 'ЕНВД',
        5: 'ЕСН',
        6: 'Патент'
    }
    return systems.get(code, f'Неизвестно ({code})')


def get_vat_name(code: int) -> str:
    '''Возвращает название ставки НДС'''
    vats = {
        1: 'НДС 20%',
        2: 'НДС 10%',
        3: 'НДС 0%',
        4: 'Без НДС',
        5: 'НДС 20/120',
        6: 'НДС 10/110'
    }
    return vats.get(code, f'Неизвестно ({code})')
