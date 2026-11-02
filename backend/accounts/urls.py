from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CurrentUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('user/', CurrentUserView.as_view(), name='auth_user'),
]

