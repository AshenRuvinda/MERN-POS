import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { adminRegister } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { UserPlus, Lock, AlertCircle, LogIn } from 'lucide-react';

const AdminRegister = () => {
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const history = useHistory();

  // Redirect if already logged in
  if (user) {
    history.push(user.userType === 'admin' ? '/dashboard' : '/pos');
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.password) {
      setError('Name and password are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await adminRegister(form);
      setForm({ name: '', password: '' });
      alert('Admin account created successfully! Please login.');
      history.push('/login');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Register</h1>
            <p className="mt-2 text-sm text-slate-600">Create the first admin account for the system.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserPlus className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onInput={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-500"
                  required
                  placeholder="Enter admin name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onInput={(e) => setForm({ ...form, password: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-500"
                  required
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-800"
            >
              Register Admin
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            <button
              onClick={() => history.push('/login?role=admin')}
              className="font-medium text-slate-900 hover:underline"
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;