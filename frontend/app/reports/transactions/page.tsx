'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { reportAPI, personAPI, loanAPI } from '@/services/api';
import Link from 'next/link';

interface Transaction {
  id: string;
  loanId: string;
  billNumber: string;
  person: {
    id: string;
    name: string;
    phone: string;
  };
  amount: number;
  type: string;
  paymentMode: string;
  date: string;
  remarks: string | null;
  createdAt: string;
}

interface TransactionReportData {
  transactions: Transaction[];
  totals: {
    totalAmount: number;
    totalByType: Record<string, number>;
    totalByPaymentMode: Record<string, number>;
    count: number;
  };
}

export default function TransactionReportPage() {
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [reportData, setReportData] = useState<TransactionReportData | null>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    personId: '',
    loanId: '',
    type: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (selectedBook) {
      fetchPeople();
      fetchLoans();
      fetchTransactionReport();
    }
  }, [selectedBook, filters]);

  const fetchPeople = async () => {
    if (!selectedBook) return;
    
    setLoadingPeople(true);
    try {
      const response = await personAPI.getAll({ bookId: selectedBook.id });
      setPeople(response.data.people || []);
    } catch (error: any) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoadingPeople(false);
    }
  };

  const fetchLoans = async () => {
    if (!selectedBook) return;
    
    setLoadingLoans(true);
    try {
      const response = await loanAPI.getAll({ bookId: selectedBook.id });
      setLoans(response.data.loans || []);
    } catch (error: any) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoadingLoans(false);
    }
  };

  const fetchTransactionReport = async () => {
    if (!selectedBook) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        bookId: selectedBook.id,
      };

      if (filters.personId) params.personId = filters.personId;
      if (filters.loanId) params.loanId = filters.loanId;
      if (filters.type) params.type = filters.type;
      if (filters.paymentMode) params.paymentMode = filters.paymentMode;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await reportAPI.transaction(params);
      setReportData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch transaction report:', error);
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      personId: '',
      loanId: '',
      type: '',
      paymentMode: '',
      startDate: '',
      endDate: '',
    });
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Report</h1>
                <p className="text-gray-600">
                  View and filter all transactions with detailed breakdown
                </p>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Borrower
                    </label>
                    <select
                      value={filters.personId}
                      onChange={(e) => handleFilterChange('personId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={loadingPeople}
                    >
                      <option value="">All Borrowers</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name} - {person.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan
                    </label>
                    <select
                      value={filters.loanId}
                      onChange={(e) => handleFilterChange('loanId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={loadingLoans}
                    >
                      <option value="">All Loans</option>
                      {loans.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.billNumber || loan.id} - {loan.person?.name || 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Types</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="TOPUP">Top Up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mode
                    </label>
                    <select
                      value={filters.paymentMode}
                      onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Modes</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {selectedBook && (
                  <p className="text-sm text-gray-500 mt-4">
                    Branch: <span className="font-semibold">{selectedBook.name}</span>
                  </p>
                )}
              </div>

              {/* Summary Cards */}
              {reportData && reportData.totals && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.totals.count}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{reportData.totals.totalAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">By Type</p>
                    <div className="space-y-1">
                      {Object.entries(reportData.totals.totalByType).map(([type, amount]) => (
                        <p key={type} className="text-sm">
                          <span className="font-medium">{type}:</span>{' '}
                          <span className="text-gray-700">
                            ₹{Number(amount).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">By Payment Mode</p>
                    <div className="space-y-1">
                      {Object.entries(reportData.totals.totalByPaymentMode).map(([mode, amount]) => (
                        <p key={mode} className="text-sm">
                          <span className="font-medium">{mode}:</span>{' '}
                          <span className="text-gray-700">
                            ₹{Number(amount).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading transaction report...</p>
                  </div>
                ) : !reportData || reportData.transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No transactions found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Try adjusting your filters to see more results
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill No.
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Mode
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remarks
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(transaction.date)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(transaction.date).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <Link
                                  href={`/customer/${transaction.person.id}`}
                                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  {transaction.person.name}
                                </Link>
                                <p className="text-sm text-gray-500">{transaction.person.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/loans/${transaction.loanId}`}
                                className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                              >
                                {transaction.billNumber || 'N/A'}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-semibold text-green-600">
                                ₹{transaction.amount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                                {transaction.paymentMode}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900 max-w-xs truncate">
                                {transaction.remarks || '-'}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Link
                                href={`/loans/${transaction.loanId}`}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                View Loan
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {reportData && reportData.totals && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-900">
                              Total:
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-indigo-600">
                              ₹{reportData.totals.totalAmount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              {reportData.totals.count} transaction(s)
                            </td>
                          </tr>
                        </tfoot>
                      )}
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

