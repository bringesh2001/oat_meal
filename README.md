# OAT Web Application

A full-stack web application with separate frontend, backend, and chatbot components.

## Project Structure

```
/your-project
│── /frontend     # React application
│── /backend      # Django application
│── /chatbot      # Chatbot logic and models
│── /docker       # Docker configuration files
│── docker-compose.yml
│── README.md
```

## Components

### Frontend (React)
- Modern React application
- Component-based architecture
- State management with Redux/Context
- Styled with Tailwind CSS

### Backend (Django)
- RESTful API
- Authentication and authorization
- Database models and migrations
- API documentation

### Chatbot
- Natural Language Processing
- Conversation management
- Response generation
- Integration with backend services

### Docker
- Containerized services
- Development and production configurations
- Nginx reverse proxy
- Environment variable management

## Getting Started

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd oat_webapp
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the application:
   ```bash
   docker-compose up --build
   ```

## Development Workflow

1. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes in the appropriate directory:
   - Frontend changes in `/frontend`
   - Backend changes in `/backend`
   - Chatbot changes in `/chatbot`
   - Docker changes in `/docker`

3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

4. Create a pull request to merge changes into the main branch

## Branch Structure

- `main`: Production-ready code
- `frontend`: Frontend development
- `backend`: Backend development
- `chatbot`: Chatbot development
- `docker`: Docker configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your chosen license]

## Features

- Django backend
- Docker containerization
- Nginx web server
- Environment variable configuration

## Prerequisites

- Docker
- Docker Compose
- Python 3.12 (for local development)

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## Docker Commands

- Build containers: `docker-compose build`
- Start containers: `docker-compose up`
- Stop containers: `docker-compose down`
- View logs: `docker-compose logs -f`

## Available Scripts

- `npm start` - Starts both frontend and backend servers
- `npm run setup` - Installs all dependencies for both frontend and backend
- `npm run backend` - Starts only the Django backend server
- `npm run frontend` - Starts only the React frontend server
