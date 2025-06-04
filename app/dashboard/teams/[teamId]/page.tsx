"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { toast } from "@/app/components/ui/use-toast";
import { 
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface TeamMember {
  id: string;
  joinedAt: string;
  invitedAt?: string;
  acceptedAt?: string;
  isActive: boolean;
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
    lastLoginAt?: string;
    isActive: boolean;
  };
  role: {
    id: string;
    name: string;
    isSystem: boolean;
  };
}

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

export default function TeamDetailsPage({ params }: { params: Promise<{ teamId: string }> }) {
  const router = useRouter();
  const { teamId } = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteData, setInviteData] = useState({
    email: "",
    roleId: "",
  });

  useEffect(() => {
    fetchTeamData();
    fetchRoles();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      // Fetch team details
      const teamResponse = await fetch(`/api/teams/${teamId}`);
      if (!teamResponse.ok) {
        throw new Error("Failed to fetch team");
      }
      const teamData = await teamResponse.json();
      setTeam(teamData.team);

      // Fetch team members
      const membersResponse = await fetch(`/api/teams/${teamId}/members`);
      if (!membersResponse.ok) {
        throw new Error("Failed to fetch team members");
      }
      const membersData = await membersResponse.json();
      setMembers(membersData.members);
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleInviteMember = async () => {
    if (!inviteData.email || !inviteData.roleId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inviteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite member");
      }

      toast({
        title: "Success",
        description: "Member invited successfully",
      });

      setIsInviteDialogOpen(false);
      setInviteData({ email: "", roleId: "" });
      fetchTeamData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite member';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      fetchTeamData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update member role");
      }

      toast({
        title: "Success",
        description: "Member role updated successfully",
      });

      fetchTeamData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update member role';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertDescription>Team not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/teams">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          </Link>
        </div>
        
        <div className="sm:flex sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="mt-1 text-sm text-gray-500">{team.description}</p>
            )}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Owner: {team.owner.name || team.owner.email}</span>
              <span>•</span>
              <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                team.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {team.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link href={`/dashboard/teams/${teamId}/settings`}>
              <Button variant="outline">
                Settings
              </Button>
            </Link>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <DialogTitle className="text-center">Invite Team Member</DialogTitle>
                  <DialogDescription className="text-center">
                    Send an invitation to add a new member to {team.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        placeholder="colleague@example.com"
                        className="pl-10 w-full"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-left font-normal">
                          <span className="flex items-center">
                            <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-400" />
                            {inviteData.roleId 
                              ? roles.find(r => r.id === inviteData.roleId)?.name || "Select a role"
                              : "Select a role"}
                          </span>
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full" align="start">
                        <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {roles.map((role) => (
                          <DropdownMenuItem
                            key={role.id}
                            onClick={() => setInviteData({ ...inviteData, roleId: role.id })}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="flex items-center">
                                <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {role.name}
                              </span>
                              {role.isSystem && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">System</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {inviteData.roleId && (
                      <p className="text-xs text-gray-500 mt-1">
                        {roles.find(r => r.id === inviteData.roleId)?.description}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsInviteDialogOpen(false);
                      setInviteData({ email: "", roleId: "" });
                    }}
                    disabled={inviting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInviteMember} 
                    disabled={inviting || !inviteData.email || !inviteData.roleId}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {inviting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Members Summary */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Members Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs font-medium text-gray-500">Total Members</p>
            <p className="text-lg font-semibold text-gray-900">{members.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs font-medium text-green-600">Active</p>
            <p className="text-lg font-semibold text-green-700">
              {members.filter(m => m.user.isActive && m.acceptedAt).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-xs font-medium text-yellow-600">Pending</p>
            <p className="text-lg font-semibold text-yellow-700">
              {members.filter(m => !m.acceptedAt).length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <p className="text-xs font-medium text-purple-600">Roles</p>
            <p className="text-lg font-semibold text-purple-700">
              {new Set(members.map(m => m.role.id)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {members.length === 0 ? "No members yet" : "No members found"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {members.length === 0 
                ? "Invite your first member to start collaborating."
                : "Try adjusting your search criteria."
              }
            </p>
            {members.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Invite Member
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {member.user.image ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={member.user.image}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.user.name || member.user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.user.email}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            {member.role.name}
                          </span>
                          {member.acceptedAt ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                          {!member.user.isActive && (
                            <span className="flex items-center text-red-600">
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-[180px]">
                            {member.role.name}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {roles.map((role) => (
                            <DropdownMenuItem
                              key={role.id}
                              onClick={() => handleUpdateMemberRole(member.id, role.id)}
                            >
                              {role.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!member.acceptedAt && (
                            <DropdownMenuItem>
                              <EnvelopeIcon className="mr-2 h-4 w-4" />
                              Resend Invitation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 