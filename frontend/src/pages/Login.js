import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { login } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  const history = useHistory();
  const location = useLocation();
  
  // Get role from query parameter
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role') || 'login';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {roleParam === 'admin' ? 'Admin Login' : roleParam === 'cashier' ? 'Cashier Login' : 'Sign In'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your account to access the POS system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Username Field */}
            <div className="space-y-2">
              <label 
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-500"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-12 text-slate-900 placeholder-slate-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition-colors ${
                loading ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-5 text-center text-sm text-slate-500">
            <div className="flex justify-center gap-4">
              <span>Admin to Dashboard</span>
              <span>Cashier to POS</span>
            </div>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-6 text-center space-y-3 text-sm text-slate-600">
          <p>Need help? Contact your system administrator</p>
          <button
            onClick={() => history.push('/')}
            className="font-medium text-slate-900 hover:underline"
          >
            ← Back to Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;