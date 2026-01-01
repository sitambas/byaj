# Implementation Guide - ByajBook

## Quick Start Commands

### Backend Setup
```bash
# Initialize backend
mkdir backend && cd backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken
npm install -D @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken typescript ts-node nodemon
npm install prisma @prisma/client
npx prisma init
```

### Frontend Setup
```bash
# Initialize frontend
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install @reduxjs/toolkit react-redux
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns
npm install react-datepicker
npm install axios
```

## Key Implementation Details

### 1. Interest Calculation Logic

#### Simple Interest
```typescript
// backend/src/services/interestCalculator.ts
export class InterestCalculator {
  static simpleInterest(
    principal: number,
    rate: number,
    days: number,
    interestEvery: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  ): number {
    const periods = this.getPeriods(days, interestEvery);
    return (principal * rate * periods) / 100;
  }

  static compoundInterest(
    principal: number,
    rate: number,
    days: number,
    interestEvery: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    compoundingFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  ): number {
    const periods = this.getPeriods(days, interestEvery);
    const n = this.getCompoundingPeriods(compoundingFrequency);
    return principal * (Math.pow(1 + (rate / (100 * n)), n * periods) - 1);
  }

  static monthlyCalculation(
    principal: number,
    rate: number,
    startDate: Date,
    endDate: Date
  ): number {
    // Calculate interest period-wise (round up partial months)
    const months = this.getMonthsBetween(startDate, endDate);
    return (principal * rate * months) / 100;
  }

  static dailyCalculation(
    principal: number,
    rate: number,
    days: number
  ): number {
    // Calculate exact days
    return (principal * rate * days) / (100 * 365);
  }

  private static getPeriods(days: number, interestEvery: string): number {
    switch (interestEvery) {
      case 'DAILY':
        return days;
      case 'WEEKLY':
        return Math.ceil(days / 7);
      case 'MONTHLY':
        return Math.ceil(days / 30);
      default:
        return days;
    }
  }
}
```

### 2. EMI Calculation
```typescript
export class EMICalculator {
  static calculateEMI(
    principal: number,
    rate: number,
    numberOfMonths: number
  ): number {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
                (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    return emi;
  }

  static generateEMISchedule(
    principal: number,
    rate: number,
    numberOfMonths: number,
    startDate: Date
  ): Array<{ date: Date; principal: number; interest: number; total: number }> {
    const emi = this.calculateEMI(principal, rate, numberOfMonths);
    const schedule = [];
    let remainingPrincipal = principal;

    for (let i = 0; i < numberOfMonths; i++) {
      const monthlyRate = rate / (12 * 100);
      const interest = remainingPrincipal * monthlyRate;
      const principalPayment = emi - interest;
      remainingPrincipal -= principalPayment;

      schedule.push({
        date: this.addMonths(startDate, i + 1),
        principal: principalPayment,
        interest: interest,
        total: emi
      });
    }

    return schedule;
  }
}
```

### 3. Redux Store Structure

```typescript
// frontend/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import bookSlice from './slices/bookSlice';
import loanSlice from './slices/loanSlice';
import personSlice from './slices/personSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    book: bookSlice,
    loans: loanSlice,
    people: personSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 4. API Service Layer

```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loanAPI = {
  getAll: (filters?: any) => api.get('/api/loans', { params: filters }),
  getById: (id: string) => api.get(`/api/loans/${id}`),
  create: (data: any) => api.post('/api/loans', data),
  update: (id: string, data: any) => api.put(`/api/loans/${id}`, data),
  delete: (id: string) => api.delete(`/api/loans/${id}`),
  recordPayment: (id: string, payment: any) => 
    api.post(`/api/loans/${id}/payments`, payment),
};

export default api;
```

### 5. Multi-step Form Component

```typescript
// frontend/src/components/loans/AddLoanWizard.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CustomerDetailsStep from './steps/CustomerDetailsStep';
import LoanTypeStep from './steps/LoanTypeStep';
import LoanDetailsStep from './steps/LoanDetailsStep';
import AttachmentsStep from './steps/AttachmentsStep';

const steps = [
  { id: 1, name: 'Customer details', component: CustomerDetailsStep },
  { id: 2, name: 'Loan Type', component: LoanTypeStep },
  { id: 3, name: 'Loan Details', component: LoanDetailsStep },
  { id: 4, name: 'Attachments', component: AttachmentsStep },
];

export default function AddLoanWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm();

  const next = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previous = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="p-6">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-gray-300'
            }`}>
              {step.id}
            </div>
            <span className="ml-2">{step.name}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <CurrentStepComponent form={form} />

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={previous} disabled={currentStep === 1}>
          Previous
        </button>
        {currentStep < steps.length ? (
          <button onClick={next}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Create Loan</button>
        )}
      </div>
    </div>
  );
}
```

### 6. Dashboard Chart Component

```typescript
// frontend/src/components/dashboard/DonutChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#9333ea', '#f97316']; // Purple and Orange

export default function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={100}
          outerRadius={150}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### 7. Backend Loan Controller

```typescript
// backend/src/controllers/loanController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InterestCalculator } from '../services/interestCalculator';

const prisma = new PrismaClient();

export const createLoan = async (req: Request, res: Response) => {
  try {
    const {
      personId,
      bookId,
      accountType,
      loanType,
      interestCalc,
      principalAmount,
      interestRate,
      interestEvery,
      startDate,
      endDate,
      hasEMI,
      hasCompounding,
      dateToDateCalc,
      strategy,
      remarks,
    } = req.body;

    // Calculate interest
    let interest = 0;
    if (loanType === 'WITH_INTEREST') {
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      
      if (hasCompounding) {
        interest = InterestCalculator.compoundInterest(
          principalAmount,
          interestRate,
          days,
          interestEvery,
          interestEvery
        );
      } else {
        if (interestCalc === 'MONTHLY') {
          interest = InterestCalculator.monthlyCalculation(
            principalAmount,
            interestRate,
            new Date(startDate),
            new Date(endDate)
          );
        } else {
          interest = InterestCalculator.dailyCalculation(
            principalAmount,
            interestRate,
            days
          );
        }
      }
    }

    const loan = await prisma.loan.create({
      data: {
        personId,
        bookId,
        accountType,
        loanType,
        interestCalc,
        principalAmount,
        interestRate,
        interestEvery,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        hasEMI,
        hasCompounding,
        dateToDateCalc,
        strategy,
        remarks,
        status: 'ACTIVE',
      },
    });

    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLoanDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        person: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        collaterals: true,
      },
    });

    // Calculate current totals
    const totalRecovered = loan.transactions
      .filter(t => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInterest = loan.hasCompounding
      ? InterestCalculator.compoundInterest(...)
      : InterestCalculator.simpleInterest(...);

    res.json({
      ...loan,
      calculated: {
        totalInterest,
        totalAmount: loan.principalAmount + totalInterest,
        amountRecovered: totalRecovered,
        amountLeft: (loan.principalAmount + totalInterest) - totalRecovered,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 8. PDF Report Generation

```typescript
// backend/src/services/reportGenerator.ts
import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateInterestReport = async (
  loanId: string,
  borrowerName: string,
  data: any
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    // Add content
    doc.fontSize(20).text('Interest Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Borrower: ${borrowerName}`);
    doc.text(`Loan ID: ${loanId}`);
    doc.moveDown();
    
    // Add table data
    doc.fontSize(12);
    doc.text(`Principal: ₹${data.principal}`);
    doc.text(`Interest: ₹${data.interest}`);
    doc.text(`Total: ₹${data.total}`);

    doc.end();
  });
};
```

## Component Library Structure

### Reusable Components
- `Button` - Primary, secondary, danger variants
- `Input` - Text, number, phone, date inputs
- `Modal` - Reusable modal wrapper
- `Table` - Data table with sorting/filtering
- `Card` - Content card wrapper
- `Badge` - Status badges
- `Chart` - Chart wrapper components
- `FormField` - Form field with validation
- `Sidebar` - Navigation sidebar
- `Header` - Top header bar

## State Management Patterns

### Redux Slices Example
```typescript
// frontend/src/store/slices/loanSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loanAPI } from '../../services/api';

export const fetchLoans = createAsyncThunk(
  'loans/fetchAll',
  async (filters?: any) => {
    const response = await loanAPI.getAll(filters);
    return response.data;
  }
);

const loanSlice = createSlice({
  name: 'loans',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {},
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters } = loanSlice.actions;
export default loanSlice.reducer;
```

## Testing Strategy

### Backend Tests
- Unit tests for interest calculations
- Integration tests for API endpoints
- Database transaction tests

### Frontend Tests
- Component tests with React Testing Library
- Redux store tests
- E2E tests with Playwright

## Deployment

### Backend
- Deploy to AWS EC2, Heroku, or Railway
- Use PM2 for process management
- Setup PostgreSQL on AWS RDS or managed service

### Frontend
- Deploy to Vercel (recommended for Next.js)
- Or deploy to AWS S3 + CloudFront

### Mobile
- Build APK for Android
- Build IPA for iOS (requires Apple Developer account)

### Desktop
- Use electron-builder for packaging
- Code sign for distribution
- Setup auto-updater

