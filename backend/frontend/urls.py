from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path, re_path
from django.shortcuts import redirect


urlpatterns = [
    path('', views.renderMainPage),
    path('home', views.renderMainPage),
    path('login', views.renderMainPage),
    path('profil/<str:user_profil>/', views.renderProfilPage),
     re_path(r'^(?!api/|home$|login$|profil/).*$', lambda request: redirect('/login')),
]