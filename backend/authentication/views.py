from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()  # This will get your CustomUser model

# Create your views here.

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info(f"Received signup request with data: {request.data}")
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                logger.info(f"Validated data: {data}")
                user = User.objects.create_user(
                    username=data['email'],
                    email=data['email'],
                    password=data['password'],
                    first_name=data['fullName']
                )
                logger.info(f"User created successfully: {user.email}")
                return Response({
                    'message': 'User created successfully',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error creating user: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
