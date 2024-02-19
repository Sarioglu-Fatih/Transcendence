from django.views.decorators.csrf import ensure_csrf_cookie
import jwt
from jwt.exceptions import InvalidTokenError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.conf import settings
from jwt.exceptions import DecodeError

@ensure_csrf_cookie
def get_csrf_token(request):
	token = get_token(request)
	response = JsonResponse({'csrf_token': token})
	response.set_cookie('csrftoken', token)
	print(token)
	return response

# def refresh

def decode_Payload(request):
    jwt_token = request.COOKIES.get('jwt_token')
    if not jwt_token:
        return
    try:
        decoded_payload = jwt.decode(jwt_token, key=str(settings.SECRET_KEY), algorithms=['HS256'])
        print("PAYLOAD DECODED : ", decoded_payload)
        return decoded_payload
    except DecodeError:
        return None
