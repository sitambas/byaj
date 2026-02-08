'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { dashboardAPI } from '@/services/api';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState({
    totalOutstanding: 0,
    totalLent: 0,
    peopleOwe: 0,
  });
  const [chartData, setChartData] = useState({ totalLent: 0, interest: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if token exists before making API calls
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        console.error('No token found, redirecting to login');
        return;
      }

      try {
        const [summaryRes, chartsRes] = await Promise.all([
          dashboardAPI.summary(),
          dashboardAPI.charts(),
        ]);

        setSummary(summaryRes.data);
        setChartData(chartsRes.data);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        if (error.response?.status === 401) {
          console.error('Unauthorized - token may be invalid or expired');
          // Don't redirect here, let the API interceptor handle it
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.error('Network error: Make sure the backend server is running on http://localhost:4000');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">TOTAL OUTSTANDING</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : formatCurrency(summary.totalOutstanding)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">TOTAL LENT</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : formatCurrency(summary.totalLent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  💵
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PEOPLE OWE</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : formatCurrency(summary.peopleOwe)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  👥
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {formatCurrency(chartData.totalLent)}
                  </div>
                  <div className="text-xl text-orange-600 mb-4">
                    {formatCurrency(chartData.interest)}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                      <span className="text-sm text-gray-600">Total Lent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-sm text-gray-600">Interest</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Today's Due Loans */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Due Loans</h2>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                + Add Loan
              </button>
            </div>
            <div className="flex space-x-2 mb-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">All</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Due Today</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Overdue</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Collaterals</button>
            </div>
            <div className="text-center text-gray-400 py-8">
              No loans due today
            </div>
          </div>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  );
}

