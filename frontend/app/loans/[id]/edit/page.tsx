'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { loanAPI } from '@/services/api';
import EditLoanForm from '@/components/loans/EditLoanForm';

export default function EditLoanPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Loan</h1>
              <p className="text-gray-600 mt-2">Update loan information</p>
            </div>
            <EditLoanForm loanId={loanId} initialLoan={loan} />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

