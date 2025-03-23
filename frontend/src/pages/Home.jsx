import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    console.log('Home - Auth check:', { 
      hasToken: !!token, 
      justLoggedIn: !!justLoggedIn 
    });
    
    if (token) {
      setIsAuthenticated(true);
      
      // If user just logged in, redirect to directories page
      if (justLoggedIn) {
        console.log('User just logged in, will redirect to directories');
        // Clear the justLoggedIn flag
        sessionStorage.removeItem('justLoggedIn');
      }
    }
    
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    console.log('User is authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="home-container">
      <div className="welcome-content">
        <h1>Welcome to Oatmeal AI</h1>
        <p>Explore our business directories or log in to access chat features.</p>
        <div className="home-buttons">
          <a href="/login" className="home-button primary">Login</a>
          <a href="/signup" className="home-button secondary">Sign Up</a>
          <a href="/directories" className="home-button tertiary">View Directories</a>
        </div>
      </div>
    </div>
  );
}

export default Home;