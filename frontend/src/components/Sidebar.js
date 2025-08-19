import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4">
      <ul>
        <li className="mb-2"><Link to="/dashboard" className="block p-2 hover:bg-gray-700">Dashboard</Link></li>
        <li className="mb-2"><Link to="/products" className="block p-2 hover:bg-gray-700">Products</Link></li>
        <li className="mb-2"><Link to="/stock" className="block p-2 hover:bg-gray-700">Stock</Link></li>
        <li className="mb-2"><Link to="/reports" className="block p-2 hover:bg-gray-700">Reports</Link></li>
        <li className="mb-2"><Link to="/users" className="block p-2 hover:bg-gray-700">Users</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;