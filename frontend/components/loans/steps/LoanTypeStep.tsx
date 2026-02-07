'use client';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function LoanTypeStep({ formData, setFormData }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Loan Type</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Loan Type Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Loan Type</h3>
          <div className="space-y-4">
            <div
              onClick={() => setFormData({ ...formData, loanType: 'WITH_INTEREST' })}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                formData.loanType === 'WITH_INTEREST'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">With Interest</span>
                {formData.loanType === 'WITH_INTEREST' && (
                  <span className="text-indigo-600">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Lend a fixed amount to get a amount with interest over a selected duration
              </p>
            </div>

            <div
              onClick={() => setFormData({ ...formData, loanType: 'FIXED_AMOUNT' })}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                formData.loanType === 'FIXED_AMOUNT'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Fixed Amount</span>
                {formData.loanType === 'FIXED_AMOUNT' && (
                  <span className="text-indigo-600">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Lend a fixed amount to get a fixed amount
              </p>
            </div>
          </div>
        </div>

        {/* Interest Calculation Method */}
        {formData.loanType === 'WITH_INTEREST' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Interest calculation</h3>
            <div className="space-y-4">
              <div
                onClick={() => setFormData({ ...formData, interestCalc: 'MONTHLY' })}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.interestCalc === 'MONTHLY'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Monthly</span>
                  {formData.interestCalc === 'MONTHLY' && (
                    <span className="text-indigo-600">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Interest will be updated Period Wise; i.e. In case of Monthly - 1 Month 5 days
                  of interest will be calculated as 2 Month's interest
                </p>
              </div>

              <div
                onClick={() => setFormData({ ...formData, interestCalc: 'DAILY' })}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.interestCalc === 'DAILY'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Daily</span>
                  {formData.interestCalc === 'DAILY' && (
                    <span className="text-indigo-600">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Interest will be updated daily; i.e. Calculate Interest of only 1 Month and 5
                  days NOT 2 Month
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Type */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Account Type</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setFormData({ ...formData, accountType: 'LENT' })}
            className={`px-6 py-3 rounded-lg ${
              formData.accountType === 'LENT'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Lend Money
          </button>
          <button
            onClick={() => setFormData({ ...formData, accountType: 'BORROWED' })}
            className={`px-6 py-3 rounded-lg ${
              formData.accountType === 'BORROWED'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Borrow Money
          </button>
        </div>
      </div>
    </div>
  );
}

