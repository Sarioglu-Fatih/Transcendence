from django.urls import path
from . import views
from . import register_login
from . import utils
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('avatar', views.avatar), # GET API
    path('profil', views.get_user),
    path('register', register_login.create_user),
    path('login', register_login.user_login),
    path('get_csrf_token/', utils.get_csrf_token, name='get_csrf_token'),
    path('logout/', register_login.user_logout),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
