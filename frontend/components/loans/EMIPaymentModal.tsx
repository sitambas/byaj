'use client';

import { useState, useEffect, useMemo } from 'react';

interface EMIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (data: { amount: number; paymentMode: string; date: string; remarks: string; emiPeriods: number[] }) => Promise<void>;
  emiBreakdown: any[];
  transactions: any[];
  emiAmount: number;
}

export default function EMIPaymentModal({
  isOpen,
  onClose,
  onPay,
  emiBreakdown,
  transactions,
  emiAmount,
}: EMIPaymentModalProps) {
  const [selectedEMIs, setSelectedEMIs] = useState<number[]>([]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoize paid EMIs calculation to prevent infinite loops
  const paidEMIs = useMemo(() => {
    const paidAmount = transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const paid: number[] = [];
    let runningTotal = 0;
    
    emiBreakdown.forEach((emi) => {
      runningTotal += emi.emiAmount;
      if (runningTotal <= paidAmount) {
        paid.push(emi.period);
      }
    });
    
    return paid;
  }, [transactions, emiBreakdown]);

  // Memoize unpaid EMIs
  const unpaidEMIs = useMemo(() => {
    return emiBreakdown.filter((emi) => !paidEMIs.includes(emi.period));
  }, [emiBreakdown, paidEMIs]);

  useEffect(() => {
    if (isOpen) {
      // Auto-select first unpaid EMI
      if (unpaidEMIs.length > 0) {
        setSelectedEMIs([unpaidEMIs[0].period]);
      }
    } else {
      // Reset when modal closes
      setSelectedEMIs([]);
      setPaymentMode('CASH');
      setDate(new Date().toISOString().split('T')[0]);
      setRemarks('');
    }
  }, [isOpen, unpaidEMIs]);

  const toggleEMI = (period: number) => {
    if (paidEMIs.includes(period)) return; // Can't select paid EMIs
    
    setSelectedEMIs((prev) => {
      if (prev.includes(period)) {
        return prev.filter((p) => p !== period);
      } else {
        return [...prev, period].sort((a, b) => a - b);
      }
    });
  };

  const selectAllUnpaid = () => {
    setSelectedEMIs(unpaidEMIs.map((emi) => emi.period));
  };

  const clearSelection = () => {
    setSelectedEMIs([]);
  };

  const calculateTotalAmount = () => {
    return selectedEMIs.reduce((total, period) => {
      const emi = emiBreakdown.find((e) => e.period === period);
      return total + (emi?.emiAmount || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEMIs.length === 0) {
      alert('Please select at least one EMI to pay');
      return;
    }

    setLoading(true);
    try {
      await onPay({
        amount: calculateTotalAmount(),
        paymentMode,
        date,
        remarks,
        emiPeriods: selectedEMIs,
      });
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Pay EMI Installments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMI Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Select EMIs to Pay</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllUnpaid}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Select All Unpaid
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                {emiBreakdown.map((emi) => {
                  const isPaid = paidEMIs.includes(emi.period);
                  const isSelected = selectedEMIs.includes(emi.period);
                  const isOverdue = new Date(emi.date) < new Date() && !isPaid;

                  return (
                    <div
                      key={emi.period}
                      onClick={() => !isPaid && toggleEMI(emi.period)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isPaid
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-indigo-50 border-indigo-500'
                          : isOverdue
                          ? 'bg-red-50 border-red-300 hover:border-red-400'
                          : 'bg-white border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {isPaid ? (
                            <span className="text-green-600">✓</span>
                          ) : isSelected ? (
                            <span className="text-indigo-600">✓</span>
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                          )}
                          <span className="font-semibold">Period {emi.period}</span>
                        </div>
                        {isOverdue && !isPaid && (
                          <span className="text-xs text-red-600 font-medium">Overdue</span>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="text-gray-600">Date: {formatDate(emi.date)}</div>
                        <div className="font-semibold text-gray-900">
                          Amount: {formatCurrency(emi.emiAmount)}
                        </div>
                        {isPaid && (
                          <div className="text-xs text-green-600 font-medium">Paid</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              {selectedEMIs.length > 0 && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {selectedEMIs.length} EMI{selectedEMIs.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-xl font-bold text-indigo-600">
                      Total: {formatCurrency(calculateTotalAmount())}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Payment remarks (optional)"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || selectedEMIs.length === 0}
              >
                {loading ? 'Processing...' : `Pay ${selectedEMIs.length} EMI${selectedEMIs.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

