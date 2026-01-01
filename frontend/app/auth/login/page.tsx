'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpFromServer, setOtpFromServer] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(phone);
      const { otp: serverOtp, message } = response.data;
      
      setOtpFromServer(serverOtp || '');
      setOtpSent(true);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verify(phone, otp);
      const { user, token } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Store credentials in Redux and localStorage
      dispatch(setCredentials({ user, token }));
      
      // Wait a moment to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify token is stored before redirecting
      if (typeof window !== 'undefined' && localStorage.getItem('token')) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to store authentication token');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Purple Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-purple-900 text-white flex-col items-center justify-center p-12">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Digitalising lending for Bharat
        </h1>
        <div className="text-center text-purple-200">
          <p className="text-lg">Manage your loans efficiently</p>
          <p className="text-lg">Track payments and interest</p>
          <p className="text-lg">Generate comprehensive reports</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-purple-600 text-white rounded-full p-4 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hello User</h2>
            <p className="text-gray-600">Enter Your Phone Number To Continue</p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <select className="px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="+91">+91</option>
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone No."
                    required
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {otpFromServer && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">OTP sent successfully!</p>
                  <p className="text-sm mt-1">Your OTP is: <strong>{otpFromServer}</strong></p>
                  <p className="text-xs mt-1 text-green-600">(This is shown only in development mode)</p>
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength={6}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  OTP sent to {phone}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setOtpFromServer('');
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Not already a member?</span>
              </div>
            </div>
            <button className="mt-4 w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
              Subscribe now or Start free trial
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <span>HINDI</span>
              <span>|</span>
              <span>ENGLISH</span>
              <span>|</span>
              <span>HINGLISH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

