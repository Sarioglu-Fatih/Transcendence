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
def enable2fa(request):
	try:
		user = request.user
		print("c mon user dans le back:", user.username)
		# Check if the user already has a TOTP device enabled
		if not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
			totp_device = TOTPDevice.objects.create(user=user)
			totp_device.save()
			# Get the TOTPDevice instance associated with the user
			otpauth_url = totp_device.config_url
			
			return JsonResponse({'success': True, 'otpauth_url': otpauth_url}, status=200)
		else:
			return JsonResponse({'success': False, 'error': 'TOTP device already enabled'}, status=400)
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable2fa(request):
	user = request.user
	try:
		totp_device = TOTPDevice.objects.get(user=user, confirmed=True)
		totp_device.delete()
		return JsonResponse({'success': True, 'message': '2FA disabled successfully'}, status=200)
	except TOTPDevice.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'TOTP device not found'}, status=404)
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=500)