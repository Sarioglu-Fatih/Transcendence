from django.views.decorators.csrf import ensure_csrf_cookie
import jwt
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.conf import settings

@ensure_csrf_cookie
def get_csrf_token(request):
	token = get_token(request)
	response = JsonResponse({'csrf_token': token})
	print(token)
	return response

def decode_Payload(request):
	# Extract the JWT token from the Authorization header
	authorization_header = request.headers.get('Authorization')
	jwt_token = authorization_header.split(' ')[1]
	# Decode the JWT token to get the payload
	decoded_payload = jwt.decode(jwt_token, key=settings.SECRET_KEY, algorithms=['HS256'])
	print(decoded_payload)
	return (decoded_payload)
