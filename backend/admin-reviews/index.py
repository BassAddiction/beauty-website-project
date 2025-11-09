import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin panel for managing reviews - get pending, approve, reject, delete
    Args: event with httpMethod, body, headers with X-Admin-Token
    Returns: HTTP response with review management results
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token')
    
    if not admin_token or len(admin_token) < 32:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized - admin token required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            status_filter = params.get('status', 'pending')
            
            if status_filter == 'pending':
                is_approved = False
            elif status_filter == 'approved':
                is_approved = True
            else:
                is_approved = None
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if is_approved is None:
                    cur.execute('''
                        SELECT id, name, location, rating, plan, text, email,
                               TO_CHAR(created_at, 'DD Month YYYY HH24:MI') as date,
                               is_approved
                        FROM reviews 
                        ORDER BY created_at DESC
                    ''')
                else:
                    cur.execute('''
                        SELECT id, name, location, rating, plan, text, email,
                               TO_CHAR(created_at, 'DD Month YYYY HH24:MI') as date,
                               is_approved
                        FROM reviews 
                        WHERE is_approved = %s
                        ORDER BY created_at DESC
                    ''', (is_approved,))
                
                reviews = cur.fetchall()
                
                reviews_list = []
                for review in reviews:
                    reviews_list.append({
                        'id': review['id'],
                        'name': review['name'],
                        'location': review['location'],
                        'rating': review['rating'],
                        'plan': review['plan'],
                        'text': review['text'],
                        'email': review['email'],
                        'date': review['date'],
                        'is_approved': review['is_approved']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'reviews': reviews_list, 'total': len(reviews_list)})
                }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            review_id = body_data.get('id')
            action = body_data.get('action', 'approve')
            
            if not review_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review ID required'})
                }
            
            with conn.cursor() as cur:
                if action == 'approve':
                    cur.execute('UPDATE reviews SET is_approved = true WHERE id = %s', (review_id,))
                elif action == 'reject':
                    cur.execute('UPDATE reviews SET is_approved = false WHERE id = %s', (review_id,))
                
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': f'Review {action}d'})
            }
        
        if method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            review_id = body_data.get('id')
            
            if not review_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review ID required'})
                }
            
            with conn.cursor() as cur:
                cur.execute('DELETE FROM reviews WHERE id = %s', (review_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Review deleted'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
