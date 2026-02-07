'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedBook } from '@/store/slices/bookSlice';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { getUserPermissions } from '@/utils/permissions';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  requiresAdmin?: boolean;
  requiresModule?: string; // Module ID required to see this menu item
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Branch Management', path: '/books', icon: '📚', requiresModule: 'books' },
  { name: 'Loan accounts', path: '/loans', icon: '💰' },
  { name: 'Customer List', path: '/customer', icon: '👥' },
  { name: 'Transactions', path: '/transactions', icon: '📊' },
  { name: 'Reports', path: '/reports', icon: '📄' },
  { name: 'Interest Calculator', path: '/calculator', icon: '🧮' },
  { name: 'Deposits', path: '/deposits', icon: '🏦' },
  { name: 'My Staff', path: '/staff', icon: '👨‍💼', requiresAdmin: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const books = useSelector((state: RootState) => state.book.books);
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Auto-select first book if available and none selected
    if (books.length > 0 && !selectedBook) {
      dispatch(setSelectedBook(books[0]));
    }
  }, [books, selectedBook, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      checkAccess();
    }
  }, [isAuthenticated]);

  const checkAccess = async () => {
    try {
      const permissions = await getUserPermissions();
      setUserPermissions(permissions.modules);
      setHasAdminAccess(permissions.isOwner || permissions.roleName === 'ADMIN');
    } catch (err: any) {
      setHasAdminAccess(false);
      setUserPermissions([]);
    }
  };

  // Filter menu items based on admin access and module permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.requiresAdmin) {
      return hasAdminAccess === true;
    }
    if (item.requiresModule) {
      return userPermissions.includes(item.requiresModule);
    }
    return true;
  });

  return (
    <div className="w-64 bg-indigo-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <Logo variant="full" size="sm" dark />
      </div>
      
      <nav className="space-y-2">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-indigo-700">
        <div className="px-4 py-2">
          <p className="text-sm text-indigo-300 mb-2">CURRENT CONTEXT</p>
          <select
            value={selectedBook?.id || ''}
            onChange={(e) => {
              const book = books.find((b) => b.id === e.target.value);
              dispatch(setSelectedBook(book || null));
            }}
            className="w-full bg-indigo-800 text-white rounded px-3 py-2 text-sm"
          >
            <option value="">Select Book/Staff</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

