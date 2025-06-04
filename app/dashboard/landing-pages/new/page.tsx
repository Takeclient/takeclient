'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewLandingPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  useEffect(() => {
    const createPage = async () => {
      try {
        let pageData: any = {
          name: 'Untitled Page',
          slug: `untitled-page-${Date.now()}`,
          status: 'DRAFT',
          content: [],
        };

        // If a template is specified, load the template data
        if (templateId) {
          try {
            const templateResponse = await fetch(`/api/templates/${templateId}`);
            if (templateResponse.ok) {
              const templateData = await templateResponse.json();
              pageData = {
                ...pageData,
                name: `${templateData.template.name} - Copy`,
                content: templateData.template.content || [],
                css: templateData.template.css || '',
                javascript: templateData.template.javascript || '',
                templateId: templateId,
              };
              toast.success(`Creating page from ${templateData.template.name} template...`);
            } else {
              // If template not found, proceed with blank page
              console.log('Template response status:', templateResponse.status);
              toast.error('Template not found, creating blank page instead');
            }
          } catch (error) {
            console.error('Error loading template:', error);
            toast.error('Failed to load template, creating blank page instead');
          }
        }

        console.log('Creating page with data:', pageData);

        // Create the new page
        const response = await fetch('/api/landing-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData),
        });

        console.log('Create page response status:', response.status);
        console.log('Create page response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('Page created successfully:', data);
          toast.success('New landing page created successfully');
          router.push(`/dashboard/landing-pages/${data.page.id}/edit`);
        } else {
          // Get the error details from the response
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          const errorMessage = errorData.error || `Server error: ${response.status}`;
          toast.error(`Failed to create page: ${errorMessage}`);
          throw new Error(`Failed to create page: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error creating page:', error);
        toast.error('Failed to create landing page');
        router.push('/dashboard/landing-pages');
      }
    };

    createPage();
  }, [templateId, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900">
          {templateId ? 'Creating page from template...' : 'Creating new landing page...'}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we set up your page
        </p>
      </div>
    </div>
  );
} 