import os
from dotenv import load_dotenv
from pathlib import Path

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env in the base directory
dotenv_path = os.path.join(BASE_DIR, '.env')
print(f"Looking for .env file at: {dotenv_path}")
print(f"File exists: {os.path.exists(dotenv_path)}")

load_dotenv(dotenv_path)

# Print all environment variables
print("\nEnvironment Variables:")
for key, value in os.environ.items():
    # Mask sensitive information
    if 'KEY' in key or 'SECRET' in key or 'PASSWORD' in key:
        masked_value = value[:4] + '*' * (len(value) - 8) + value[-4:] if len(value) > 8 else '****'
        print(f"{key}: {masked_value}")
    else:
        print(f"{key}: {value}")

# Check specifically for Azure OpenAI variables
print("\nAzure OpenAI Variables:")
api_key = os.environ.get('AZURE_OPENAI_API_KEY')
endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
api_version = os.environ.get('AZURE_OPENAI_API_VERSION')

print(f"AZURE_OPENAI_API_KEY: {'Found (masked)' if api_key else 'Not found'}")
print(f"AZURE_OPENAI_ENDPOINT: {endpoint if endpoint else 'Not found'}")
print(f"AZURE_OPENAI_API_VERSION: {api_version if api_version else 'Not found'}") 