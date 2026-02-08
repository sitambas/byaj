'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { reportAPI, personAPI } from '@/services/api';
import Link from 'next/link';

interface EMIBreakdown {
  period: number;
  date: string;
  principal: number;
  interest: number;
  processFee: number;
  emiAmount: number;
  balance: number;
}

interface LoanTransaction {
  id: string;
  amount: number;
  type: string;
  paymentMode: string;
  date: string;
  remarks: string | null;
}

interface Loan {
  id: string;
  billNumber: string;
  principalAmount: number;
  interestRate: number;
  interest: number;
  processFee: number;
  total: number;
  recovered: number;
  outstanding: number;
  startDate: string;
  endDate: string | null;
  loanType: string;
  interestCalc: string;
  hasEMI: boolean;
  numberOfEMI: number | null;
  status: string;
  emiBreakdown: EMIBreakdown[];
  transactions: LoanTransaction[];
}

interface PartyStatementData {
  person: {
    id: string;
    name: string;
    phone: string;
    address: string | null;
    accountNumber: string | null;
  };
  book: {
    id: string;
    name: string;
  };
  loans: Loan[];
  totals: {
    totalPrincipal: number;
    totalInterest: number;
    totalProcessFee: number;
    totalAmount: number;
    totalRecovered: number;
    totalOutstanding: number;
  };
}

export default function PartyStatementPage() {
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [reportData, setReportData] = useState<PartyStatementData | null>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectedBook) {
      fetchPeople();
    }
  }, [selectedBook]);

  useEffect(() => {
    if (selectedPersonId && selectedBook) {
      fetchPartyStatement();
    } else {
      setReportData(null);
    }
  }, [selectedPersonId, selectedBook]);

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

  const fetchPartyStatement = async () => {
    if (!selectedBook || !selectedPersonId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await reportAPI.partyStatement(selectedPersonId, selectedBook?.id);
      setReportData(response.data);
      // Auto-expand all loans with EMI
      const loansWithEMI = response.data.loans
        .filter((loan: Loan) => loan.hasEMI && loan.emiBreakdown.length > 0)
        .map((loan: Loan) => loan.id);
      setExpandedLoans(new Set(loansWithEMI));
    } catch (error: any) {
      console.error('Failed to fetch party statement:', error);
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

  const toggleLoanExpansion = (loanId: string) => {
    setExpandedLoans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(loanId)) {
        newSet.delete(loanId);
      } else {
        newSet.add(loanId);
      }
      return newSet;
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Party Statement</h1>
                <p className="text-gray-600">
                  View complete account statement with EMI breakdown for a borrower
                </p>
              </div>

              {/* Person Selector */}
              <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Borrower *
                    </label>
                    <select
                      value={selectedPersonId}
                      onChange={(e) => setSelectedPersonId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={loadingPeople}
                    >
                      <option value="">Select a borrower</option>
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
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-gray-600">Loading party statement...</p>
                </div>
              )}

              {/* Party Statement Content */}
              {!loading && reportData && (
                <>
                  {/* Person Details */}
                  <div className="bg-white rounded-lg shadow mb-6 p-6">
                    <h2 className="text-xl font-semibold mb-4">Borrower Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="text-lg font-semibold text-gray-900">{reportData.person.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="text-lg font-semibold text-gray-900">{reportData.person.phone}</p>
                      </div>
                      {reportData.person.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Account Number</p>
                          <p className="text-lg font-semibold text-gray-900">{reportData.person.accountNumber}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Branch</p>
                        <p className="text-lg font-semibold text-gray-900">{reportData.book.name}</p>
                      </div>
                    </div>
                    {reportData.person.address && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="text-gray-900">{reportData.person.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Summary Totals */}
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

                  {/* Loans List */}
                  <div className="space-y-6">
                    {reportData.loans.map((loan) => (
                      <div key={loan.id} className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Loan Header */}
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Bill No: {loan.billNumber || 'N/A'}
                                </h3>
                                <Link
                                  href={`/loans/${loan.id}`}
                                  className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  View Details
                                </Link>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Principal</p>
                                  <p className="font-medium">₹{loan.principalAmount.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Interest</p>
                                  <p className="font-medium text-blue-600">₹{loan.interest.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Total</p>
                                  <p className="font-medium text-indigo-600">₹{loan.total.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Outstanding</p>
                                  <p className="font-medium text-red-600">₹{loan.outstanding.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}</p>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                <span>Period: {formatDate(loan.startDate)} - {formatDate(loan.endDate)}</span>
                                {loan.hasEMI && loan.numberOfEMI && (
                                  <span className="ml-4">EMI: {loan.numberOfEMI} periods ({formatInterestCalc(loan.interestCalc)})</span>
                                )}
                              </div>
                            </div>
                            {loan.hasEMI && loan.emiBreakdown.length > 0 && (
                              <button
                                onClick={() => toggleLoanExpansion(loan.id)}
                                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                              >
                                {expandedLoans.has(loan.id) ? 'Hide EMI' : 'Show EMI'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* EMI Breakdown */}
                        {expandedLoans.has(loan.id) && loan.emiBreakdown.length > 0 && (
                          <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <h4 className="text-md font-semibold mb-4">EMI Breakdown</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">Period</th>
                                    <th className="px-4 py-2 text-right">Date</th>
                                    <th className="px-4 py-2 text-right">Principal</th>
                                    <th className="px-4 py-2 text-right">Interest</th>
                                    <th className="px-4 py-2 text-right">Process Fee</th>
                                    <th className="px-4 py-2 text-right">EMI Amount</th>
                                    <th className="px-4 py-2 text-right">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loan.emiBreakdown.map((emi) => (
                                    <tr key={emi.period} className="border-b border-gray-200">
                                      <td className="px-4 py-2">{emi.period}</td>
                                      <td className="px-4 py-2 text-right">{formatDate(emi.date)}</td>
                                      <td className="px-4 py-2 text-right">
                                        ₹{emi.principal.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        ₹{emi.interest.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        ₹{emi.processFee.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-right font-medium">
                                        ₹{emi.emiAmount.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        ₹{emi.balance.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Transactions */}
                        {loan.transactions.length > 0 && (
                          <div className="p-6">
                            <h4 className="text-md font-semibold mb-4">Transaction History</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                    <th className="px-4 py-2 text-center">Type</th>
                                    <th className="px-4 py-2 text-center">Mode</th>
                                    <th className="px-4 py-2 text-left">Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loan.transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b border-gray-200">
                                      <td className="px-4 py-2">{formatDate(transaction.date)}</td>
                                      <td className="px-4 py-2 text-right font-medium text-green-600">
                                        ₹{transaction.amount.toLocaleString('en-IN', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                          {transaction.type}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                          {transaction.paymentMode}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">{transaction.remarks || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {reportData.loans.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <p className="text-gray-500 text-lg">No loans found for this borrower</p>
                    </div>
                  )}
                </>
              )}

              {!loading && !reportData && selectedPersonId && (
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

