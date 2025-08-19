import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, FileText, Users } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/stock', label: 'Stock', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen border-r border-slate-700">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200">Navigation</h2>
        <p className="text-sm text-slate-400 mt-1">Admin Panel</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200 group border border-transparent hover:border-slate-600/50"
                >
                  <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-slate-600/80 transition-all duration-200">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            © 2025 POS System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;