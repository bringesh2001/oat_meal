import requests
import os
from langchain.agents import tool

@tool
def get_weather(city: str):
    """Returns the weather information of given city"""
    
    base_url = "http://api.openweathermap.org/data/2.5/weather"

    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

    if not WEATHER_API_KEY:
        return "Weather API key is not set. Please check your environment variables."
    
    try:
        response = requests.get(base_url, params={"q": city, "appid": WEATHER_API_KEY, "units": "metric"})
        data = response.json()
        
        if response.status_code == 200:
            return data
            
        else:
            return f"Could not fetch weather data for {city}. Error: {data.get('message', 'Unknown error')}."
    except Exception as e:
        return f"An error occurred while fetching weather data: {str(e)}"
