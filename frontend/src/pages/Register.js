import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { register } from '../utils/api';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    birthday: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const history = useHistory();

  // Redirect non-admins
  if (user && user.userType !== 'admin') {
    history.push('/pos');
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.username || !form.birthday || !form.phoneNumber || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await register(form);
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        birthday: '',
        phoneNumber: '',
        password: ''
      });
      alert('Cashier registered successfully!');
      history.push('/users');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register cashier');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Register Cashier</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Birthday</label>
          <input
            type="date"
            value={form.birthday}
            onChange={e => setForm({ ...form, birthday: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
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
          Register Cashier
        </button>
      </form>
    </div>
  );
};

export default Register;