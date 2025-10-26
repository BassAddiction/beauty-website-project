import json
import os
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin API for managing tariffs and clients
    Args: event with httpMethod, queryStringParameters, headers; context with request_id
    Returns: HTTP response with tariffs or clients data
    '''
    method: str = event.get('httpMethod', 'GET')
    headers_in = event.get('headers', {})
    query = event.get('queryStringParameters', {})
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
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
    
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    provided_password = headers_in.get('x-admin-password', headers_in.get('X-Admin-Password', ''))
    
    if provided_password != admin_password:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    action = query.get('action', 'plans')
    
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            if action == 'plans':
                cur.execute('''
                    SELECT plan_id, name, price, days, traffic_gb, 
                           is_active, is_custom, sort_order, features
                    FROM subscription_plans
                    ORDER BY sort_order
                ''')
                plans = [dict(row) for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'plans': plans}),
                    'isBase64Encoded': False
                }
            
            elif action == 'clients':
                cur.execute('''
                    SELECT 
                        username, 
                        email,
                        MAX(created_at) as last_payment,
                        SUM(amount) as total_paid,
                        COUNT(*) as payment_count
                    FROM payments
                    GROUP BY username, email
                    ORDER BY last_payment DESC
                ''')
                clients = [dict(row) for row in cur.fetchall()]
                
                for client in clients:
                    if client['last_payment']:
                        client['last_payment'] = client['last_payment'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'clients': clients}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            plan_id = body_data.get('plan_id', 0)
            
            if plan_id == 0:
                cur.execute('''
                    INSERT INTO subscription_plans 
                    (name, price, days, traffic_gb, is_active, is_custom, sort_order, features)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING plan_id
                ''', (
                    body_data['name'],
                    body_data['price'],
                    body_data['days'],
                    body_data['traffic_gb'],
                    body_data.get('is_active', True),
                    body_data.get('is_custom', False),
                    body_data.get('sort_order', 1),
                    body_data.get('features', [])
                ))
                new_id = cur.fetchone()['plan_id']
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'plan_id': new_id}),
                    'isBase64Encoded': False
                }
            else:
                cur.execute('''
                    UPDATE subscription_plans
                    SET name=%s, price=%s, days=%s, traffic_gb=%s,
                        is_active=%s, is_custom=%s, sort_order=%s, features=%s
                    WHERE plan_id=%s
                ''', (
                    body_data['name'],
                    body_data['price'],
                    body_data['days'],
                    body_data['traffic_gb'],
                    body_data.get('is_active', True),
                    body_data.get('is_custom', False),
                    body_data.get('sort_order', 1),
                    body_data.get('features', []),
                    plan_id
                ))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            plan_id = query.get('plan_id')
            if plan_id:
                cur.execute('DELETE FROM subscription_plans WHERE plan_id=%s', (plan_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            username = query.get('username')
            if username:
                cur.execute('DELETE FROM payments WHERE username=%s', (username,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        cur.close()
        conn.close()
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 400,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Invalid request'}),
        'isBase64Encoded': False
    }
