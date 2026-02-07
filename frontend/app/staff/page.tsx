'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import { staffAPI } from '@/services/api';
import Link from 'next/link';

interface StaffMember {
  id: string;
  userId: string;
  phone: string;
  name: string | null;
  roleId: string | null;
  roleName: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
  permissions: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, [search]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await staffAPI.getAll();
      setStaff(response.data.staff);
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
      setError(err.response?.data?.error || 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name || 'this staff member'}?`)) {
      return;
    }

    try {
      await staffAPI.delete(id);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete staff member');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'STAFF':
        return 'bg-green-100 text-green-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredStaff = staff.filter((member) => {
    const searchLower = search.toLowerCase();
    const roleDisplayName = member.role?.name || member.roleName;
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.phone.includes(search) ||
      roleDisplayName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">My Staff</h1>
              <div className="flex space-x-3">
                <Link
                  href="/staff/roles"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Manage Roles
                </Link>
                <Link
                  href="/staff/add"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  + Add Staff
                </Link>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Total Staff</p>
                    <p className="text-3xl font-bold">{staff.length}</p>
                  </div>
                  <div className="text-4xl">👨‍💼</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Admins</p>
                    <p className="text-3xl font-bold">
                      {staff.filter((s) => s.roleName === 'ADMIN').length}
                    </p>
                  </div>
                  <div className="text-4xl">👑</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Managers</p>
                    <p className="text-3xl font-bold">
                      {staff.filter((s) => s.roleName === 'MANAGER').length}
                    </p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Staff Members</p>
                    <p className="text-3xl font-bold">
                      {staff.filter((s) => s.roleName === 'STAFF' || s.roleName === 'VIEWER').length}
                    </p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or role..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Staff Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading staff...</div>
            ) : filteredStaff.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500 mb-4">
                  {search ? 'No staff members found matching your search.' : 'No staff members yet. Add your first staff member to get started.'}
                </p>
                {!search && (
                  <Link
                    href="/staff/add"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                  >
                    Add Staff
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        NAME
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        PHONE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        ROLE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        JOINED
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name || 'No name'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                              member.roleName
                            )}`}
                          >
                            {member.role?.name || member.roleName}
                            {member.roleId && (
                              <span className="ml-1 text-xs">(Custom)</span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/staff/edit?id=${member.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(member.id, member.name || '')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </main>
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  );
}

