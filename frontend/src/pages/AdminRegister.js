import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { adminRegister } from '../utils/api';
import useAuth from '../hooks/useAuth';

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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Registration</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
        >
          Register Admin
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;