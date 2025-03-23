import os
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI
import json
from pathlib import Path

# Get the base directory (where manage.py is located)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))

def get_llm_model():
    """Initializes and returns the Azure OpenAI Chat model."""
    print("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n")
    debug = os.environ.get('DEBUG', 'True')
    print(f"Debug mode: {debug}")
    
    # Try to load credentials from a JSON file first
    credentials_path = os.path.join(BASE_DIR, 'azure_credentials.json')
    try:
        if os.path.exists(credentials_path):
            print(f"Loading credentials from {credentials_path}")
            with open(credentials_path, 'r') as f:
                credentials = json.load(f)
                api_key = credentials.get('api_key')
                endpoint = credentials.get('endpoint')
                api_version = credentials.get('api_version', '2023-05-15')
                print("Credentials loaded from JSON file")
        else:
            # Fall back to environment variables
            print("Credentials file not found, using environment variables")
            api_key = os.environ.get('AZURE_OPENAI_API_KEY')
            endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
            api_version = os.environ.get('AZURE_OPENAI_API_VERSION', '2023-05-15')
    except Exception as e:
        print(f"Error loading credentials: {e}")
        # Fall back to environment variables
        print("Falling back to environment variables")
        api_key = os.environ.get('AZURE_OPENAI_API_KEY')
        endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
        api_version = os.environ.get('AZURE_OPENAI_API_VERSION', '2023-05-15')
    
    print(f"API Key found: {'Yes' if api_key else 'No'}")
    print(f"Endpoint found: {'Yes' if endpoint else 'No'}")
    print(f"API Version: {api_version}")
    
    if not api_key or not endpoint:
        # If credentials are missing, use a fallback response generator
        print("Azure OpenAI credentials not found. Using fallback response generator.")
        return FallbackResponseGenerator()
    
    try:
        # Attempt to create the AzureChatOpenAI model with the credentials
        model = AzureChatOpenAI(
            azure_deployment="gpt-4o-mini",  # Use the deployment name from Azure
            api_key=api_key,
            azure_endpoint=endpoint,
            api_version=api_version,
            temperature=0,
            max_tokens=600,
            timeout=None,
            max_retries=2,
        )
        
        # Test the model to ensure it works
        test_response = model.invoke("Hello, are you working?")
        print("LLM model initialized successfully!")
        return model
    except Exception as e:
        print(f"Error initializing AzureChatOpenAI: {e}")
        return FallbackResponseGenerator()

class FallbackResponseGenerator:
    """A fallback class that mimics the LLM interface but returns predefined responses."""
    
    def invoke(self, prompt):
        """Mimics the invoke method of LLM but returns a predefined response."""
        # Simple response based on keywords in the prompt
        prompt_lower = prompt.lower()
        
        if "weather" in prompt_lower:
            response = "I'm sorry, I can't access weather information right now. This is a development environment without Azure OpenAI API credentials."
        elif "plant" in prompt_lower or "crop" in prompt_lower:
            response = "I'm sorry, I can't provide plant information right now. This is a development environment without Azure OpenAI API credentials."
        else:
            response = "I'm sorry, I can't process your request right now. This is a development environment without Azure OpenAI API credentials."
        
        # Create a response object with a content attribute to mimic the LLM response
        class Response:
            def __init__(self, content):
                self.content = content
        
        return Response(response)

