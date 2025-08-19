import React from 'react';
import { useHistory } from 'react-router-dom';
import { User, LogOut, Shield, ShoppingCart, Menu, Bell, Settings } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    console.log('Navbar: Logout button clicked');
    
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        console.log('Navbar: User confirmed logout');
        logout();
        history.push('/login');
      } catch (error) {
        console.error('Navbar: Error during logout:', error);
        // Fallback logout
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
    console.log('Navbar: No user found, not rendering navbar');
    return null;
  }

  console.log('Navbar: Rendering for user:', user);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b border-slate-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left Section - Logo, Brand, and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle - Only show for admin users */}
            {user.userType === 'admin' && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Logo and Brand */}
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  POS System
                </h1>
                <p className="text-xs text-slate-400 hidden md:block">Point of Sale Management</p>
              </div>
            </div>
            
            {/* User Type Badge - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                user.userType === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
              }`}>
                <Shield className="h-3.5 w-3.5" />
                <span>{user.userType === 'admin' ? 'Administrator' : 'Cashier'}</span>
              </div>
            </div>
          </div>
          
          {/* Right Section - User Info and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications - Admin only */}
            {user.userType === 'admin' && (
              <button className="relative bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors hidden sm:block">
                <Bell className="h-4 w-4 text-slate-300" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </button>
            )}

            {/* Settings - Admin only */}
            {user.userType === 'admin' && (
              <button className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors hidden sm:block">
                <Settings className="h-4 w-4 text-slate-300" />
              </button>
            )}
            
            {/* User Profile */}
            <div 
              className="flex items-center space-x-2 sm:space-x-3 bg-slate-800/60 hover:bg-slate-700/60 px-3 sm:px-4 py-2 rounded-xl border border-slate-700 cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={handleProfileClick}
            >
              <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-slate-200" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white truncate max-w-32">
                  {user.username || (user.userType === 'admin' ? 'Admin' : 'User')}
                </p>
                <p className="text-xs text-slate-400 hidden md:block">
                  {user.userType === 'admin' ? 'System Administrator' : 'Sales Representative'}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25 font-medium text-sm"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile User Type Badge */}
        <div className="md:hidden mt-3 flex justify-center">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
            user.userType === 'admin' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
          }`}>
            <Shield className="h-3.5 w-3.5" />
            <span>{user.userType === 'admin' ? 'Administrator' : 'Cashier'}</span>
          </div>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="hidden sm:block absolute top-2 right-2 text-xs text-slate-400 bg-slate-800/30 px-2 py-1 rounded opacity-50">
            Debug: {user.userId?.slice(-4) || 'No ID'}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;