import React from 'react';
import { useHistory } from 'react-router-dom';
import { User, LogOut, Shield, ShoppingCart } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl border-b border-slate-700">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  POS System
                </h1>
                <p className="text-xs text-slate-400">Point of Sale</p>
              </div>
            </div>
            
            {/* User Type Badge */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                user.userType === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
              }`}>
                <Shield className="h-3.5 w-3.5" />
                <span>{user.userType === 'admin' ? 'Administrator' : 'Cashier'}</span>
              </div>
            </div>
          </div>
          
          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
              <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg">
                <User className="h-4 w-4 text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user.username || (user.userType === 'admin' ? 'Admin' : 'User')}
                </p>
                <p className="text-xs text-slate-400">
                  {user.userType === 'admin' ? 'System Administrator' : 'Sales Representative'}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;