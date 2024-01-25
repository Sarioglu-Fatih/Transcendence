from django.urls import path, include
from . import views


urlpatterns = [
    path('', views.renderMainPage),
    path('home', views.renderMainPage),
    path('login', views.renderMainPage),
    path('profil', views.renderMainPage)
]