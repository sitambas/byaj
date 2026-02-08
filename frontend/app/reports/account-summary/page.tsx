'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { reportAPI } from '@/services/api';
import Link from 'next/link';

interface Loan {
  id: string;
  billNumber: string;
  person: {
    id: string;
    name: string;
    phone: string;
    accountNo: string | null;
  };
  principalAmount: number;
  interest: number;
  processFee: number;
  total: number;
  recovered: number;
  outstanding: number;
  accountType: string;
  loanType: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

interface Person {
  id: string;
  name: string;
  phone: string;
  accountNo: string | null;
  loanCount: number;
}

interface AccountSummaryData {
  summary: {
    totalPeople: number;
    totalLoans: number;
    activeLoans: number;
    closedLoans: number;
    totalLent: number;
    totalLentInterest: number;
    totalLentProcessFee: number;
    totalLentAmount: number;
    totalLentRecovered: number;
    totalLentOutstanding: number;
  };
  loans: Loan[];
  people: Person[];
}

export default function AccountSummaryPage() {
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [reportData, setReportData] = useState<AccountSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'people'>('overview');

  useEffect(() => {
    if (selectedBook) {
      fetchAccountSummary();
    }
  }, [selectedBook]);

  const fetchAccountSummary = async () => {
    if (!selectedBook) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await reportAPI.accountSummary(selectedBook.id);
      setReportData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch account summary:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized - token may be invalid or expired');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error: Make sure the backend server is running');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Summary</h1>
                <p className="text-gray-600">
                  Comprehensive overview of all accounts, loans, and financial metrics
                </p>
                {selectedBook && (
                  <p className="text-sm text-gray-500 mt-2">
                    Branch: <span className="font-semibold">{selectedBook.name}</span>
                  </p>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-gray-600">Loading account summary...</p>
                </div>
              )}

              {/* Account Summary Content */}
              {!loading && reportData && (
                <>
                  {/* Tabs */}
                  <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="flex -mb-px">
                        <button
                          onClick={() => setActiveTab('overview')}
                          className={`px-6 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'overview'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setActiveTab('loans')}
                          className={`px-6 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'loans'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Loans ({reportData.summary.totalLoans})
                        </button>
                        <button
                          onClick={() => setActiveTab('people')}
                          className={`px-6 py-3 text-sm font-medium border-b-2 ${
                            activeTab === 'people'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          People ({reportData.summary.totalPeople})
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Statistics Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                          <p className="text-sm text-gray-600 mb-1">Total People</p>
                          <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalPeople}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                          <p className="text-sm text-gray-600 mb-1">Total Loans</p>
                          <p className="text-2xl font-bold text-indigo-600">{reportData.summary.totalLoans}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                          <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                          <p className="text-2xl font-bold text-green-600">{reportData.summary.activeLoans}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                          <p className="text-sm text-gray-600 mb-1">Closed Loans</p>
                          <p className="text-2xl font-bold text-gray-600">{reportData.summary.closedLoans}</p>
                        </div>
                      </div>

                      {/* LENT Loans Summary */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-indigo-600">LENT Loans Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Principal</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(reportData.summary.totalLent)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(reportData.summary.totalLentInterest)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Process Fee</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(reportData.summary.totalLentProcessFee)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-lg font-bold text-indigo-600">{formatCurrency(reportData.summary.totalLentAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Recovered</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.summary.totalLentRecovered)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(reportData.summary.totalLentOutstanding)}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Loans Tab */}
                  {activeTab === 'loans' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No.</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Principal</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Interest</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recovered</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.loans.map((loan) => (
                              <tr key={loan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {loan.billNumber || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Link
                                    href={`/customer/${loan.person.id}`}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                  >
                                    {loan.person.name}
                                  </Link>
                                  <p className="text-sm text-gray-500">{loan.person.phone}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                  {formatCurrency(loan.principalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600">
                                  {formatCurrency(loan.interest)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-indigo-600">
                                  {formatCurrency(loan.total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                  {formatCurrency(loan.recovered)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">
                                  {formatCurrency(loan.outstanding)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {loan.accountType}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    loan.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-800' 
                                      : loan.status === 'CLOSED'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {loan.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <Link
                                    href={`/loans/${loan.id}`}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* People Tab */}
                  {activeTab === 'people' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account No.</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Loan Count</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.people.map((person) => (
                              <tr key={person.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {person.accountNo || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {person.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {person.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                                    {person.loanCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <Link
                                    href={`/customer/${person.id}`}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!loading && !reportData && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg">No data available</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

