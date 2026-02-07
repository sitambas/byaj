'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { loanAPI, personAPI } from '@/services/api';
import CustomerDetailsStep from './steps/CustomerDetailsStep';
import LoanTypeStep from './steps/LoanTypeStep';
import LoanDetailsStep from './steps/LoanDetailsStep';
import AttachmentsStep from './steps/AttachmentsStep';

const steps = [
  { id: 1, name: 'Customer details' },
  { id: 2, name: 'Loan Type' },
  { id: 3, name: 'Loan Details' },
  { id: 4, name: 'Attachments' },
];

export default function AddLoanWizard() {
  const router = useRouter();
  const selectedBook = useSelector((state: RootState) => state.book.selectedBook);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    // Step 1: Customer details
    personId: '',
    personName: '',
    personPhone: '',
    personAddress: '',
    // Step 2: Loan Type
    accountType: 'LENT',
    loanType: 'WITH_INTEREST',
    interestCalc: 'MONTHLY',
    // Step 3: Loan Details
    principalAmount: '',
    interestRate: '',
    interestEvery: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    hasEMI: false,
    numberOfEMI: '',
    hasCompounding: false,
    dateToDateCalc: false,
    strategy: 'SIMPLE_INTEREST',
    remarks: '',
    // Step 4: Attachments
    collaterals: [],
  });

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

  const handleSubmit = async () => {
    if (!selectedBook) {
      alert('Please select a book first');
      return;
    }

    setLoading(true);
    try {
      // Create person if new
      let personId = formData.personId;
      if (!personId && formData.personName && formData.personPhone) {
        const personRes = await personAPI.create({
          name: formData.personName,
          phone: formData.personPhone,
          address: formData.personAddress,
          bookId: selectedBook.id,
        });
        personId = personRes.data.person.id;
      }

      // Create loan
      await loanAPI.create({
        personId,
        bookId: selectedBook.id,
        accountType: formData.accountType,
        loanType: formData.loanType,
        interestCalc: formData.interestCalc,
        principalAmount: formData.principalAmount,
        interestRate: formData.interestRate || 0,
        interestEvery: formData.interestEvery,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        hasEMI: formData.hasEMI,
        numberOfEMI: formData.numberOfEMI || null,
        hasCompounding: formData.hasCompounding,
        dateToDateCalc: formData.dateToDateCalc,
        strategy: formData.strategy,
        remarks: formData.remarks,
      });

      router.push('/loans');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">{step.name}</span>
            </div>
            {step.id < steps.length && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        {currentStep === 1 && (
          <CustomerDetailsStep
            formData={formData}
            setFormData={setFormData}
            selectedBook={selectedBook}
          />
        )}
        {currentStep === 2 && (
          <LoanTypeStep formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 3 && (
          <LoanDetailsStep formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 4 && (
          <AttachmentsStep formData={formData} setFormData={setFormData} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previous}
          disabled={currentStep === 1}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep < steps.length ? (
          <button
            onClick={next}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Verify & Create Loan'}
          </button>
        )}
      </div>
    </div>
  );
}

