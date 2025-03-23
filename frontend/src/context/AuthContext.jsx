import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    console.log('Checking auth - token exists:', !!token);
    
    try {
      // If token exists, try to get user data from localStorage
      if (token) {
        const storedUser = localStorage.getItem('user');
        console.log('Stored user data found:', !!storedUser);
        
        try {
          // Try to parse user data
          const userData = storedUser ? JSON.parse(storedUser) : null;
          
          // If we have user data, use it
          if (userData && (userData.id || userData.email)) {
            console.log('Setting user from localStorage:', userData.email || userData.id);
            setUser(userData);
          } else {
            // Create a basic user object if we have a token but no valid user data
            console.log('Creating basic user object from token');
            setUser({ id: 'authenticated', authenticated: true });
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          // Create a basic user object if parsing fails
          setUser({ id: 'authenticated', authenticated: true });
        }
        return true;
      } else {
        console.log('No token found, user not authenticated');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      return false;
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    console.log('AuthContext initialized');
    checkAuth();
  }, []);

  const login = async (data) => {
    console.log('Login called with data:', JSON.stringify(data));
    try {
      // Extract token from response
      const { token, user: userData } = data;
      
      if (!token) {
        throw new Error('Invalid token received');
      }
      
      // Token should already be stored in localStorage from Login component
      // But let's ensure it's there as a fallback
      if (localStorage.getItem('token') !== token) {
        console.log('Storing token in localStorage from AuthContext');
        localStorage.setItem('token', token);
      }
      
      // Create initial user object with data we have
      const initialUser = {
        id: userData?.id || 'temp-id',
        email: data.email || userData?.email || 'user@example.com',
        name: userData?.name || userData?.username || 'User',
        authenticated: true,
        ...(userData || {})
      };
      
      // Set user in state and localStorage
      console.log('Setting initial user:', initialUser.email);
      setUser(initialUser);
      localStorage.setItem('user', JSON.stringify(initialUser));
      
      // Don't wait for profile fetch to complete
      // Just kick it off and let it update in the background if successful
      getUserProfile().then(profileData => {
        if (profileData) {
          const fullUser = { ...initialUser, ...profileData };
          console.log('Profile data fetched successfully, updating user');
          setUser(fullUser);
          localStorage.setItem('user', JSON.stringify(fullUser));
        }
      }).catch(err => {
        console.log('Profile fetch failed, continuing with basic user data:', err.message);
      });
      
      return true;
    } catch (error) {
      console.error('Error in login:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Signup called with data:', JSON.stringify(userData));
      
      // Extract token and other user data
      const { token, email, fullName } = userData;
      
      if (!token) {
        throw new Error('Invalid token received during signup');
      }
      
      // Store token in localStorage (should already be done in Signup component)
      if (localStorage.getItem('token') !== token) {
        console.log('Storing token in localStorage from AuthContext signup');
        localStorage.setItem('token', token);
      }
      
      // Create user object with available data
      const userObj = {
        id: userData.id || 'temp-id',
        email: email || userData.email || 'user@example.com',
        fullName: fullName || userData.fullName || userData.name || 'User',
        authenticated: true,
        ...(userData.user || {})
      };
      
      // Set user in state and localStorage
      console.log('Setting user in signup:', userObj.email);
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Attempt to fetch profile data but don't block the process
      getUserProfile().then(profileData => {
        if (profileData) {
          const fullUser = { ...userObj, ...profileData };
          console.log('Profile data fetched after signup, updating user');
          setUser(fullUser);
          localStorage.setItem('user', JSON.stringify(fullUser));
        }
      }).catch(err => {
        console.log('Profile fetch after signup failed, continuing with basic user data:', err.message);
      });
      
      return true;
    } catch (error) {
      console.error('Error in signup:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out');
    
    // Clear all user data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any session data
    sessionStorage.removeItem('justLoggedIn');
    sessionStorage.removeItem('loginTimestamp');
    sessionStorage.removeItem('justSignedUp');
    sessionStorage.removeItem('signupTimestamp');
    sessionStorage.removeItem('lastLoginEmail');
    
    // Clear user from state
    setUser(null);
    
    // Force a fresh reload of the application
    console.log('Logout complete, redirecting to home page');
  };

  const isAuthenticated = () => {
    // Check if we have a token and have completed the auth check
    const hasToken = !!localStorage.getItem('token');
    console.log('isAuthenticated called:', hasToken, 'User:', !!user);
    return hasToken;
  };

  if (loading) {
    return <div>Loading authentication state...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading,
        isAuthenticated,
        authChecked,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};