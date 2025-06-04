'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast, { Toaster } from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isSuperAdmin: boolean;
  tenantId?: string;
  tenantName?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
  });

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({
          name: data.name || '',
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully');
        
        // Update session if name changed
        if (editForm.name !== profile?.name) {
          await update({ name: editForm.name });
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: profile?.name || '',
    });
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return 'Super Administrator';
    
    const roleNames: Record<string, string> = {
      TENANT_ADMIN: 'Administrator',
      MANAGER: 'Manager',
      MARKETER: 'Marketing',
      SALES: 'Sales',
      SUPPORT: 'Support',
      USER: 'User',
    };
    return roleNames[role] || role;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <p className="text-blue-100">{profile.email}</p>
                <div className="flex items-center mt-2">
                  {profile.isSuperAdmin ? (
                    <ShieldCheckIcon className="h-5 w-5 text-yellow-300 mr-2" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-blue-200 mr-2" />
                  )}
                  <span className="text-blue-100">
                    {getRoleDisplayName(profile.role, profile.isSuperAdmin)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900">{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profile.email}</span>
                    <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                  </div>
                </div>


              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="flex items-center">
                    {profile.isSuperAdmin ? (
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <span className="text-gray-900">
                      {getRoleDisplayName(profile.role, profile.isSuperAdmin)}
                    </span>
                  </div>
                </div>

                {!profile.isSuperAdmin && profile.tenantName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900">{profile.tenantName}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <span className="text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {profile.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Login
                    </label>
                    <span className="text-gray-900">
                      {new Date(profile.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Super Admin Features */}
          {profile.isSuperAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Super Admin Access</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <ShieldCheckIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Platform Administrator
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      You have full access to platform management, including plan management, 
                      tenant oversight, and system administration.
                    </p>
                    <div className="mt-3">
                      <Button
                        onClick={() => router.push('/admin')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                      >
                        Go to Admin Panel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 