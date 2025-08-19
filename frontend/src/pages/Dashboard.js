import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getProducts, getSales, getUsers, getReports } from '../utils/api';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle,
  Calendar,
  BarChart3,
  PlusCircle,
  Activity,
  Target,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    products: [],
    sales: [],
    users: [],
    reports: { daily: [], weekly: [], monthly: [] }
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalUsers: 0,
    lowStockItems: 0,
    todaysSales: 0,
    thisWeekSales: 0,
    thisMonthSales: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!loading && user && user.token && user.userType === 'admin') {
        setIsLoading(true);
        setError('');

        try {
          console.log('Dashboard: Fetching all data...');
          
          // Fetch all data in parallel
          const [productsRes, salesRes, usersRes] = await Promise.allSettled([
            getProducts(),
            getSales().catch(() => ({ data: [] })), // Handle if sales endpoint fails
            getUsers(),
          ]);

          const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
          const sales = salesRes.status === 'fulfilled' ? salesRes.value.data : [];
          const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];

          setDashboardData({
            products,
            sales,
            users,
            reports: { daily: [], weekly: [], monthly: [] }
          });

          // Calculate statistics
          const lowStockItems = products.filter(product => product.stock <= 10).length;
          const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
          
          // Calculate time-based sales
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

          const todaysSales = sales.filter(sale => 
            new Date(sale.createdAt) >= todayStart
          ).reduce((sum, sale) => sum + (sale.total || 0), 0);

          const thisWeekSales = sales.filter(sale => 
            new Date(sale.createdAt) >= weekStart
          ).reduce((sum, sale) => sum + (sale.total || 0), 0);

          const thisMonthSales = sales.filter(sale => 
            new Date(sale.createdAt) >= monthStart
          ).reduce((sum, sale) => sum + (sale.total || 0), 0);

          setStats({
            totalProducts: products.length,
            totalSales: sales.length,
            totalUsers: users.length,
            lowStockItems,
            todaysSales,
            thisWeekSales,
            thisMonthSales
          });

        } catch (error) {
          console.error('Dashboard: Error fetching data:', error);
          setError('Failed to load dashboard data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user, loading]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Check authorization
  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Unauthorized Access</h2>
          <p className="text-slate-600">Admin access required to view the dashboard.</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, trend, trendValue, link }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color.bg} ${color.shadow}`}>
            {icon}
          </div>
          {link && (
            <Link 
              to={link}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Eye className="h-5 w-5" />
            </Link>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          
          {trend && (
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, link }) => (
    <Link 
      to={link}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${color.bg} ${color.shadow} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </Link>
  );

  const RecentActivityItem = ({ activity, time, type }) => {
    const typeColors = {
      sale: 'bg-emerald-100 text-emerald-800',
      product: 'bg-blue-100 text-blue-800',
      user: 'bg-purple-100 text-purple-800',
      stock: 'bg-orange-100 text-orange-800'
    };

    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${type === 'sale' ? 'bg-emerald-500' : type === 'product' ? 'bg-blue-500' : type === 'user' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
          <span className="text-sm text-slate-700">{activity}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
            {type}
          </span>
          <span className="text-xs text-slate-500">{time}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user.username || 'Admin'}! Here's your business overview.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-sm font-medium text-slate-700">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6 text-white" />}
          color={{ bg: 'bg-gradient-to-br from-blue-500 to-blue-600', shadow: 'shadow-lg shadow-blue-500/25' }}
          link="/products"
        />
        <StatCard
          title="Total Sales"
          value={`$${stats.thisMonthSales.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color={{ bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', shadow: 'shadow-lg shadow-emerald-500/25' }}
          trend="up"
          trendValue="This month"
          link="/reports"
        />
        <StatCard
          title="Active Users"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6 text-white" />}
          color={{ bg: 'bg-gradient-to-br from-purple-500 to-purple-600', shadow: 'shadow-lg shadow-purple-500/25' }}
          link="/users"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color={{ bg: 'bg-gradient-to-br from-orange-500 to-orange-600', shadow: 'shadow-lg shadow-orange-500/25' }}
          trend={stats.lowStockItems > 5 ? "down" : "up"}
          trendValue={stats.lowStockItems > 5 ? "Action needed" : "Good status"}
          link="/stock"
        />
      </div>

      {/* Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Today's Sales</h3>
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            ${stats.todaysSales.toFixed(2)}
          </div>
          <p className="text-sm text-slate-600">Sales made today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">This Week</h3>
            <div className="bg-blue-500 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${stats.thisWeekSales.toFixed(2)}
          </div>
          <p className="text-sm text-slate-600">Weekly performance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">This Month</h3>
            <div className="bg-purple-500 p-2 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ${stats.thisMonthSales.toFixed(2)}
          </div>
          <p className="text-sm text-slate-600">Monthly revenue</p>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          
          <div className="space-y-4">
            <QuickActionCard
              title="Add New Product"
              description="Add products to your inventory"
              icon={<PlusCircle className="h-5 w-5 text-white" />}
              color={{ bg: 'bg-gradient-to-br from-blue-500 to-blue-600', shadow: 'shadow-lg shadow-blue-500/25' }}
              link="/products"
            />
            <QuickActionCard
              title="Register Cashier"
              description="Add new team members"
              icon={<Users className="h-5 w-5 text-white" />}
              color={{ bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', shadow: 'shadow-lg shadow-emerald-500/25' }}
              link="/register"
            />
            <QuickActionCard
              title="Update Stock"
              description="Manage inventory levels"
              icon={<Package className="h-5 w-5 text-white" />}
              color={{ bg: 'bg-gradient-to-br from-purple-500 to-purple-600', shadow: 'shadow-lg shadow-purple-500/25' }}
              link="/stock"
            />
            <QuickActionCard
              title="View Reports"
              description="Analyze sales performance"
              icon={<BarChart3 className="h-5 w-5 text-white" />}
              color={{ bg: 'bg-gradient-to-br from-orange-500 to-orange-600', shadow: 'shadow-lg shadow-orange-500/25' }}
              link="/reports"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading activity...</p>
              </div>
            ) : (
              <>
                <RecentActivityItem
                  activity="New product added to inventory"
                  time="2 hours ago"
                  type="product"
                />
                <RecentActivityItem
                  activity="Sale completed - $45.99"
                  time="3 hours ago"
                  type="sale"
                />
                <RecentActivityItem
                  activity="Stock updated for 5 items"
                  time="5 hours ago"
                  type="stock"
                />
                <RecentActivityItem
                  activity="New cashier registered"
                  time="1 day ago"
                  type="user"
                />
                <RecentActivityItem
                  activity="Sale completed - $123.45"
                  time="1 day ago"
                  type="sale"
                />
                
                <div className="pt-4 border-t border-slate-100">
                  <Link 
                    to="/reports"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <span>View all activity</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;