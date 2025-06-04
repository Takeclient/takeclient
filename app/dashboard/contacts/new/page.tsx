'use client';

import ContactForm from '../contact-form';

export default function NewContactPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new contact in your CRM
        </p>
      </div>
      
      <ContactForm />
    </div>
  );
}
