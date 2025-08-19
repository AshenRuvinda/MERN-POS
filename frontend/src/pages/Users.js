import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getUsers, register, updateUser } from '../utils/api';
import { 
  Users as UsersIcon, 
  UserPlus, 
  User, 
  Lock, 
  Shield, 
  UserCheck, 
  UserX, 
  ToggleLeft, 
  ToggleRight,
  Crown,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Activity
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Users = () => {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'cashier', isActive: true });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!loading && user && user.token) {
        try {
          setError('');
          const response = await getUsers();
          setUsers(response.data);
        } catch (error) {
          console.error('Failed to fetch users:', error);
          setError(error.response?.data?.message || 'Failed to load users');
        }
      }
    };
    fetchUsers();
  }, [user, loading]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await register(form);
      setForm({ username: '', password: '', role: 'cashier', isActive: true });
      const response = await getUsers();
      setUsers(response.data);
      setSuccessMessage('User added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add user:', error);
      setError(error.response?.data?.error || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id, user) => {
    try {
      setError('');
      await updateUser(id, user);
      const response = await getUsers();
      setUsers(response.data);
      setSuccessMessage(`User ${user.isActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    cashiers: users.filter(u => u.role === 'cashier').length
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-800">Loading User Management...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated or not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-slate-800">Please log in to access user management.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-slate-800">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-700">Manage your team members and their access levels</p>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">{userStats.total}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Total Users</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-500 p-2 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">{userStats.active}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Active Users</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{userStats.admins}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Administrators</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-600">{userStats.cashiers}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Cashiers</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span><strong>Error:</strong> {error}</span>
          </div>
        )}
      </div>

      {/* Add User Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New User</h2>
              <p className="text-sm text-slate-700">Create a new team member account</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <User className="h-4 w-4 text-slate-600" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 text-slate-900 placeholder-slate-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Lock className="h-4 w-4 text-slate-600" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 text-slate-900 placeholder-slate-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <span>Role</span>
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 text-slate-900"
                  disabled={isSubmitting}
                >
                  <option value="admin">Administrator</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-emerald-500/25 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Add User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
              <p className="text-sm text-slate-700">Manage user accounts and permissions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-800">Showing {filteredUsers.length} of {users.length} users</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by username or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-500 bg-white"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Filter className="h-3 w-3 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                {users.length === 0 ? 'No users found' : 'No matching users'}
              </h3>
              <p className="text-slate-600">
                {users.length === 0 ? 'Add your first team member using the form above' : 'Try adjusting your search terms'}
              </p>
            </div>
          ) : (
            <Table
              headers={['User Details', 'Role & Permissions', 'Account Status', 'Joined Date', 'Actions']}
              data={filteredUsers}
              renderRow={user => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors duration-200">
                  {/* User Details */}
                  <td className="border-b border-slate-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                        user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">{user.username}</h4>
                        <p className="text-sm text-slate-600">ID: {user._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role & Permissions */}
                  <td className="border-b border-slate-200 p-6">
                    <div className="space-y-2">
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <Crown className="h-4 w-4" />
                            <span>Administrator</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            <span>Cashier</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        {user.role === 'admin' ? 'Full system access' : 'POS system only'}
                      </div>
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="border-b border-slate-200 p-6">
                    <div className="flex items-center space-x-3">
                      {user.isActive ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="border-b border-slate-200 p-6">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="border-b border-slate-200 p-6">
                    <button
                      onClick={() => handleUpdate(user._id, { ...user, isActive: !user.isActive })}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 ${
                        user.isActive
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/25'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-green-500/25'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-4 w-4" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;