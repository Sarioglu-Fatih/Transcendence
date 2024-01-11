from django.core import serializers
from .models import User
from django.http import JsonResponse
import json
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from .models import User

def user(request):
    data = serializers.serialize("json",User.objects.all())
    return JsonResponse(json.loads(data), safe=False)

@csrf_exempt
def register(request):
    # csrf_token_from_request = request.headers.get('X-CSRFToken')
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data[0]
            mail = data[1]
            password = data[2]
            if User.objects.filter(username=username).exists():
                return JsonResponse({'message': 'username already in use'})
            if User.objects.filter(mail=mail).exists():
                return JsonResponse({'message': 'email already in use'})
            new_user = User(username=username, mail=mail, password=password)
            new_user.save()
            return JsonResponse({'message': 'user created succesfuly'})
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except IndexError as e:
            return JsonResponse({'error': 'Invalid data format: Missing required fields'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)