import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getReports } from '../utils/api';

const Reports = () => {
  const [reports, setReports] = useState({ daily: [], weekly: [], monthly: [] });

  useEffect(() => {
    const fetchReports = async () => {
      const response = await getReports();
      setReports(response.data);
    };
    fetchReports();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Sales Reports</h2>
      <h3 className="text-xl mb-2">Daily</h3>
      <Table
        headers={['User', 'Total', 'Date']}
        data={reports.daily}
        renderRow={sale => (
          <tr key={sale._id}>
            <td className="border p-2">{sale.userId.username}</td>
            <td className="border p-2">${sale.total}</td>
            <td className="border p-2">{new Date(sale.createdAt).toLocaleDateString()}</td>
          </tr>
        )}
      />
      <h3 className="text-xl mb-2 mt-4">Weekly</h3>
      <Table
        headers={['User', 'Total', 'Date']}
        data={reports.weekly}
        renderRow={sale => (
          <tr key={sale._id}>
            <td className="border p-2">{sale.userId.username}</td>
            <td className="border p-2">${sale.total}</td>
            <td className="border p-2">{new Date(sale.createdAt).toLocaleDateString()}</td>
          </tr>
        )}
      />
      <h3 className="text-xl mb-2 mt-4">Monthly</h3>
      <Table
        headers={['User', 'Total', 'Date']}
        data={reports.monthly}
        renderRow={sale => (
          <tr key={sale._id}>
            <td className="border p-2">{sale.userId.username}</td>
            <td className="border p-2">${sale.total}</td>
            <td className="border p-2">{new Date(sale.createdAt).toLocaleDateString()}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default Reports;