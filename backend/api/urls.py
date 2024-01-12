from django.urls import path, include
from .models import Profile
from . import views

urlpatterns = [
    path('user', views.user),
]