import json
from django.http import HttpResponse, HttpResponseNotFound
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dataclasses import dataclass
from .models import User
from .utils import generate_jwt
from django.contrib.auth.hashers import make_password, check_password

@dataclass
class registerPostParameters():
	username: str
	mail: str
	password: str

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
		new_user = User(username=data.username, mail=data.mail, password=make_password(data.password))
		new_user.save()
		return HttpResponse(status=200)
	else:
		return HttpResponseNotFound(status=404)

@csrf_exempt
def user_login(request):
	print(json.loads(request.body))
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		print(data)
		username = data.get('username')
		password = data.get('password')
		if (not User.objects.filter(username=username).exists()):
			return (JsonResponse({'error': 'No user by this name'}))
		user = User.objects.get(username=username)
		if check_password(password, user.password) and user.username == username:
			jwt_token = generate_jwt(user)
			print('token = ', jwt_token)
			return JsonResponse({'token': jwt_token})
		else:
			return JsonResponse({'error': 'Invalid login credentials'})
	else:
		return JsonResponse({'error': 'Invalid request method'})