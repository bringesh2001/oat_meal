from django.contrib import admin
from django.urls import path, include
from users.views import signup_view, login_view, home_view
from django.contrib.auth.views import LogoutView
from . import views
from users.api_views import LoginView as UsersLoginView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pyodbc
import logging
from django.conf import settings
import sys
from rest_framework.authtoken.views import obtain_auth_token
from .views import DirectoryBusinessesView, countries_view, states_view

logger = logging.getLogger(__name__)

# Simple health check view
def health_check(request):
    return JsonResponse({"status": "ok", "message": "Server is running"})

# Simple test view to verify CORS and connectivity
def test_api(request):
    return JsonResponse({"status": "ok", "message": "API is working", "cors": "enabled"})

# Countries API view - fetch from Azure SQL database
def countries_view(request):
    try:
        # Connect to Azure SQL database
        logger.info("Connecting to database to fetch countries")
        connection_string = (
            f"Driver={{ODBC Driver 18 for SQL Server}};"  # Note the double curly braces for escaping
            f"Server=oatmealaiserverlive.database.windows.net;"
            f"Database=OatmealAILive;"
            f"UID=OatmealBowl;"
            f"PWD=Mapo31415926!;"
            f"TrustServerCertificate=no;"
            f"Encrypt=yes;"
            f"Connection Timeout=30"
        )
        
        # Log connection attempt
        logger.info("Attempting to connect to database to fetch countries...")
        drivers = pyodbc.drivers()
        logger.info(f"Available ODBC drivers: {drivers}")
        
        try:
            conn = pyodbc.connect(connection_string)
            logger.info("Database connection established successfully for countries_view")
            cursor = conn.cursor()
            
            # First check the schema
            cursor.execute("SELECT TOP 1 * FROM dir_con_table")
            columns = [column[0] for column in cursor.description]
            logger.info(f"Available columns in dir_con_table: {columns}")
            
            # Find the country column
            country_column = None
            possible_country_columns = ['country', 'Country', 'country_name', 'CountryName', 'nation']
            
            for col in columns:
                if col.lower() in [pc.lower() for pc in possible_country_columns]:
                    country_column = col
                    break
            
            if country_column:
                cursor.execute(f"SELECT DISTINCT {country_column} FROM dir_con_table WHERE {country_column} IS NOT NULL ORDER BY {country_column}")
                countries = [row[0] for row in cursor.fetchall()]
            else:
                # Fallback
                countries = ["USA", "Canada", "Mexico"]
            
            # Close the database connection
            cursor.close()
            conn.close()
            
            logger.info(f"Retrieved {len(countries)} countries from database")
            return JsonResponse(countries, safe=False)
        except pyodbc.Error as e:
            error_msg = str(e)
            logger.error(f"Database connection error in countries_view: {error_msg}")
            # Check if it's a driver-related error
            if "IM002" in error_msg or "IM012" in error_msg:
                logger.error(f"Available ODBC drivers: {drivers}")
                logger.error(f"Connection string used: {connection_string}")
            
            # Fall back to hardcoded examples if database connection fails
            logger.warning("Falling back to hardcoded country examples")
            return JsonResponse(["USA", "Canada", "Mexico"], safe=False)
    
    except Exception as e:
        logger.exception(f"Unexpected error in countries_view: {str(e)}")
        # Fall back to hardcoded examples if something goes wrong
        return JsonResponse(["USA", "Canada", "Mexico"], safe=False)

# States API view - fetch from Azure SQL database based on country
def states_view(request):
    country = request.GET.get('country', '')
    logger.info(f"Fetching states for country: {country}")
    
    if not country:
        logger.warning("No country provided for states_view")
        return JsonResponse([], safe=False)
    
    try:
        # Connect to Azure SQL database
        connection_string = (
            f"Driver={{ODBC Driver 18 for SQL Server}};"  # Note the double curly braces for escaping
            f"Server=oatmealaiserverlive.database.windows.net;"
            f"Database=OatmealAILive;"
            f"UID=OatmealBowl;"
            f"PWD=Mapo31415926!;"
            f"TrustServerCertificate=no;"
            f"Encrypt=yes;"
            f"Connection Timeout=30"
        )
        
        try:
            logger.info("Attempting to connect to database to fetch states...")
            drivers = pyodbc.drivers()
            logger.info(f"Available ODBC drivers: {drivers}")
            
            conn = pyodbc.connect(connection_string)
            logger.info("Database connection established successfully for states_view")
            cursor = conn.cursor()
            
            # First check the schema
            cursor.execute("SELECT TOP 1 * FROM dir_con_table")
            columns = [column[0] for column in cursor.description]
            
            # Find the country and state columns
            country_column = None
            state_column = None
            possible_country_columns = ['country', 'Country', 'country_name', 'CountryName', 'nation']
            possible_state_columns = ['state', 'State', 'state_name', 'StateName', 'province', 'Province']
            
            for col in columns:
                if col.lower() in [pc.lower() for pc in possible_country_columns]:
                    country_column = col
                if col.lower() in [ps.lower() for ps in possible_state_columns]:
                    state_column = col
            
            if country_column and state_column:
                cursor.execute(f"SELECT DISTINCT {state_column} FROM dir_con_table WHERE {country_column} = ? AND {state_column} IS NOT NULL ORDER BY {state_column}", (country,))
                states = [row[0] for row in cursor.fetchall()]
            else:
                # Fallback
                states = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador"]
            
            # Close the database connection
            cursor.close()
            conn.close()
            
            logger.info(f"Retrieved {len(states)} states for {country}")
            return JsonResponse(states, safe=False)
        except pyodbc.Error as e:
            error_msg = str(e)
            logger.error(f"Database connection error in states_view: {error_msg}")
            logger.error(f"Connection string used: {connection_string}")
            
            # Fall back to hardcoded examples if database connection fails
            if country == "USA":
                logger.warning("Falling back to hardcoded USA states")
                return JsonResponse(["Alabama", "Alaska", "Arizona", "California", "Texas"], safe=False)
            elif country == "Canada":
                logger.warning("Falling back to hardcoded Canada provinces")
                return JsonResponse(["Alberta", "British Columbia", "Ontario", "Quebec"], safe=False)
            elif country == "Mexico":
                logger.warning("Falling back to hardcoded Mexico states")
                return JsonResponse(["Jalisco", "Mexico City", "Yucatan", "Tamaulipas"], safe=False)
            else:
                return JsonResponse([], safe=False)
    
    except Exception as e:
        logger.exception(f"Unexpected error in states_view: {str(e)}")
        # Fall back to hardcoded examples
        if country == "USA":
            return JsonResponse(["Alabama", "Alaska", "Arizona", "California", "Texas"], safe=False)
        elif country == "Canada":
            return JsonResponse(["Alberta", "British Columbia", "Ontario", "Quebec"], safe=False)
        elif country == "Mexico":
            return JsonResponse(["Jalisco", "Mexico City", "Yucatan", "Tamaulipas"], safe=False)
        else:
            return JsonResponse([], safe=False)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('apiV1/', include('chatbot.urls')),
    # Home URL
    path('', home_view, name='home'),
    # Health check endpoint
    path('health/', csrf_exempt(health_check), name='health_check'),
    # Test API endpoint
    path('test-api/', csrf_exempt(test_api), name='test_api'),
    # Authentication URLs - Use views from backend.views
    path('api/auth/signup/', views.SignupView.as_view(), name='signup'),
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    # Add the users login endpoint as an alternative
    path('users/api/login/', UsersLoginView.as_view(), name='users_login'),
    # Add a direct login endpoint
    path('login/', UsersLoginView.as_view(), name='direct_login'),
    path('api/auth/profile/', views.ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    
    # Directory and Business API endpoints - made publicly accessible with CSRF exemption
    path('api/directory-businesses/', csrf_exempt(DirectoryBusinessesView.as_view()), name='directory-businesses'),
    path('api/countries/', csrf_exempt(countries_view), name='countries'),
    path('api/states/', csrf_exempt(states_view), name='states'),
    
    # Include other user URLs with a prefix to avoid conflicts
    path('users/', include('users.urls')),
]
