from django.urls import path
from django.contrib.auth import views as auth_views
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from . import views
from .api_views import RegisterView, LoginView, LogoutView

urlpatterns = [
    # API endpoints
    path('api/register/', RegisterView.as_view(), name='api_register'),
    path('api/login/', LoginView.as_view(), name='api_login'),
    path('api/logout/', LogoutView.as_view(), name='api_logout'),
    path('health/', csrf_exempt(lambda request: JsonResponse({"status": "Server is running"}, status=200)), name='health_check'),
]