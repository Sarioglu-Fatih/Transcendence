import re
import json
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from dataclasses import dataclass
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import logout, authenticate, login
from django.contrib.sessions.models import Session
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

@dataclass
class registerPostParameters():
	username: str
	email: str
	password: str


def create_user(request):
	if request.method == 'POST':
		try:
			data = registerPostParameters(**json.loads(request.body))
		except Exception  as e:
			return HttpResponse(status=400, reason="Bad request: " + str(e))
		regexUsername = r'^[a-zA-Z0-9_-]+$'																# register page parsing
		regexEmail = r'\A\S+@\S+\.\S+\Z'
		secRegexEmail = r'^[a-zA-Z0-9@.]+$'
		regexPwd = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$'
		if not re.match(regexUsername, data.username):
			return JsonResponse({'error': 'Username not valide'})
		if not (re.match(regexEmail, data.email) and re.match(secRegexEmail, data.email)):
			return JsonResponse({'error': 'Email not valide'})
		if  not re.match(regexPwd, data.password):
			return JsonResponse({'error': "Special characters allowed : @$!%#?&"})
		if User.objects.filter(username=data.username).exists():
			return HttpResponse(reason="Conflict: Username already exists.", status=409)
		if User.objects.filter(email=data.email).exists():
			return HttpResponse(reason="Conflict: Email already exists.", status=409)
		new_user = User(username=data.username, email=data.email, password=make_password(data.password))
		new_user.save()
		return HttpResponse(status=200)
	else:
		return HttpResponseNotFound(status=404)


def user_login(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		username = data.get('username')
		password = data.get('password')
		regexUsername = r'^[a-zA-Z0-9_-]+$'																# login page parsing
		if (not re.match(regexUsername, username)):
			return JsonResponse({'error': 'Username not valide'})
		user = authenticate(request, username=username, password=password)
		if user is not None:
			if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
				# Extract the TOTP token from the request
				token = data.get('token')
				if verify_totp(user, token):
					# TOTP is valid, proceed with login
					login(request, user)
					# Generate JWT token, access, and refresh
					refresh = RefreshToken.for_user(user)
					jwt_token = str(refresh.access_token)
					refresh_token = str(refresh)
					return JsonResponse({'status': 'success', 'message': 'Login successful', 'token': jwt_token, 'refresh_token': refresh_token})
				else:
					# TOTP is invalid, show an error message
					return JsonResponse({'status': 'error', 'message': 'Invalid TOTP token'}, status=401)
			else:
				# If 2FA is not enabled, proceed with login and generate JWT token
				login(request, user)
				refresh = RefreshToken.for_user(user)
				jwt_token = str(refresh.access_token)
				refresh_token = str(refresh)
				return JsonResponse({'status': 'success', 'message': 'Login successful', 'token': jwt_token, 'refresh_token': refresh_token})
		else:
			# Authentication failed. Return an error response.
			return JsonResponse({'status': 'error', 'message': 'Invalid login credentials'}, status=401)
	else:
		# Return an error for an invalid request method.
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


def user_login2fa(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		username = data.get('username')
		password = data.get('password')
		regexUsername = r'^[a-zA-Z0-9_-]+$'																# login page parsing
		if (not re.match(regexUsername, username)):
			return JsonResponse({'error': 'Username not valide'})
		user = authenticate(request, username=username, password=password)
		if user is not None:
			if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
				# Extract the TOTP token from the request
				token = data.get('token')
				if verify_totp(user, token):
					# TOTP is valid, proceed with login
					login(request, user)
					# Generate JWT token, access, and refresh
					refresh = RefreshToken.for_user(user)
					jwt_token = str(refresh.access_token)
					refresh_token = str(refresh)
					return JsonResponse({'status': 'success', 'message': 'Login successful', 'token': jwt_token, 'refresh_token': refresh_token})
				else:
					# TOTP is invalid, show an error message
					return JsonResponse({'status': 'error', 'message': 'Invalid TOTP token'}, status=401)
			else:
				# If 2FA is not enabled, proceed with login and generate JWT token
				login(request, user)
				refresh = RefreshToken.for_user(user)
				jwt_token = str(refresh.access_token)
				refresh_token = str(refresh)
				return JsonResponse({'status': 'success', 'message': 'Login successful', 'token': jwt_token, 'refresh_token': refresh_token})
		else:
			# Authentication failed. Return an error response.
			return JsonResponse({'status': 'error', 'message': 'Invalid login credentials'}, status=401)
	else:
		# Return an error for an invalid request method.
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
def user_logout(request):

	logout(request)
	Session.objects.filter(session_key=request.session.session_key).delete()
	return JsonResponse({'status': 'success', 'message': 'User logged out'})


def updateUser(request):
	if request.method == 'PATCH':
		try:
			 data = registerPostParameters(**json.loads(request.body))
		except Exception  as e:
			return HttpResponse(status=400, reason="Bad request: " + str(e))
		
		regexUsername = r'^[a-zA-Z0-9_-]+$'																# register page parsing
		regexEmail = r'\A\S+@\S+\.\S+\Z'
		secRegexEmail = r'^[a-zA-Z0-9@.]+$'
		regexPwd = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$'

		user = request.user
		if User.objects.filter(username=data.username).exists():
			return HttpResponse(reason="Conflict: Username already exists.", status=409)
		if User.objects.filter(email=data.email).exists():
			return HttpResponse(reason="Conflict: Email already exists.", status=409)
		if (data.username):
			if not re.match(regexUsername, user.username):
				return JsonResponse({'error': 'Username not valide'})
			user.username = data.username
		if (data.email):
			if not (re.match(regexEmail, user.email) and re.match(secRegexEmail, user.email)):
				return JsonResponse({'error': 'Email not valide'})
			user.email = data.email
		if (data.password):
			if  not re.match(regexPwd, data.password):
				return JsonResponse({'error': "Special characters allowed : @$!%#?&"})
			user.password = make_password(data.password)
		user.save()
		return HttpResponse(status=200)
	
def verify_totp(user, token):
	try:
		totp_device = TOTPDevice.objects.get(user=user, confirmed=True)
	except TOTPDevice.DoesNotExist:
		# Handle the case where the TOTP device doesn't exist
		print("111111111")
		return False

	if token is None:
		# Handle the case where the token is None (possibly not provided in the request)
		print("222222222")
		return False

	totp = pyotp.TOTP(totp_device.bin_key)
	return totp.verify(token.encode('utf-8'))
