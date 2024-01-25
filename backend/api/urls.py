from django.urls import path, include
from .models import User
from . import views
from . import register_login
from . import utils

urlpatterns = [
    path('avatar', views.avatar), # GET API
    path('profil', views.get_user),
    path('register', register_login.create_user),
    path('login', register_login.user_login),
    path('get_csrf_token/', utils.get_csrf_token, name='get_csrf_token'),
]
