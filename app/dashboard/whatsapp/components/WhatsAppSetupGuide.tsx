'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LinkIcon,
  DocumentTextIcon,
  CogIcon,
  KeyIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WhatsAppSetupGuideProps {
  isModal?: boolean;
  onClose?: () => void;
  onComplete: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  isCompleted: boolean;
}

export function WhatsAppSetupGuide({ isModal = false, onClose, onComplete }: WhatsAppSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : '';
  const verifyToken = 'whatsapp_webhook_verify_token';

  const steps: SetupStep[] = [
    {
      id: 'prerequisites',
      title: 'Prerequisites',
      description: 'What you need before starting the setup',
      icon: InformationCircleIcon,
      isCompleted: completedSteps.includes('prerequisites'),
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Requirements Checklist</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                    Meta Business Manager account
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                    WhatsApp Business Account (verified)
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                    WhatsApp Business phone number
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                    Admin access to Meta Business Manager
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your WhatsApp Business number must be verified and active</li>
                  <li>• You need admin or developer access to your Meta Business Manager</li>
                  <li>• The setup process may take 10-15 minutes to complete</li>
                  <li>• Keep your credentials secure and don't share them</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => markStepCompleted('prerequisites')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            I have all prerequisites ✓
          </button>
        </div>
      )
    },
    {
      id: 'business-manager',
      title: 'Access Meta Business Manager',
      description: 'Navigate to your WhatsApp Business settings',
      icon: LinkIcon,
      isCompleted: completedSteps.includes('business-manager'),
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">Go to Meta Business Manager</p>
                <p className="text-sm text-gray-600 mt-1">
                  Visit{' '}
                  <a 
                    href="https://business.facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    business.facebook.com
                  </a>{' '}
                  and log in with your business account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">Navigate to WhatsApp Manager</p>
                <p className="text-sm text-gray-600 mt-1">
                  In the left sidebar, click on "WhatsApp Manager" or find it in the "All tools" section
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">Select Your WhatsApp Business Account</p>
                <p className="text-sm text-gray-600 mt-1">
                  Choose the WhatsApp Business Account you want to integrate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Links</h4>
            <div className="space-y-2">
              <a
                href="https://business.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Meta Business Manager
              </a>
              <a
                href="https://business.facebook.com/wa/manager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 block"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                WhatsApp Manager (Direct Link)
              </a>
            </div>
          </div>

          <button
            onClick={() => markStepCompleted('business-manager')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            I'm in WhatsApp Manager ✓
          </button>
        </div>
      )
    },
    {
      id: 'api-setup',
      title: 'Configure API Settings',
      description: 'Set up the API and get your credentials',
      icon: CogIcon,
      isCompleted: completedSteps.includes('api-setup'),
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">Navigate to API Setup</p>
                <p className="text-sm text-gray-600 mt-1">
                  In WhatsApp Manager, go to "Settings" → "API Setup" in the left navigation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">Copy Phone Number ID</p>
                <p className="text-sm text-gray-600 mt-1">
                  Find your Phone Number ID in the API Setup page and copy it (looks like: 1234567890123456)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">Copy WhatsApp Business Account ID</p>
                <p className="text-sm text-gray-600 mt-1">
                  Find your WhatsApp Business Account ID (also visible in the API Setup page)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">4</span>
              <div>
                <p className="font-medium text-gray-900">Note Your Phone Number</p>
                <p className="text-sm text-gray-600 mt-1">
                  Copy your WhatsApp Business phone number with country code (e.g., +1234567890)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Where to Find These IDs</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Phone Number ID:</strong> API Setup → From phone number section</li>
                  <li>• <strong>Business Account ID:</strong> API Setup → Business info section or URL</li>
                  <li>• <strong>Phone Number:</strong> The actual WhatsApp number displayed</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => markStepCompleted('api-setup')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            I have my IDs ✓
          </button>
        </div>
      )
    },
    {
      id: 'access-token',
      title: 'Generate Access Token',
      description: 'Create a permanent access token for API access',
      icon: KeyIcon,
      isCompleted: completedSteps.includes('access-token'),
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-2">Critical: Permanent Token Required</h4>
                <p className="text-sm text-red-700">
                  You MUST generate a permanent access token, not a temporary one. Temporary tokens expire and will break your integration.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">Go to System Users</p>
                <p className="text-sm text-gray-600 mt-1">
                  In Meta Business Manager, go to "Business Settings" → "System Users"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">Create System User</p>
                <p className="text-sm text-gray-600 mt-1">
                  Click "Add" → "Create New System User" → Give it a name like "WhatsApp CRM Integration"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">Assign WhatsApp Permissions</p>
                <p className="text-sm text-gray-600 mt-1">
                  Select your system user → "Assign Assets" → Choose your WhatsApp Business Account
                </p>
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                  <strong>Required permissions:</strong> whatsapp_business_management, whatsapp_business_messaging
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">4</span>
              <div>
                <p className="font-medium text-gray-900">Generate Access Token</p>
                <p className="text-sm text-gray-600 mt-1">
                  Click "Generate New Token" → Select your WhatsApp app → Choose permissions → Copy the token
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Token Security Best Practices</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Never share your access token publicly</li>
              <li>• Store it securely in your CRM system</li>
              <li>• Set up token rotation if possible</li>
              <li>• Monitor token usage in Business Manager</li>
            </ul>
          </div>

          <button
            onClick={() => markStepCompleted('access-token')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            I have my permanent access token ✓
          </button>
        </div>
      )
    },
    {
      id: 'webhook-setup',
      title: 'Configure Webhooks',
      description: 'Set up webhooks to receive messages',
      icon: DocumentTextIcon,
      isCompleted: completedSteps.includes('webhook-setup'),
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-3">Webhook Configuration Values</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Webhook URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 text-sm bg-white border border-blue-200 rounded px-3 py-2"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Verify Token</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={verifyToken}
                    className="flex-1 text-sm bg-white border border-blue-200 rounded px-3 py-2"
                  />
                  <button
                    onClick={() => copyToClipboard(verifyToken, 'Verify Token')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">Go to Webhook Configuration</p>
                <p className="text-sm text-gray-600 mt-1">
                  In WhatsApp Manager: API Setup → Webhooks section
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">Configure Webhook</p>
                <p className="text-sm text-gray-600 mt-1">
                  Click "Configure" or "Edit" next to webhooks
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">Enter Webhook Details</p>
                <p className="text-sm text-gray-600 mt-1">
                  Paste the Webhook URL and Verify Token from above
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">4</span>
              <div>
                <p className="font-medium text-gray-900">Subscribe to Events</p>
                <p className="text-sm text-gray-600 mt-1">
                  Enable: messages, message_deliveries, message_reads, message_echoes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">Webhook Events to Enable</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                messages
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                message_deliveries
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                message_reads
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                message_echoes
              </div>
            </div>
          </div>

          <button
            onClick={() => markStepCompleted('webhook-setup')}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Webhook configured ✓
          </button>
        </div>
      )
    },
    {
      id: 'final-setup',
      title: 'Complete Integration',
      description: 'Add the integration to your CRM',
      icon: PhoneIcon,
      isCompleted: completedSteps.includes('final-setup'),
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-2">You're Almost Done!</h4>
                <p className="text-sm text-green-700">
                  You now have all the credentials needed to set up your WhatsApp Business integration.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Information You Should Have:</h4>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Integration Name:</span>
                <span className="font-medium text-gray-900">Your chosen name</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-medium text-gray-900">+1234567890</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Phone Number ID:</span>
                <span className="font-medium text-gray-900">From API Setup</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Business Account ID:</span>
                <span className="font-medium text-gray-900">From API Setup</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Access Token:</span>
                <span className="font-medium text-gray-900">Permanent token</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Next Steps</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Complete Setup" below</li>
              <li>Enter all your credentials in the integration form</li>
              <li>Test the connection</li>
              <li>Start managing WhatsApp conversations!</li>
            </ol>
          </div>

          <button
            onClick={() => {
              markStepCompleted('final-setup');
              onComplete();
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Complete Setup & Add Integration ✓
          </button>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = completedSteps.includes(currentStepData.id);

  const content = (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-100 text-green-600 border-2 border-green-200'
                    : index === currentStep
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-200'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 rounded ${
                  completedSteps.includes(step.id) ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h2>
          <p className="text-gray-600 mt-1">{currentStepData.description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {currentStepData.content}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>

        {!isLastStep && (
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={!canProceed}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        )}

        {isLastStep && (
          <div className="w-20" /> // Spacer for last step
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <Transition.Root show={true} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose || (() => {})}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-50 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                  {onClose && (
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  )}

                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6 text-center">
                    WhatsApp Business Setup Guide
                  </Dialog.Title>

                  {content}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Business Setup Guide</h2>
        <p className="text-gray-600">
          Follow these step-by-step instructions to connect your WhatsApp Business account
        </p>
      </div>
      {content}
    </div>
  );
} 