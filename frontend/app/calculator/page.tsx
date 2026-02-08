'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InterestCalculator from '@/components/calculator/InterestCalculator';

export default function CalculatorPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Interest Calculator</h1>
                <p className="text-gray-600 mt-2">Calculate interest for loans based on different calculation methods</p>
              </div>
              <InterestCalculator />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

