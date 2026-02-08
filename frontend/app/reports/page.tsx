'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

const reportCards = [
  {
    title: 'Due Payment Report',
    description: 'View all loans with pending payments that are due or overdue',
    icon: '⏰',
    path: '/reports/due-payments',
    color: 'bg-red-500',
  },
  {
    title: 'Interest Report',
    description: 'Generate interest reports for specific borrowers',
    icon: '📈',
    path: '/reports/interest',
    color: 'bg-blue-500',
  },
  {
    title: 'Transaction Report',
    description: 'View detailed transaction reports with filters',
    icon: '💳',
    path: '/reports/transactions',
    color: 'bg-green-500',
  },
  {
    title: 'Party Statement',
    description: 'Generate account statements for specific parties',
    icon: '📋',
    path: '/reports/party-statement',
    color: 'bg-purple-500',
  },
  {
    title: 'Account Summary',
    description: 'View comprehensive account summary reports',
    icon: '📊',
    path: '/reports/account-summary',
    color: 'bg-indigo-500',
  },
];

export default function ReportsPage() {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
                <p className="text-gray-600">
                  Generate and view various financial reports for your loan management
                </p>
              </div>

              {/* Report Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCards.map((report) => (
                  <Link
                    key={report.path}
                    href={report.comingSoon ? '#' : report.path}
                    className={`block bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                      report.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={(e) => {
                      if (report.comingSoon) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`${report.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}
                        >
                          {report.icon}
                        </div>
                        {report.comingSoon && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 text-sm">{report.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

