from django.core import serializers
from .models import User
from django.http import JsonResponse
import json
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

def user(request):
    data = serializers.serialize("json",User.objects.all())
    return JsonResponse(json.loads(data), safe=False)

@csrf_exempt
def register(request):
    csrf_token_from_request = request.headers.get('X-CSRFToken')
    # csrf_token_from_session = get_token(request)
    return JsonResponse({'token i send': csrf_token_from_request})