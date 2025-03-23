from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
import jwt
import datetime
from django.conf import settings
import logging
import pyodbc  # For Azure SQL connection
import json
from django.http import JsonResponse, HttpResponse
import sys
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import permission_classes, api_view
import os
import traceback
from datetime import datetime, date, time

logger = logging.getLogger(__name__)
User = get_user_model()  # This will get your CustomUser model

def normalize_business_type(title):
    """Convert display titles to database business types"""
    # Special cases for titles that don't match database values
    special_cases = {
        "farms-ranches": "Farm / Ranch",
        "fiber-mills": "Fiber Mill",
        "farmers-markets": "Farmers Market",
        "food-hubs": "Food Hub",
        "grocery-stores": "Grocery Store",
        "manufacturers": "Manufacturer", 
        "marinas": "Marina",
        "restaurants": "Restaurant",
        "retailers": "Retailer",
        "service-providers": "Service Provider",
        "universities": "University",
        "veterinarians": "Veterinarian",
        "wineries": "Winery"
    }
    
    # Check if we have a special case
    if title in special_cases:
        return special_cases[title]
    
    # Convert hyphenated names to spaces and capitalize first letter of each word
    formatted_title = title.replace('-', ' ').title()
    
    # Handle plurals by removing trailing 's'
    if formatted_title.endswith('s') and not formatted_title.endswith('ss'):
        singular = formatted_title[:-1]
        return singular
    
    # Return the formatted title
    return formatted_title

class SignupView(APIView):
    permission_classes = [AllowAny]

    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def post(self, request):
        try:
            logger.info(f"Received signup request: {request.data}")
            data = request.data
            if not all([data.get('fullName'), data.get('email'), data.get('password')]):
                return Response(
                    {'message': 'Please provide all required fields'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'message': 'User with this email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create user with username derived from email
            user = User.objects.create_user(
                username=data['email'],  # Use email as username
                email=data['email'],
                password=data['password'],
                first_name=data['fullName']
            )

            # Generate JWT token manually
            payload = {
                'user_id': user.id,
                'email': user.email,
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

            logger.info(f"User created successfully: {user.email}")
            return Response({
                'message': 'User created successfully',
                'token': token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'fullName': user.first_name
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error in signup: {str(e)}")
            return Response(
                {'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def post(self, request):
        try:
            logger.info(f"Received login request: {request.data}")
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                return Response(
                    {'message': 'Email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Try to authenticate with email as username (since USERNAME_FIELD is 'email')
            user = authenticate(username=email, password=password)
            
            # If that fails, try direct email authentication
            if user is None:
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            if user is not None:
                # Log the user in for session-based auth
                login(request, user)
                
                # Generate JWT token manually
                payload = {
                    'user_id': user.id,
                    'email': user.email,
                    'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                
                logger.info(f"User logged in successfully: {user.email}")
                return Response({
                    'token': token,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'fullName': user.first_name
                    }
                })
            else:
                logger.warning(f"Invalid login attempt for email: {email}")
                return Response(
                    {'message': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            logger.error(f"Error in login: {str(e)}")
            return Response(
                {'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'fullName': user.first_name
        })

class DirectoryBusinessesView(APIView):
    """
    API endpoint to get businesses from the directory. This endpoint is publicly accessible.
    """
    permission_classes = [AllowAny]

    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests for CORS"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get(self, request):
        logger.info("DirectoryBusinessesView.get called")
        try:
            # Get parameters with support for multiple formats
            business_type = request.GET.get('BusinessType') or request.GET.get('business_type') or request.GET.get('type')
            country_name = request.GET.get('country_name') or request.GET.get('countryName') or request.GET.get('country')
            state_name = request.GET.get('state_name') or request.GET.get('stateName') or request.GET.get('state')
            
            logger.info(f"Fetching businesses with params: business_type={business_type}, country_name={country_name}, state_name={state_name}")
            
            # Connect to Azure SQL database
            connection_string = os.environ.get('AZURE_SQL_CONNECTION_STRING')
            if not connection_string:
                # Fallback connection string if environment variable not set
                connection_string = "Driver={ODBC Driver 17 for SQL Server};Server=tcp:oatmealai.database.windows.net,1433;Database=BusinessDirectory;Uid=oatmealadmin;Pwd=Password@1;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
            
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()
            
            # Build the SQL query dynamically
            query = "SELECT * FROM dir_con_table"
            conditions = []
            params = []
            
            if business_type:
                conditions.append("BusinessType = ?")
                params.append(business_type)
                
            if country_name:
                conditions.append("country_name = ?")
                params.append(country_name)
                
            if state_name:
                conditions.append("state_name = ?")
                params.append(state_name)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            logger.info(f"Executing SQL query: {query} with params: {params}")
            cursor.execute(query, params)
            
            # Fetch all rows and convert to list of dictionaries
            columns = [column[0] for column in cursor.description]
            businesses = []
            
            for row in cursor.fetchall():
                business = {}
                for i, value in enumerate(row):
                    # Handle non-serializable types
                    if isinstance(value, (datetime, date, time)):
                        value = value.isoformat()
                    elif isinstance(value, bytes):
                        value = value.decode('utf-8', errors='ignore')
                    business[columns[i]] = value
                businesses.append(business)
            
            # Close the cursor and connection
            cursor.close()
            conn.close()
            
            # Log the result
            logger.info(f"Found {len(businesses)} businesses")
            if businesses:
                logger.info(f"Sample first business data: {businesses[0]}")
            
            return JsonResponse(businesses, safe=False)
        
        except Exception as e:
            logger.error(f"Error fetching businesses: {str(e)}")
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def countries_view(request):
    """
    API endpoint to get countries from the directory. This endpoint is publicly accessible.
    """
    try:
        logger.info("countries_view called")
        # Connect to Azure SQL database
        connection_string = os.environ.get('AZURE_SQL_CONNECTION_STRING')
        if not connection_string:
            # Fallback connection string if environment variable not set
            connection_string = "Driver={ODBC Driver 17 for SQL Server};Server=tcp:oatmealai.database.windows.net,1433;Database=BusinessDirectory;Uid=oatmealadmin;Pwd=Password@1;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
        
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        # Query to get distinct countries
        query = "SELECT DISTINCT country_name FROM dir_con_table WHERE country_name IS NOT NULL ORDER BY country_name"
        cursor.execute(query)
        
        # Fetch all rows and convert to list
        countries = [row[0] for row in cursor.fetchall() if row[0]]
        
        # Close the cursor and connection
        cursor.close()
        conn.close()
        
        logger.info(f"Found {len(countries)} countries")
        
        return JsonResponse({"countries": countries})
    
    except Exception as e:
        logger.error(f"Error fetching countries: {str(e)}")
        logger.error(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def states_view(request):
    """
    API endpoint to get states for a country from the directory. This endpoint is publicly accessible.
    """
    try:
        logger.info("states_view called")
        country_name = request.GET.get('country_name')
        
        if not country_name:
            return JsonResponse({"error": "country_name parameter is required"}, status=400)
        
        logger.info(f"Fetching states for country: {country_name}")
        
        # Connect to Azure SQL database
        connection_string = os.environ.get('AZURE_SQL_CONNECTION_STRING')
        if not connection_string:
            # Fallback connection string if environment variable not set
            connection_string = "Driver={ODBC Driver 17 for SQL Server};Server=tcp:oatmealai.database.windows.net,1433;Database=BusinessDirectory;Uid=oatmealadmin;Pwd=Password@1;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
        
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        # Query to get distinct states for the given country
        query = "SELECT DISTINCT state_name FROM dir_con_table WHERE country_name = ? AND state_name IS NOT NULL ORDER BY state_name"
        cursor.execute(query, [country_name])
        
        # Fetch all rows and convert to list
        states = [row[0] for row in cursor.fetchall() if row[0]]
        
        # Close the cursor and connection
        cursor.close()
        conn.close()
        
        logger.info(f"Found {len(states)} states for country {country_name}")
        
        return JsonResponse({"states": states})
    
    except Exception as e:
        logger.error(f"Error fetching states: {str(e)}")
        logger.error(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

# Define any additional views as needed
