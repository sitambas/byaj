'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { loanAPI, personAPI } from '@/services/api';

export default function AddLoanForm() {
  const router = useRouter();
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    // Customer details
    personId: '',
    personName: '',
    personPhone: '',
    personAddress: '',
    // Loan Type
    loanType: 'WITH_INTEREST', // WITH_INTEREST or FIXED_AMOUNT
    interestCalc: 'MONTHLY', // MONTHLY, HALF_MONTHLY, WEEKLY, DAILY
    // Loan Details
    principalAmount: '',
    interestRate: '23.95',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tenure: '',
    processFee: '',
    calculatedInterest: '',
    emiAmount: '',
    totalAmount: '',
    // Collateral
    collaterals: [] as any[],
    remarks: '',
  });

  const fetchPeople = useCallback(async () => {
    if (!selectedBook) return;
    try {
      const response = await personAPI.getAll({ bookId: selectedBook.id });
      setPeople(response.data.people);
    } catch (error) {
      console.error('Failed to fetch people:', error);
    }
  }, [selectedBook]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);


  // Calculate Process Fee: 7.5% of principal amount
  useEffect(() => {
    if (formData.principalAmount) {
      const principal = parseFloat(formData.principalAmount);
      if (!isNaN(principal) && principal > 0) {
        const processFee = (principal * 0.075).toFixed(2);
        setFormData(prev => ({ ...prev, processFee }));
      } else {
        setFormData(prev => ({ ...prev, processFee: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, processFee: '' }));
    }
  }, [formData.principalAmount]);

  // Calculate Interest based on Yearly Rate and Tenure
  useEffect(() => {
    if (formData.principalAmount && formData.interestRate && formData.tenure && formData.loanType === 'WITH_INTEREST') {
      const principal = parseFloat(formData.principalAmount);
      const yearlyRate = parseFloat(formData.interestRate);
      const tenure = parseFloat(formData.tenure);
      
      if (!isNaN(principal) && !isNaN(yearlyRate) && !isNaN(tenure) && principal > 0 && tenure > 0) {
        let interest = 0;
        
        // Calculate interest based on interest calculation frequency
        // Yearly rate is converted to the appropriate period rate
        switch (formData.interestCalc) {
          case 'MONTHLY':
            // Monthly: (Principal * Yearly_Rate / 100) * (Tenure / 12)
            interest = principal * (yearlyRate / 100) * (tenure / 12);
            break;
          case 'HALF_MONTHLY':
            // Half Monthly: (Principal * Yearly_Rate / 100) * (Tenure / 24)
            interest = principal * (yearlyRate / 100) * (tenure / 24);
            break;
          case 'WEEKLY':
            // Weekly: (Principal * Yearly_Rate / 100) * (Tenure / 52)
            interest = principal * (yearlyRate / 100) * (tenure / 52);
            break;
          case 'DAILY':
            // Daily: (Principal * Yearly_Rate / 100) * (Tenure / 365)
            interest = principal * (yearlyRate / 100) * (tenure / 365);
            break;
          default:
            interest = principal * (yearlyRate / 100) * (tenure / 12);
        }
        
        const totalAmount = principal + interest;
        const emiAmount = tenure > 0 ? totalAmount / tenure : 0;
        
        setFormData(prev => ({ 
          ...prev, 
          calculatedInterest: interest.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          emiAmount: emiAmount.toFixed(2)
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          calculatedInterest: '',
          totalAmount: '',
          emiAmount: ''
        }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        calculatedInterest: '',
        totalAmount: '',
        emiAmount: ''
      }));
    }
  }, [formData.principalAmount, formData.interestRate, formData.tenure, formData.interestCalc, formData.loanType]);

  // Calculate End Date based on Tenure and Interest Calculation
  useEffect(() => {
    if (formData.startDate && formData.tenure) {
      const tenure = parseFloat(formData.tenure);
      
      if (!isNaN(tenure) && tenure > 0) {
        const start = new Date(formData.startDate);
        const end = new Date(start);
        
        switch (formData.interestCalc) {
          case 'MONTHLY':
            // Add actual calendar months
            end.setMonth(end.getMonth() + tenure);
            break;
          case 'HALF_MONTHLY':
            // Add half months (15 days per period)
            end.setDate(end.getDate() + (tenure * 15));
            break;
          case 'WEEKLY':
            // Add weeks (7 days per period)
            end.setDate(end.getDate() + (tenure * 7));
            break;
          case 'DAILY':
            // Add days
            end.setDate(end.getDate() + tenure);
            break;
          default:
            // Default to months
            end.setMonth(end.getMonth() + tenure);
        }
        
        setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
      }
    }
  }, [formData.startDate, formData.tenure, formData.interestCalc]);

  const handleAddNewCustomer = () => {
    const returnUrl = encodeURIComponent('/loans/add');
    router.push(`/customer/add?returnUrl=${returnUrl}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook) {
      alert('Please select a book first');
      return;
    }

    if (!formData.personId && !formData.personName) {
      alert('Please select or add a customer');
      return;
    }

    if (!formData.principalAmount) {
      alert('Please enter principal amount');
      return;
    }

    setLoading(true);
    try {
      // Create person if new
      let personId = formData.personId;
      if (!personId && formData.personName && formData.personPhone) {
        const personRes = await personAPI.create({
          name: formData.personName,
          phone: formData.personPhone,
          address: formData.personAddress,
          bookId: selectedBook.id,
        });
        personId = personRes.data.person.id;
      }

      // Create loan
      await loanAPI.create({
        personId,
        bookId: selectedBook.id,
        accountType: 'LENT',
        loanType: formData.loanType,
        interestCalc: formData.interestCalc,
        principalAmount: formData.principalAmount,
        interestRate: formData.interestRate || 0,
        interestEvery: formData.interestCalc, // Use same value for interestEvery
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        hasEMI: true,
        numberOfEMI: formData.tenure ? parseInt(formData.tenure) : null,
        hasCompounding: false,
        dateToDateCalc: false,
        strategy: 'SIMPLE_INTEREST',
        remarks: formData.remarks,
        processFee: formData.processFee ? parseFloat(formData.processFee) : 0,
      });

      router.push('/loans');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Customer *
            </label>
            <select
              value={formData.personId}
              onChange={(e) => {
                const person = people.find((p) => p.id === e.target.value);
                setFormData({
                  ...formData,
                  personId: e.target.value,
                  personName: person?.name || '',
                  personPhone: person?.phone || '',
                  personAddress: person?.address || '',
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Existing Customer</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} - {person.phone}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddNewCustomer}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Add New Customer
            </button>
          </div>
        </div>
        {!formData.personId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={!formData.personId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.personPhone}
                onChange={(e) => setFormData({ ...formData, personPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={!formData.personId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.personAddress}
                onChange={(e) => setFormData({ ...formData, personAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loan Type */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Loan Type</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Type *
          </label>
          <select
            value={formData.loanType}
            onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="WITH_INTEREST">With Interest</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Calculation *
          </label>
          <select
            value={formData.interestCalc}
            onChange={(e) => setFormData({ ...formData, interestCalc: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="MONTHLY">Monthly</option>
            <option value="HALF_MONTHLY">Half Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="DAILY">Daily</option>
          </select>
        </div>
      </div>

      {/* Loan Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Principal Amount *
            </label>
            <input
              type="number"
              value={formData.principalAmount}
              onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          {formData.loanType === 'WITH_INTEREST' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate of Interest (Yearly %) *
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Auto-calculated)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenure for Loan * (Number of periods)
            </label>
            <input
              type="number"
              value={formData.tenure}
              onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
              min="1"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter number of periods"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of {formData.interestCalc.toLowerCase().replace('_', ' ')} periods for the loan. End date will be calculated automatically.
            </p>
          </div>
          {formData.loanType === 'WITH_INTEREST' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculated Interest (Auto-calculated)
                </label>
                <input
                  type="text"
                  value={formData.calculatedInterest ? `₹${formData.calculatedInterest}` : ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Interest calculated based on {formData.interestRate}% yearly rate for {formData.tenure || 0} {formData.interestCalc.toLowerCase().replace('_', ' ')} period(s).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (Principal + Interest)
                </label>
                <input
                  type="text"
                  value={formData.totalAmount ? `₹${formData.totalAmount}` : ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMI Amount per Period
                </label>
                <input
                  type="text"
                  value={formData.emiAmount ? `₹${formData.emiAmount}` : ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  EMI = (Principal + Interest) / {formData.tenure || 0} periods
                </p>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Process Fee (7.5% of Amount)
            </label>
            <input
              type="text"
              value={formData.processFee ? `₹${formData.processFee}` : ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* EMI Breakdown Chart */}
      {formData.loanType === 'WITH_INTEREST' && formData.principalAmount && formData.tenure && formData.calculatedInterest && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">EMI Breakdown Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Period</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Principal</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Interest</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">EMI Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const principal = parseFloat(formData.principalAmount);
                  const interest = parseFloat(formData.calculatedInterest);
                  const tenure = parseInt(formData.tenure);
                  const emiAmount = parseFloat(formData.emiAmount);
                  const principalPerPeriod = principal / tenure;
                  const interestPerPeriod = interest / tenure;
                  const startDate = new Date(formData.startDate);
                  const rows = [];
                  let balance = principal + interest;

                  for (let i = 1; i <= tenure; i++) {
                    const periodDate = new Date(startDate);
                    
                    // Calculate date based on interest calculation frequency
                    switch (formData.interestCalc) {
                      case 'MONTHLY':
                        periodDate.setMonth(periodDate.getMonth() + i);
                        break;
                      case 'HALF_MONTHLY':
                        periodDate.setDate(periodDate.getDate() + (i * 15));
                        break;
                      case 'WEEKLY':
                        periodDate.setDate(periodDate.getDate() + (i * 7));
                        break;
                      case 'DAILY':
                        periodDate.setDate(periodDate.getDate() + i);
                        break;
                    }

                    balance -= emiAmount;
                    const isLastRow = i === tenure;

                    rows.push(
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="border border-gray-300 px-4 py-2">{i}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {periodDate.toLocaleDateString('en-GB')}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          ₹{principalPerPeriod.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          ₹{interestPerPeriod.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          ₹{emiAmount.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          ₹{isLastRow ? '0.00' : Math.max(0, balance).toFixed(2)}
                        </td>
                      </tr>
                    );
                  }

                  // Add summary row
                  rows.push(
                    <tr key="summary" className="bg-indigo-50 font-semibold">
                      <td colSpan={2} className="border border-gray-300 px-4 py-2">Total</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ₹{principal.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ₹{interest.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        ₹{(emiAmount * tenure).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">₹0.00</td>
                    </tr>
                  );

                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collateral Details (Optional) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Collateral Details (Optional)</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Collateral upload functionality will be available after loan creation</p>
          <p className="text-sm text-gray-400">You can add collateral details from the loan details page</p>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Remarks</h2>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add any additional notes or remarks..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/loans')}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Loan'}
        </button>
      </div>
    </form>
  );
}

