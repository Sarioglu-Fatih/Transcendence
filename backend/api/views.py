from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from .utils import decode_Payload
import base64
from .models import User
from django.shortcuts import render

def avatar(request):
	if request.method == 'GET':
		payload = decode_Payload(request)
		print(payload)
		user_id = payload.get('user_id')
		if user_id:
			print('avatar')
			user = User.objects.get(id=user_id)
			encoded_avatar = base64.b64encode(user.get_avatar()).decode('utf-8')
			return JsonResponse({'avatar': encoded_avatar})

def get_user(request):
	if request.method == 'GET':
		payload = decode_Payload(request)
		user_id = payload.get('user_id')
		if user_id:
			user = User.objects.get(id=user_id)
			data = {
				'username': user.username,
				'email': user.email
			}
			return JsonResponse(data, safe=False)
		return HttpResponseNotFound(status=404)
	else:
		return HttpResponseNotFound(status=404)


