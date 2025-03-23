from rest_framework import status
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle

from chatbot.helpers.load_data import load_data


class LoadDataView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    throttle_classes = [UserRateThrottle]

    def post(self, request, format=None):
        try:
            load_data()
            return Response({'response': "Data loaded!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'response': str(e)}, status=status.HTTP_404_NOT_FOUND)
