import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (phone: string) => api.post('/api/auth/login', { phone }),
  verify: (phone: string, otp: string) => api.post('/api/auth/verify', { phone, otp }),
  me: () => api.get('/api/auth/me'),
};

export const bookAPI = {
  getAll: () => api.get('/api/books'),
  create: (data: { name: string }) => api.post('/api/books', data),
  update: (id: string, data: { name: string }) => api.put(`/api/books/${id}`, data),
  delete: (id: string) => api.delete(`/api/books/${id}`),
};

export const personAPI = {
  getAll: (filters?: any) => api.get('/api/people', { params: filters }),
  getById: (id: string) => api.get(`/api/people/${id}`),
  create: (data: any) => api.post('/api/people', data),
  update: (id: string, data: any) => api.put(`/api/people/${id}`, data),
  delete: (id: string) => api.delete(`/api/people/${id}`),
};

export const loanAPI = {
  getAll: (filters?: any) => api.get('/api/loans', { params: filters }),
  getById: (id: string) => api.get(`/api/loans/${id}`),
  create: (data: any) => api.post('/api/loans', data),
  update: (id: string, data: any) => api.put(`/api/loans/${id}`, data),
  delete: (id: string) => api.delete(`/api/loans/${id}`),
  recordPayment: (id: string, payment: any) => api.post(`/api/loans/${id}/payments`, payment),
};

export const transactionAPI = {
  getAll: (filters?: any) => api.get('/api/transactions', { params: filters }),
  create: (data: any) => api.post('/api/transactions', data),
};

export const reportAPI = {
  interest: (borrowerId?: string) => api.get('/api/reports/interest', { params: { borrowerId } }),
  transaction: (filters?: any) => api.get('/api/reports/transaction', { params: filters }),
  partyStatement: (personId: string) => api.get('/api/reports/party-statement', { params: { personId } }),
  accountSummary: () => api.get('/api/reports/account-summary'),
};

export const dashboardAPI = {
  summary: () => api.get('/api/dashboard/summary'),
  charts: () => api.get('/api/dashboard/charts'),
  dueLoans: (filters?: any) => api.get('/api/dashboard/due-loans', { params: filters }),
};

export const staffAPI = {
  getAll: () => api.get('/api/staff'),
  getById: (id: string) => api.get(`/api/staff/${id}`),
  getMe: () => api.get('/api/staff/me'),
  create: (data: { phone: string; name?: string; role: string }) => api.post('/api/staff', data),
  update: (id: string, data: { role?: string; name?: string }) => api.put(`/api/staff/${id}`, data),
  delete: (id: string) => api.delete(`/api/staff/${id}`),
};

export default api;

