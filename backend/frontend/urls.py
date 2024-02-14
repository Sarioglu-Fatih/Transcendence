from django.urls import path, re_path
from django.shortcuts import redirect
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('home', views.renderMainPage),
    path('login', views.renderMainPage),
    path('profil/<str:user_profil>/', views.renderProfilPage),
    re_path(r'^.*$', lambda request: redirect('/login')),
]