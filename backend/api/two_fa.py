import json
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django_otp.plugins.otp_totp.models import TOTPDevice
from .models import User
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import pyotp

@login_required
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable2fa(request):
	user = request.user
	totp_device = user.enable_2faA()

@login_required
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable2fa(request):
	user = request.user
	

def verify_totp(user, token):
	try:
		totp_device = TOTPDevice.objects.get(user=user, confirmed=True)
	except TOTPDevice.DoesNotExist:
		# Handle the case where the TOTP device doesn't exist
		print("111111111")
		return False

	if token is None:
		# Handle the case where the token is None (possibly not provided in the request)
		print("222222222")
		return False

	totp = pyotp.TOTP(totp_device.bin_key)
	return totp.verify(token.encode('utf-8'))