import React from 'react';
import { useHistory } from 'react-router-dom';
import { User, LogOut, Shield, ShoppingCart, Menu, Bell, Settings } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        logout();
        history.push('/login');
      } catch (error) {
        // Fallback logout if context logout fails.
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  };

  const handleProfileClick = () => {
    if (user?.userType === 'admin') {
      history.push('/dashboard');
    } else {
      history.push('/pos');
    }
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.userType === 'admin';

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-200/80 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleProfileClick}
            >
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  POS System
                </h1>
                <p className="text-xs text-slate-500 hidden md:block">Point of Sale Management</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isAdmin
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <Shield className="h-3.5 w-3.5" />
                <span>{isAdmin ? 'Administrator' : 'Cashier'}</span>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAdmin && (
              <button className="relative hidden sm:inline-flex items-center justify-center p-2 rounded-lg border border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </button>
            )}

            {isAdmin && (
              <button className="hidden sm:inline-flex items-center justify-center p-2 rounded-lg border border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            )}

            <div 
              className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 cursor-pointer transition-colors"
              onClick={handleProfileClick}
            >
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-100">
                <User className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800 truncate max-w-32">
                  {user.username || (isAdmin ? 'Admin' : 'User')}
                </p>
                <p className="text-xs text-slate-500 hidden md:block">
                  {isAdmin ? 'System Administrator' : 'Sales Representative'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl transition-colors font-medium text-sm"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile user type badge */}
        <div className="md:hidden mt-3 flex justify-center">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isAdmin
              ? 'bg-violet-50 text-violet-700 border-violet-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <Shield className="h-3.5 w-3.5" />
            <span>{isAdmin ? 'Administrator' : 'Cashier'}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;