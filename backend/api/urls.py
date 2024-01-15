from django.urls import path, include
from .models import User
from . import views

urlpatterns = [
    path('avatar', views.avatar), # GET API
    path('profil', views.get_user),
    path('register', views.create_user),
    path('login', views.user_login),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token'),
]
