'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import { staffAPI } from '@/services/api';

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    role: 'STAFF',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await staffAPI.create({
        phone: formData.phone,
        name: formData.name || undefined,
        role: formData.role,
      });
      router.push('/staff');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create staff member');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Staff Member</h1>

              <div className="bg-white rounded-lg shadow p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter staff name"
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="VIEWER">Viewer - Read only access</option>
                      <option value="STAFF">Staff - Basic operations</option>
                      <option value="MANAGER">Manager - Advanced operations</option>
                      <option value="ADMIN">Admin - Full access</option>
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      Select the appropriate role for this staff member based on their responsibilities.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      disabled={loading}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Creating...' : 'Create Staff'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
      </AdminRoute>
    </ProtectedRoute>
  );
}

