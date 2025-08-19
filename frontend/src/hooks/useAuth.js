import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('useAuth: Decoded token:', decoded); // Debug log
        if (decoded.userType) {
          setUser({ userType: decoded.userType, userId: decoded.userId });
        } else {
          console.error('useAuth: No userType in token'); // Debug log
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('useAuth: Invalid token', error.message); // Debug log
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      console.log('useAuth: No token found'); // Debug log
      setUser(null);
    }
  }, []);

  return { user, setUser };
};

export default useAuth;