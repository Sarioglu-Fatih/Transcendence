from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('', views.renderMainPage),
    path('home', views.renderMainPage),
    path('login', views.renderMainPage),
    path('profil/<str:user_profil>/', views.renderProfilPage),

]