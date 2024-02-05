import re
import json
import requests
import os
import random
import string
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from dataclasses import dataclass
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import logout, authenticate, login
from django.contrib.sessions.models import Session
from rest_framework_simplejwt.tokens import RefreshToken


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
			login(request, user)
			# Generate JWT token, access and refresh
			refresh = RefreshToken.for_user(user)
			jwt_token = str(refresh.access_token)
			refresh_token = str(refresh)
			return JsonResponse({'status': 'success', 'message': 'Login successful', 'token': jwt_token, 'refresh_token': refresh_token})
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
        
        # print(request.PATCH.get('username'))
        return HttpResponse(status=200)

def auth42(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        print("code : " + data.get('code'))

        url = "https://api.intra.42.fr/oauth/token"
        data = {
            "grant_type": "authorization_code",
            "client_id": os.getenv('CLIENT_ID'),
            "client_secret": os.getenv('CLIENT_SECRET'),
            "code": data.get('code'),
            "redirect_uri": "https://localhost:8000/home",
            "state": data.get('state')
        }

        # Get the access token to make request to 42 API
        response = requests.post(url, data=data)

        # Vérifiez si la requête a réussi
        if response.status_code == 200:
            print("Requête réussie")
        else:
            print("Erreur lors de la requête")
            return JsonResponse({'status': 'error', 'message': 'error'}, status=response.status_code)
        print("Token response content : ")
        print(response.content)
        response_data = json.loads(response.content.decode('utf-8'))
        print("JSON response_data : ")
        print(response_data)
        # {
        #     'access_token': 'd5sg45g4s54g5sg', 
        #     'token_type': 'bearer', 
        #     'expires_in': 354, 
        #     'refresh_token': '84d4s5g454dg545g4', 
        #     'scope': 'public', 
        #     'created_at': 9921, 
        #     'secret_valid_until': 99845
        # }
        access_token = response_data.get('access_token')
        print("Access_token : ")
        print(access_token)
        authorization = "Bearer " + access_token
        # url = "https://api.intra.42.fr/oauth/token/info"
        url = "https://api.intra.42.fr/v2/me"
        headers = {
            "Authorization": authorization
        }

        # Get info about the user
        response = requests.get(url, headers=headers)

        # Conversion de la réponse en json
        json_response = response.json()

        # print("Réponse en JSON :", json_response)
        # {
        #     'id': 12345,
        #     'email': 'xxx@student.42lyon.fr',
        #     'login': 'xxx',
        #     'first_name': 'Xxx',
        #     'last_name': 'Xxx',
        #     'usual_full_name': 'Xxx Xxx',
        #     'usual_first_name': None,
        #     'url': 'https://api.intra.42.fr/v2/users/xxx',
        #     'phone': 'hidden',
        #     'displayname': 'Xxx Xxx',
        #     'kind': 'student',
        #     'image': {'link': 'https://cdn.intra.42.fr/users/f1d5f1d5f1gfhdfsh/xxx.jpg',
        #     'versions': {
        #     'large': 'https://cdn.intra.42.fr/users/848d4g8d4g8d48gsggrhgfhg/large_xxx.jpg',
        #     'medium': 'https://cdn.intra.42.fr/users/8d4g84dg84dg84dg84ftyh/medium_xxx.jpg',
        #     'small': 'https://cdn.intra.42.fr/users/8ds4g845fd46s5g4g5s4g6s/small_xxx.jpg',
        #     'micro': 'https://cdn.intra.42.fr/users/sd56g4564dsg54ds6g54sd5/micro_xxx.jpg'}}
        # }

        user_login = json_response.get('login')
        user_email = json_response.get('email')
        user_password = 'PWDauth42!' + user_login
        # if User.objects.filter(username=user_login).exists():
        #     user_password = User.objects.filter(username=user_login).password
        # else
            # genere une chaine aleatoire de 12 caracteres
            # user_password = 'pwdauth42' + ''.join(random.choices(string.ascii_lowercase, k=12)) + user_login
        user_data = {
            "username": user_login,
            "email": user_email,
            "password": user_password
        }
        print("YOOOOOOO")
        user_creation = create_user42(user_data)
        print("YAAAAAAA")
        print(user_creation)
        if (user_creation.get('status') == 'error'):
            return JsonResponse({'status': 'error', 'message': user_creation.get('message')}, status=401)
        if (user_creation.get('status') == 'exist'):
            return user_login42(request, user_data)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def create_user42(data):
    regexUsername = r'^[a-zA-Z0-9_-]+$'
    regexEmail = r'\A\S+@\S+\.\S+\Z'
    secRegexEmail = r'^[a-zA-Z0-9@.]+$'
    regexPwd = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$'
    if not re.match(regexUsername, data['username']):
        return {'status': 'error', 'message': 'Username not valid'}
    if not (re.match(regexEmail, data['email']) and re.match(secRegexEmail, data['email'])):
        return {'status': 'error', 'message': 'Email not valid'}
    if  not re.match(regexPwd, data['password']):
        return {'status': 'error', 'message': "Special characters allowed : @$!%#?&"}
    if User.objects.filter(username=data['username']).exists():
        return {'status': 'exist', 'message': "Username already exists."}
    if User.objects.filter(email=data['email']).exists():
        return {'status': 'exist', 'message': "Email already exists."}
    print("YELLOOOO")
    new_user = User(username=data['username'], email=data['email'], password=make_password(data['password']))
    new_user.save()
    return {'status': 'exist', 'message': "User created"}

def user_login42(request, data):
    username = data['username']
    password = data['password']
    regexUsername = r'^[a-zA-Z0-9_-]+$'
    if (not re.match(regexUsername, username)):
        return JsonResponse({'error': 'Username not valid'})
    user = authenticate(username=username, password=password)
    print("user is : ")
    print(user)
    if user is not None:
        login(request, user)
        # Generate JWT token, access and refresh
        refresh = RefreshToken.for_user(user)
        jwt_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return JsonResponse({'status': 'success', 'message': 'Login successful', 'token': jwt_token, 'refresh_token': refresh_token})
    else:
        # Authentication failed. Return an error response.
        return JsonResponse({'status': 'error', 'message': 'Invalid login credentials'}, status=401)
    
# def auth_42(request):
#     url = 'https://api.intra.42.fr/oauth/authorize'
#     params = {
#         'client_id': os.getenv('APP_INTRA_CLIENT_ID'),
#         'redirect_uri': 'https://localhost:8000/home',
#         'scope': 'public',
#         # ajouter state quand on fera la protection xss
#         'response_type': 'code',
#     }
#     response = requests.get(url, params=params)
#     print(response.status_code)     
#     return HttpResponse(status=200)#('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-e95dac742f419c01abf9f266b8219d8be7c13613ebcc4b3a64edc9e84beac84c&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome&response_type=code')  
