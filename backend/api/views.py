from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from .utils import decode_Payload
from api.models import User, AvatarUploadForm
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import base64, os
from django.conf import settings

def avatar(request):
    if request.method == 'GET':
        payload = decode_Payload(request)
        user_id = payload.get('user_id')
        
        if user_id:
            user = get_object_or_404(User, id=user_id)
            avatar_data = None

            if user.avatar and os.path.exists(user.avatar.path):
                with open(user.avatar.path, 'rb') as avatar_file:
                    avatar_data = base64.b64encode(avatar_file.read()).decode('utf-8')
            else:
                # set the default avatar
                print("KKKKKK")
                default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'avatars', 'default_avatar.png')
                with open(default_avatar_path, 'rb') as f:
                    avatar_data = base64.b64encode(f.read()).decode('utf-8')

            return JsonResponse({'avatar': avatar_data})
        else:
            return JsonResponse({'error': 'User ID not provided'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

		
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
def get_user(request, user_profil):
	print(user_profil)
	if request.method == 'GET':
		payload = decode_Payload(request)
		user_id = payload.get('user_id')
		if user_id:
			user_we_want_to_see = User.objects.get(username=user_profil)
			if (not user_we_want_to_see):
				return HttpResponseNotFound(status=404)
			if (user_we_want_to_see.id == user_id):
				user = User.objects.get(id=user_id)
				data = {
					'User_ID': user_id,
					'username': user.username,
					'pseudo': user.pseudo,
					'email': user.email,
					'win': user.win,
					'lose': user.lose,
				}
			else:
				print("ici")
				user = user_we_want_to_see
				data = {
					'username': user.username,
					'pseudo': user.pseudo,
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

@login_required
@permission_classes([IsAuthenticated])
def username(request):
	if not request.method == 'GET':
		return HttpResponseNotFound(status=404)
	payload = decode_Payload(request)
	user_id = payload.get('user_id')
	if (not user_id):
		return HttpResponseNotFound(status=404)
	user = User.objects.get(id=user_id)
	if (not user):
		return HttpResponseNotFound(status=404)
	data = {
		'username': user.username,
	}
	print(data)
	return JsonResponse(data, safe=False)