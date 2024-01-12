import json
from django.core import serializers
# from django.contrib.auth import _
from django.http import HttpResponse, HttpResponseNotFound
from dataclasses import dataclass
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import base64

from .models import Profile

@dataclass
class registerPostParameters():
	username: str
	mail: str
	password: str

def avatar(request):
    avatar_data = User.objects.get(username='louis').get_avatar()
    encoded_avatar = base64.b64encode(avatar_data).decode('utf-8')
    return JsonResponse({'avatar': encoded_avatar})

@csrf_exempt
def user(request):
	if request.method == 'POST':
		return create_user(request)
	elif request.method == 'GET':
		return get_user(request)
	else:
		return HttpResponseNotFound(status=404)

def get_user(request):
	profiles = Profile.objects.all()
	for profile in profiles:
		if profile.user.username == 'toto':
			return HttpResponse(profile.response_profile(), status=200)
	return HttpResponseNotFound(status=404)

def create_user(request):
	try:
		data = registerPostParameters(**json.loads(request.body))
	except Exception  as e:
		return HttpResponse(status=400, reason="Bad request: " + str(e))
	if User.objects.filter(username=data.username).exists():
		return HttpResponse(reason="Conflict: Username already exists.", status=409)
	if Profile.objects.filter(mail=data.mail).exists():
		return HttpResponse(reason="Conflict: Email already exists.", status=409)
	django_user = User(username=data.username, password=data.password)
	django_user.save()
	new_user = Profile(user=django_user, mail=data.mail)
	new_user.save()
	return HttpResponse(status=200)