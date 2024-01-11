from django.urls import path, include
from .models import User
from . import views

urlpatterns = [
    path('user', views.user), # GET API
    path('register',views.register), #POST API
]