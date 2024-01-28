from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseNotFound
from .utils import decode_Payload
from api.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
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

