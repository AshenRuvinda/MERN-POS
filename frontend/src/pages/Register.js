import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { register } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { 
  UserPlus, 
  User, 
  Lock, 
  Calendar, 
  Phone, 
  Check, 
  X,
  AlertCircle,
  Shield,
  ArrowRight
} from 'lucide-react';

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

  // Redirect non-admins
  if (user && user.userType !== 'admin') {
    history.push('/pos');
    return null;
  }

  // Show error if user is not authenticated or not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to register new cashiers.</p>
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

  const InputField = ({ 
    label, 
    icon, 
    type = "text", 
    placeholder, 
    value, 
    onChange, 
    error, 
    required = true 
  }) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
        <div className="text-slate-500">{icon}</div>
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-slate-50/50 ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          required={required}
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className={error ? 'text-red-400' : 'text-slate-400'}>
            {icon}
          </div>
        </div>
        {error && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <X className="h-4 w-4 text-red-400" />
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Register New Cashier</h1>
            <p className="text-slate-600">Add a new team member to your POS system</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 inline-flex items-center space-x-2">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Admin Access Required</span>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Cashier Details</h2>
                  <p className="text-sm text-slate-600">Fill in all required information</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Registration Failed:</strong>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="First Name"
                    icon={<User className="h-4 w-4" />}
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    error={validationErrors.firstName}
                  />
                  
                  <InputField
                    label="Last Name"
                    icon={<User className="h-4 w-4" />}
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    error={validationErrors.lastName}
                  />
                </div>

                {/* Birthday and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Date of Birth"
                    icon={<Calendar className="h-4 w-4" />}
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    error={validationErrors.birthday}
                  />
                  
                  <InputField
                    label="Phone Number"
                    icon={<Phone className="h-4 w-4" />}
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    error={validationErrors.phoneNumber}
                  />
                </div>
              </div>

              {/* Account Information Section */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Account Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center space-x-2 ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-emerald-500/25 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Register Cashier</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Registration Guidelines</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• All fields marked with * are required</li>
                <li>• Username must be unique and at least 3 characters long</li>
                <li>• Password must be at least 6 characters long</li>
                <li>• Cashier must be at least 16 years old</li>
                <li>• Phone number should be in a valid format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;