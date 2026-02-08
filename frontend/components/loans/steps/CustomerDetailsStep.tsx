'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { personAPI } from '@/services/api';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  selectedBook: any;
}

export default function CustomerDetailsStep({ formData, setFormData, selectedBook }: Props) {
  const router = useRouter();
  const [people, setPeople] = useState<any[]>([]);

  const fetchPeople = useCallback(async () => {
    if (!selectedBook) return;
    try {
      const response = await personAPI.getAll({ bookId: selectedBook.id });
      setPeople(response.data.people);
    } catch (error) {
      console.error('Failed to fetch people:', error);
    }
  }, [selectedBook]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Refresh customer list when window regains focus (e.g., returning from customer add page)
  useEffect(() => {
    const handleFocus = () => {
      fetchPeople();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPeople]);

  const handleAddNew = () => {
    // Redirect to customer add page with return URL
    const returnUrl = encodeURIComponent('/loans/add');
    router.push(`/customer/add?returnUrl=${returnUrl}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer details</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select existing customer or add new
        </label>
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Select Existing
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Add New
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer name *
        </label>
        <select
          value={formData.personId}
          onChange={(e) => {
            const person = people.find((p) => p.id === e.target.value);
            setFormData({
              ...formData,
              personId: e.target.value,
              personName: person?.name || '',
              personPhone: person?.phone || '',
              personAddress: person?.address || '',
            });
          }}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Customer</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} - {person.phone}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

