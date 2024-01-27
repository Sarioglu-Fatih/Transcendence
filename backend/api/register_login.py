import json
from django.http import HttpResponse, HttpResponseNotFound
from django.http import JsonResponse
from dataclasses import dataclass
from .models import User
from .utils import generate_jwt
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import logout, authenticate, login
from django.contrib.sessions.models import Session


@dataclass
class registerPostParameters():
	username: str
	mail: str
	password: str


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


def user_login(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		username = data.get('username')
		password = data.get('password')
		print(User.objects.filter(username=username).exists())
		user1 = User.objects.get(username=username)
		if check_password(password, user1.password):
			print("OUI")
		else:
			print("NON")
		if user1.is_active:
			print("OUI1")
		else:
			print("NON1")
		user = authenticate(request, username=username, password=password)
		print(user)
		if user is not None:
			login(request, user)
			# Now the user is logged in. You can return a success response.
			return JsonResponse({'status': 'success', 'message': 'Login successful'})
		else:
			# Authentication failed. Return an error response.
			return JsonResponse({'status': 'error', 'message': 'Invalid login credentials'}, status=401)
	else:
		# Return an error for invalid request method.
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
	
def user_logout(request):

	logout(request)
	Session.objects.filter(session_key=request.session.session_key).delete()
	return JsonResponse({'status': 'success', 'message': 'User logged out'})
