from django.urls import path, include
from .models import User
from .views import user

urlpatterns = [
    path('user', user), # GET API
]