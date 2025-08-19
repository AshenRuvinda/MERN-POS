import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        
        console.log('useAuth: Initializing auth with:', { token: !!token, role, userId, username });
        
        if (token && role) {
          // Simple validation - just check if token and role exist
          setUser({ 
            userType: role, 
            userId: userId,
            username: username,
            token: token 
          });
          console.log('useAuth: User authenticated:', { userType: role, userId: userId });
        } else {
          console.log('useAuth: No token or role found');
          setUser(null);
        }
      } catch (error) {
        console.error('useAuth: Error initializing auth:', error.message);
        // Clear invalid data
        clearAuthData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    console.log('useAuth: Clearing all auth data from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  };

  const setUserData = (userData) => {
    console.log('useAuth: Setting user data:', userData);
    setUser(userData);
  };

  const logout = () => {
    console.log('useAuth: Starting logout process');
    
    // Clear localStorage
    clearAuthData();
    
    // Clear user state
    setUser(null);
    
    // Force page reload to ensure clean state
    console.log('useAuth: Logout complete, reloading page');
    window.location.href = '/login';
  };

  return { 
    user, 
    setUser: setUserData, 
    logout,
    loading 
  };
};

export default useAuth;