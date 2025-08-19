import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getReports } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { FileText, TrendingUp, Calendar, DollarSign } from 'lucide-react';

const Reports = () => {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState({ daily: [], weekly: [], monthly: [] });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      if (!loading && user && user.token) {
        console.log('Reports: User authenticated, fetching reports...');
        setIsLoading(true);
        setError('');
        
        try {
          console.log('Reports: Making API call to /sales/reports');
          const response = await getReports();
          console.log('Reports: API response:', response.data);
          setReports(response.data);
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

    fetchReports();
  }, [user, loading]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Reports...</p>
        </div>
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

  const renderReportSection = (title, data, icon) => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">{data.length} records found</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-600 mb-2">No {title.toLowerCase()} data</h4>
            <p className="text-slate-500">No sales data available for this period</p>
          </div>
        ) : (
          <Table
            headers={['User', 'Total', 'Date']}
            data={data}
            renderRow={sale => (
              <tr key={sale._id} className="hover:bg-slate-50 transition-colors duration-200">
                <td className="border-b border-slate-200 p-4">
                  <div className="font-medium text-slate-800">
                    {sale.userId?.username || 'Unknown User'}
                  </div>
                </td>
                <td className="border-b border-slate-200 p-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
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
  );

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
        
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Loading reports...</span>
          </div>
        )}
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

      {/* Debug Information */}
      <details className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium text-yellow-700">
          Debug Information (Click to expand)
        </summary>
        <div className="mt-3 text-sm">
          <pre className="bg-white p-3 rounded-lg overflow-auto text-xs">
            {JSON.stringify({
              userAuthenticated: !!user,
              userType: user?.userType,
              reportsData: {
                daily: reports.daily?.length || 0,
                weekly: reports.weekly?.length || 0,
                monthly: reports.monthly?.length || 0
              },
              error: error,
              isLoading: isLoading
            }, null, 2)}
          </pre>
        </div>
      </details>

      {/* Reports Sections */}
      <div className="space-y-8">
        {renderReportSection(
          'Daily Reports', 
          reports.daily || [], 
          <Calendar className="h-5 w-5 text-white" />
        )}
        
        {renderReportSection(
          'Weekly Reports', 
          reports.weekly || [], 
          <TrendingUp className="h-5 w-5 text-white" />
        )}
        
        {renderReportSection(
          'Monthly Reports', 
          reports.monthly || [], 
          <FileText className="h-5 w-5 text-white" />
        )}
      </div>
    </div>
  );
};

export default Reports;