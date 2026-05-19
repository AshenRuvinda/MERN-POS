import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { register } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { UserPlus, User, Lock, Calendar, Phone, Check, X, AlertCircle, Shield } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { user, loading } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (user && user.userType !== 'admin') {
      history.replace('/pos');
    }
  }, [history, user]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Authentication required</h2>
          <p className="mt-2 text-sm text-slate-600">Please log in as an admin to register a new cashier.</p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.username.trim()) errors.username = 'Username is required';
    else if (form.username.length < 3) errors.username = 'Username must be at least 3 characters';
    
    if (!form.birthday) errors.birthday = 'Birthday is required';
    else {
      const age = new Date().getFullYear() - new Date(form.birthday).getFullYear();
      if (age < 16) errors.birthday = 'Cashier must be at least 16 years old';
    }
    
    if (!form.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    else if (!/^[\d\s\-\+\(\)]+$/.test(form.phoneNumber)) errors.phoneNumber = 'Invalid phone number format';
    
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(form);
      
      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        birthday: '',
        phoneNumber: '',
        password: ''
      });
      
      // Show success message and redirect
      alert('Cashier registered successfully!');
      history.push('/users');
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Failed to register cashier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, icon, type = 'text', placeholder, value, onChange, error, required = true }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="text-slate-500">{icon}</span>
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e)}
          required={required}
          className={`block w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 outline-none transition-colors ${
            error ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-slate-900'
          }`}
        />
        {error && <X className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-red-500" />}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Shield className="h-3.5 w-3.5" />
              Admin access required
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Register cashier</h1>
                <p className="mt-1 text-sm text-slate-600">Create a new cashier account for the POS system.</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium">Registration failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Cashier information</h2>
                <p className="text-sm text-slate-600">Fill in the details below to add a cashier.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Personal details</h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <InputField
                    label="First name"
                    icon={<User className="h-4 w-4" />}
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    error={validationErrors.firstName}
                  />
                  <InputField
                    label="Last name"
                    icon={<User className="h-4 w-4" />}
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    error={validationErrors.lastName}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <InputField
                    label="Date of birth"
                    icon={<Calendar className="h-4 w-4" />}
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    error={validationErrors.birthday}
                  />
                  <InputField
                    label="Phone number"
                    icon={<Phone className="h-4 w-4" />}
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    error={validationErrors.phoneNumber}
                  />
                </div>
              </div>

              <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Account details</h3>
                </div>

                <InputField
                  label="Username"
                  icon={<User className="h-4 w-4" />}
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  error={validationErrors.username}
                />

                <InputField
                  label="Password"
                  icon={<Lock className="h-4 w-4" />}
                  type="password"
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={validationErrors.password}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  Password must be at least 6 characters long.
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => history.push('/users')}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-slate-400 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    <span>Registering</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Register cashier</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;