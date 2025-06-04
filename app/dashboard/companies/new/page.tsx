'use client';

import CompanyForm from '../company-form';

export default function NewCompanyPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new company in your CRM
        </p>
      </div>
      
      <CompanyForm />
    </div>
  );
}
