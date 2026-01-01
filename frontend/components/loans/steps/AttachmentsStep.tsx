'use client';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function AttachmentsStep({ formData, setFormData }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attachments</h2>
      <p className="text-gray-600 mb-6">
        You can add collateral details after creating the loan from the loan details page.
      </p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-gray-500">Collateral management will be available after loan creation</p>
      </div>
    </div>
  );
}

