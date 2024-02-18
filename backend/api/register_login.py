import re
import json
import requests
import os
import random
import string
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from dataclasses import dataclass
from .models import User, Match
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import logout, authenticate, login
from django.contrib.sessions.models import Session
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from django_otp.plugins.otp_totp.models import TOTPDevice
from .utils import decode_Payload
from django.contrib.auth.decorators import login_required


@dataclass
class registerPostParameters():
	username: str
	email: str
	password: str
	pseudo : str


def create_user(request):
	if request.method != 'POST':
		return HttpResponseNotFound(status=405)
	try:
		data = registerPostParameters(**json.loads(request.body))
	except Exception  as e:
		return HttpResponse(status=400, reason="Bad request: " + str(e))
	regexUsername = r'^[a-zA-Z0-9_-]{1,16}$'															# register page parsing
	regexEmail = r'\A\S+@\S+\.\S+\Z'
	secRegexEmail = r'^[a-zA-Z0-9@.-]+$'
	regexPwd = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,16}$'
	print("===========================")
	if not re.match(regexUsername, data.username):
		return JsonResponse({'error': 'Username not valide'}, status=419)
	if not (re.match(regexEmail, data.email) and re.match(secRegexEmail, data.email)):
		return JsonResponse({'error': 'Email not valide'}, status=420)
	if  not re.match(regexPwd, data.password):
		return JsonResponse({'error': "Special characters allowed : @$!%#?&"}, status=421)
	if User.objects.filter(username=data.username).exists():
		return JsonResponse({'error': "Conflict: Username already exists."}, status=409)
	if User.objects.filter(email=data.email).exists():
		return JsonResponse({'error': "Conflict: Email already exists."}, status=409)
	new_user = User(username=data.username, email=data.email, password=make_password(data.password))
	new_user.save()
	return HttpResponse(status=200)


def user_login(request):
	if request.method != 'POST':
		return HttpResponseNotFound(status=405)
	data = json.loads(request.body.decode('utf-8'))
	username = data.get('username')
	password = data.get('password')
	regexUsername = r'^[a-zA-Z0-9_-]+$'																# login page parsing
	if (not re.match(regexUsername, username)):
		return JsonResponse({'error': 'Username not valide'})
	user = authenticate(request, username=username, password=password)
	if user is None:
		return HttpResponse(status=401)
	if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
		return HttpResponse(reason='Need totp token', status='222')
	login(request, user)
	# Generate JWT token, access and refresh
	refresh = RefreshToken.for_user(user)
	jwt_token = str(refresh.access_token)
	refresh_token = str(refresh)
	user.user_is_connected = True
	user.save()
	# Set JWT token in a cookie
	response = JsonResponse({
		'status': 'success',
		'message': 'Login successful',
		'token': jwt_token,
		'refresh_token': refresh_token
	})
	response.set_cookie('refresh_token',refresh_token)
	response.set_cookie('jwt_token', jwt_token)
	return response

def user_logout(request):
	if request.method != 'GET':
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	logout(request)
	Session.objects.filter(session_key=request.session.session_key).delete()
	response = JsonResponse({
				'status': 'success',
				'message': 'User logged out',
			})
	response.set_cookie('refresh_token', '', expires=0)
	response.set_cookie('jwt_token', '', expires=0)
	return response

@login_required
def updateUser(request):
	if request.method != 'PATCH':
		return JsonResponse({'error': 'Invalid request method'}, status=405)
	try:
			data = registerPostParameters(**json.loads(request.body))
	except Exception  as e:   
		return HttpResponse(status=400, reason="Bad request: " + str(e))
	regexUsername = r'^[a-zA-Z0-9_-]{1,16}$'	
	regexPseudo = r'^[a-zA-Z0-9_-]{1,16}$'																# register page parsing
	regexEmail = r'\A[^%\s]+@\S+\.\S+\Z'
	secRegexEmail = r'^[a-zA-Z0-9@.-]+$'
	regexPwd = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%?&])[^\s]{8,16}$'
	payload = decode_Payload(request)
	user_id = payload.get('user_id')
	if (not user_id):
		return HttpResponseNotFound(status=404)
	if (not User.objects.filter(id=user_id)):
		return HttpResponseNotFound(status=404)
	user = User.objects.get(id=user_id)
	if User.objects.filter(username=data.username).exists():
		return JsonResponse({'error': 'Conflict: Username already exists.'}, status=409)
	if (data.pseudo != ""):
		if User.objects.filter(pseudo=data.pseudo).exists():
			return JsonResponse({'error': 'Conflict: Pseudo already exists.'}, status=410)
	if User.objects.filter(email=data.email).exists():
		return JsonResponse({'error': 'Conflict: Email already exists.'}, status=411)
	if (user.user_is_in_game or user.user_is_looking_tournament or user.user_is_looking_game):
		return JsonResponse({'error': 'Can\'t change info while in game.'}, status=454)
	if (data.username):
		if not re.match(regexUsername, data.username):
			return JsonResponse({'error': 'Username not valid'}, status=452)
		user.username = data.username
	if (data.pseudo):
		if not re.match(regexPseudo, data.pseudo):
			return JsonResponse({'error': 'pseudo not valid'}, status=476)
		Match.update_match_usernames(user.pseudo, data.pseudo)
		user.pseudo = data.pseudo
	if (data.email):
		if not (re.match(regexEmail, data.email) and re.match(secRegexEmail, data.email)):
			return JsonResponse({'error': 'Email not valid'}, status=453)
		user.email = data.email
	if (data.password):
		if  not re.match(regexPwd, data.password):
			return JsonResponse({'error': "Special characters allowed : @$!%#?&"}, status=453)
		if (check_password(data.password, user.password)):
			return JsonResponse({'error': "Can't use the same password"}, status=457)
		user.password = make_password(data.password)
	user.save()
	print(user.password, user.pseudo)
	return HttpResponse(status=200)

def auth42(request):
	ip_value = os.getenv('IP')
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))

		url = "https://api.intra.42.fr/oauth/token"
		rdata = {
			"grant_type": "authorization_code",
			"client_id": os.getenv('CLIENT_ID'),
			"client_secret": os.getenv('CLIENT_SECRET'),
			"code": data.get('code'),
			"redirect_uri": f"https://{ip_value}:8000/home",
			"state": data.get('state')
		}

		# Get the access token to make request to 42 API
		response = requests.post(url, data=rdata)

		# Vérifiez si la requête a réussi
		if response.status_code == 200:
			print("Requête réussie")
		else:
			print("Erreur lors de la requête")
			return JsonResponse({'status': 'error', 'message': 'error'}, status=response.status_code)
		print("Token response content : ")
		print(response.content)
		response_data = json.loads(response.content.decode('utf-8'))
		access_token = response_data.get('access_token')
		authorization = "Bearer " + access_token
		url = "https://api.intra.42.fr/v2/me"
		headers = {
			"Authorization": authorization
		}
		response = requests.get(url, headers=headers)
		json_response = response.json()

		user_login = json_response.get('login')
		user_email = json_response.get('email')
		user_password = 'PWDauth42!' + user_login
		user_data = {
			"username": user_login + '@42',
			"email": user_email,
			"password": user_password
		}
		user_creation = create_user42(user_data)
		if (user_creation.get('status') == 'error'):
			return JsonResponse({'status': 'error', 'message': user_creation.get('message')}, status=401)
		if (user_creation.get('status') == 'exist'):
			return user_login42(request, user_data)
	else:
		# Return an error for an invalid request method.
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def create_user42(data):
	if User.objects.filter(username=data['username']).exists():
		return {'status': 'exist', 'message': "Username already exists."}
	if User.objects.filter(email=data['email']).exists():
		return {'status': 'exist', 'message': "Email already exists."}
	new_user = User(username=data['username'], email=data['email'], password=make_password(data['password']))
	new_user.logged_with_42 = True
	new_user.save()
	return {'status': 'exist', 'message': "User created"}

def user_login42(request, data):
	username = data['username']
	password = data['password']
	user = authenticate(username=username, password=password)
	if user is not None:
		login(request, user)
		# Generate JWT token, access and refresh
		refresh = RefreshToken.for_user(user)
		jwt_token = str(refresh.access_token)
		refresh_token = str(refresh)
		response = JsonResponse({
				'status': 'success',
				'message': 'Login successful',
				'token': jwt_token,
				'refresh_token': refresh_token
			})
		response.set_cookie('refresh_token',refresh_token)
		response.set_cookie('jwt_token', jwt_token)
		return response
	else:
		# Authentication failed. Return an error response.
		return JsonResponse({'status': 'error', 'message': 'Invalid login credentials'}, status=401)
