'use client';

import DealForm from '../deal-form';

export default function NewDealPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Deal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new deal or sales opportunity
        </p>
      </div>
      
      <DealForm />
    </div>
  );
}
