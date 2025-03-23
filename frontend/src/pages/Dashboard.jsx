import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 18) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }
    
    // Get user name if available
    const userName = user?.fullName || user?.name || '';
    setGreeting(`${timeGreeting}${userName ? ', ' + userName : ''}!`);
  }, [user]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{greeting}</h1>
        <p>Welcome to your personalized dashboard</p>
      </header>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Business Directories</h2>
          <p>Explore our business directories</p>
          <Link to="/directories" className="dashboard-button">View Directories</Link>
        </div>
        
        <div className="dashboard-card">
          <h2>Chat with AI</h2>
          <p>Get help and information from our AI assistant</p>
          <Link to="/chat" className="dashboard-button">Open Chat</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 