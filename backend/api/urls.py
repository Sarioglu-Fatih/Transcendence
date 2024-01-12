from django.urls import path, include
from .models import Profile
from . import views

urlpatterns = [
    path('avatar', views.avatar), # GET API
    path('user', views.user),
]