'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loanAPI } from '@/services/api';
import { getLoanCategoryFromRemarks } from '@/utils/loanCategories';

interface EditLoanFormProps {
  loanId: string;
  initialLoan: any;
}

export default function EditLoanForm({ loanId, initialLoan }: EditLoanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract loan category from remarks
  const getCategoryFromRemarks = (remarks: string | null | undefined): string => {
    if (!remarks) return 'PERSONAL_LOAN';
    const categoryMatch = remarks.match(/Loan Category:\s*(\w+)/);
    return categoryMatch ? categoryMatch[1] : 'PERSONAL_LOAN';
  };

  // Extract remarks without category
  const getRemarksWithoutCategory = (remarks: string | null | undefined): string => {
    if (!remarks) return '';
    return remarks.replace(/\n?Loan Category:\s*\w+/, '').trim();
  };

  const [formData, setFormData] = useState({
    status: initialLoan.status || 'ACTIVE',
    remarks: getRemarksWithoutCategory(initialLoan.remarks),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Preserve loan category in remarks
      const categoryFromRemarks = getCategoryFromRemarks(initialLoan.remarks);
      const remarksWithCategory = formData.remarks
        ? `${formData.remarks}\nLoan Category: ${categoryFromRemarks}`
        : `Loan Category: ${categoryFromRemarks}`;

      await loanAPI.update(loanId, {
        status: formData.status,
        remarks: remarksWithCategory,
      });

      router.push(`/loans/${loanId}`);
    } catch (error: any) {
      console.error('Failed to update loan:', error);
      setError(error.response?.data?.error || error.message || 'Failed to update loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loan Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Edit Loan Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="SETTLED">Settled</option>
                <option value="MUTED">Muted</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional remarks about the loan"
              />
            </div>
          </div>
        </div>

        {/* Read-only Loan Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Loan Details (Read-only)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Bill Number:</span>
              <span className="ml-2 font-medium">{initialLoan.billNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Customer:</span>
              <span className="ml-2 font-medium">{initialLoan.person?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Principal Amount:</span>
              <span className="ml-2 font-medium">₹{initialLoan.principalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-gray-600">Interest Rate:</span>
              <span className="ml-2 font-medium">{initialLoan.interestRate}% yearly</span>
            </div>
            <div>
              <span className="text-gray-600">Start Date:</span>
              <span className="ml-2 font-medium">
                {new Date(initialLoan.startDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-600">End Date:</span>
              <span className="ml-2 font-medium">
                {initialLoan.endDate
                  ? new Date(initialLoan.endDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Loan Category:</span>
              <span className="ml-2 font-medium">
                {getLoanCategoryFromRemarks(initialLoan.remarks)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">EMI:</span>
              <span className="ml-2 font-medium">
                {initialLoan.hasEMI ? `${initialLoan.numberOfEMI} periods` : 'No EMI'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Loan'}
          </button>
        </div>
      </form>
    </div>
  );
}

