import json

from django.core import serializers
from django.http import JsonResponse
# from django.contrib.auth import _
from django.http import HttpResponse, HttpResponseNotFound
from dataclasses import dataclass
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .models import Profile

@dataclass
class registerPostParameters():
	username: str
	mail: str
	password: str

@csrf_exempt
def user(request):
	if request.method == 'POST':
		return create_user(request)
	elif request.method == 'GET':
		return get_user(request)
	else:
		return HttpResponseNotFound(status=404)

def get_user(request):
	if User.objects.filter(username='toto').exists():
		user = User.objects.get(username='toto')
		data = {
			'username': user.username,
			'mail': user.email
		}
		return JsonResponse(data, safe=False)
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