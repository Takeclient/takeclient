'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast, { Toaster } from 'react-hot-toast';

interface Settings {
  notifications: {
    email: boolean;
    browser: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

interface TenantSettings {
  name: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      browser: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
    },
  });

  const [tenantSettings, setTenantSettings] = useState<TenantSettings>({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const user = session?.user as any;
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'TENANT_ADMIN' || isSuperAdmin;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load user settings
      const settingsResponse = await fetch('/api/settings');
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        setSettings(data);
      }

      // Load tenant settings if admin
      if (isAdmin && !isSuperAdmin) {
        const tenantResponse = await fetch('/api/settings/tenant');
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          setTenantSettings(tenantData);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const saveTenantSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/tenant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantSettings),
      });

      if (response.ok) {
        toast.success('Organization settings saved successfully');
      } else {
        toast.error('Failed to save organization settings');
      }
    } catch (error) {
      console.error('Error saving tenant settings:', error);
      toast.error('Error saving organization settings');
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    ...(isAdmin && !isSuperAdmin ? [{ id: 'organization', name: 'Organization', icon: BuildingOfficeIcon }] : []),
    ...(isSuperAdmin ? [{ id: 'admin', name: 'Admin', icon: ShieldCheckIcon }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Privacy</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.privacy.profileVisible}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisible: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Make my profile visible to other users</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.privacy.activityVisible}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, activityVisible: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show my activity status</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveSettings} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, email: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Receive email notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.marketing}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, marketing: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Receive marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Browser Notifications</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.browser}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, browser: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable browser notifications</span>
                    </label>
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveSettings} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Password</h3>
                    {!showPasswordForm ? (
                      <Button
                        onClick={() => setShowPasswordForm(true)}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        Change Password
                      </Button>
                    ) : (
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button onClick={changePassword} disabled={isSaving}>
                            <CheckIcon className="h-4 w-4 mr-2" />
                            {isSaving ? 'Changing...' : 'Change Password'}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="bg-gray-600 hover:bg-gray-700"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Session Settings</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                        })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={60}>60</option>
                        <option value={120}>120</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveSettings} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Settings (Tenant Admins only) */}
            {activeTab === 'organization' && isAdmin && !isSuperAdmin && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Organization Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={tenantSettings.name}
                        onChange={(e) => setTenantSettings({ ...tenantSettings, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={tenantSettings.website}
                        onChange={(e) => setTenantSettings({ ...tenantSettings, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        value={tenantSettings.industry}
                        onChange={(e) => setTenantSettings({ ...tenantSettings, industry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Size
                      </label>
                      <select
                        value={tenantSettings.size}
                        onChange={(e) => setTenantSettings({ ...tenantSettings, size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={tenantSettings.description}
                      onChange={(e) => setTenantSettings({ ...tenantSettings, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveTenantSettings} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Organization Settings'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Super Admin Settings */}
            {activeTab === 'admin' && isSuperAdmin && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Super Admin Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">
                          Platform Administrator Access
                        </h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          You have full administrative access to the platform. Use these settings to manage 
                          system-wide configurations and monitor platform health.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => router.push('/admin')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CogIcon className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/admin/plans')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Manage Plans
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/admin/tenants')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      Manage Tenants
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/admin/users')}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 