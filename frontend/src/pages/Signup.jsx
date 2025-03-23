import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting registration data:', {
        fullName: formData.fullName,
        email: formData.email,
        password: '********' // Don't log actual password
      });
      
      const response = await signupUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration successful:', response);
      
      // Store email in sessionStorage for use in other components
      sessionStorage.setItem('lastLoginEmail', formData.email);
      
      if (response && response.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        
        // Create a basic user object in localStorage
        const userData = {
          email: formData.email,
          fullName: formData.fullName,
          authenticated: true
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Signup successful, redirecting to directories');
        
        // Directly go to directories page
        window.location.href = '/directories';
      } else {
        // If backend doesn't return a token directly after signup, redirect to login
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error details:', err);
      let errorMessage = 'Registration failed';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data.message || JSON.stringify(err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message) {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage, user already logged in');
      // If already logged in, go directly to directories
      window.location.href = '/directories';
    }
  }, []);

  return (
    <div className="signup-form-wrapper">
      <h2>Create an Account</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <small className="form-text">Your name will appear in your profile and we'll use your initials for your profile icon.</small>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="signup-button" 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Signup;