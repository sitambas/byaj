'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import { staffAPI, roleAPI } from '@/services/api';
import Link from 'next/link';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

interface Module {
  id: string;
  name: string;
  description: string;
}

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    roleType: 'system', // 'system' or 'custom'
    roleId: '',
    roleName: 'STAFF',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRolesAndModules();
  }, []);

  const fetchRolesAndModules = async () => {
    try {
      const [rolesRes, modulesRes] = await Promise.all([
        roleAPI.getAll(),
        roleAPI.getModules(),
      ]);
      setRoles(rolesRes.data.roles);
      setModules(modulesRes.data.modules);
    } catch (err: any) {
      console.error('Failed to fetch roles/modules:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePermissionToggle = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(moduleId)
        ? prev.permissions.filter((id) => id !== moduleId)
        : [...prev.permissions, moduleId],
    }));
  };

  const handleRoleChange = (roleId: string) => {
    const selectedRole = roles.find((r) => r.id === roleId);
    if (selectedRole) {
      setFormData((prev) => ({
        ...prev,
        roleId: roleId,
        permissions: selectedRole.permissions || [],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        phone: formData.phone,
        name: formData.name || undefined,
      };

      if (formData.roleType === 'custom' && formData.roleId) {
        payload.roleId = formData.roleId;
        if (formData.permissions.length > 0) {
          payload.permissions = formData.permissions;
        }
      } else {
        payload.roleName = formData.roleName;
        if (formData.permissions.length > 0) {
          payload.permissions = formData.permissions;
        }
      }

      await staffAPI.create(payload);
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="system"
                          checked={formData.roleType === 'system'}
                          onChange={(e) => setFormData({ ...formData, roleType: e.target.value, roleId: '' })}
                          disabled={loading}
                          className="mr-2"
                        />
                        System Role
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="custom"
                          checked={formData.roleType === 'custom'}
                          onChange={(e) => setFormData({ ...formData, roleType: e.target.value, roleName: 'STAFF' })}
                          disabled={loading}
                          className="mr-2"
                        />
                        Custom Role
                      </label>
                    </div>

                    {formData.roleType === 'system' ? (
                      <select
                        value={formData.roleName}
                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value, permissions: [] })}
                        required
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      >
                        <option value="VIEWER">Viewer - Read only access</option>
                        <option value="STAFF">Staff - Basic operations</option>
                        <option value="MANAGER">Manager - Advanced operations</option>
                        <option value="ADMIN">Admin - Full access</option>
                      </select>
                    ) : (
                      <div>
                        <select
                          value={formData.roleId}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          required
                          disabled={loading || loadingData}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        >
                          <option value="">Select a custom role</option>
                          {roles.filter((r) => !r.isSystem).map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name} {role.description && `- ${role.description}`}
                            </option>
                          ))}
                        </select>
                        {roles.filter((r) => !r.isSystem).length === 0 && (
                          <p className="mt-2 text-sm text-gray-500">
                            No custom roles available.{' '}
                            <Link href="/staff/roles" className="text-indigo-600 hover:text-indigo-900">
                              Create a role
                            </Link>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Module Permissions
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                      {modules.map((module) => (
                        <label key={module.id} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(module.id)}
                            onChange={() => handlePermissionToggle(module.id)}
                            disabled={loading}
                            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{module.name}</div>
                            <div className="text-xs text-gray-500">{module.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Select which modules this staff member can access. If a custom role is selected, these permissions will override the role's default permissions.
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

