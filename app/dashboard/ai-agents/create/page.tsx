'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  InformationCircleIcon,
  SparklesIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CogIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

interface AgentConfig {
  name: string;
  description: string;
  type: 'chat' | 'voice' | 'hybrid';
  personality: string;
  language: string;
  industry: string;
  useCase: string;
  tone: string;
  greeting: string;
  fallbackMessage: string;
  maxTokens: number;
  temperature: number;
  platforms: string[];
  trainingData: string;
  knowledgeBase: string[];
  integrations: string[];
}

const PERSONALITY_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal, knowledgeable, and business-focused',
    tone: 'Professional and courteous',
    greeting: 'Hello! I\'m here to assist you with your business needs. How can I help you today?',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, approachable, and conversational',
    tone: 'Friendly and helpful',
    greeting: 'Hi there! 👋 I\'m excited to help you out today. What can I do for you?',
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Authoritative, detailed, and technical',
    tone: 'Expert and informative',
    greeting: 'Welcome! I\'m your expert assistant ready to provide detailed insights. What would you like to know?',
  },
  {
    id: 'sales',
    name: 'Sales-focused',
    description: 'Persuasive, goal-oriented, and results-driven',
    tone: 'Enthusiastic and solution-oriented',
    greeting: 'Hello! I\'m here to help you find the perfect solution for your needs. Let\'s get started!',
  },
];

const USE_CASES = [
  'Lead Generation',
  'Customer Support',
  'Sales Qualification',
  'Appointment Booking',
  'Product Recommendations',
  'FAQ Assistant',
  'Order Processing',
  'Technical Support',
  'Onboarding Guide',
  'Survey Collection',
];

const PLATFORMS = [
  { id: 'website', name: 'Website Widget', icon: '🌐' },
  { id: 'landing-page', name: 'Landing Pages', icon: '📄' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'facebook', name: 'Facebook Messenger', icon: '📘' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'slack', name: 'Slack', icon: '💼' },
  { id: 'api', name: 'API Integration', icon: '⚡' },
];

export default function CreateAgent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [config, setConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    type: 'chat',
    personality: '',
    language: 'English',
    industry: '',
    useCase: '',
    tone: '',
    greeting: '',
    fallbackMessage: 'I apologize, but I don\'t understand that request. Could you please rephrase or ask something else?',
    maxTokens: 150,
    temperature: 0.7,
    platforms: [],
    trainingData: '',
    knowledgeBase: [],
    integrations: [],
  });

  const totalSteps = 5;

  const handlePersonalitySelect = (template: typeof PERSONALITY_TEMPLATES[0]) => {
    setConfig({
      ...config,
      personality: template.id,
      tone: template.tone,
      greeting: template.greeting,
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    setConfig({
      ...config,
      platforms: config.platforms.includes(platformId)
        ? config.platforms.filter(p => p !== platformId)
        : [...config.platforms, platformId],
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/dashboard/ai-agents?created=true');
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return config.name && config.description && config.type;
      case 2:
        return config.personality && config.useCase;
      case 3:
        return config.greeting && config.fallbackMessage;
      case 4:
        return config.platforms.length > 0;
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="e.g., Sales Assistant Sarah"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    placeholder="Describe what your agent does and how it helps users..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'chat', label: 'Chat Only', description: 'Text-based conversations' },
                      { value: 'voice', label: 'Voice Only', description: 'Audio conversations' },
                      { value: 'hybrid', label: 'Chat + Voice', description: 'Both text and audio' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setConfig({ ...config, type: type.value as any })}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          config.type === type.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry/Niche
                  </label>
                  <input
                    type="text"
                    value={config.industry}
                    onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                    placeholder="e.g., Real Estate, E-commerce, SaaS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personality & Purpose</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Personality Template *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PERSONALITY_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handlePersonalitySelect(template)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          config.personality === template.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                        <div className="text-xs text-gray-500">Tone: {template.tone}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Use Case *
                  </label>
                  <select
                    value={config.useCase}
                    onChange={(e) => setConfig({ ...config, useCase: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a use case</option>
                    {USE_CASES.map((useCase) => (
                      <option key={useCase} value={useCase}>{useCase}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Italian">Italian</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Greeting *
                  </label>
                  <textarea
                    value={config.greeting}
                    onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                    placeholder="The first message your agent will send to users..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fallback Message *
                  </label>
                  <textarea
                    value={config.fallbackMessage}
                    onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
                    placeholder="Message when the agent doesn't understand..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Length
                    </label>
                    <select
                      value={config.maxTokens}
                      onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value={50}>Short (50 tokens)</option>
                      <option value={150}>Medium (150 tokens)</option>
                      <option value={300}>Long (300 tokens)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creativity Level
                    </label>
                    <select
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value={0.3}>Conservative (0.3)</option>
                      <option value={0.7}>Balanced (0.7)</option>
                      <option value={1.0}>Creative (1.0)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Platforms</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select where you want to deploy your AI agent *
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => handlePlatformToggle(platform.id)}
                        className={`flex items-center p-4 border rounded-lg transition-colors ${
                          config.platforms.includes(platform.id)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl mr-3">{platform.icon}</span>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{platform.name}</div>
                        </div>
                        {config.platforms.includes(platform.id) && (
                          <div className="ml-auto">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Data (Optional)
                  </label>
                  <textarea
                    value={config.trainingData}
                    onChange={(e) => setConfig({ ...config, trainingData: e.target.value })}
                    placeholder="Paste relevant information, FAQs, or examples that will help train your agent..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used to train your agent on specific topics and responses
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Create</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-900">{config.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <p className="text-gray-900 capitalize">{config.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Use Case:</span>
                    <p className="text-gray-900">{config.useCase}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Language:</span>
                    <p className="text-gray-900">{config.language}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-gray-900">{config.description}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Greeting:</span>
                  <p className="text-gray-900 italic">"{config.greeting}"</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Platforms:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {config.platforms.map(platformId => {
                      const platform = PLATFORMS.find(p => p.id === platformId);
                      return (
                        <span key={platformId} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {platform?.icon} {platform?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your agent will be created and enter training mode</li>
                      <li>Initial training will take 2-5 minutes</li>
                      <li>You can start testing and refining immediately</li>
                      <li>Deployment codes will be generated for your selected platforms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/ai-agents" className="flex items-center text-gray-600 hover:text-gray-900">
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                Back to AI Agents
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create AI Agent</h1>
            <p className="mt-2 text-gray-600">Build your intelligent conversational agent</p>
          </div>

          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !isStepValid()}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Agent...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 