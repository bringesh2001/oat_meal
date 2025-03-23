// Environment variables in React are automatically loaded from .env files during build
// No need to import dotenv in browser environments

// API configuration - Use localhost explicitly
const API_BASE_URL = 'http://localhost:8000';

// Log the API base URL for debugging
console.log('FIXED_API_BASE_URL:', API_BASE_URL);

// API endpoints
const API_ENDPOINTS = {
  // Test endpoint
  test: `${API_BASE_URL}/test-api/`,
  
  // API endpoints matching Django URL patterns
  countries: `${API_BASE_URL}/api/countries/`,
  states: `${API_BASE_URL}/api/states/`,
  directoryBusinesses: `${API_BASE_URL}/api/directory-businesses/`,
};

// Log all endpoints for debugging
console.log('API_ENDPOINTS:', API_ENDPOINTS);

export const AZURE_OPENAI_API_KEY = process.env.REACT_APP_AZURE_OPENAI_API_KEY;
export const AZURE_OPENAI_ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
export const AZURE_OPENAI_API_VERSION = process.env.REACT_APP_AZURE_OPENAI_API_VERSION;

export { API_BASE_URL, API_ENDPOINTS };
