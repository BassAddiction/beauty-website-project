import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage reviews - get approved reviews and create new review
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with reviews list or creation status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
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
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    SELECT id, name, location, rating, plan, text, 
                           TO_CHAR(created_at, 'DD Month YYYY') as date
                    FROM reviews 
                    WHERE is_approved = true 
                    ORDER BY created_at DESC
                ''')
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
                        'date': review['date']
                    })
                
                total_reviews = len(reviews_list)
                avg_rating = sum(r['rating'] for r in reviews_list) / total_reviews if total_reviews > 0 else 0
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'reviews': reviews_list,
                        'total': total_reviews,
                        'average_rating': round(avg_rating, 1)
                    })
                }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            location = body_data.get('location', '').strip()
            rating = body_data.get('rating', 5)
            plan = body_data.get('plan', '').strip()
            text = body_data.get('text', '').strip()
            email = body_data.get('email', '').strip()
            
            if not all([name, location, text, plan]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            if not (1 <= rating <= 5):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'})
                }
            
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO reviews (name, location, rating, plan, text, email, is_approved)
                    VALUES (%s, %s, %s, %s, %s, %s, false)
                    RETURNING id
                ''', (name, location, rating, plan, text, email if email else None))
                
                review_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'review_id': review_id,
                    'message': 'Review submitted for moderation'
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
