'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  LinkIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WhatsAppAccount {
  businessId: string;
  businessName: string;
  whatsappBusinessAccountId: string;
  whatsappBusinessAccountName: string;
  phoneNumbers: {
    id: string;
    display_phone_number: string;
    verified_name: string;
    status: string;
  }[];
}

interface MetaConnectSetupProps {
  onComplete: () => void;
}

export function MetaConnectSetup({ onComplete }: MetaConnectSetupProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metaAccessToken, setMetaAccessToken] = useState<string>('');
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>('');
  const [integrationName, setIntegrationName] = useState('');

  // Check if user already has Meta connected (from ads integration)
  useEffect(() => {
    checkMetaConnection();
  }, []);

  const checkMetaConnection = async () => {
    try {
      // Check if Meta token exists in localStorage (from ads integration)
      const storedToken = localStorage.getItem('meta_access_token');
      if (storedToken) {
        setMetaAccessToken(storedToken);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking Meta connection:', error);
    }
  };

  const connectToMeta = () => {
    // Redirect to Meta OAuth (same as ads integration)
    const metaAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/meta/callback')}&` +
      `scope=business_management,whatsapp_business_management,whatsapp_business_messaging&` +
      `response_type=code&` +
      `state=whatsapp_setup`;
    
    window.location.href = metaAuthUrl;
  };

  const discoverWhatsAppAccounts = async () => {
    if (!metaAccessToken) {
      toast.error('Please connect to Meta first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/meta-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaAccessToken }),
      });

      const data = await response.json();
      
      if (data.success) {
        setWhatsappAccounts(data.whatsappAccounts);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to discover WhatsApp accounts');
      }
    } catch (error) {
      console.error('Error discovering WhatsApp accounts:', error);
      toast.error('Failed to discover WhatsApp accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async () => {
    if (!selectedAccount || !selectedPhoneNumber) {
      toast.error('Please select a WhatsApp Business account and phone number');
      return;
    }

    const account = whatsappAccounts.find(acc => acc.whatsappBusinessAccountId === selectedAccount);
    const phoneNumber = account?.phoneNumbers.find(phone => phone.id === selectedPhoneNumber);

    if (!account || !phoneNumber) {
      toast.error('Invalid selection');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/meta-connect', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaAccessToken,
          whatsappBusinessAccountId: selectedAccount,
          phoneNumberId: selectedPhoneNumber,
          phoneNumber: phoneNumber.display_phone_number,
          integrationName: integrationName || `WhatsApp ${phoneNumber.display_phone_number}`,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('WhatsApp integration created successfully!');
        onComplete();
      } else {
        toast.error(data.error || 'Failed to create integration');
      }
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect WhatsApp via Meta Business
        </h2>
        <p className="text-gray-600">
          Use your existing Meta Business account to automatically set up WhatsApp integration
        </p>
      </div>

      {/* Step 1: Connect to Meta */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isConnected ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {isConnected ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <span className="text-sm font-medium">1</span>
            )}
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Connect Meta Business Account
          </h3>
        </div>

        {!isConnected ? (
          <div className="ml-11">
            <p className="text-gray-600 mb-4">
              Connect your Meta Business account to access your WhatsApp Business accounts.
            </p>
            <button
              onClick={connectToMeta}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect to Meta
            </button>
          </div>
        ) : (
          <div className="ml-11">
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Connected to Meta Business</span>
            </div>
            <p className="text-gray-600 text-sm">
              Your Meta Business account is connected and ready to discover WhatsApp accounts.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Discover WhatsApp Accounts */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            whatsappAccounts.length > 0 ? 'bg-green-100 text-green-600' : 
            isConnected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {whatsappAccounts.length > 0 ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <span className="text-sm font-medium">2</span>
            )}
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Discover WhatsApp Business Accounts
          </h3>
        </div>

        <div className="ml-11">
          {!isConnected ? (
            <p className="text-gray-400">Complete step 1 to continue</p>
          ) : whatsappAccounts.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">
                Scan your Meta Business account for WhatsApp Business accounts and phone numbers.
              </p>
              <button
                onClick={discoverWhatsAppAccounts}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PhoneIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Discovering...' : 'Discover WhatsApp Accounts'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center text-green-600 mb-4">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  Found {whatsappAccounts.length} WhatsApp Business account(s)
                </span>
              </div>
              
              <div className="space-y-4">
                {whatsappAccounts.map((account) => (
                  <div key={account.whatsappBusinessAccountId} className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{account.businessName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({account.whatsappBusinessAccountName})
                      </span>
                    </div>
                    
                    {account.phoneNumbers.map((phone) => (
                      <label
                        key={phone.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="whatsapp_account"
                          value={phone.id}
                          checked={selectedPhoneNumber === phone.id}
                          onChange={() => {
                            setSelectedAccount(account.whatsappBusinessAccountId);
                            setSelectedPhoneNumber(phone.id);
                            setIntegrationName(`WhatsApp ${phone.display_phone_number}`);
                          }}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {phone.display_phone_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {phone.verified_name} • Status: {phone.status}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Create Integration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            selectedPhoneNumber ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
          }`}>
            <span className="text-sm font-medium">3</span>
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Create Integration
          </h3>
        </div>

        <div className="ml-11">
          {!selectedPhoneNumber ? (
            <p className="text-gray-400">Select a WhatsApp phone number to continue</p>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={integrationName}
                  onChange={(e) => setIntegrationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter a name for this integration"
                />
              </div>

              <button
                onClick={createIntegration}
                disabled={isLoading || !integrationName.trim()}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRightIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Creating...' : 'Create WhatsApp Integration'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Need help?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure you have a Meta Business account with WhatsApp Business API access</li>
              <li>Your WhatsApp Business phone number must be verified</li>
              <li>You'll need to configure webhooks after creating the integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 