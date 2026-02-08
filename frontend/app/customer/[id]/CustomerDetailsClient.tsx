'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { personAPI } from '@/services/api';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CustomerDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await personAPI.getById(customerId);
      setCustomer(response.data.person);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load customer details');
      console.error('Failed to fetch customer details:', err);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              <div className="text-center py-12 text-gray-500">Loading customer details...</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !customer) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error || 'Customer not found'}
              </div>
              <button
                onClick={() => router.push('/customer')}
                className="mt-4 text-indigo-600 hover:text-indigo-700"
              >
                ← Back to Customer List
              </button>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const totals = customer.totals || {
    totalLent: 0,
    totalBorrowed: 0,
    totalLoans: 0,
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
              {customer.book && (
                <p className="text-sm text-gray-500 mt-1">
                  Branch: <span className="font-semibold text-indigo-600">{customer.book.name}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-indigo-600">
                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                      <p className="text-gray-600">{customer.phone}</p>
                    </div>
                  </div>

                  {customer.address && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">{customer.address}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number:</span>
                      <span className="font-medium text-gray-900">{customer.accountNo || 'N/A'}</span>
                    </div>
                    {customer.book && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Branch:</span>
                        <span className="font-medium text-indigo-600">{customer.book.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {customer.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* KYC Documents Section */}
                  {(() => {
                    const hasKycDocs = customer.kycDocuments && 
                                      typeof customer.kycDocuments === 'object' && 
                                      Object.keys(customer.kycDocuments).length > 0;
                    
                    if (!hasKycDocs) {
                      return (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">KYC Documents</h3>
                          <p className="text-sm text-gray-500">No KYC documents uploaded</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">KYC Documents</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customer.kycDocuments.aadhaar && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Aadhaar Card</span>
                              <a
                                href={`${API_URL}${customer.kycDocuments.aadhaar}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-xs"
                              >
                                View →
                              </a>
                            </div>
                            {customer.kycDocuments.aadhaar.match(/\.(jpg|jpeg|png)$/i) && (
                              <img
                                src={`${API_URL}${customer.kycDocuments.aadhaar}`}
                                alt="Aadhaar Card"
                                className="w-full h-32 object-cover rounded mt-2 border border-gray-300"
                              />
                            )}
                          </div>
                        )}
                        {customer.kycDocuments.pan && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">PAN Card</span>
                              <a
                                href={`${API_URL}${customer.kycDocuments.pan}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-xs"
                              >
                                View →
                              </a>
                            </div>
                            {customer.kycDocuments.pan.match(/\.(jpg|jpeg|png)$/i) && (
                              <img
                                src={`${API_URL}${customer.kycDocuments.pan}`}
                                alt="PAN Card"
                                className="w-full h-32 object-cover rounded mt-2 border border-gray-300"
                              />
                            )}
                          </div>
                        )}
                        {customer.kycDocuments.photo && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Customer Photo</span>
                              <a
                                href={`${API_URL}${customer.kycDocuments.photo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-xs"
                              >
                                View →
                              </a>
                            </div>
                            {customer.kycDocuments.photo.match(/\.(jpg|jpeg|png)$/i) && (
                              <img
                                src={`${API_URL}${customer.kycDocuments.photo}`}
                                alt="Customer Photo"
                                className="w-full h-32 object-cover rounded mt-2 border border-gray-300"
                              />
                            )}
                          </div>
                        )}
                        {customer.kycDocuments.addressProof && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Address Proof</span>
                              <a
                                href={`${API_URL}${customer.kycDocuments.addressProof}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-xs"
                              >
                                View →
                              </a>
                            </div>
                            {customer.kycDocuments.addressProof.match(/\.(jpg|jpeg|png)$/i) && (
                              <img
                                src={`${API_URL}${customer.kycDocuments.addressProof}`}
                                alt="Address Proof"
                                className="w-full h-32 object-cover rounded mt-2 border border-gray-300"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      </div>
                    );
                  })()}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mb-2">
                      Edit Customer
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Delete Customer
                    </button>
                  </div>
                </div>
              </div>

              {/* Center and Right Columns - Summary and Loans */}
              <div className="lg:col-span-2 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-sm text-gray-500 mb-2">Total Lent</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totals.totalLent)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-sm text-gray-500 mb-2">Total Borrowed</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.totalBorrowed)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-sm text-gray-500 mb-2">Total Loans</p>
                    <p className="text-2xl font-bold text-gray-900">{totals.totalLoans}</p>
                  </div>
                </div>

                {/* Loan Accounts Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Loan Accounts</h3>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                      Download Report
                    </button>
                  </div>
                  {customer.loans && customer.loans.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bill Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Principal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customer.loans.map((loan: any) => (
                            <tr key={loan.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {loan.billNumber || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {loan.accountType || 'LENT'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(loan.principalAmount || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  loan.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {loan.status || 'ACTIVE'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  href={`/loans/${loan.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  View →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <p>No loans found for this customer.</p>
                      <Link
                        href="/loans/add"
                        className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
                      >
                        Create New Loan
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

