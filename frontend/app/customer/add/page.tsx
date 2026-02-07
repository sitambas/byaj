'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { personAPI, uploadAPI } from '@/services/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AddPersonPage() {
  const router = useRouter();
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [kycDocuments, setKycDocuments] = useState<{
    aadhaar?: string;
    pan?: string;
    photo?: string;
    addressProof?: string;
  }>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRefs = {
    aadhaar: useRef<HTMLInputElement>(null),
    pan: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLInputElement>(null),
    addressProof: useRef<HTMLInputElement>(null),
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    setUploading(documentType);
    try {
      const response = await uploadAPI.uploadKYC(file);
      const fileUrl = response.data.file.url;
      
      setKycDocuments((prev) => ({
        ...prev,
        [documentType]: fileUrl,
      }));
      
      // Clear error if required document is uploaded
      if (error && (error.includes('Customer Photo') || error.includes('Address Proof'))) {
        setError('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, documentType);
    }
  };

  const removeDocument = (documentType: string) => {
    setKycDocuments((prev) => {
      const updated = { ...prev };
      delete updated[documentType as keyof typeof updated];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBook) {
      setError('Please select a book first');
      return;
    }

    // Validate required KYC documents
    if (!kycDocuments.photo) {
      setError('Customer Photo is required');
      return;
    }

    if (!kycDocuments.addressProof) {
      setError('Address Proof is required');
      return;
    }

    setLoading(true);
    try {
      await personAPI.create({
        ...formData,
        bookId: selectedBook.id,
        kycDocuments: Object.keys(kycDocuments).length > 0 ? kycDocuments : null,
      });
      router.push('/customer');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
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
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="text-indigo-600 hover:text-indigo-700 mb-4"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
              {selectedBook && (
                <p className="text-sm text-gray-500 mt-1">
                  Adding to branch: <span className="font-semibold text-indigo-600">{selectedBook.name}</span>
                </p>
              )}
            </div>

            {!selectedBook && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                Please select a branch from the sidebar before adding a customer.
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer phone *
                  </label>
                  <div className="flex">
                    <select className="px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
                      <option value="+91">+91</option>
                    </select>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer address
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* KYC Documents Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Aadhaar Card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhaar Card
                      </label>
                      <input
                        ref={fileInputRefs.aadhaar}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'aadhaar')}
                        className="hidden"
                      />
                      {kycDocuments.aadhaar ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${API_URL}${kycDocuments.aadhaar}`}
                            alt="Aadhaar"
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('aadhaar')}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.aadhaar.current?.click()}
                          disabled={uploading === 'aadhaar'}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                        >
                          {uploading === 'aadhaar' ? 'Uploading...' : '+ Upload Aadhaar'}
                        </button>
                      )}
                    </div>

                    {/* PAN Card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Card
                      </label>
                      <input
                        ref={fileInputRefs.pan}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'pan')}
                        className="hidden"
                      />
                      {kycDocuments.pan ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${API_URL}${kycDocuments.pan}`}
                            alt="PAN"
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('pan')}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.pan.current?.click()}
                          disabled={uploading === 'pan'}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                        >
                          {uploading === 'pan' ? 'Uploading...' : '+ Upload PAN'}
                        </button>
                      )}
                    </div>

                    {/* Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Photo <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={fileInputRefs.photo}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="hidden"
                      />
                      {kycDocuments.photo ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${API_URL}${kycDocuments.photo}`}
                            alt="Photo"
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('photo')}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.photo.current?.click()}
                          disabled={uploading === 'photo'}
                          className={`w-full px-4 py-2 border-2 border-dashed rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50 ${
                            error && error.includes('Customer Photo') ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {uploading === 'photo' ? 'Uploading...' : '+ Upload Photo'}
                        </button>
                      )}
                      {error && error.includes('Customer Photo') && (
                        <p className="text-red-500 text-xs mt-1">Customer Photo is required</p>
                      )}
                    </div>

                    {/* Address Proof */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Proof <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={fileInputRefs.addressProof}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'addressProof')}
                        className="hidden"
                      />
                      {kycDocuments.addressProof ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${API_URL}${kycDocuments.addressProof}`}
                            alt="Address Proof"
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('addressProof')}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.addressProof.current?.click()}
                          disabled={uploading === 'addressProof'}
                          className={`w-full px-4 py-2 border-2 border-dashed rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50 ${
                            error && error.includes('Address Proof') ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {uploading === 'addressProof' ? 'Uploading...' : '+ Upload Address Proof'}
                        </button>
                      )}
                      {error && error.includes('Address Proof') && (
                        <p className="text-red-500 text-xs mt-1">Address Proof is required</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> Account number will be automatically generated as a 10-digit number when you create the customer.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Customer'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

