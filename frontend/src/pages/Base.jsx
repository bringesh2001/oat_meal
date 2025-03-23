import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import '../styles/Base.css';

function Base() {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  // Basic authentication logging without redirection
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const isAuthenticated = !!token;
    
    console.log('Base: Path =', location.pathname);
    console.log('Base: Token exists =', !!token);
    console.log('Base: User exists =', !!storedUser);
    console.log('Base: Is authenticated =', isAuthenticated);
  }, [location.pathname]);

  return (
    <div className="base-container">
      <Navbar />
      <main className="content-container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Base;