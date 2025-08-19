import React from 'react';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user || user.userType !== 'admin') {
    return <div className="text-red-500 text-center">Unauthorized Access</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <p className="text-gray-700">Welcome, Admin! Manage your POS system from here.</p>
      <div className="mt-4">
        <p>Use the sidebar to navigate to:</p>
        <ul className="list-disc ml-6">
          <li>Register Cashiers</li>
          <li>Manage Products</li>
          <li>View Stock</li>
          <li>Generate Reports</li>
          <li>Manage Users</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;