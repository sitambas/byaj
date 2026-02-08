'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { reportAPI, personAPI } from '@/services/api';
import Link from 'next/link';

interface InterestLoan {
  id: string;
  billNumber: string;
  person: {
    id: string;
    name: string;
    phone: string;
  };
  principalAmount: number;
  interestRate: number;
  interest: number;
  processFee: number;
  total: number;
  recovered: number;
  outstanding: number;
  startDate: string;
  endDate: string | null;
  days: number;
  loanType: string;
  interestCalc: string;
  status: string;
}

interface InterestReportData {
  loans: InterestLoan[];
  totals: {
    totalPrincipal: number;
    totalInterest: number;
    totalProcessFee: number;
    totalAmount: number;
    totalRecovered: number;
    totalOutstanding: number;
  };
  borrower: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

export default function InterestReportPage() {
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [reportData, setReportData] = useState<InterestReportData | null>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);

  useEffect(() => {
    if (selectedBook) {
      fetchPeople();
      fetchInterestReport();
    }
  }, [selectedBook, selectedBorrowerId]);

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

  const fetchInterestReport = async () => {
    if (!selectedBook) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const borrowerId = selectedBorrowerId || undefined;
      const bookId = selectedBook.id;
      const response = await reportAPI.interest(borrowerId, bookId);
      setReportData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch interest report:', error);
      if (error.response?.status === 401) {
        console.error('Unauthorized - token may be invalid or expired');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error: Make sure the backend server is running');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatInterestCalc = (calc: string) => {
    return calc.toLowerCase().replace('_', ' ');
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Interest Report</h1>
                <p className="text-gray-600">
                  View detailed interest calculations for loans
                </p>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Borrower (Optional)
                    </label>
                    <select
                      value={selectedBorrowerId}
                      onChange={(e) => setSelectedBorrowerId(e.target.value)}
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
                  {selectedBook && (
                    <div className="flex items-end">
                      <p className="text-sm text-gray-500">
                        Branch: <span className="font-semibold">{selectedBook.name}</span>
                      </p>
                    </div>
                  )}
                </div>
                {reportData?.borrower && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Selected Borrower</p>
                    <p className="text-lg font-semibold text-indigo-900">
                      {reportData.borrower.name} - {reportData.borrower.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Cards */}
              {reportData && reportData.totals && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Principal</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{reportData.totals.totalPrincipal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{reportData.totals.totalInterest.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Process Fee</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{reportData.totals.totalProcessFee.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-indigo-600">
                      ₹{reportData.totals.totalAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Recovered</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{reportData.totals.totalRecovered.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                    <p className="text-xl font-bold text-red-600">
                      ₹{reportData.totals.totalOutstanding.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Loans Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading interest report...</p>
                  </div>
                ) : !reportData || reportData.loans.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No loans found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {selectedBorrowerId
                        ? 'This borrower has no loans'
                        : 'No loans available for the selected branch'}
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
                            Rate (%)
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Interest
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Process Fee
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recovered
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Outstanding
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.loans.map((loan) => (
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
                                {loan.interestRate.toFixed(2)}%
                              </span>
                              <p className="text-xs text-gray-500">
                                {formatInterestCalc(loan.interestCalc)}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-blue-600">
                                ₹{loan.interest.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">
                                ₹{loan.processFee.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-indigo-600">
                                ₹{loan.total.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-green-600">
                                ₹{loan.recovered.toLocaleString('en-IN', {
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
                              <div>
                                <p className="text-sm text-gray-900">
                                  {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
                                </p>
                                <p className="text-xs text-gray-500">{loan.days} days</p>
                              </div>
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
                      {reportData && reportData.totals && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={2} className="px-6 py-4 text-right font-semibold text-gray-900">
                              Totals:
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                              ₹{reportData.totals.totalPrincipal.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4"></td>
                            <td className="px-6 py-4 text-right font-semibold text-blue-600">
                              ₹{reportData.totals.totalInterest.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                              ₹{reportData.totals.totalProcessFee.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-indigo-600">
                              ₹{reportData.totals.totalAmount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-green-600">
                              ₹{reportData.totals.totalRecovered.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-red-600">
                              ₹{reportData.totals.totalOutstanding.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td colSpan={2} className="px-6 py-4"></td>
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

