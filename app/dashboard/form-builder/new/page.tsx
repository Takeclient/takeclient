'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import EmbedCodeModal from '../components/EmbedCodeModal';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ExclamationTriangleIcon, 
  ArrowUpIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { generateFieldId } from '../../../utils/id-generator';

interface PlanUsage {
  forms: {
    canCreate: boolean;
    currentCount: number;
    limit: number;
    percentage: number;
    message?: string;
  };
  planName: string;
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  fields: any[];
  styles: any;
  buttonStyle: any;
  submitText: string;
  successMessage: string;
}

const formTemplates: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'A comprehensive contact form with name, email, phone, subject, and message fields',
    icon: EnvelopeIcon,
    category: 'Business',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Subject',
        placeholder: 'Select a subject',
        required: false,
        options: ['Product Inquiry', 'Customer Service', 'Parts & Service', 'Warranty Inquiry', 'Other']
      },
      {
        id: generateFieldId(),
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter your message here...',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'checkbox',
        label: 'I agree to the privacy policy and terms of use',
        required: true,
        options: ['I agree to the privacy policy and terms of use']
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Send Message',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: '0px',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.875rem',
      titleFontWeight: '700',
      titleColor: '#111827',
      descriptionColor: '#6b7280',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#2563eb',
      hoverColor: '#1d4ed8',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Send Message',
    successMessage: 'Thank you for your message! We will get back to you soon.'
  },
  {
    id: 'registration',
    name: 'Event Registration',
    description: 'Perfect for event registrations with attendee details and preferences',
    icon: CalendarIcon,
    category: 'Events',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Company/Organization',
        placeholder: 'Enter your company name',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Ticket Type',
        placeholder: 'Select ticket type',
        required: true,
        options: ['General Admission', 'VIP', 'Student', 'Group']
      },
      {
        id: generateFieldId(),
        type: 'radio',
        label: 'Dietary Restrictions',
        required: false,
        options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Other']
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Register Now',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#f8fafc',
      borderColor: '#e2e8f0',
      borderWidth: '1px',
      borderRadius: '16px',
      padding: '2.5rem',
      maxWidth: '700px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      titleFontSize: '2rem',
      titleFontWeight: '800',
      titleColor: '#1e293b',
      descriptionColor: '#64748b',
      descriptionFontSize: '1.125rem'
    },
    buttonStyle: {
      backgroundColor: '#059669',
      hoverColor: '#047857',
      textColor: '#ffffff',
      borderRadius: '12px',
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Register Now',
    successMessage: 'Registration successful! You will receive a confirmation email shortly.'
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Comprehensive job application form with personal details and file upload',
    icon: BriefcaseIcon,
    category: 'HR',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Current Position',
        placeholder: 'Enter your current job title',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Position Applied For',
        placeholder: 'Select position',
        required: true,
        options: ['Software Developer', 'Marketing Manager', 'Sales Representative', 'Customer Support', 'Other']
      },
      {
        id: generateFieldId(),
        type: 'number',
        label: 'Years of Experience',
        placeholder: 'Enter years of experience',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'textarea',
        label: 'Cover Letter',
        placeholder: 'Tell us why you are interested in this position...',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Submit Application',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      borderWidth: '1px',
      borderRadius: '8px',
      padding: '2rem',
      maxWidth: '650px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.75rem',
      titleFontWeight: '700',
      titleColor: '#1f2937',
      descriptionColor: '#6b7280',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#7c3aed',
      hoverColor: '#6d28d9',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Submit Application',
    successMessage: 'Thank you for your application! We will review it and get back to you soon.'
  },
  {
    id: 'feedback',
    name: 'Customer Feedback',
    description: 'Collect customer feedback and ratings for your products or services',
    icon: ChatBubbleLeftRightIcon,
    category: 'Business',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Name (Optional)',
        placeholder: 'Enter your name',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email (Optional)',
        placeholder: 'Enter your email',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'radio',
        label: 'Overall Satisfaction',
        required: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'How did you hear about us?',
        placeholder: 'Select an option',
        required: false,
        options: ['Google Search', 'Social Media', 'Friend/Family', 'Advertisement', 'Other']
      },
      {
        id: generateFieldId(),
        type: 'textarea',
        label: 'Additional Comments',
        placeholder: 'Please share any additional feedback...',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'checkbox',
        label: 'Would you recommend us to others?',
        required: false,
        options: ['Yes, I would recommend your services']
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Submit Feedback',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      borderWidth: '2px',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.875rem',
      titleFontWeight: '700',
      titleColor: '#92400e',
      descriptionColor: '#a16207',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#f59e0b',
      hoverColor: '#d97706',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Submit Feedback',
    successMessage: 'Thank you for your valuable feedback!'
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Simple and effective newsletter subscription form',
    icon: EnvelopeIcon,
    category: 'Marketing',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'checkbox',
        label: 'Email Preferences',
        required: false,
        options: ['Weekly Newsletter', 'Product Updates', 'Special Offers']
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Subscribe',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: '0px',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '500px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.75rem',
      titleFontWeight: '700',
      titleColor: '#111827',
      descriptionColor: '#6b7280',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#10b981',
      hoverColor: '#059669',
      textColor: '#ffffff',
      borderRadius: '9999px',
      padding: '0.875rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Subscribe',
    successMessage: 'Welcome! You have successfully subscribed to our newsletter.'
  },
  {
    id: 'appointment',
    name: 'Appointment Booking',
    description: 'Book appointments with date, time, and service selection',
    icon: CalendarIcon,
    category: 'Business',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Service Type',
        placeholder: 'Select a service',
        required: true,
        options: ['Consultation', 'Follow-up', 'New Patient', 'Emergency']
      },
      {
        id: generateFieldId(),
        type: 'date',
        label: 'Preferred Date',
        placeholder: 'Select a date',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Preferred Time',
        placeholder: 'Select time slot',
        required: true,
        options: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']
      },
      {
        id: generateFieldId(),
        type: 'textarea',
        label: 'Additional Notes',
        placeholder: 'Any special requirements or notes...',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Book Appointment',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#f0f9ff',
      borderColor: '#0ea5e9',
      borderWidth: '1px',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '650px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.875rem',
      titleFontWeight: '700',
      titleColor: '#0c4a6e',
      descriptionColor: '#0369a1',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#0ea5e9',
      hoverColor: '#0284c7',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Book Appointment',
    successMessage: 'Your appointment request has been submitted. We will confirm your booking shortly.'
  },
  {
    id: 'survey',
    name: 'Customer Survey',
    description: 'Detailed survey form to gather customer insights and preferences',
    icon: DocumentTextIcon,
    category: 'Research',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Age Group',
        placeholder: 'Select your age group',
        required: true,
        options: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
      },
      {
        id: generateFieldId(),
        type: 'radio',
        label: 'How often do you use our product?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'First time']
      },
      {
        id: generateFieldId(),
        type: 'checkbox',
        label: 'Which features do you use most?',
        required: false,
        options: ['Feature A', 'Feature B', 'Feature C', 'Feature D']
      },
      {
        id: generateFieldId(),
        type: 'radio',
        label: 'How would you rate our customer service?',
        required: true,
        options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
      },
      {
        id: generateFieldId(),
        type: 'textarea',
        label: 'What improvements would you suggest?',
        placeholder: 'Please share your suggestions...',
        required: false
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Submit Survey',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#fdf4ff',
      borderColor: '#c084fc',
      borderWidth: '1px',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '650px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.875rem',
      titleFontWeight: '700',
      titleColor: '#7c2d12',
      descriptionColor: '#a855f7',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#a855f7',
      hoverColor: '#9333ea',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Submit Survey',
    successMessage: 'Thank you for participating in our survey!'
  },
  {
    id: 'support',
    name: 'Support Request',
    description: 'Technical support and help desk form for customer assistance',
    icon: HeartIcon,
    category: 'Support',
    fields: [
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Priority Level',
        placeholder: 'Select priority',
        required: true,
        options: ['Low', 'Medium', 'High', 'Critical']
      },
      {
        id: generateFieldId(),
        type: 'select',
        label: 'Issue Category',
        placeholder: 'Select category',
        required: true,
        options: ['Technical Issue', 'Billing Question', 'Feature Request', 'Bug Report', 'Other']
      },
      {
        id: generateFieldId(),
        type: 'text',
        label: 'Subject',
        placeholder: 'Brief description of the issue',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'textarea',
        label: 'Detailed Description',
        placeholder: 'Please provide detailed information about your issue...',
        required: true
      },
      {
        id: generateFieldId(),
        type: 'submit',
        label: 'Submit Request',
        placeholder: ''
      }
    ],
    styles: {
      backgroundColor: '#fef2f2',
      borderColor: '#f87171',
      borderWidth: '1px',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '650px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.875rem',
      titleFontWeight: '700',
      titleColor: '#dc2626',
      descriptionColor: '#ef4444',
      descriptionFontSize: '1rem'
    },
    buttonStyle: {
      backgroundColor: '#dc2626',
      hoverColor: '#b91c1c',
      textColor: '#ffffff',
      borderRadius: '8px',
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    },
    submitText: 'Submit Request',
    successMessage: 'Your support request has been submitted. Our team will get back to you soon.'
  }
];

export default function NewFormPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [createdForm, setCreatedForm] = useState<any>(null);
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      checkPlanLimits();
    }
  }, [status, router]);

  const checkPlanLimits = async () => {
    try {
      const response = await fetch('/api/plan/usage');
      if (response.ok) {
        const usage = await response.json();
        setPlanUsage(usage);
      }
    } catch (error) {
      console.error('Error checking plan limits:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveForm = async (formData: any) => {
    try {
      // Check if user can create form
      if (planUsage && planUsage.forms && !planUsage.forms.canCreate) {
        toast.error(planUsage.forms.message || 'You have reached your form limit');
        return;
      }
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save form');
      }
      
      const result = await response.json();
      
      // Show success message
      toast.success('Form created successfully!');
      
      // Show embed code modal
      setCreatedForm(result.form);
      setShowEmbedModal(true);
      
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
      throw error;
    }
  };

  const handleCloseEmbedModal = () => {
    setShowEmbedModal(false);
    setCreatedForm(null);
    // Redirect to form list
    router.push('/dashboard/form-builder');
  };

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    setShowTemplates(false);
  };

  const handleBackToTemplates = () => {
    setShowTemplates(true);
    setSelectedTemplate(null);
  };

  // Filter templates
  const categories = ['All', ...Array.from(new Set(formTemplates.map(t => t.category)))];
  const filteredTemplates = formTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
      
  // Show plan limit warning/blocker
  if (planUsage && planUsage.forms && !planUsage.forms.canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Toaster position="top-right" />
        
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <ExclamationTriangleIcon className="h-16 w-16 text-amber-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Form Limit Reached
            </h2>
            
            <p className="text-gray-600 mb-6">
              You've reached your form limit ({planUsage.forms?.limit || 0} forms) on the{' '}
              <span className="font-semibold capitalize">{planUsage.planName}</span> plan.
              Upgrade your plan to create more forms.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Forms Used</span>
                <span>{planUsage.forms?.currentCount || 0} / {planUsage.forms?.limit || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${Math.min(planUsage.forms?.percentage || 0, 100)}%` }}
                ></div>
              </div>
            </div>
                    
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/billing"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center justify-center"
              >
                <ArrowUpIcon className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
              <button 
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show usage warning if close to limit
  const showUsageWarning = planUsage && planUsage.forms && planUsage.forms.percentage > 80;

  // Show templates selection
  if (showTemplates) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster position="top-right" />
        
        {/* Usage Warning Banner */}
        {showUsageWarning && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-amber-700">
                                  <span className="font-medium">
                  You're running low on forms ({planUsage.forms?.currentCount || 0}/{planUsage.forms?.limit || 0} used).
                </span>{' '}
                  <Link href="/dashboard/billing" className="font-medium underline hover:no-underline">
                    Upgrade your plan
                  </Link>{' '}
                  to create more forms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose a Form Template
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start with a professionally designed template or create your form from scratch. 
            All templates are fully customizable to match your needs.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Start from Scratch Option */}
          <div
            onClick={handleStartFromScratch}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100">
                <SparklesIcon className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start from Scratch</h3>
              <p className="text-sm text-gray-600">
                Build your form from the ground up with complete creative control
              </p>
            </div>
          </div>

          {/* Template Cards */}
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                  <template.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="text-xs text-gray-500">
                {template.fields.length} fields
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    );
  }
  
  // Show form builder with selected template or from scratch
  return (
    <>
      <Toaster position="top-right" />
      
      {/* Back to Templates Button */}
      <div className="mb-4">
        <button
          onClick={handleBackToTemplates}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Templates
        </button>
      </div>

      {/* Usage Warning Banner */}
      {showUsageWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-amber-700">
                <span className="font-medium">
                  You're running low on forms ({planUsage.forms?.currentCount || 0}/{planUsage.forms?.limit || 0} used).
                </span>{' '}
                <Link href="/dashboard/billing" className="font-medium underline hover:no-underline">
                  Upgrade your plan
                </Link>{' '}
                to create more forms.
              </p>
            </div>
          </div>
        </div>
      )}
                      
      <FormBuilder 
        onSave={handleSaveForm} 
        isEdit={false}
        initialData={selectedTemplate ? {
          title: selectedTemplate.name,
          description: `Based on ${selectedTemplate.name} template`,
          fields: selectedTemplate.fields,
          styles: selectedTemplate.styles,
          buttonStyle: selectedTemplate.buttonStyle,
          submitText: selectedTemplate.submitText,
          successMessage: selectedTemplate.successMessage,
          redirectUrl: '',
          isActive: true
        } : undefined}
      />
      
      {/* Embed Code Modal */}
      {showEmbedModal && createdForm && (
        <EmbedCodeModal
          isOpen={showEmbedModal}
          onClose={handleCloseEmbedModal}
          formTitle={createdForm.title}
          embedCode={createdForm.embedCode}
        />
      )}
    </>
  );
}
