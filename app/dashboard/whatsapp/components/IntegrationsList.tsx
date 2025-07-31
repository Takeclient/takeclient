'use client';

import { format } from 'date-fns';
import { 
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  isActive: boolean;
  createdAt: string;
}

interface IntegrationsListProps {
  integrations: Integration[];
  onRefresh: () => void;
  onEdit: (integration: Integration) => void;
  onSync?: (integrationId: string) => void;
}

export function IntegrationsList({ integrations, onRefresh, onEdit, onSync }: IntegrationsListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/whatsapp/integrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Integration deleted successfully');
        onRefresh();
      } else {
        toast.error('Failed to delete integration');
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/whatsapp/integrations/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Integration ${!currentStatus ? 'activated' : 'deactivated'}`);
        onRefresh();
      } else {
        toast.error('Failed to update integration status');
      }
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to update integration status');
    }
  };

  if (integrations.length === 0) {
    return (
      <div className="text-center py-12">
        <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your WhatsApp Business account
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <div
          key={integration.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${
                integration.isActive ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <PhoneIcon className={`h-6 w-6 ${
                  integration.isActive ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{integration.phoneNumber}</p>
                
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <p>Phone Number ID: {integration.phoneNumberId}</p>
                  <p>Business Account ID: {integration.businessAccountId}</p>
                  <p>Created: {format(new Date(integration.createdAt), 'MMM d, yyyy')}</p>
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  {integration.isActive ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onSync && integration.isActive && (
                <button
                  onClick={() => onSync(integration.id)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                  title="Sync Now"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => handleToggleStatus(integration.id, integration.isActive)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title={integration.isActive ? 'Deactivate' : 'Activate'}
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onEdit(integration)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(integration.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 