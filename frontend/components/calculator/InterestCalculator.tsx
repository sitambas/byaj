'use client';

import { useState, useEffect } from 'react';

export default function InterestCalculator() {
  const [formData, setFormData] = useState({
    principalAmount: '',
    interestRate: '23.95',
    loanType: 'WITH_INTEREST',
    interestCalc: 'MONTHLY',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [results, setResults] = useState({
    calculatedInterest: '',
    totalAmount: '',
    emiAmount: '',
    endDate: '',
  });

  // Calculate Interest based on Yearly Rate and Tenure
  useEffect(() => {
    if (formData.principalAmount && formData.interestRate && formData.tenure && formData.loanType === 'WITH_INTEREST') {
      const principal = parseFloat(formData.principalAmount);
      const yearlyRate = parseFloat(formData.interestRate);
      const tenure = parseFloat(formData.tenure);
      
      if (!isNaN(principal) && !isNaN(yearlyRate) && !isNaN(tenure) && principal > 0 && tenure > 0) {
        let interest = 0;
        
        // Calculate interest based on interest calculation frequency
        switch (formData.interestCalc) {
          case 'MONTHLY':
            interest = principal * (yearlyRate / 100) * (tenure / 12);
            break;
          case 'HALF_MONTHLY':
            interest = principal * (yearlyRate / 100) * (tenure / 24);
            break;
          case 'WEEKLY':
            interest = principal * (yearlyRate / 100) * (tenure / 52);
            break;
          case 'DAILY':
            interest = principal * (yearlyRate / 100) * (tenure / 365);
            break;
          default:
            interest = principal * (yearlyRate / 100) * (tenure / 12);
        }
        
        const totalAmount = principal + interest;
        const emiAmount = tenure > 0 ? totalAmount / tenure : 0;
        
        setResults({
          calculatedInterest: interest.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          emiAmount: emiAmount.toFixed(2),
          endDate: results.endDate,
        });
      } else {
        setResults({
          calculatedInterest: '',
          totalAmount: '',
          emiAmount: '',
          endDate: results.endDate,
        });
      }
    } else {
      setResults({
        calculatedInterest: '',
        totalAmount: '',
        emiAmount: '',
        endDate: results.endDate,
      });
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
            end.setMonth(end.getMonth() + tenure);
            break;
          case 'HALF_MONTHLY':
            end.setDate(end.getDate() + (tenure * 15));
            break;
          case 'WEEKLY':
            end.setDate(end.getDate() + (tenure * 7));
            break;
          case 'DAILY':
            end.setDate(end.getDate() + tenure);
            break;
          default:
            end.setMonth(end.getMonth() + tenure);
        }
        
        setResults(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
      }
    }
  }, [formData.startDate, formData.tenure, formData.interestCalc]);

  const generateBreakdown = () => {
    if (!formData.principalAmount || !formData.tenure || !results.calculatedInterest) return [];

    const principal = parseFloat(formData.principalAmount);
    const interest = parseFloat(results.calculatedInterest);
    const tenure = parseInt(formData.tenure);
    const emiAmount = parseFloat(results.emiAmount);
    const principalPerPeriod = principal / tenure;
    const interestPerPeriod = interest / tenure;
    const startDate = new Date(formData.startDate);
    const breakdown = [];
    let balance = principal + interest;

    for (let i = 1; i <= tenure; i++) {
      const periodDate = new Date(startDate);
      
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

      breakdown.push({
        period: i,
        date: periodDate.toLocaleDateString('en-GB'),
        principal: principalPerPeriod.toFixed(2),
        interest: interestPerPeriod.toFixed(2),
        emiAmount: emiAmount.toFixed(2),
        balance: Math.max(0, balance).toFixed(2),
      });
    }

    return breakdown;
  };

  const breakdown = generateBreakdown();

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
              placeholder="Enter principal amount"
              required
            />
          </div>
          {formData.loanType === 'WITH_INTEREST' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (Yearly %) *
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="23.95"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Annual interest rate. Interest is calculated based on this yearly rate and converted to {formData.interestCalc.toLowerCase().replace('_', ' ')} periods.
              </p>
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
              Tenure (Number of periods) *
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
          </div>
        </div>
      </div>

      {/* Results */}
      {formData.loanType === 'WITH_INTEREST' && results.calculatedInterest && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Calculation Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
              <p className="text-2xl font-bold text-indigo-600">
                ₹{parseFloat(formData.principalAmount).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Calculated Interest</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{results.calculatedInterest}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{results.totalAmount}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">EMI per Period</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{results.emiAmount}
              </p>
            </div>
          </div>
          {results.endDate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">End Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(results.endDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* EMI Breakdown Chart */}
      {breakdown.length > 0 && (
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
                {breakdown.map((row, index) => (
                  <tr key={row.period} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2">{row.period}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{row.date}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{row.principal}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{row.interest}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{row.emiAmount}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {row.period === breakdown.length ? '₹0.00' : `₹${row.balance}`}
                    </td>
                  </tr>
                ))}
                <tr className="bg-indigo-50 font-semibold">
                  <td colSpan={2} className="border border-gray-300 px-4 py-2">Total</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ₹{parseFloat(formData.principalAmount).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ₹{results.calculatedInterest}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ₹{(parseFloat(results.emiAmount) * breakdown.length).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fixed Amount Result */}
      {formData.loanType === 'FIXED_AMOUNT' && formData.principalAmount && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Calculation Results</h2>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Fixed Amount</p>
            <p className="text-2xl font-bold text-indigo-600">
              ₹{parseFloat(formData.principalAmount).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">No interest calculated for fixed amount loans</p>
          </div>
        </div>
      )}
    </div>
  );
}

