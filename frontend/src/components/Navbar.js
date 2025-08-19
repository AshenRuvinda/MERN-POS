import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, setUser } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    history.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user?.userType === 'admin' ? '/dashboard' : '/pos'} className="text-xl font-bold">
          POS System
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm">
                Logged in as {user.userType === 'admin' ? 'Admin' : 'Cashier'}
              </span>
              {user.userType === 'admin' && (
                <div className="space-x-4">
                  <Link to="/dashboard" className="hover:underline">
                    Dashboard
                  </Link>
                  <Link to="/register" className="hover:underline">
                    Register Cashier
                  </Link>
                  <Link to="/products" className="hover:underline">
                    Products
                  </Link>
                  <Link to="/stock" className="hover:underline">
                    Stock
                  </Link>
                  <Link to="/reports" className="hover:underline">
                    Reports
                  </Link>
                  <Link to="/users" className="hover:underline">
                    Users
                  </Link>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;