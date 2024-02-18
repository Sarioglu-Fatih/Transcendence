import json
import base64
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django_otp.plugins.otp_totp.models import TOTPDevice
from .models import User
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import pyotp
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import logout, authenticate, login
from dataclasses import dataclass

@dataclass
class registerPostParameters():
	token : str
	username: str

@permission_classes([IsAuthenticated])
def enable2fa(request):
	try:
		user = request.user
		data = json.loads(request.body)
		token = data.get('token')
		# # Check if the user already has a TOTP device enabled
		# if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
		# 	return JsonResponse({'success': False, 'error': 'TOTP device already enabled'}, status=400)
		if not token and not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
			totp_device = TOTPDevice.objects.create(user=user)
			totp_device.save()
			otpauth_url = totp_device.config_url
			user.qrcode = otpauth_url
			user.save()
			return JsonResponse({'success': True, 'two_factor_confirmation': True, 'qrcode': user.qrcode}, status=200)
		print("11111111111111111111111")
		print(token)
		# Verify TOTP token
		if not verify_totp(user, token):
			return JsonResponse({'success': False, 'error': 'Invalid TOTP token'}, status=452)
		print("22222222222222222222222")
		user.status_2fa = True
		user.save()
		return JsonResponse({'success': True, 'qrcode': user.qrcode}, status=200)
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=400)

@permission_classes([IsAuthenticated])
def disable2fa(request):
	user = request.user
	try:
		totp_device = TOTPDevice.objects.get(user=user, confirmed=True)
		totp_device.delete()
		user.status_2fa = False
		user.save()
		return JsonResponse({'success': True, 'message': '2FA disabled successfully'}, status=200)
	except TOTPDevice.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'TOTP device not found'}, status=404)
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=400)

@permission_classes([IsAuthenticated])
def get_2fa_status(request):
	try:
		user = request.user
		if (user.status_2fa == True):
			print("========================")
			return JsonResponse({
				'two_factor_enabled': True,
				'qrcode': user.qrcode
				}, status=200)
		else:
			return JsonResponse({'two_factor_enabled': False}, status=270)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=486)

@permission_classes([IsAuthenticated])
def check_totp(request):
	try:
		data = registerPostParameters(**json.loads(request.body))
	except Exception  as e:
		return HttpResponse(status=400, reason="Bad request: " + str(e))
	if not User.objects.filter(username=data.username).exists:
		return HttpResponseNotFound(status=404)
	user = User.objects.get(username=data.username)
	token = data.token
	if not verify_totp(user, token):
		return JsonResponse({'status': 'error', 'message': 'Invalid TOTP token'}, status=401)
	# TOTP is valid, proceed with login
	login(request, user)
	# Generate JWT token, access, and refresh
	refresh = RefreshToken.for_user(user)
	jwt_token = str(refresh.access_token)
	refresh_token = str(refresh)
	# Set JWT token in a cookie
	response = JsonResponse({
		'status': 'success',
		'message': 'Login successful',
		'token': jwt_token,
		'refresh_token': refresh_token
	})
	response.set_cookie('refresh_token',refresh_token)
	response.set_cookie('jwt_token', jwt_token)
	return response


def verify_totp(user, token):
	try:
		totp_device = TOTPDevice.objects.get(user=user, confirmed=True)
	except TOTPDevice.DoesNotExist:
		return False

	if token is None:
		return False
	
	secret_key = totp_device.key
	base16_secret_key = secret_key
	secret_bytes = bytes.fromhex(base16_secret_key)
	base32_secret_key = base64.b32encode(secret_bytes).decode()
	totp = pyotp.TOTP(base32_secret_key)

	if (totp.verify(token)):
		return True
	else:
		return False
