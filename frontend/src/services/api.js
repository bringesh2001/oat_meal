import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // Updated to point directly to the Django server
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - adds auth token if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Check if token exists
    if (token) {
      console.log(`API Request: Using token for ${config.url}`);
      
      // Check token format - use Bearer for JWT tokens
      if (token.startsWith('eyJ')) {
        // JWT format tokens should use Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Using JWT token with Bearer prefix');
      } else {
        // Other token formats use the Django REST Framework Token format
        config.headers.Authorization = `Token ${token}`;
        console.log('Using Django REST Framework Token format');
      }
      
      // Add detailed debug info for troubleshooting
      console.log('Authorization header format:', config.headers.Authorization.includes(' ') ? 
        `${config.headers.Authorization.split(' ')[0]} + token` : 'Direct token (no prefix)');
      console.log('Token length:', token.length);
    } else {
      console.log('API Request: No token found');
    }
    
    console.log('Sending token:', token);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized error from API:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers.Authorization ? 
          error.config.headers.Authorization.substring(0, 20) + '...' : 'none',
        data: error.response.data
      });
      
      // Log the full error response for debugging
      console.error('Full 401 response:', {
        detail: error.response.data.detail || 'No detail provided',
        message: error.response.data.message || 'No message provided',
        rawData: JSON.stringify(error.response.data)
      });
      
      // Check if token was invalid
      if (error.response.data && 
          (error.response.data.detail === 'Invalid token' || 
           error.response.data.message === 'Invalid token')) {
        console.error('Token was rejected by server - may need to log in again');
        
        // Keep the token for now, but log the issue
        // Don't automatically clear it to prevent logout loops
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth functions
export const loginUser = async ({ email, password }) => {
  try {
    console.log('Login attempt with data:', { 
      email,
      password: '********' // Mask password in logs for security
    });
    
    // Define all possible login endpoints, prioritizing the most likely ones
    const possibleEndpoints = [
      'http://127.0.0.1:8000/login/',
      'http://127.0.0.1:8000/api/auth/login/',
      'http://127.0.0.1:8000/users/api/login/',
      'http://127.0.0.1:8000/apiV1/api/auth/login/',
      'http://127.0.0.1:8000/apiV1/users/api/login/'
    ];
    
    let lastError = null;
    
    // Try each endpoint until one succeeds
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Attempting login with endpoint: ${endpoint}`);
        const response = await axios.post(endpoint, { email, password });
        
        console.log(`Login successful with endpoint: ${endpoint}`);
        console.log('Login response structure:', Object.keys(response.data).join(', '));
        
        // Extract token from various possible formats
        let token = null;
        
        if (response.data.token) {
          token = response.data.token;
          console.log('Found token in response.data.token');
        } else if (response.data.access) {
          token = response.data.access;
          console.log('Found token in response.data.access');
        } else if (response.data.key) {
          token = response.data.key;
          console.log('Found token in response.data.key');
        } else if (typeof response.data === 'string') {
          // Sometimes the API returns the token directly as a string
          token = response.data;
          console.log('Response data is a string, using as token');
        } else {
          // Loop through all properties to find one that might be a token
          for (const key in response.data) {
            if (
              typeof response.data[key] === 'string' && 
              (response.data[key].length > 20 || key.toLowerCase().includes('token'))
            ) {
              token = response.data[key];
              console.log(`Found possible token in response.data.${key}`);
              break;
            }
          }
        }
        
        if (!token) {
          console.error('No token found in login response:', response.data);
          throw new Error('Authentication failed: No token in response');
        }
        
        // Log details about the token to help with debugging
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 10) + '...');
        console.log('Appears to be JWT:', token.startsWith('eyJ'));
        
        // Store the token
        localStorage.setItem('token', token);
        
        // Store user info if available in the response
        if (response.data.user) {
          console.log('User data found in response:', Object.keys(response.data.user).join(', '));
          const userData = response.data.user;
          
          // Create a user object to store in localStorage
          const userObj = {
            id: userData.id || 'unknown',
            email: userData.email || email,
            name: userData.fullName || userData.name || userData.username || email.split('@')[0],
            authenticated: true
          };
          
          localStorage.setItem('user', JSON.stringify(userObj));
          
          if (userData.email) {
            sessionStorage.setItem('lastLoginEmail', userData.email);
          } else if (typeof email === 'string') {
            sessionStorage.setItem('lastLoginEmail', email);
          }
        } else {
          // If we don't have user info, store the email we logged in with
          if (typeof email === 'string') {
            sessionStorage.setItem('lastLoginEmail', email);
            
            // Create a basic user object in localStorage
            const userObj = {
              email: email,
              name: email.split('@')[0],
              authenticated: true
            };
            
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        }
        
        return {
          ...response.data,
          token: token, // Ensure token is in the returned data
          success: true
        };
      } catch (error) {
        console.error(`Login failed with endpoint ${endpoint}:`, error.message);
        lastError = error;
        // Continue to the next endpoint if this one failed
      }
    }
    
    // If we've reached this point, all endpoints failed
    console.error('Login error:', lastError);
    console.error('Error details:', lastError.response?.data || lastError.message);
    
    // Extract meaningful error message if available
    let errorMessage = 'Login failed. Please check your credentials.';
    if (lastError.response) {
      if (lastError.response.data.message) {
        errorMessage = lastError.response.data.message;
      } else if (lastError.response.data.error) {
        errorMessage = lastError.response.data.error;
      } else if (typeof lastError.response.data === 'string') {
        errorMessage = lastError.response.data;
      } else if (lastError.response.data.detail) {
        errorMessage = lastError.response.data.detail;
      } else if (lastError.response.data.non_field_errors) {
        errorMessage = lastError.response.data.non_field_errors.join('. ');
      }
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Extract meaningful error message if available
    let errorMessage = 'Login failed. Please check your credentials.';
    if (error.response) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors.join('. ');
      }
    }
    
    throw new Error(errorMessage);
  }
};

export const signupUser = async (userData) => {
  try {
    console.log('Signup attempt with data:', { 
      ...userData, 
      password: userData.password ? '********' : undefined  // Mask password in logs for security
    });
    
    // Define all possible signup endpoints
    const possibleEndpoints = [
      'http://127.0.0.1:8000/api/auth/signup/',
      'http://127.0.0.1:8000/apiV1/api/auth/signup/',
      'http://127.0.0.1:8000/users/api/register/',
      'http://127.0.0.1:8000/apiV1/users/api/register/',
      'http://127.0.0.1:8000/signup/',
      'http://127.0.0.1:8000/register/'
    ];
    
    let lastError = null;
    
    // Try each endpoint until one succeeds
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Attempting signup with endpoint: ${endpoint}`);
        const response = await axios.post(endpoint, userData);
        
        console.log(`Signup successful with endpoint: ${endpoint}`);
        console.log('Signup response:', response.data);
        
        // If the response contains a token, store it
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        return {
          ...response.data,
          success: true
        };
      } catch (error) {
        console.error(`Signup failed with endpoint ${endpoint}:`, error.message);
        lastError = error;
        // Continue to the next endpoint if this one failed
      }
    }
    
    // If we've reached this point, all endpoints failed
    console.error('All signup endpoints failed. Last error:', lastError);
    console.error('Error details:', lastError.response?.data || lastError.message);
    
    // Extract meaningful error message if available
    let errorMessage = 'Signup failed. Please try again.';
    if (lastError.response) {
      if (lastError.response.data.message) {
        errorMessage = lastError.response.data.message;
      } else if (lastError.response.data.error) {
        errorMessage = lastError.response.data.error;
      } else if (typeof lastError.response.data === 'string') {
        errorMessage = lastError.response.data;
      } else if (lastError.response.data.detail) {
        errorMessage = lastError.response.data.detail;
      } else if (Object.keys(lastError.response.data).length > 0) {
        // Extract field-specific errors
        const fieldErrors = Object.entries(lastError.response.data)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          });
        
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      }
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Extract meaningful error message if available
    let errorMessage = 'Signup failed. Please try again.';
    if (error.response) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (Object.keys(error.response.data).length > 0) {
        // Extract field-specific errors
        const fieldErrors = Object.entries(error.response.data)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          });
        
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      }
    }
    
    throw new Error(errorMessage);
  }
};

// User profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Determine the correct authentication header based on token format
    let headers = {};
    if (token.startsWith('eyJ')) {
      // For JWT, try direct token approach (no prefix)
      headers.Authorization = token;
      console.log('getUserProfile: Using direct JWT token (no prefix)');
    } else {
      // Use Token format for other types
      headers.Authorization = `Token ${token}`;
      console.log('getUserProfile: Using Django REST Framework Token format');
    }

    // Try multiple profile endpoints that might exist
    const possibleEndpoints = [
      '/apiV1/profile/',
      '/apiV1/user/profile/',
      '/apiV1/user/',
      '/api/auth/profile/',
      '/api/auth/user/',
      '/api/user/profile/',
      '/api/user/',
      '/api/profile/',
      '/api/me/',
      '/admin/'  // Try admin endpoint as a test for authentication
    ];
    
    let lastError = null;
    let userData = null;
    
    // Try each endpoint until one works
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying to fetch profile from ${endpoint}`);
        const response = await api.get(endpoint, { headers });
        
        if (response.status === 200 && response.data) {
          console.log(`Profile found at ${endpoint}:`, response.status);
          userData = response.data;
          break;
        }
      } catch (endpointError) {
        console.log(`Profile not found at ${endpoint}:`, 
          endpointError.response ? endpointError.response.status : 'network error');
        lastError = endpointError;
        // Continue to the next endpoint
      }
    }
    
    // If we found user data from any endpoint
    if (userData) {
      console.log('Profile data found:', Object.keys(userData).join(', '));
      
      // Store key user info in session storage for fallback
      if (userData.email) {
        sessionStorage.setItem('lastLoginEmail', userData.email);
      }
      
      if (userData.name) {
        sessionStorage.setItem('userName', userData.name);
      } else if (userData.username) {
        sessionStorage.setItem('userName', userData.username);
      } else if (userData.first_name) {
        const fullName = userData.last_name 
          ? `${userData.first_name} ${userData.last_name}`
          : userData.first_name;
        sessionStorage.setItem('userName', fullName);
      }
      
      return userData;
    }
    
    // If we get here, no endpoints worked but we have a token
    // Create a fallback profile based on stored session data
    console.log('No profile endpoints successful, using fallback data');
    const email = sessionStorage.getItem('lastLoginEmail');
    const name = sessionStorage.getItem('userName');
    
    if (email) {
      return {
        email: email,
        name: name || 'User',
        profile_picture: null,
      };
    }
    
    // If we have no email, re-throw the last error
    throw lastError || new Error('Failed to fetch profile from all endpoints');
  } catch (error) {
    console.error('Error fetching user profile:', 
      error.response ? `${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message);
    
    // Create a fallback user object if profile fetch fails
    const email = sessionStorage.getItem('lastLoginEmail');
    if (email) {
      return {
        email: email,
        name: sessionStorage.getItem('userName') || 'User',
        profile_picture: null,
      };
    }
    throw error;
  }
};

// Directories
export const getDirectories = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Try with trailing slash first (Django often requires this)
    const response = await api.get('/apiV1/directories/', {
      headers: {
        Authorization: `Token ${token}`, // Using Token format for Django REST Framework
      },
    });

    console.log('Directories response:', response.status, response.data);
    return response.data;
  } catch (error) {
    // If we get a 404 with trailing slash, try without
    if (error.response && error.response.status === 404) {
      try {
        const response = await api.get('/apiV1/directories', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        console.log('Directories response (without trailing slash):', response.status, response.data);
        return response.data;
      } catch (retryError) {
        console.error('Error fetching directories (retry):', retryError.response ? retryError.response.status : retryError.message);
        throw retryError;
      }
    }

    console.error('Error fetching directories:', error.response ? error.response.status : error.message);
    
    // Return some mock directory data if the API fails
    return [
      { id: 1, name: 'Documents', path: '/documents', color: '#4285F4' },
      { id: 2, name: 'Images', path: '/images', color: '#34A853' },
      { id: 3, name: 'Projects', path: '/projects', color: '#FBBC05' },
      { id: 4, name: 'Reports', path: '/reports', color: '#EA4335' },
    ];
  }
};

// Chat API Functions
export const getChatHistory = async () => {
  try {
    // For initial implementation, we'll create a welcome message
    return [
      {
        id: 'welcome',
        sender: 'bot',
        content: 'Welcome to FarmSphere.AI, your intelligent farming assistant. How can I help you today?',
        timestamp: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

export const sendChatMessage = async (message) => {
  try {
    const token = localStorage.getItem('token');
    
    // Log token status for debugging
    console.log('Sending chat message with token:', token ? 'Token exists' : 'No token');
    
    // Set up headers with proper authentication
    let headers = {};
    if (token) {
      if (token.startsWith('eyJ')) {
        headers.Authorization = `Bearer ${token}`;
        console.log('Using JWT Bearer token format');
      } else {
        headers.Authorization = `Token ${token}`;
        console.log('Using Django Token format');
      }
    }
    
    // Log the actual authorization header for debugging
    console.log('Authorization header:', headers.Authorization || 'None');
    
    // Make request with explicit full URL to avoid any path issues
    const response = await axios.post(
      'http://127.0.0.1:8000/apiV1/chat/', 
      { message }, 
      { headers }
    );
    
    console.log('Chat response received:', response.data);
    
    return {
      content: response.data.response,
      sender: 'bot',
      timestamp: response.data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // Check for specific auth errors and handle appropriately
    if (error.response && error.response.status === 401) {
      console.warn('Authentication failed - you may need to log in again');
      // Optional: Redirect to login or reset auth state
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    
    throw new Error('Failed to send message. Please try again.');
  }
};

// Function to diagnose API endpoints
export const checkApiEndpoints = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token available');
    return { authenticated: false, endpoints: [] };
  }
  
  // Prepare headers
  const headers = {
    Authorization: `Token ${token}`,
  };
  
  // List of endpoints to test
  const endpoints = [
    // Common API endpoints
    { method: 'GET', url: '/api/auth/profile/' },
    { method: 'GET', url: '/api/directories/' },
    { method: 'GET', url: '/api/chat/' },
    { method: 'POST', url: '/api/chat/', data: { message: 'test' } },
    
    // V1 API endpoints 
    { method: 'GET', url: '/apiV1/profile/' },
    { method: 'GET', url: '/apiV1/directories/' },
    { method: 'GET', url: '/apiV1/ping/' },
    { method: 'POST', url: '/apiV1/chat/', data: { message: 'test' } },
    
    // Azure-specific endpoints (if any)
    { method: 'GET', url: '/apiV1/azure/status/' },
  ];
  
  const results = [];
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.url}...`);
      
      const config = {
        method: endpoint.method,
        url: endpoint.url,
        headers: headers,
        data: endpoint.data || null
      };
      
      const response = await axios(config);
      
      results.push({
        endpoint: endpoint.url,
        method: endpoint.method,
        status: response.status,
        available: true,
        data: typeof response.data === 'object' ? 'Object received' : 'Data received'
      });
      
      console.log(`✅ ${endpoint.method} ${endpoint.url} - Status: ${response.status}`);
    } catch (error) {
      results.push({
        endpoint: endpoint.url,
        method: endpoint.method,
        status: error.response?.status || 'Network Error',
        available: false,
        error: error.response?.data || error.message
      });
      
      console.log(`❌ ${endpoint.method} ${endpoint.url} - Error: ${error.response?.status || error.message}`);
    }
  }
  
  // Log the summary
  const availableEndpoints = results.filter(e => e.available);
  console.log(`API Endpoint Check Summary: ${availableEndpoints.length}/${endpoints.length} endpoints available`);
  console.table(results);
  
  return {
    authenticated: true,
    endpoints: results,
    availableCount: availableEndpoints.length,
    totalCount: endpoints.length
  };
};

/**
 * Tests a specific endpoint and returns detailed status information
 * @param {string} endpoint - The endpoint path to test (e.g., '/api/chat/')
 * @returns {Object} - Object containing status information
 */
export const testEndpoint = async (endpoint) => {
  const baseUrl = 'http://127.0.0.1:8000'; // Django backend URL
  const url = `${baseUrl}${endpoint}`;
  
  try {
    // Get token if available and use appropriate format
    const token = localStorage.getItem('token');
    let headers = {};
    
    if (token) {
      if (token.startsWith('eyJ')) {
        // For JWT, try direct token approach (no prefix)
        headers.Authorization = token;
        console.log('Using direct JWT token (no prefix)');
      } else {
        // Other token formats use the Django REST Framework Token format
        headers.Authorization = `Token ${token}`;
        console.log('Using Django REST Framework Token format');
      }
    }
    
    console.log(`Testing endpoint: ${url}`);
    console.log('Authorization header:', token ? headers.Authorization.substring(0, 15) + '...' : 'None');
    
    // For GET endpoints
    const response = await axios.get(url, { 
      headers,
      // Don't throw error on non-2xx responses - we want to handle them ourselves
      validateStatus: () => true
    });
    
    console.log(`Endpoint ${url} response:`, response.status, response.statusText);
    
    // A 404 means the server is running but endpoint doesn't exist
    if (response.status === 404) {
      return {
        url,
        status: 404,
        available: false,
        serverRunning: true,
        message: "Endpoint not found, but server is running",
        data: response.data
      };
    }
    
    // Auth errors
    if (response.status === 401 || response.status === 403) {
      return {
        url,
        status: response.status,
        available: false,
        authError: true,
        message: response.status === 401 ? "Unauthorized - Invalid or missing token" : "Forbidden",
        data: response.data
      };
    }
    
    // Success (2xx) responses
    if (response.status >= 200 && response.status < 300) {
      return {
        url,
        status: response.status,
        available: true,
        message: "Endpoint available",
        data: response.data
      };
    }
    
    // Other responses
    return {
      url,
      status: response.status,
      available: false,
      message: `Endpoint responded with: ${response.status} ${response.statusText}`,
      data: response.data
    };
  } catch (error) {
    console.error(`Error testing endpoint ${url}:`, error);
    
    // Network errors (server not running)
    if (error.code === 'ERR_NETWORK') {
      return {
        url,
        status: 'Network Error',
        available: false,
        serverRunning: false,
        message: "Server not running or network error",
        error: error.message
      };
    }
    
    return {
      url,
      status: error.response?.status || 'Error',
      available: false,
      message: `Error: ${error.message}`,
      error: error.message
    };
  }
};

export default api;