from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.shortcuts import render

from .controllers.chat_view_controller import chat_view_controller
from .helpers.load_data import load_data
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

@login_required
@csrf_protect
def chat_view(request):
    return render(request, 'chatbot/chat.html')

class PingView(APIView):
    def get(self, request):
        return Response({"message": "pong"}, status=200)

class LoginView(APIView):
    def post(self, request):
        # Your login logic here
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)


