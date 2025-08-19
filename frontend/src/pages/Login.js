import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { login } from '../utils/api';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Client-side validation
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login for:', form.username);
      const response = await login(form);
      const { token, role, user } = response.data;
      
      console.log('Login response:', { token, role, user });
      
      // Store auth data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('username', user.username);
      
      // Set user in auth context
      setUser({ 
        userType: role, 
        userId: user.id,
        username: user.username,
        token: token 
      });
      
      // Role-based redirection with validation
      if (role === 'admin') {
        console.log('Redirecting admin to dashboard');
        history.push('/dashboard');
      } else if (role === 'cashier') {
        console.log('Redirecting cashier to POS');
        history.push('/pos');
      } else {
        // Handle unexpected role
        setError('Invalid user role');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setUser(null);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else if (error.response?.status === 403) {
        setError('Account is inactive or suspended');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
      
      // Clear any stored data on error
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          POS System Login
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
            disabled={loading}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            disabled={loading}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded font-medium transition duration-200 ${
            loading 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Admin users will be redirected to Dashboard</p>
          <p>Cashier users will be redirected to POS</p>
        </div>
      </form>
    </div>
  );
};

export default Login;