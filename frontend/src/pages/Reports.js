import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getReports, getSales } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { formatLkr } from '../utils/currency';
import { FileText, TrendingUp, Calendar, Banknote } from 'lucide-react';

const Reports = () => {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState({ daily: [], weekly: [], monthly: [] });
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const periodLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  const buildReportsFromSales = (sales = []) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      daily: sales.filter((sale) => new Date(sale.createdAt) >= startOfToday),
      weekly: sales.filter((sale) => new Date(sale.createdAt) >= startOfWeek),
      monthly: sales.filter((sale) => new Date(sale.createdAt) >= startOfMonth),
    };
  };

  const getReportTotals = () => {
    const allReports = [...(reports.daily || []), ...(reports.weekly || []), ...(reports.monthly || [])];
    const uniqueSales = new Map();

    allReports.forEach((sale) => {
      if (sale && sale._id) {
        uniqueSales.set(sale._id, sale);
      }
    });

    const totalRevenue = Array.from(uniqueSales.values()).reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    return {
      dailyCount: reports.daily?.length || 0,
      weeklyCount: reports.weekly?.length || 0,
      monthlyCount: reports.monthly?.length || 0,
      totalSales: uniqueSales.size,
      totalRevenue,
    };
  };

  const getSelectedSales = () => reports[selectedPeriod] || [];

  const buildGraphData = (sales = [], period = 'weekly') => {
    if (period === 'daily') {
      return Array.from({ length: 24 }, (_, hour) => {
        const hourSales = sales.filter((sale) => new Date(sale.createdAt).getHours() === hour);
        return {
          label: `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'AM' : 'PM'}`,
          value: hourSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
        };
      }).filter((entry) => entry.value > 0);
    }

    if (period === 'weekly') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + index);
        const daySales = sales.filter((sale) => new Date(sale.createdAt).toDateString() === day.toDateString());
        return {
          label: day.toLocaleDateString(undefined, { weekday: 'short' }),
          value: daySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
        };
      });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = new Date(startOfMonth);
      day.setDate(startOfMonth.getDate() + index);
      const daySales = sales.filter((sale) => new Date(sale.createdAt).toDateString() === day.toDateString());
      return {
        label: `${day.getDate()}`,
        value: daySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      };
    });
  };

  const getSelectedPeriodSummary = () => {
    const selectedSales = getSelectedSales();
    const totalRevenue = selectedSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const averageSale = selectedSales.length ? totalRevenue / selectedSales.length : 0;
    const peakSale = selectedSales.reduce((max, sale) => Math.max(max, Number(sale.total || 0)), 0);

    return {
      count: selectedSales.length,
      totalRevenue,
      averageSale,
      peakSale,
    };
  };

  const fetchReports = async () => {
    if (!loading && user && user.token) {
      console.log('Reports: User authenticated, fetching reports...');
      setIsLoading(true);
      setError('');
      
      try {
        console.log('Reports: Making API call to /sales/reports and /sales');
        const [reportsResponse, salesResponse] = await Promise.allSettled([
          getReports(),
          getSales(),
        ]);

        const reportData = reportsResponse.status === 'fulfilled' ? reportsResponse.value.data : null;
        const salesData = salesResponse.status === 'fulfilled' ? salesResponse.value.data : [];

        const normalizedReports = reportData && typeof reportData === 'object'
          ? reportData
          : buildReportsFromSales(salesData);

        const fallbackReports = buildReportsFromSales(salesData);

        setReports({
          daily: normalizedReports.daily || fallbackReports.daily,
          weekly: normalizedReports.weekly || fallbackReports.weekly,
          monthly: normalizedReports.monthly || fallbackReports.monthly,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Reports: API error:', error);
        console.error('Reports: Error response:', error.response);
        console.error('Reports: Error status:', error.response?.status);
        console.error('Reports: Error data:', error.response?.data);
        
        let errorMessage = 'Failed to load reports';
        if (error.response?.status === 400) {
          errorMessage = error.response?.data?.message || error.response?.data?.error || 'Bad request - please check your data';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Reports: Waiting for auth...', { loading, user: !!user });
    }
  };

  useEffect(() => {
    fetchReports();
    const intervalId = window.setInterval(fetchReports, 15000);

    return () => window.clearInterval(intervalId);
  }, [user, loading]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-white"></div>
      </div>
    );
  }

  // Show error if user is not authenticated or not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access reports.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access reports.</p>
        </div>
      </div>
    );
  }

  const totals = getReportTotals();
  const selectedSales = getSelectedSales();
  const selectedSummary = getSelectedPeriodSummary();
  const graphData = buildGraphData(selectedSales, selectedPeriod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Sales Reports</h1>
            <p className="text-slate-600">View and analyze your sales performance</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></div>
            <span>Live refresh every 15 seconds</span>
          </div>
          {lastUpdated && (
            <div className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <span className="font-medium text-slate-800">Last updated:</span>
              <span>{lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Refreshing reports...</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Daily reports</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totals.dailyCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Weekly reports</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totals.weeklyCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Monthly reports</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totals.monthlyCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total revenue</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{formatLkr(totals.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Show error message if there's an API error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong>Error Loading Reports:</strong>
              <p>{error}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Technical Details</summary>
                <div className="mt-2 text-sm">
                  <p>This is likely a backend issue. Check:</p>
                  <ul className="list-disc ml-5 mt-1">
                    <li>Is the backend server running on port 5000?</li>
                    <li>Does the /api/sales/reports endpoint exist?</li>
                    <li>Are there any sales records in the database?</li>
                    <li>Check the browser Network tab for the exact error</li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Sales Overview</h3>
                  <p className="text-sm text-slate-600">Filter daily, weekly, or monthly sales in one place</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700" htmlFor="report-period">
                Period
              </label>
              <select
                id="report-period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Current period</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{periodLabels[selectedPeriod]}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{selectedSummary.count}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatLkr(selectedSummary.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Average sale</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatLkr(selectedSummary.averageSale)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{periodLabels[selectedPeriod]} sales graph</h4>
                <p className="text-sm text-slate-600">Each bar represents sales revenue for the selected period</p>
              </div>
              <div className="text-sm text-slate-500">
                Peak sale: <span className="font-semibold text-slate-800">{formatLkr(selectedSummary.peakSale)}</span>
              </div>
            </div>

            {graphData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No sales data for this period yet.
              </div>
            ) : (
              <div className="space-y-3">
                {graphData.map((entry) => {
                  const maxValue = Math.max(...graphData.map((item) => item.value), 1);
                  const widthPercent = Math.max((entry.value / maxValue) * 100, 4);

                  return (
                    <div key={entry.label} className="flex items-center gap-3">
                      <div className="w-14 text-xs font-medium text-slate-500">{entry.label}</div>
                      <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-600"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-semibold text-slate-800">
                        {formatLkr(entry.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{periodLabels[selectedPeriod]} Sales Table</h4>
                  <p className="text-sm text-slate-600">{selectedSales.length} records found</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto bg-white">
              {selectedSales.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-600 mb-2">No {periodLabels[selectedPeriod].toLowerCase()} sales</h4>
                  <p className="text-slate-500">Sales will appear here once transactions are recorded.</p>
                </div>
              ) : (
                <Table
                  headers={['User', 'Total', 'Date']}
                  data={selectedSales}
                  renderRow={sale => (
                    <tr key={sale._id} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="border-b border-slate-200 p-4">
                        <div className="font-medium text-slate-800">
                          {sale.userDisplayName || sale.userId?.userDisplayName || sale.userId?.username || sale.userId?.name || 'Unknown User'}
                        </div>
                      </td>
                      <td className="border-b border-slate-200 p-4">
                        <div className="flex items-center space-x-1">
                          <Banknote className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-600">{sale.total}</span>
                        </div>
                      </td>
                      <td className="border-b border-slate-200 p-4 text-slate-600">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;