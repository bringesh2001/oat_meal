import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Check authentication status on mount and when user changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Navbar: Checking auth state');
    console.log('Navbar: Token exists:', !!token);
    console.log('Navbar: User from context:', user ? 'yes' : 'no');
    console.log('Navbar: Stored user exists:', !!storedUser);
    
    // SIMPLIFIED: Consider authenticated if token exists
    if (token) {
      setIsLoggedIn(true);
      
      // Set user info from context or local storage
      if (user) {
        setUserInfo(user);
      } else if (storedUser) {
        try {
          setUserInfo(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          // Create a default user object if parsing fails
          const email = sessionStorage.getItem('lastLoginEmail');
          setUserInfo({ email: email || 'user@example.com' });
        }
      } else {
        // If no user info but token exists, create a default user
        const email = sessionStorage.getItem('lastLoginEmail');
        setUserInfo({ email: email || 'user@example.com' });
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, [user]);

  const handleLogout = () => {
    // Log out and redirect to login page
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('lastLoginEmail');
    window.location.href = '/login';
  };

  // Generate initials from user's name
  const getInitials = (userObj) => {
    if (!userObj) return '?';
    
    // If fullName exists, get initials from it
    if (userObj.fullName) {
      const names = userObj.fullName.split(' ');
      if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    
    // Try to get initials from name if fullName doesn't exist
    if (userObj.name) {
      const names = userObj.name.split(' ');
      if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    
    // Check sessionStorage for email
    const storedEmail = sessionStorage.getItem('lastLoginEmail');
    if (storedEmail) {
      return storedEmail[0].toUpperCase();
    }
    
    // Fallback to email from user object
    return userObj.email ? userObj.email[0].toUpperCase() : '?';
  };

  return (
    <nav className="navbar white-navbar">
      <div className="logo">
        <Link to={isLoggedIn ? "/dashboard" : "/"}>OatmealAI</Link>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          <>
            {/* For logged in users: Home (goes to dashboard), Chat, Profile */}
            <li><Link to="/dashboard">Home</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/directories">Directories</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/our-team">Our Team</Link></li>
            <li><Link to="/contact-us" className="contact-button">Contact Us</Link></li>
            <li className="dropdown">
              <div className="profile-circle black-sphere">
                {getInitials(userInfo)}
              </div>
              <div className="dropdown-content">
                <div className="dropdown-header">
                  <p>{userInfo?.fullName || userInfo?.name || userInfo?.email || 'User'}</p>
                  <small>{userInfo?.email || ''}</small>
                </div>
                <Link to="/profile">My Profile</Link>
                <Link to="/settings">Settings</Link>
                <button onClick={handleLogout} className="logout-button">Logout</button>
              </div>
            </li>
          </>
        ) : (
          <>
            {/* For non-logged in users */}
            <li><Link to="/">Home</Link></li>
            <li><Link to="/directories">Directories</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/our-team">Our Team</Link></li>
            <li><Link to="/contact-us" className="contact-button">Contact Us</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;