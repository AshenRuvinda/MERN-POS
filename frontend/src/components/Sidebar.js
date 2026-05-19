import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  UserPlus,
  Archive 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Analytics' },
    { path: '/products', label: 'Products', icon: Package, description: 'Manage Inventory' },
    { path: '/register', label: 'Add Cashier', icon: UserPlus, description: 'Register New Staff' },
    { path: '/stock', label: 'Stock', icon: Archive, description: 'Inventory Levels' },
    { path: '/users', label: 'Manage Users', icon: Users, description: 'User Administration' },
    { path: '/reports', label: 'Reports', icon: FileText, description: 'Sales Analytics' },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col overflow-y-auto border-r border-emerald-200 bg-white text-slate-800 shadow-sm">
      {/* Sidebar Header */}
      <div className="flex-shrink-0 border-b border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-white/20 p-2 shadow-sm">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-emerald-100">Management Console</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveLink(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-slate-900 border-transparent hover:border-emerald-200'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block">{item.label}</span>
                  <span className={`text-xs ${
                    isActive ? 'text-emerald-100' : 'text-slate-500 group-hover:text-slate-600'
                  }`}>
                    {item.description}
                  </span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-emerald-800">Quick Access</h3>
          <div className="space-y-2">
            <Link
              to="/products"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-700 transition-colors hover:bg-white hover:text-emerald-700"
            >
              <Package className="h-3 w-3" />
              <span>Add Product</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-700 transition-colors hover:bg-white hover:text-emerald-700"
            >
              <UserPlus className="h-3 w-3" />
              <span>Add Cashier</span>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="flex-shrink-0 border-t border-emerald-200 p-4">
        <div className="rounded-lg border border-emerald-200 bg-white p-3">
          <div className="mb-2 flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
            <span className="text-xs font-medium text-slate-700">System Status</span>
          </div>
          <p className="text-xs text-slate-600">
            All systems operational
          </p>
          <p className="mt-1 text-xs text-slate-400">
            © 2025 POS 1.1 - All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;