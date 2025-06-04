"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "@/app/components/ui/use-toast";
import { 
  PlusIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { TEAM_PERMISSION_GROUPS, TEAM_PERMISSIONS, getTeamPermissionsByCategory } from "@/app/lib/team-permissions";

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  _count: {
    members: number;
  };
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/teams/roles");
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one permission",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/teams/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create role");
      }

      toast({
        title: "Success",
        description: "Role created successfully",
      });

      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", permissions: [] });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete role");
      }

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = Object.values(getTeamPermissionsByCategory(category)) as string[];
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p)),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])],
      }));
    }
  };

  // Filter roles based on search and type
  const filteredRoles = roles.filter(role => {
    const matchesSearch = searchTerm === '' || 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === 'ALL' || 
      (typeFilter === 'SYSTEM' && role.isSystem) ||
      (typeFilter === 'CUSTOM' && !role.isSystem);
    
    return matchesSearch && matchesType;
  });

  const typeOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'SYSTEM', label: 'System Roles' },
    { value: 'CUSTOM', label: 'Custom Roles' },
  ];

  if (loading) {
    return (
      <div>
        <div className="sm:flex sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/teams">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Teams
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Roles</h1>
              <p className="mt-1 text-sm text-gray-500">Define roles and permissions for your team members</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/teams">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Roles</h1>
            <p className="mt-1 text-sm text-gray-500">Define roles and permissions for your team members</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <DialogTitle className="text-center">Create New Role</DialogTitle>
                <DialogDescription className="text-center">
                  Define a custom role with specific permissions for your team members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Role Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Content Editor"
                    className="w-full"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this role's responsibilities..."
                    rows={2}
                    className="w-full resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Permissions <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg overflow-hidden">
                    <ScrollArea className="h-[400px]">
                      <Tabs defaultValue={TEAM_PERMISSION_GROUPS[0].title} className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto">
                          {TEAM_PERMISSION_GROUPS.map((group) => (
                            <TabsTrigger 
                              key={group.title} 
                              value={group.title} 
                              className="rounded-none border-r last:border-r-0 px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                            >
                              {group.title}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {TEAM_PERMISSION_GROUPS.map((group) => (
                          <TabsContent key={group.title} value={group.title} className="p-4 m-0">
                            <div className="space-y-4">
                              {group.categories.map((category) => {
                                const permissions = getTeamPermissionsByCategory(category);
                                const categoryPerms = Object.values(permissions);
                                const allSelected = categoryPerms.every(p => 
                                  formData.permissions.includes(p)
                                );
                                const someSelected = categoryPerms.some(p => 
                                  formData.permissions.includes(p)
                                );

                                return (
                                  <div key={category} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`category-${category}`}
                                          checked={allSelected}
                                          onCheckedChange={() => toggleCategoryPermissions(category)}
                                        />
                                        <Label
                                          htmlFor={`category-${category}`}
                                          className="text-sm font-medium cursor-pointer"
                                        >
                                          {category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                        </Label>
                                      </div>
                                      {someSelected && !allSelected && (
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                          Partial
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 ml-6">
                                      {Object.entries(permissions).map(([key, value]) => (
                                        <div key={value} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={value}
                                            checked={formData.permissions.includes(value)}
                                            onCheckedChange={() => togglePermission(value)}
                                            className="h-4 w-4"
                                          />
                                          <Label
                                            htmlFor={value}
                                            className="text-sm cursor-pointer capitalize text-gray-600"
                                          >
                                            {key.toLowerCase().replace(/_/g, " ")}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </ScrollArea>
                  </div>
                  <p className="text-xs text-gray-500">
                    Selected {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({ name: "", description: "", permissions: [] });
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRole} 
                  disabled={creating || !formData.name.trim() || formData.permissions.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Role"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Summary */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Roles Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs font-medium text-gray-500">Total Roles</p>
            <p className="text-lg font-semibold text-gray-900">{roles.length}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs font-medium text-blue-600">System Roles</p>
            <p className="text-lg font-semibold text-blue-700">
              {roles.filter(r => r.isSystem).length}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs font-medium text-green-600">Custom Roles</p>
            <p className="text-lg font-semibold text-green-700">
              {roles.filter(r => !r.isSystem).length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <p className="text-xs font-medium text-purple-600">Active Roles</p>
            <p className="text-lg font-semibold text-purple-700">
              {roles.filter(r => r.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-56">
            <label htmlFor="type-filter" className="sr-only">
              Type
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="type-filter"
                name="type-filter"
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-12 text-center">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {roles.length === 0 ? "No roles yet" : "No roles found"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {roles.length === 0 
                ? "Create your first role to define permissions for your team members."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {roles.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Create Role
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {role.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isSystem 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role.isSystem ? 'System' : 'Custom'}
                      </span>
                    </div>
                    {role.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {role.description}
                      </p>
                    )}
                  </div>
                  {!role.isSystem && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="ml-2 p-1 rounded-full hover:bg-gray-100">
                          <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/teams/roles/${role.id}/edit`)}
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}</span>
                    <span>{role._count.members} member{role._count.members !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => router.push(`/dashboard/teams/roles/${role.id}`)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 