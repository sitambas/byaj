'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { personAPI, uploadAPI } from '@/services/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    accountNo: '',
  });
  const [kycDocuments, setKycDocuments] = useState<{
    aadhaar?: string;
    pan?: string;
    photo?: string;
    addressProof?: string;
    signature?: string;
  }>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  const fileInputRefs = {
    aadhaar: useRef<HTMLInputElement>(null),
    pan: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLInputElement>(null),
    addressProof: useRef<HTMLInputElement>(null),
    signature: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoadingData(true);
      const response = await personAPI.getById(customerId);
      const customer = response.data.person;
      
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        accountNo: customer.accountNo || '',
      });

      // Parse KYC documents if they exist
      if (customer.kycDocuments) {
        try {
          const parsed = typeof customer.kycDocuments === 'string' 
            ? JSON.parse(customer.kycDocuments) 
            : customer.kycDocuments;
          setKycDocuments(parsed || {});
        } catch (e) {
          console.error('Error parsing KYC documents:', e);
          setKycDocuments({});
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load customer data');
      console.error('Failed to fetch customer:', err);
    } finally {
      setLoadingData(false);
    }
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
      
      setError('');
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

    setLoading(true);
    try {
      await personAPI.update(customerId, {
        ...formData,
        kycDocuments: Object.keys(kycDocuments).length > 0 ? kycDocuments : null,
      });
      router.push(`/customer/${customerId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              <div className="text-center py-12 text-gray-500">Loading customer data...</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
              {selectedBook && (
                <p className="text-sm text-gray-500 mt-1">
                  Branch: <span className="font-semibold text-indigo-600">{selectedBook.name}</span>
                </p>
              )}
            </div>

            {!selectedBook && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                Please select a branch from the sidebar.
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

                <div>
                  <label htmlFor="accountNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    id="accountNo"
                    type="text"
                    value={formData.accountNo}
                    onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
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
                        <div className="relative inline-block">
                          <img
                            src={`${API_URL}${kycDocuments.aadhaar}`}
                            alt="Aadhaar"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('aadhaar')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
                        <div className="relative inline-block">
                          <img
                            src={`${API_URL}${kycDocuments.pan}`}
                            alt="PAN"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('pan')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
                        Customer Photo
                      </label>
                      <input
                        ref={fileInputRefs.photo}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="hidden"
                      />
                      {kycDocuments.photo ? (
                        <div className="relative inline-block">
                          <img
                            src={`${API_URL}${kycDocuments.photo}`}
                            alt="Photo"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('photo')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.photo.current?.click()}
                          disabled={uploading === 'photo'}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                        >
                          {uploading === 'photo' ? 'Uploading...' : '+ Upload Photo'}
                        </button>
                      )}
                    </div>

                    {/* Address Proof */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Proof
                      </label>
                      <input
                        ref={fileInputRefs.addressProof}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'addressProof')}
                        className="hidden"
                      />
                      {kycDocuments.addressProof ? (
                        <div className="relative inline-block">
                          <img
                            src={`${API_URL}${kycDocuments.addressProof}`}
                            alt="Address Proof"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('addressProof')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.addressProof.current?.click()}
                          disabled={uploading === 'addressProof'}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                        >
                          {uploading === 'addressProof' ? 'Uploading...' : '+ Upload Address Proof'}
                        </button>
                      )}
                    </div>

                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Signature
                      </label>
                      <input
                        ref={fileInputRefs.signature}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'signature')}
                        className="hidden"
                      />
                      {kycDocuments.signature ? (
                        <div className="relative inline-block">
                          <img
                            src={`${API_URL}${kycDocuments.signature}`}
                            alt="Signature"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocument('signature')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.signature.current?.click()}
                          disabled={uploading === 'signature'}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                        >
                          {uploading === 'signature' ? 'Uploading...' : '+ Upload Signature'}
                        </button>
                      )}
                    </div>
                  </div>
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
                    {loading ? 'Updating...' : 'Update Customer'}
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

