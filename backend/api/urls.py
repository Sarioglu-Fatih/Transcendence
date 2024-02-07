from django.urls import path
from . import views
from . import register_login
from . import two_fa
from . import utils
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('avatar', views.avatar), # GET API
    path('profil/<str:user_profil>/', views.get_user),
    path('register', register_login.create_user),
    path('login', register_login.user_login),
    path('get_csrf_token/', utils.get_csrf_token, name='get_csrf_token'),
    path('logout/', register_login.user_logout),
    path('add_friend/<int:userToAddId>/', views.add_friend_request),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('upload_avatar/', views.upload_avatar, name='upload_avatar'),
    path('username', views.username),
    path('enable_2fa', two_fa.enable2fa),
    path('disable_2fa', two_fa.disable2fa),
    path('get_2fa_status', two_fa.get_2fa_status),
]
