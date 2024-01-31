from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from .utils import decode_Payload
from api.models import User, AvatarUploadForm
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import base64


def avatar(request):
    if request.method == 'GET':
        payload = decode_Payload(request)
        user_id = payload.get('user_id')
        if user_id:
            print('avatar')
            user = User.objects.get(id=user_id)
            avatar_data = None

            if user.avatar:
                with open(user.avatar.path, 'rb') as avatar_file:
                    avatar_data = base64.b64encode(avatar_file.read()).decode('utf-8')

            return JsonResponse({'avatar': avatar_data})
		
@login_required	
def upload_avatar(request):
	if request.method == 'POST':
		form = AvatarUploadForm(request.POST, request.FILES, instance=request.user)
		if form.is_valid() and request.user == form.instance:
			form.save()
			return JsonResponse({'message': 'Avatar uploaded successfully'})
	return JsonResponse({'error': 'Invalid form submission'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
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