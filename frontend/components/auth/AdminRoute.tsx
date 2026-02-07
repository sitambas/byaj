'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { staffAPI } from '@/services/api';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (mounted && isAuthenticated) {
      checkAccess();
    }
  }, [mounted, isAuthenticated, router]);

  const checkAccess = async () => {
    try {
      // Try to get staff info - if user is owner, this will fail with 404
      // If user is staff, it will return their info
      const response = await staffAPI.getMe();
      const staff = response.data.staff;
      
      // Check if user is ADMIN
      if (staff.role === 'ADMIN') {
        setHasAccess(true);
      } else {
        // Not admin, deny access
        setHasAccess(false);
      }
    } catch (err: any) {
      // If 404, user is owner (no staff record) - has full access
      if (err.response?.status === 404) {
        setHasAccess(true);
      } else {
        // Other error or insufficient permissions
        setHasAccess(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || loading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only administrators and owners can manage staff.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

