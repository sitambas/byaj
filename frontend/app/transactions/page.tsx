'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { reportAPI, personAPI, loanAPI } from '@/services/api';
import Link from 'next/link';

interface Transaction {
  id: string;
  loanId: string;
  billNumber: string;
  person: {
    id: string;
    name: string;
    phone: string;
  };
  amount: number;
  type: string;
  paymentMode: string;
  date: string;
  remarks: string | null;
  createdAt: string;
}

export default function TransactionsPage() {
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    personId: '',
    loanId: '',
    type: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (selectedBook) {
      fetchPeople();
      fetchLoans();
      fetchTransactions();
    }
  }, [selectedBook, filters, search]);

  const fetchPeople = async () => {
    if (!selectedBook) return;
    try {
      const response = await personAPI.getAll({ bookId: selectedBook.id });
      setPeople(response.data.people || []);
    } catch (error) {
      console.error('Failed to fetch people:', error);
    }
  };

  const fetchLoans = async () => {
    if (!selectedBook) return;
    try {
      const response = await loanAPI.getAll({ bookId: selectedBook.id });
      setLoans(response.data.loans || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!selectedBook) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        bookId: selectedBook.id,
      };

      if (filters.personId) params.personId = filters.personId;
      if (filters.loanId) params.loanId = filters.loanId;
      if (filters.type) params.type = filters.type;
      if (filters.paymentMode) params.paymentMode = filters.paymentMode;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await reportAPI.transaction(params);
      let transactionList = response.data.transactions || [];

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        transactionList = transactionList.filter(
          (t: Transaction) =>
            t.person.name.toLowerCase().includes(searchLower) ||
            t.person.phone.includes(search) ||
            t.billNumber.toLowerCase().includes(searchLower)
        );
      }

      setTransactions(transactionList);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'Payment';
      case 'TOPUP':
        return 'Top Up';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-green-100 text-green-800';
      case 'TOPUP':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPayments = transactions.filter((t) => t.type === 'PAYMENT').reduce((sum, t) => sum + t.amount, 0);
  const totalTopups = transactions.filter((t) => t.type === 'TOPUP').reduce((sum, t) => sum + t.amount, 0);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-2">View and manage all loan transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Total Transactions</p>
                    <p className="text-3xl font-bold">{transactions.length}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Total Amount</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="text-4xl">₹</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Total Payments</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalPayments)}</p>
                  </div>
                  <div className="text-4xl">💵</div>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-200">Total Top Ups</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalTopups)}</p>
                  </div>
                  <div className="text-4xl">⬆️</div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer name, phone, or bill number..."
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

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={filters.personId}
                    onChange={(e) => setFilters({ ...filters, personId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loan</label>
                  <select
                    value={filters.loanId}
                    onChange={(e) => setFilters({ ...filters, loanId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All</option>
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        {loan.billNumber || loan.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="TOPUP">Top Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <select
                    value={filters.paymentMode}
                    onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {(filters.personId || filters.loanId || filters.type || filters.paymentMode || filters.startDate || filters.endDate) && (
                <div className="mt-4">
                  <button
                    onClick={() => setFilters({ personId: '', loanId: '', type: '', paymentMode: '', startDate: '', endDate: '' })}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Transactions Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500 mb-4">No transactions found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        DATE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        CUSTOMER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        BILL NUMBER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        AMOUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        PAYMENT MODE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        REMARKS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.person.name}</div>
                            <div className="text-sm text-gray-500">{transaction.person.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.billNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                            {getTypeLabel(transaction.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.paymentMode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {transaction.remarks || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/loans/${transaction.loanId}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Loan →
                          </Link>
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
    </ProtectedRoute>
  );
}

