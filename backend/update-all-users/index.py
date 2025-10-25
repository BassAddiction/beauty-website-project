import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: TEST API endpoints to find correct update method
    Args: event - dict with httpMethod, context - Cloud Function execution context  
    Returns: HTTP response dict with API test results
    Version: 3.0.0 - TESTING ONLY
    '''
    print(f'🚨 NEW VERSION 3.0.0 - TESTING API ENDPOINTS')
    print(f'🔧 Method: {event.get("httpMethod", "NONE")}')
    method: str = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
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
    
    if method == 'POST':
        remnawave_url = os.environ.get('REMNAWAVE_API_URL', '').rstrip('/')
        remnawave_token = os.environ.get('REMNAWAVE_API_TOKEN', '')
        
        if not remnawave_url or not remnawave_token:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Remnawave API not configured'}),
                'isBase64Encoded': False
            }
        
        headers = {
            'Authorization': f'Bearer {remnawave_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Получаем ПЕРВОГО пользователя
            print('🔍 Fetching first user...')
            users_response = requests.get(
                f'{remnawave_url}/api/users?limit=1',
                headers=headers,
                timeout=15
            )
            
            print(f'📡 Users API Response: {users_response.status_code}')
            users_data = users_response.json()
            print(f'📦 Full Response: {json.dumps(users_data, indent=2)}')
            
            # Извлекаем первого пользователя
            if 'response' in users_data and 'users' in users_data['response']:
                first_user = users_data['response']['users'][0] if users_data['response']['users'] else None
            elif 'users' in users_data:
                first_user = users_data['users'][0] if users_data['users'] else None
            elif isinstance(users_data, list):
                first_user = users_data[0] if users_data else None
            else:
                first_user = None
            
            if not first_user:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'No users found'}),
                    'isBase64Encoded': False
                }
            
            print('=' * 80)
            print('👤 FIRST USER DATA:')
            print(json.dumps(first_user, indent=2))
            print('=' * 80)
            
            test_username = first_user.get('username')
            test_uuid = first_user.get('uuid')
            
            print(f'🧪 Test username: {test_username}')
            print(f'🧪 Test UUID: {test_uuid}')
            
            # Тестовый payload
            test_payload = {
                'data_limit': 32212254720,
                'data_limit_reset_strategy': 'day'
            }
            
            test_results = []
            
            # Test 1: GET /api/user/{username}
            print('\n' + '=' * 80)
            print('🧪 TEST 1: GET /api/user/{username}')
            print('=' * 80)
            try:
                r1 = requests.get(f'{remnawave_url}/api/user/{test_username}', headers=headers, timeout=10)
                print(f'Status: {r1.status_code}')
                print(f'Response: {r1.text[:300]}')
                test_results.append({
                    'test': 'GET /api/user/{username}',
                    'status': r1.status_code,
                    'response': r1.text[:300]
                })
            except Exception as e:
                print(f'ERROR: {str(e)}')
                test_results.append({
                    'test': 'GET /api/user/{username}',
                    'error': str(e)
                })
            
            # Test 2: PUT /api/user/{username}
            print('\n' + '=' * 80)
            print('🧪 TEST 2: PUT /api/user/{username}')
            print('=' * 80)
            try:
                r2 = requests.put(f'{remnawave_url}/api/user/{test_username}', headers=headers, json=test_payload, timeout=10)
                print(f'Status: {r2.status_code}')
                print(f'Response: {r2.text[:300]}')
                test_results.append({
                    'test': 'PUT /api/user/{username}',
                    'status': r2.status_code,
                    'response': r2.text[:300]
                })
            except Exception as e:
                print(f'ERROR: {str(e)}')
                test_results.append({
                    'test': 'PUT /api/user/{username}',
                    'error': str(e)
                })
            
            # Test 3: PUT /api/users/{username} (with 's')
            print('\n' + '=' * 80)
            print('🧪 TEST 3: PUT /api/users/{username} (with s)')
            print('=' * 80)
            try:
                r3 = requests.put(f'{remnawave_url}/api/users/{test_username}', headers=headers, json=test_payload, timeout=10)
                print(f'Status: {r3.status_code}')
                print(f'Response: {r3.text[:300]}')
                test_results.append({
                    'test': 'PUT /api/users/{username}',
                    'status': r3.status_code,
                    'response': r3.text[:300]
                })
            except Exception as e:
                print(f'ERROR: {str(e)}')
                test_results.append({
                    'test': 'PUT /api/users/{username}',
                    'error': str(e)
                })
            
            # Test 4: PATCH /api/user/{username}
            print('\n' + '=' * 80)
            print('🧪 TEST 4: PATCH /api/user/{username}')
            print('=' * 80)
            try:
                r4 = requests.patch(f'{remnawave_url}/api/user/{test_username}', headers=headers, json=test_payload, timeout=10)
                print(f'Status: {r4.status_code}')
                print(f'Response: {r4.text[:300]}')
                test_results.append({
                    'test': 'PATCH /api/user/{username}',
                    'status': r4.status_code,
                    'response': r4.text[:300]
                })
            except Exception as e:
                print(f'ERROR: {str(e)}')
                test_results.append({
                    'test': 'PATCH /api/user/{username}',
                    'error': str(e)
                })
            
            # Test 5: PUT /api/user/{uuid}
            print('\n' + '=' * 80)
            print('🧪 TEST 5: PUT /api/user/{uuid}')
            print('=' * 80)
            try:
                r5 = requests.put(f'{remnawave_url}/api/user/{test_uuid}', headers=headers, json=test_payload, timeout=10)
                print(f'Status: {r5.status_code}')
                print(f'Response: {r5.text[:300]}')
                test_results.append({
                    'test': 'PUT /api/user/{uuid}',
                    'status': r5.status_code,
                    'response': r5.text[:300]
                })
            except Exception as e:
                print(f'ERROR: {str(e)}')
                test_results.append({
                    'test': 'PUT /api/user/{uuid}',
                    'error': str(e)
                })
            
            # Test 6: PATCH /api/users/{uuid}
            print('\n' + '=' * 80)
            print('🧪 TEST 6: PATCH /api/users/{uuid}')
            print('=' * 80)
            try:
                r6 = requests.patch(f'{remnawave_url}/api/users/{test_uuid}', headers=headers, json=test_payload, timeout=10)
                print(f'Status: {r6.status_code}')
                print(f'Response: {r6.text[:300]}')
                test_results.append({
                    'test': 'PATCH /api/users/{uuid}',
                    'status': r6.status_code,
                    'response': r6.text[:300]
                })
            except Exception as e:
                print(f'ERROR: {str(e)}')
                test_results.append({
                    'test': 'PATCH /api/users/{uuid}',
                    'error': str(e)
                })
            
            print('\n' + '=' * 80)
            print('✅ ALL TESTS COMPLETED')
            print('=' * 80)
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'API endpoint tests completed',
                    'test_user': {
                        'username': test_username,
                        'uuid': test_uuid
                    },
                    'test_results': test_results
                }, indent=2),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            print(f'💥 CRITICAL ERROR: {str(e)}')
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }