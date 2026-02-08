'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPeople } from '@/store/slices/personSlice';
import { setBooks, setSelectedBook } from '@/store/slices/bookSlice';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { personAPI, bookAPI } from '@/services/api';
import { getUserPermissions } from '@/utils/permissions';
import Link from 'next/link';

export default function PeoplePage() {
  const dispatch = useDispatch();
  const people = useSelector((state: RootState) => state.people.people);
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const books = useSelector((state: RootState) => state.book.books);
  const userBranches = useSelector((state: RootState) => state.book.userBranches);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const permissions = await getUserPermissions();
        setIsOwner(permissions.isOwner);
        
        // Fetch books (this will return only accessible branches)
        try {
          const response = await bookAPI.getAll();
          dispatch(setBooks(response.data.books));
          
          // Use userBranches if available (from login), otherwise use books from API
          const availableBranches = userBranches.length > 0 ? userBranches : response.data.books;
          
          // Auto-select first branch if available and none selected
          if (availableBranches.length > 0 && !selectedBook) {
            const firstBranch = availableBranches[0];
            setSelectedBranchId(firstBranch.id);
            dispatch(setSelectedBook(firstBranch));
          }
          
          // For super admin, also allow selecting from dropdown
          if (permissions.isOwner && response.data.books.length > 0 && !selectedBranchId) {
            const firstBook = response.data.books[0];
            setSelectedBranchId(firstBook.id);
            dispatch(setSelectedBook(firstBook));
          }
        } catch (error: any) {
          console.error('Failed to fetch books:', error);
          // If it's a network error, the backend might not be running
          if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            console.error('Network error: Make sure the backend server is running on http://localhost:4000');
            setNetworkError(true);
          }
        }
      } catch (error: any) {
        console.error('Failed to get permissions:', error);
      }
    };
    
    initialize();
  }, []);

  useEffect(() => {
    // For staff: use selectedBook from Redux (set from userBranches)
    // For owner: use selectedBranchId from dropdown
    const branchId = isOwner ? selectedBranchId : selectedBook?.id;
    if (branchId) {
      fetchPeople(branchId);
    } else if (!isOwner && userBranches.length > 0 && !selectedBook) {
      // Auto-select first branch for staff if not already selected
      const firstBranch = userBranches[0];
      dispatch(setSelectedBook(firstBranch));
    }
  }, [selectedBook, selectedBranchId, isOwner, search, userBranches, dispatch]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    if (branchId) {
      const branch = books.find((b) => b.id === branchId);
      if (branch) {
        dispatch(setSelectedBook(branch));
      }
    } else {
      dispatch(setSelectedBook(null));
    }
  };

  const fetchPeople = async (branchId: string) => {
    try {
      setLoading(true);
      const response = await personAPI.getAll({
        bookId: branchId,
        search,
      });
      dispatch(setPeople(response.data.people));
    } catch (error) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Customer List</h1>
                {networkError && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Connection Error</p>
                    <p className="text-sm mt-1">
                      Cannot connect to the backend server. Please make sure the backend is running on <code className="bg-red-100 px-1 rounded">http://localhost:4000</code>
                    </p>
                  </div>
                )}
                {isOwner ? (
                  <div className="mt-3 flex items-center space-x-3">
                    <label htmlFor="branch-select" className="text-sm font-medium text-gray-700">
                      Select Branch:
                    </label>
                    <select
                      id="branch-select"
                      value={selectedBranchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
                    >
                      <option value="">Select a branch...</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.name}
                        </option>
                      ))}
                    </select>
                    {selectedBranchId && (
                      <span className="text-sm text-gray-500">
                        Viewing: <span className="font-semibold text-indigo-600">
                          {books.find((b) => b.id === selectedBranchId)?.name}
                        </span>
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    {selectedBook && (
                      <p className="text-sm text-gray-500 mt-1">
                        Branch: <span className="font-semibold text-indigo-600">{selectedBook.name}</span>
                      </p>
                    )}
                    {!selectedBook && (
                      <p className="text-sm text-yellow-600 mt-1">Please select a branch to view customers</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Total Customers</p>
                    <p className="text-3xl font-bold">{people.length}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Active Customers</p>
                    <p className="text-3xl font-bold">
                      {people.filter((p) => p.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Contact Coverage</p>
                    <p className="text-3xl font-bold">100%</p>
                  </div>
                  <div className="text-4xl">📞</div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search customers..."
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
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Show Filters
                </button>
              </div>
            </div>

            {/* Customer Table */}
            {!isOwner && !selectedBook ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                Please select a branch from the sidebar to view customers.
              </div>
            ) : isOwner && !selectedBranchId ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                Please select a branch from the dropdown above to view customers.
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-gray-500">Loading customers...</div>
            ) : people.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                {(() => {
                  const currentBranch = isOwner 
                    ? books.find((b) => b.id === selectedBranchId)
                    : selectedBook;
                  return (
                    <>
                      <p className="text-gray-500 mb-2">
                        No customers found in <strong>{currentBranch?.name || 'selected'}</strong> branch.
                      </p>
                      <p className="text-gray-500 mb-4">Add your first customer to get started.</p>
                <Link
                        href="/customer/add"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Add customer
                </Link>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        PERSON
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        CONTACT INFO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        A/C NO.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        BRANCH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        LOANS COUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {people.map((person) => {
                      const isInactive = person.status === 'INACTIVE';
                      return (
                        <tr 
                          key={person.id} 
                          className={`hover:bg-gray-50 ${isInactive ? 'opacity-60' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                isInactive ? 'bg-gray-100' : 'bg-indigo-100'
                              }`}>
                                <span className={`font-semibold ${
                                  isInactive ? 'text-gray-500' : 'text-indigo-600'
                                }`}>
                                  {person.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${
                                  isInactive ? 'text-gray-500' : 'text-gray-900'
                                }`}>
                                  {person.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                              📞 {person.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {person.accountNo || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const currentBranch = isOwner 
                                ? books.find((b) => b.id === selectedBranchId)
                                : selectedBook;
                              return currentBranch ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  📚 {currentBranch.name}
                                </span>
                              ) : null;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isInactive 
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {person.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {person.loansCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/customer/${person.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Floating Action Button */}
            <Link
              href="/customer/add"
              className="fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="font-medium">Add customer</span>
            </Link>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

