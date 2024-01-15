import json
from django.core import serializers
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from dataclasses import dataclass
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
import jwt
import base64
from .models import User
import datetime
from django.conf import settings


def generate_jwt(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=settings.TOKEN_EXPIRATION_TIME),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

@dataclass
class registerPostParameters():
	username: str
	mail: str
	password: str

def avatar(request):
    avatar_data = User.objects.get(username='toto').user.get_avatar()
    encoded_avatar = base64.b64encode(avatar_data).decode('utf-8')
    return JsonResponse({'avatar': encoded_avatar})

def get_user(request):
	if request.method == 'GET':
		authorization_header = request.headers.get('Authorization')
		# Extract the JWT token from the Authorization header
		jwt_token = authorization_header.split(' ')[1]
		# Decode the JWT token to get the payload
		decoded_payload = jwt.decode(jwt_token, key=settings.SECRET_KEY, algorithms=['HS256'])
		# Access the user information, such as the username
		print(decoded_payload)
		user_id = decoded_payload.get('user_id')
		if user_id:
			user = User.objects.get(id=user_id)
			data = {
				'username': user.username,
				'mail': user.mail
			}
			return JsonResponse(data, safe=False)
		return HttpResponseNotFound(status=404)
	else:
		return HttpResponseNotFound(status=404)

@csrf_exempt
def create_user(request):
	if request.method == 'POST':
		try:
			data = registerPostParameters(**json.loads(request.body))
		except Exception  as e:
			return HttpResponse(status=400, reason="Bad request: " + str(e))
		if User.objects.filter(username=data.username).exists():
			return HttpResponse(reason="Conflict: Username already exists.", status=409)
		if User.objects.filter(mail=data.mail).exists():
			return HttpResponse(reason="Conflict: Email already exists.", status=409)
		new_user = User(username=data.username, mail=data.mail, password=data.password)
		new_user.save()
		return HttpResponse(status=200)
	else:
		return HttpResponseNotFound(status=404)

@csrf_exempt
def user_login(request):
	print(json.loads(request.body))
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		username = data.get('username')
		password = data.get('password')
		user = User.objects.get(username=username)
		if user.password == password and user.username == username:
			jwt_token = generate_jwt(user)
			print('token = ', jwt_token)
			return JsonResponse({'token': jwt_token})
		else:
			return JsonResponse({'error': 'Invalid login credentials'})
	else:
		return JsonResponse({'error': 'Invalid request method'})

@ensure_csrf_cookie
def get_csrf_token(request):
	token = get_token(request)
	response = JsonResponse({'csrf_token': token})
	print(token)
	return response