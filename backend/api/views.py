from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from .utils import decode_Payload
from api.models import User
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User
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
def get_user(request, user_profil):
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
def add_friend_request(request, userToAddName):
    # Get the two user
    currentUser = request.user
    userToAdd = get_object_or_404(User, username=userToAddName)
    # Add the userToAdd to the friendlist if is not already in
    if userToAdd not in  currentUser.friendlist.all():
        currentUser.friendlist.add(userToAdd)
        currentUser.save()
        return HttpResponse("Friend added to the friendlist", status=200)
    else:
        return HttpResponse("Friend is already in the friendlist", status=400)

@login_required
def my_friends(request):
    user = request.user
    friend_list = list(user.friendlist.values('username'))
    return JsonResponse({'friend_list': friend_list})

def isFriend(request, userToAddName):
    if not request.method == 'GET':
        return HttpResponseNotFound(status=404)
    payload = decode_Payload(request)
    user_id = payload.get('user_id')
    if (not user_id):
        return HttpResponseNotFound(status=404)    
    currentUser = request.user
    userToAdd = get_object_or_404(User, username=userToAddName)
    is_friend = userToAdd in currentUser.friendlist.all()
    if (is_friend):
        return HttpResponseNotFound(status=200)
    return HttpResponseNotFound(status=400)

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