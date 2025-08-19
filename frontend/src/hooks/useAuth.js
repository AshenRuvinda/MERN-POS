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
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setUserData = (userData) => {
    console.log('useAuth: Setting user data:', userData);
    setUser(userData);
  };

  const logout = () => {
    console.log('useAuth: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
  };

  return { 
    user, 
    setUser: setUserData, 
    logout,
    loading 
  };
};

export default useAuth;