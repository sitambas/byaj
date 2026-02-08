'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { dashboardAPI } from '@/services/api';
import Link from 'next/link';

interface DueLoan {
  id: string;
  billNumber: string;
  person: {
    id: string;
    name: string;
    phone: string;
  };
  principalAmount: number;
  interest: number;
  processFee?: number;
  total: number;
  outstanding: number;
  startDate: string;
  endDate: string;
  status: string;
}

export default function DuePaymentsReportPage() {
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [loans, setLoans] = useState<DueLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'due-today' | 'overdue'>('all');
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    fetchDueLoans();
  }, [selectedBook, filter]);

  const fetchDueLoans = async () => {
    if (!selectedBook) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        bookId: selectedBook.id,
      };

      if (filter !== 'all') {
        params.filter = filter;
      }

      const response = await dashboardAPI.dueLoans(params);
      setLoans(response.data.loans || []);
      
      // Calculate total outstanding
      const total = response.data.loans?.reduce((sum: number, loan: DueLoan) => sum + loan.outstanding, 0) || 0;
      setTotalOutstanding(total);
    } catch (error: any) {
      console.error('Failed to fetch due loans:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized - token may be invalid or expired');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error: Make sure the backend server is running');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysOverdue = (endDate: string) => {
    if (!endDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getStatusBadge = (loan: DueLoan) => {
    const daysOverdue = getDaysOverdue(loan.endDate);
    if (daysOverdue > 0) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
          {daysOverdue} days overdue
        </span>
      );
    } else if (daysOverdue === 0) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
          Due today
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
          Due soon
        </span>
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Due Payment Report</h1>
                <p className="text-gray-600">
                  View all loans with pending payments that are due or overdue
                </p>
              </div>

              {/* Filters and Summary */}
              <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Due
                    </button>
                    <button
                      onClick={() => setFilter('due-today')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'due-today'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Due Today
                    </button>
                    <button
                      onClick={() => setFilter('overdue')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'overdue'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Overdue
                    </button>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {selectedBook && (
                  <p className="text-sm text-gray-500">
                    Showing results for: <span className="font-semibold">{selectedBook.name}</span>
                  </p>
                )}
              </div>

              {/* Loans Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading due payments...</p>
                  </div>
                ) : loans.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No due payments found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {filter === 'all'
                        ? 'There are no loans with pending payments'
                        : filter === 'due-today'
                        ? 'No loans are due today'
                        : 'No loans are overdue'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Principal
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Interest
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Outstanding
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {loan.billNumber || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <Link
                                  href={`/customer/${loan.person.id}`}
                                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  {loan.person.name}
                                </Link>
                                <p className="text-sm text-gray-500">{loan.person.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">
                                ₹{loan.principalAmount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">
                                ₹{loan.interest.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-gray-900">
                                ₹{loan.total.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-semibold text-red-600">
                                ₹{loan.outstanding.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{formatDate(loan.endDate)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {getStatusBadge(loan)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Link
                                href={`/loans/${loan.id}`}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-right font-semibold text-gray-900">
                            Total Outstanding:
                          </td>
                          <td colSpan={5} className="px-6 py-4 text-right">
                            <span className="text-lg font-bold text-red-600">
                              ₹{totalOutstanding.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

