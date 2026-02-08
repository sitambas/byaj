'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { loanAPI } from '@/services/api';

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'CASH',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  useEffect(() => {
    fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      const response = await loanAPI.getById(loanId);
      setLoan(response.data.loan);
    } catch (error) {
      console.error('Failed to fetch loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loanAPI.recordPayment(loanId, paymentData);
      setShowPaymentModal(false);
      setPaymentData({
        amount: '',
        paymentMode: 'CASH',
        date: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      fetchLoanDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to record payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              <div className="text-center py-12 text-gray-500">Loading loan details...</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!loan) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              <div className="text-center py-12 text-gray-500">Loan not found</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const calculated = loan.calculated || {};
  const timeDuration = calculated.timeDuration || { years: 0, months: 0, days: 0 };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="text-indigo-600 hover:text-indigo-700 mb-4"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Loan details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Borrower Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-indigo-600">
                        {loan.person?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{loan.person?.name}</h2>
                      <p className="text-gray-600">{loan.person?.phone}</p>
                    </div>
                  </div>

                  {loan.person?.address && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">{loan.person.address}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill Number:</span>
                      <span className="font-medium">{loan.billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start date:</span>
                      <span className="font-medium">{formatDate(loan.startDate)}</span>
                    </div>
                    {loan.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End date:</span>
                        <span className="font-medium">{formatDate(loan.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                  {loan.collaterals && loan.collaterals.length > 0 ? (
                    <div className="space-y-2">
                      {loan.collaterals.map((collateral: any) => (
                        <div key={collateral.id} className="p-2 border rounded">
                          <p className="text-sm font-medium">{collateral.productName}</p>
                          <p className="text-xs text-gray-500">{collateral.productType}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No mortgage added yet!</p>
                  )}
                </div>
              </div>

              {/* Center Column - Loan Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {formatCurrency(loan.principalAmount)}
                    </div>
                    <div className="text-xl text-orange-600 mb-4">
                      {formatCurrency(calculated.interest || 0)}
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                        <span className="text-sm text-gray-600">You lent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-600">Interest</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Type:</span>
                      <span className="font-medium">{loan.accountType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate of interest:</span>
                      <span className="font-medium">{loan.interestRate}% {loan.interestCalc}</span>
                    </div>
                    {loan.hasEMI && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">EMI Cycle:</span>
                          <span className="font-medium">{loan.interestEvery}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of EMI:</span>
                          <span className="font-medium">{loan.numberOfEMI}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Financial Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-semibold">Financial Summary</h3>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Duration:</span>
                      <span className="font-medium">
                        {timeDuration.years}YR {timeDuration.months}MO {timeDuration.days}DYS
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Principal amount:</span>
                      <span className="font-medium">{formatCurrency(loan.principalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Topup:</span>
                      <span className="font-medium">{formatCurrency(calculated.topup || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interest:</span>
                      <span className="font-medium">{formatCurrency(calculated.interest || 0)}</span>
                    </div>
                    {calculated.processFee && calculated.processFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Process Fee:</span>
                        <span className="font-medium">{formatCurrency(calculated.processFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">Total:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(calculated.total || loan.principalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Amount Recovered:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(calculated.amountRecovered || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">Amount Left:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(calculated.amountLeft || calculated.total || loan.principalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      Add Topup
                    </button>
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                      Transactions
                    </button>
                  </div>
                </div>

                {/* Transactions */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  {loan.transactions && loan.transactions.length > 0 ? (
                    <div className="space-y-2">
                      {loan.transactions.slice(0, 5).map((transaction: any) => (
                        <div key={transaction.id} className="flex justify-between text-sm p-2 border rounded">
                          <div>
                            <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                            <p className="text-gray-500 text-xs">{transaction.paymentMode}</p>
                          </div>
                          <p className="text-gray-500 text-xs">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No transactions yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* EMI Breakdown Section */}
            {loan.hasEMI && calculated.emiBreakdown && calculated.emiBreakdown.length > 0 && (
              <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">EMI Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Period</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Date</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Principal</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Interest</th>
                        {calculated.processFee > 0 && (
                          <th className="border border-gray-300 px-4 py-2 text-right">Process Fee</th>
                        )}
                        <th className="border border-gray-300 px-4 py-2 text-right">EMI Amount</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculated.emiBreakdown.map((emi: any) => (
                        <tr key={emi.period} className={emi.period % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="border border-gray-300 px-4 py-2">{emi.period}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatDateShort(emi.date)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(emi.principal)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(emi.interest)}
                          </td>
                          {calculated.processFee > 0 && (
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              {formatCurrency(emi.processFee)}
                            </td>
                          )}
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            {formatCurrency(emi.emiAmount)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(emi.balance)}
                          </td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-indigo-50 font-semibold">
                        <td colSpan={calculated.processFee > 0 ? 2 : 2} className="border border-gray-300 px-4 py-2">
                          Total
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(loan.principalAmount)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(calculated.interest || 0)}
                        </td>
                        {calculated.processFee > 0 && (
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(calculated.processFee)}
                          </td>
                        )}
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(
                            calculated.emiBreakdown.reduce(
                              (sum: number, emi: any) => sum + emi.emiAmount,
                              0
                            )
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">₹0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Record Payment Button */}
            <div className="fixed bottom-8 right-8">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700"
              >
                Record Payment ↓
              </button>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Record Payment</h2>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount *
                      </label>
                      <input
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Mode *
                      </label>
                      <select
                        value={paymentData.paymentMode}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="CASH">Cash</option>
                        <option value="BANK">Bank</option>
                        <option value="UPI">UPI</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={paymentData.date}
                        onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                      </label>
                      <textarea
                        value={paymentData.remarks}
                        onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Record Payment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

