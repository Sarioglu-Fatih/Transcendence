from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path, re_path
from django.shortcuts import redirect
from django.conf import settings
import jwt


def decode_Payload(request):
	# Decode the JWT token to get the payload
	jwt_token = request.COOKIES.get('jwt_token')
	if (not jwt_token):
		return
	decoded_payload = jwt.decode(jwt_token, key=settings.SECRET_KEY, algorithms=['HS256'])
	print("PAYLOAD DECODED : ", decoded_payload)
	return (decoded_payload)

def custom_redirect(request):
	payload = decode_Payload(request)
	if not payload:
		return redirect('/login') 
	user_id = payload.get('user_id')
	if not user_id:
		return redirect('/login')
	return redirect('/home')

urlpatterns = [
	path('home', views.renderMainPage),
	path('login', views.renderMainPage),
	path('profil/<str:user_profil>/', views.renderProfilPage),
	re_path(r'^(?!api/|home$|login$|profil/).*$', custom_redirect),
]