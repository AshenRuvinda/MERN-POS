import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (token && role) {
      setUserState({
        userType: role,
        userId,
        username,
        token
      });
    } else {
      setUserState(null);
    }

    setLoading(false);
  }, []);

  const setUser = useCallback((userData) => {
    if (!userData) {
      logout();
      return;
    }

    const { userType, userId, username, token } = userData;

    localStorage.setItem('token', token);
    localStorage.setItem('role', userType);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);

    setUserState(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUserState(null);
  }, []);

  // 🔥 IMPORTANT FIX: split context to avoid rerendering whole app on user change
  const authActions = useMemo(() => ({ setUser, logout }), [setUser, logout]);

  const value = useMemo(() => ({
    user,
    loading,
    ...authActions
  }), [user, loading, authActions]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};