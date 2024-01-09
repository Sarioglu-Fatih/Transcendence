from django.core import serializers
from .models import User
from django.http import JsonResponse
import json

# Create your views here.

def user(request):
    data = serializers.serialize("json",User.objects.all())
    return JsonResponse(json.loads(data), safe=False)