from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication
from rest_framework.throttling import UserRateThrottle
from rest_framework import status
import datetime
import logging

from chatbot.serializers.chat_serializer import ChatSerializer
from chatbot.utils import process_query
from chatbot.helpers.get_llm_model import get_llm_model

# Set up logger
logger = logging.getLogger(__name__)

class ChatAPIView(APIView):
    # For testing, we'll temporarily allow all access
    # Once authentication is confirmed working, restore the permission_classes and authentication_classes
    permission_classes = [AllowAny]  # Temporarily use AllowAny instead of IsAuthenticated
    authentication_classes = [TokenAuthentication, SessionAuthentication, BasicAuthentication]
    throttle_classes = [UserRateThrottle]

    def post(self, request, format=None):
        # Log request info for debugging
        auth_header = request.META.get('HTTP_AUTHORIZATION', None)
        logger.info(f"Received chat request. Auth header exists: {auth_header is not None}")
        if auth_header:
            # Don't log the full token, just the type and first few chars
            logger.info(f"Auth type: {auth_header.split(' ')[0] if ' ' in auth_header else 'Unknown'}")
        
        # Log user authentication status
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        
        serializer = ChatSerializer(data=request.data)
        if serializer.is_valid():
            user_query = serializer.validated_data['message']
            ip_address = request.META.get("REMOTE_ADDR")
            logger.info(f"Processing query from {ip_address}: {user_query[:50]}...")
            
            try:
                # Process the query using our utility function
                response_text = process_query(user_query)
                logger.info("Query processed successfully")
                
                # Return a structured response
                return Response({
                    'response': response_text,
                    'timestamp': datetime.datetime.now().isoformat(),
                    'status': 'success'
                })
            except Exception as e:
                logger.error(f"Error processing query: {str(e)}")
                return Response({
                    'response': "I'm sorry, I encountered an error while processing your request.",
                    'timestamp': datetime.datetime.now().isoformat(),
                    'status': 'error',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.warning(f"Invalid request data: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
