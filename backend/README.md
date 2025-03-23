# FarmSphere.AI Backend

This is the backend for the FarmSphere.AI application.

## Setup

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file in the project root with the following variables:
   ```
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_API_VERSION=2023-05-15
   DEBUG=True
   ```
6. Run migrations: `python manage.py migrate`
7. Create a superuser: `python manage.py createsuperuser`
8. Run the server: `python manage.py runserver`

## API Endpoints

- `/apiV1/chat/` - For querying the chatbot
  - Method: POST
  - Content-Type: application/json
  - Body: `{"message": "your query here"}`
  - Authorization: Token <user_token>
  - Response: `{"response": "chatbot response"}`

- `/apiV1/load-data/` - For loading data into the vector database
  - Method: POST
  - Authorization: Token <user_token>
  - Response: `{"message": "Data loaded successfully"}`

- `/register/` - For user registration
  - Method: POST
  - Content-Type: application/json
  - Body: `{"email": "user@example.com", "username": "username", "password": "password"}`
  - Response: `{"message": "User registered successfully", "token": "user_token"}`

- `/login/` - For user login
  - Method: POST
  - Content-Type: application/json
  - Body: `{"email": "user@example.com", "password": "password"}`
  - Response: `{"message": "Login successful", "token": "user_token"}`

- `/logout/` - For user logout
  - Method: POST
  - Authorization: Token <user_token>
  - Response: `{"message": "Logout successful"}`
