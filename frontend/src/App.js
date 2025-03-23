import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Base from './pages/Base';
import Home from './pages/Home';
import Directories from './pages/Directories';
import DirectoryDetail from './pages/DirectoryDetail';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import './App.css';

// Protected route component that checks authentication and redirects if necessary
const ProtectedRoute = ({ component: Component }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  console.log('ProtectedRoute - Auth check:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // Render the protected component
  return <Component />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Auth routes outside of Base layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes for authenticated users with Base layout */}
            <Route element={<Base />}>
              <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
              <Route path="/chat" element={<ProtectedRoute component={Chat} />} />
            </Route>
            
            {/* Public routes with Base layout */}
            <Route path="/" element={<Base />}>
              {/* Home route */}
              <Route index element={<Home />} />
              
              {/* Directory routes - publicly accessible */}
              <Route path="directories" element={<Directories />} />
              <Route path="directory/:directoryType" element={<DirectoryDetail />} />
              
              {/* Redirect any other paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;