from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from .utils import decode_Payload
from api.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import base64


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
	if request.method == 'GET':
		payload = decode_Payload(request)
		user_id = payload.get('user_id')
		if user_id:
			user = User.objects.get(id=user_id)
			data = {
				'User_ID': user_id,
				'username': user.username,
				'pseudo': user.pseudo,
				'email': user.email,
				'win': user.win,
				'lose': user.lose,
			}
			return JsonResponse(data, safe=False)
		return HttpResponseNotFound(status=404)
	else:
		return HttpResponseNotFound(status=404)
  
@login_required
def add_friend_request(request, userToAddId):
	# Get the two user
	currentUser = request.user
	userToAdd = get_object_or_404(User, id=userToAddId)
	# Add the userToAdd to the friendlist if is not already in
	if userToAdd not in  currentUser.friendlist.all():
		currentUser.friendlist.add(userToAdd)
		currentUser.save()
		return HttpResponse("Friend added to the friendlist", status=200)
	else:
		return HttpResponse("Friend is already in the friendlist", status=400)
