'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AddLoanWizard from '@/components/loans/AddLoanWizard';

export default function AddLoanPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Add new loan</h1>
              </div>
              <AddLoanWizard />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

