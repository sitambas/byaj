'use client';

import { useState, useEffect } from 'react';
import { personAPI } from '@/services/api';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  selectedBook: any;
}

export default function CustomerDetailsStep({ formData, setFormData, selectedBook }: Props) {
  const [people, setPeople] = useState<any[]>([]);
  const [showNewPerson, setShowNewPerson] = useState(false);

  useEffect(() => {
    if (selectedBook) {
      fetchPeople();
    }
  }, [selectedBook]);

  const fetchPeople = async () => {
    try {
      const response = await personAPI.getAll({ bookId: selectedBook?.id });
      setPeople(response.data.people);
    } catch (error) {
      console.error('Failed to fetch people:', error);
    }
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
            onClick={() => setShowNewPerson(false)}
            className={`px-4 py-2 rounded-lg ${
              !showNewPerson
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Select Existing
          </button>
          <button
            type="button"
            onClick={() => setShowNewPerson(true)}
            className={`px-4 py-2 rounded-lg ${
              showNewPerson
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Add New
          </button>
        </div>
      </div>

      {!showNewPerson ? (
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
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer name *
            </label>
            <input
              type="text"
              value={formData.personName}
              onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer phone *
            </label>
            <div className="flex">
              <select className="px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
                <option value="+91">+91</option>
              </select>
              <input
                type="tel"
                value={formData.personPhone}
                onChange={(e) => setFormData({ ...formData, personPhone: e.target.value })}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer address
            </label>
            <textarea
              value={formData.personAddress}
              onChange={(e) => setFormData({ ...formData, personAddress: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

