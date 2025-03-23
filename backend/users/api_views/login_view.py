from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
import jwt
import datetime
from django.conf import settings
import logging

from users.serializers.login_serializer import LoginSerializer

logger = logging.getLogger(__name__)

class LoginView(APIView):
    def post(self, request):
        try:
            logger.info(f"Received login request in users app: {request.data}")
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
                
                logger.info(f"Attempting to authenticate user with email: {email}")
                
                # First try with email as username
                user = authenticate(request, username=email, password=password)
                logger.info(f"Authentication with username=email result: {user}")
                
                # If that fails, try direct email authentication
                if user is None:
                    try:
                        from django.contrib.auth import get_user_model
                        User = get_user_model()
                        logger.info(f"Looking up user by email: {email}")
                        user_obj = User.objects.filter(email=email).first()
                        
                        if user_obj:
                            logger.info(f"Found user with email {email}, username: {user_obj.username}")
                            user = authenticate(request, username=user_obj.username, password=password)
                            logger.info(f"Authentication with username result: {user}")
                        else:
                            logger.warning(f"No user found with email: {email}")
                    except Exception as e:
                        logger.error(f"Error looking up user: {str(e)}")
                        user = None
                
                if user is not None:
                    # Log in user for session authentication
                    login(request, user)
                    logger.info(f"User logged in successfully: {user.email}")
                    
                    # Generate JWT token
                    payload = {
                        'user_id': user.id,
                        'email': user.email,
                        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
                    }
                    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                    
                    logger.info(f"Generated JWT token for user: {user.email}")
                    return Response({
                        "token": token,
                        "user": {
                            "id": user.id,
                            "email": user.email,
                            "fullName": user.first_name
                        }
                    }, status=status.HTTP_200_OK)
                
                logger.warning(f"Invalid login attempt in users app for email: {email}")
                return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                logger.warning(f"Invalid serializer data: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in users app login: {str(e)}")
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

