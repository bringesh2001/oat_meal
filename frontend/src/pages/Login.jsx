import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser, getUserProfile } from '../services/api';
import axios from 'axios';
import '../styles/Login.css';
import hensImage from '../images/hens.jpg';
import logo from '../images/logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [testingBackend, setTestingBackend] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [availableEndpoints, setAvailableEndpoints] = useState([]);
  const [testingEndpoints, setTestingEndpoints] = useState(false);
  const passwordTooltipRef = useRef(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Test backend connectivity
  const testBackendConnection = async () => {
    setTestingBackend(true);
    setBackendStatus(null);
    
    const testEndpoints = [
      'http://127.0.0.1:8000/'
    ];
    
    let connected = false;
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 5000 });
        if (response.status >= 200 && response.status < 500) {
          connected = true;
          setBackendStatus({
            connected: true,
            message: 'Backend server is online.',
            endpoint: endpoint
          });
          break;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          connected = true;
          setBackendStatus({
            connected: true,
            message: 'Backend server is online (404 response).',
            endpoint: endpoint
          });
          break;
        }
      }
    }
    
    if (!connected) {
      setBackendStatus({
        connected: false,
        message: 'Cannot connect to backend server. Please ensure the server is running.',
        error: 'All connection attempts failed'
      });
    }
    
    setTestingBackend(false);
  };
  
  // Test which login endpoints are available
  const testLoginEndpoints = async () => {
    // This entire function should be removed
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordFocus = () => {
    if (passwordTooltipRef.current) {
      passwordTooltipRef.current.style.display = 'block';
    }
  };

  const handlePasswordBlur = () => {
    if (passwordTooltipRef.current) {
      passwordTooltipRef.current.style.display = 'none';
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordTooltipRef.current) {
      if (e.target.value.length >= 8) {
        passwordTooltipRef.current.style.display = 'none';
      } else {
        passwordTooltipRef.current.style.display = 'block';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      sessionStorage.setItem('lastLoginEmail', email);
      const username = email.split('@')[0];
      if (username) {
        const displayName = username.charAt(0).toUpperCase() + username.slice(1);
        sessionStorage.setItem('userName', displayName);
      }
      
      // If remember me is checked, save email to localStorage
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      
      const response = await loginUser({ email, password });
      if (!response || !response.token) {
        throw new Error('Invalid login response - no token received');
      }
      
      localStorage.setItem('token', response.token);
      
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          if (userProfile.name) {
            sessionStorage.setItem('userName', userProfile.name);
          } else if (userProfile.username) {
            sessionStorage.setItem('userName', userProfile.username);
          }
          if (userProfile.email) {
            sessionStorage.setItem('lastLoginEmail', userProfile.email);
          }
        }
      } catch (profileError) {
        console.warn('Could not fetch profile, will use fallback data:', profileError);
      }
      
      await login({ ...response, email: email });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const errorMsg = err.response.data?.detail || 
                         err.response.data?.message || 
                         'Invalid email or password';
        setError(errorMsg);
        setPassword('');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Check for saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Image animation effect from original code
  useEffect(() => {
    const handleMouseMove = (event) => {
      const image = document.querySelector('.right-corner-image');
      if (!image) return;
      
      const rect = image.getBoundingClientRect();
      
      // Check if mouse is over the image
      const isMouseOverImage = (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
      
      // Only update the position if the mouse is not over the image
      if (!isMouseOverImage) {
        image.style.transform = `translate(${event.clientX / 100 - 20}px, ${event.clientY / 100 - 20}px)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="login-page">
      <nav className="navbar">
        <img src={logo} alt="Logo" className="logo" />
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="/team">Our Team</a>
          <a href="/contact">Contact Us</a>
        </div>
      </nav>
      
      <div className="container">
        <div className="form-container">
          <h2>Sign in</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {backendStatus && !backendStatus.connected && (
            <div className="error-message">
              {backendStatus.message}
              <button 
                onClick={testBackendConnection}
                disabled={testingBackend}
                className="retry-button"
              >
                {testingBackend ? 'Testing...' : 'Retry Connection'}
              </button>
            </div>
          )}
          
          {backendStatus && backendStatus.connected && (
            <div className="api-test-section">
              {/* Test login endpoints section removed */}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="textbox">
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required 
              />
              <label className="label" htmlFor="email">Email</label>
            </div>
            
            <div className="textbox">
              <input 
                type={passwordVisible ? "text" : "password"}
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required 
              />
              <label className="label" htmlFor="password">Password</label>
              <span className="eye-icon" onClick={togglePasswordVisibility}>
                {passwordVisible ? '🙉' : '🙈'}
              </span>
            </div>
            
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <label htmlFor="rememberMe">Remember me</label>
              <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading || (backendStatus && !backendStatus.connected)}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="signup-container">
            <Link to="/signup" className="signup-button">No account? Join Us 🤝</Link>
          </div>
        </div>
        
        <img src={hensImage} alt="Right Corner Image" className="right-corner-image" />
      </div>
    </div>
  );
}

export default Login;