'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPeople } from '@/store/slices/personSlice';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { personAPI } from '@/services/api';
import Link from 'next/link';

export default function PeoplePage() {
  const dispatch = useDispatch();
  const people = useSelector((state: RootState) => state.people.people);
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (selectedBook) {
      fetchPeople();
    }
  }, [selectedBook, search]);

  const fetchPeople = async () => {
    try {
      const response = await personAPI.getAll({
        bookId: selectedBook?.id,
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
              <h1 className="text-3xl font-bold text-gray-900">People Management</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-200">Total People</p>
                    <p className="text-3xl font-bold">{people.length}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              <div className="bg-purple-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-200">Active People</p>
                    <p className="text-3xl font-bold">
                      {people.filter((p) => p.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>
              </div>
              <div className="bg-purple-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-200">Contact Coverage</p>
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
                    placeholder="Search People Placeholder"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Show Filters
                </button>
              </div>
            </div>

            {/* People Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading people...</div>
            ) : people.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500 mb-4">No people found. Add your first person to get started.</p>
                <Link
                  href="/people/add"
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                >
                  Add Person
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-600">
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
                    {people.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-purple-600 font-semibold">
                                {person.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{person.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">📞 {person.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person.accountNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {person.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person.loansCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/people/${person.id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Floating Action Button */}
            <Link
              href="/people/add"
              className="fixed bottom-8 right-8 bg-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
            >
              <span className="text-2xl">+</span>
            </Link>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

