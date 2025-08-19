import React from 'react';
import { Search, Filter, SortAsc, SortDesc, FileText } from 'lucide-react';

const Table = ({ 
  headers, 
  data, 
  renderRow, 
  title = "Data Table",
  description = "View and manage your data",
  icon = <FileText className="h-5 w-5 text-white" />,
  searchable = false,
  searchTerm = "",
  onSearchChange = () => {},
  sortable = false,
  sortConfig = null,
  onSort = () => {},
  emptyState = {
    title: "No data available",
    description: "No records found for the current filters",
    icon: <FileText className="h-8 w-8 text-slate-400" />
  },
  loading = false,
  actions = null
}) => {
  const getSortIcon = (column) => {
    if (!sortConfig || sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg shadow-lg">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Custom actions */}
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
            
            {/* Record count */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              {data.length} {data.length === 1 ? 'record' : 'records'}
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        {searchable && (
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800 placeholder-slate-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading data...</p>
        </div>
      ) : data.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-6">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {emptyState.icon}
          </div>
          <h4 className="text-lg font-medium text-slate-600 mb-2">{emptyState.title}</h4>
          <p className="text-slate-500 text-sm">{emptyState.description}</p>
        </div>
      ) : (
        /* Table Content */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {headers.map((header, idx) => (
                  <th 
                    key={idx} 
                    className={`px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${
                      sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''
                    }`}
                    onClick={() => sortable && onSort(header.toLowerCase())}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{header}</span>
                      {sortable && getSortIcon(header.toLowerCase())}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((item, idx) => renderRow(item, idx))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Table;