'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface FormSubmission {
  id: string;
  data: Record<string, any>;
  createdAt: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
}

interface FormData {
  title: string;
  fields: FormField[];
}

export default function FormSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSubmissions();
  }, [formId, page]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/forms/submissions?formId=${formId}&page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to load submissions');
      }
      
      const data = await response.json();
      setSubmissions(data.submissions);
      setForm(data.form);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      setError(error.message || 'An error occurred while loading submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!form || submissions.length === 0) return;

    // Create CSV header
    const headers = ['Submission Date', ...form.fields.map(field => field.label)];
    const csvContent = [
      headers.join(','),
      ...submissions.map(submission => {
        const row = [
          new Date(submission.createdAt).toLocaleString(),
          ...form.fields.map(field => {
            const value = submission.data[field.id] || '';
            // Escape quotes and wrap in quotes if contains comma
            const escapedValue = String(value).replace(/"/g, '""');
            return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
          })
        ];
        return row.join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title.replace(/[^a-z0-9]/gi, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFieldValue = (field: FormField, value: any) => {
    if (!value) return '-';
    
    switch (field.type) {
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value ? 'Yes' : 'No';
      case 'radio':
      case 'select':
        return String(value);
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return String(value);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
        <Link href="/dashboard/form-builder" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to forms
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/form-builder" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to forms
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Form Submissions</h1>
            <p className="text-gray-600 mt-1">{form?.title} - {total} total submissions</p>
          </div>
          
          {submissions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export to CSV
            </button>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No submissions yet for this form.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  {form?.fields.map((field) => (
                    <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                    {form?.fields.map((field) => (
                      <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderFieldValue(field, submission.data[field.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 