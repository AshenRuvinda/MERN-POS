import React from 'react';
import { useHistory } from 'react-router-dom';
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
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">POS System</h1>
          <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-medium">
            {user.userType === 'admin' ? 'Administrator' : 'Cashier'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Welcome, {user.username || (user.userType === 'admin' ? 'Admin' : 'User')}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;