from django.views.decorators.csrf import ensure_csrf_cookie
import jwt
from jwt.exceptions import InvalidTokenError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.conf import settings

@ensure_csrf_cookie
def get_csrf_token(request):
	token = get_token(request)
	response = JsonResponse({'csrf_token': token})
	response.set_cookie('csrftoken', token)
	print(token)
	return response

def decode_Payload(request):
	# Decode the JWT token to get the payload
	jwt_token = request.COOKIES.get('jwt_token')
	if (not jwt_token):
		return
	decoded_payload = jwt.decode(jwt_token, key=settings.SECRET_KEY, algorithms=['HS256'])
	print("PAYLOAD DECODED : ", decoded_payload)
	return (decoded_payload)
