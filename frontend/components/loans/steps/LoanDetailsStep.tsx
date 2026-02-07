'use client';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function LoanDetailsStep({ formData, setFormData }: Props) {
  const calculateEndDate = (startDate: string, numberOfEMI: number, interestEvery: string) => {
    if (!startDate || !numberOfEMI) return '';

    const start = new Date(startDate);
    let months = numberOfEMI;

    if (interestEvery === 'WEEKLY') {
      months = Math.ceil((numberOfEMI * 7) / 30);
    } else if (interestEvery === 'DAILY') {
      months = Math.ceil(numberOfEMI / 30);
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toISOString().split('T')[0];
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Loan Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const newData = { ...formData, startDate: e.target.value };
              if (formData.hasEMI && formData.numberOfEMI) {
                newData.endDate = calculateEndDate(
                  e.target.value,
                  parseInt(formData.numberOfEMI),
                  formData.interestEvery
                );
              }
              setFormData(newData);
            }}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Principal amount *
          </label>
          <input
            type="number"
            value={formData.principalAmount}
            onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {formData.loanType === 'WITH_INTEREST' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                % Rate of interest
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Every
              </label>
              <select
                value={formData.interestEvery}
                onChange={(e) => setFormData({ ...formData, interestEvery: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.hasEMI}
            onChange={(e) => {
              const newData = { ...formData, hasEMI: e.target.checked };
              if (e.target.checked && formData.startDate && formData.numberOfEMI) {
                newData.endDate = calculateEndDate(
                  formData.startDate,
                  parseInt(formData.numberOfEMI),
                  formData.interestEvery
                );
              }
              setFormData(newData);
            }}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span>Add EMI</span>
        </label>

        {formData.hasEMI && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of EMI
            </label>
            <input
              type="number"
              value={formData.numberOfEMI}
              onChange={(e) => {
                const newData = { ...formData, numberOfEMI: e.target.value };
                if (formData.startDate) {
                  newData.endDate = calculateEndDate(
                    formData.startDate,
                    parseInt(e.target.value),
                    formData.interestEvery
                  );
                }
                setFormData(newData);
              }}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {formData.loanType === 'WITH_INTEREST' && (
          <>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.hasCompounding}
                onChange={(e) =>
                  setFormData({ ...formData, hasCompounding: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Do you wish to add compounding to this loan?</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.dateToDateCalc}
                onChange={(e) =>
                  setFormData({ ...formData, dateToDateCalc: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Date to Date Calculation?</span>
            </label>
          </>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

