import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
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
    <div className="fixed left-0 top-0 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen border-r border-slate-700 flex flex-col overflow-y-auto z-40">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-200">Admin Panel</h2>
            <p className="text-xs text-slate-400">Management Console</p>
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
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-transparent hover:border-slate-600/50'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/80'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block">{item.label}</span>
                  <span className={`text-xs ${
                    isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'
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
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick Access</h3>
          <div className="space-y-2">
            <Link
              to="/products"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors text-xs"
            >
              <Package className="h-3 w-3" />
              <span>Add Product</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs"
            >
              <UserPlus className="h-3 w-3" />
              <span>Add Cashier</span>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">System Status</span>
          </div>
          <p className="text-xs text-slate-400">
            All systems operational
          </p>
          <p className="text-xs text-slate-500 mt-1">
            © 2025 POS 1.1 - All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;