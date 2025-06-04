'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  ClipboardDocumentIcon, 
  CheckIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  embedCode: string;
}

export default function EmbedCodeModal({ isOpen, onClose, formTitle, embedCode }: EmbedCodeModalProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'wordpress' | 'react' | 'html'>('standard');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  let embedData;
  try {
    embedData = JSON.parse(embedCode);
  } catch {
    // Fallback for old format
    embedData = {
      options: {
        standard: embedCode,
        wordpress: '',
        react: '',
        html: ''
      },
      instructions: {}
    };
  }

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const tabs = [
    { id: 'standard', label: 'Standard HTML', icon: CodeBracketIcon },
    { id: 'wordpress', label: 'WordPress', icon: DevicePhoneMobileIcon },
    { id: 'react', label: 'React/Next.js', icon: ComputerDesktopIcon },
    { id: 'html', label: 'Full HTML', icon: CodeBracketIcon }
  ];

  const themes = [
    { name: 'Light', value: 'light', description: 'Clean light theme' },
    { name: 'Dark', value: 'dark', description: 'Modern dark theme' },
    { name: 'Minimal', value: 'minimal', description: 'Minimalist transparent theme' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Embed Your Form
            </h3>
            <p className="text-gray-600 mt-1">
              Form: <span className="font-medium">{formTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Copy Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Copy - Standard Embed</h4>
          <div className="flex items-center space-x-2">
            <code className="flex-1 p-3 bg-white rounded border text-sm font-mono text-gray-800 overflow-x-auto">
              {embedData.options?.standard || embedCode}
            </code>
            <button
              onClick={() => handleCopy(embedData.options?.standard || embedCode, -1)}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Copy to clipboard"
            >
              {copiedIndex === -1 ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Standard HTML */}
          {activeTab === 'standard' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Standard HTML Embed</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Copy and paste this code into any HTML page where you want the form to appear.
                </p>
                
                {/* Theme Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {themes.map((theme, index) => (
                    <div key={theme.value} className="border rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">{theme.name} Theme</h5>
                      <p className="text-xs text-gray-600 mb-3">{theme.description}</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                          {embedData.options?.[theme.value] || embedData.options?.standard?.replace('theme=light', `theme=${theme.value}`)}
                        </code>
                        <button
                          onClick={() => handleCopy(
                            embedData.options?.[theme.value] || embedData.options?.standard?.replace('theme=light', `theme=${theme.value}`), 
                            index
                          )}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WordPress */}
          {activeTab === 'wordpress' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">WordPress Integration</h4>
              <p className="text-gray-600 text-sm mb-4">
                For WordPress sites, you can use this shortcode in posts or pages, or embed the HTML directly.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shortcode (if you have a plugin)</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 bg-gray-50 rounded border text-sm font-mono">
                      {embedData.options?.wordpress || `[crm_form id="${embedData.formId}" theme="light"]`}
                    </code>
                    <button
                      onClick={() => handleCopy(embedData.options?.wordpress || `[crm_form id="${embedData.formId}" theme="light"]`, 10)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {copiedIndex === 10 ? (
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HTML (use in HTML blocks)</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 bg-gray-50 rounded border text-sm font-mono overflow-x-auto">
                      {embedData.options?.standard}
                    </code>
                    <button
                      onClick={() => handleCopy(embedData.options?.standard, 11)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {copiedIndex === 11 ? (
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* React/Next.js */}
          {activeTab === 'react' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">React/Next.js Component</h4>
              <p className="text-gray-600 text-sm mb-4">
                Use this component code in your React or Next.js application.
              </p>
              
              <div className="flex items-start space-x-2">
                <pre className="flex-1 p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                  <code>{embedData.options?.react}</code>
                </pre>
                <button
                  onClick={() => handleCopy(embedData.options?.react, 20)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedIndex === 20 ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Full HTML */}
          {activeTab === 'html' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Complete HTML Page</h4>
              <p className="text-gray-600 text-sm mb-4">
                A complete HTML page with the embedded form. Perfect for testing or standalone pages.
              </p>
              
              <div className="flex items-start space-x-2">
                <pre className="flex-1 p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                  <code>{embedData.options?.html}</code>
                </pre>
                <button
                  onClick={() => handleCopy(embedData.options?.html, 30)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copiedIndex === 30 ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h5 className="font-medium text-yellow-800 mb-2">📝 Important Notes:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• The form will automatically match your website's layout and styling</li>
              <li>• Form submissions will appear in your CRM dashboard automatically</li>
              <li>• You can change themes by modifying the theme parameter (light, dark, minimal)</li>
              <li>• The form is responsive and works on all devices</li>
              <li>• No additional setup required - just paste and go!</li>
            </ul>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 