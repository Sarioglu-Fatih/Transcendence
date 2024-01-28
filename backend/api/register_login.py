import re
import json
from django.http import HttpResponse, HttpResponseNotFound
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dataclasses import dataclass
from .models import User
from .utils import generate_jwt

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
		regexUsername = r'^[a-zA-Z0-9_-]+$'																# register page parsing
		regexEmail = r'\A\S+@\S+\.\S+\Z'
		secRegexEmail = r'^[a-zA-Z0-9@.]+$'
		regexPwd = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$'
		if not re.match(regexUsername, data.username):
			return JsonResponse({'error': 'Username not valide'})
		if not (re.match(regexEmail, data.mail) and re.match(secRegexEmail, data.mail)):
			return JsonResponse({'error': 'Email not valide'})
		if  not re.match(regexPwd, data.password):
			return JsonResponse({'error': "Special characters allowed : @$!%#?&"})
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
		print(data)
		username = data.get('username')
		password = data.get('password')
		regexUsername = r'^[a-zA-Z0-9_-]+$'																# login page parsing
		if (re.match(regexUsername, username)):
			if (not User.objects.filter(username=username).exists()):
				return (JsonResponse({'error': 'No user by this name'}))
			user = User.objects.get(username=username)
			if user.password == password and user.username == username:
				jwt_token = generate_jwt(user)
				print('token = ', jwt_token)
				return JsonResponse({'token': jwt_token})
			else:
				return JsonResponse({'error': 'Invalid login credentials'})
		else:
			return JsonResponse({'error': 'Username not valide'})

	else:
		return JsonResponse({'error': 'Invalid request method'})