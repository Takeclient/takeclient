'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import ContactDetailsModal from '../components/ContactDetailsModal';
import ContactSelectionModal from '../components/ContactSelectionModal';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status: string;
  avatar?: string;
  jobTitle?: string;
  company?: {
    id: string;
    name: string;
  };
  leadScore?: number;
  lastActivity?: string;
  tags: string[];
  createdAt: string;
}

interface ContactStage {
  id: string;
  name: string;
  color: string;
  order: number;
  contacts: Contact[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: ContactStage[];
}

export default function ContactKanban() {
  const { data: session } = useSession();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactSelection, setShowContactSelection] = useState(false);
  const [selectedStageForAddContact, setSelectedStageForAddContact] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contacts/pipeline');
      if (response.ok) {
        const data = await response.json();
        setPipeline(data);
      } else {
        toast.error('Failed to load contact pipeline');
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
      toast.error('Error loading pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !pipeline) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Find source and destination stages
    const sourceStage = pipeline.stages.find(stage => stage.id === source.droppableId);
    const destStage = pipeline.stages.find(stage => stage.id === destination.droppableId);

    if (!sourceStage || !destStage) return;

    // Create new pipeline state
    const newPipeline = { ...pipeline };
    
    // Remove contact from source stage
    const contactToMove = sourceStage.contacts[source.index];
    const newSourceContacts = [...sourceStage.contacts];
    newSourceContacts.splice(source.index, 1);

    // Add contact to destination stage
    const newDestContacts = [...destStage.contacts];
    newDestContacts.splice(destination.index, 0, contactToMove);

    // Update the pipeline state
    newPipeline.stages = newPipeline.stages.map(stage => {
      if (stage.id === source.droppableId) {
        return { ...stage, contacts: newSourceContacts };
      }
      if (stage.id === destination.droppableId) {
        return { ...stage, contacts: newDestContacts };
      }
      return stage;
    });

    // Optimistically update UI
    setPipeline(newPipeline);

    // Update backend
    try {
      const response = await fetch('/api/contacts/move-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: draggableId,
          newStageId: destination.droppableId,
        }),
      });

      if (!response.ok) {
        // Revert on error
        loadPipeline();
        toast.error('Failed to move contact');
      } else {
        toast.success('Contact moved successfully');
      }
    } catch (error) {
      // Revert on error
      loadPipeline();
      toast.error('Error moving contact');
    }
  };

  const filteredContacts = (contacts: Contact[]) => {
    return contacts.filter(contact => {
      const matchesSearch = searchTerm === '' || 
        `${contact.firstName} ${contact.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => contact.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  };

  const getLeadScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const handleContactClick = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsModalOpen(true);
  };

  const handleContactUpdated = (updatedContact: any) => {
    // Update the contact in the pipeline
    if (pipeline) {
      const newPipeline = { ...pipeline };
      newPipeline.stages = newPipeline.stages.map(stage => ({
        ...stage,
        contacts: stage.contacts.map(contact => 
          contact.id === updatedContact.id ? { ...contact, ...updatedContact } : contact
        )
      }));
      setPipeline(newPipeline);
    }
  };

  const handleAddContactToStage = (stageId: string, stageName: string) => {
    setSelectedStageForAddContact({ id: stageId, name: stageName });
    setShowContactSelection(true);
  };

  const handleContactsSelected = async (contactIds: string[]) => {
    if (!selectedStageForAddContact || contactIds.length === 0) return;

    try {
      const response = await fetch('/api/contacts/add-to-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds,
          stageId: selectedStageForAddContact.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Reload the pipeline to get updated data
        await loadPipeline();
        toast.success(`${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''} added to ${selectedStageForAddContact.name}`);
      } else {
        toast.error('Failed to add contacts to stage');
      }
    } catch (error) {
      console.error('Error adding contacts to stage:', error);
      toast.error('Error adding contacts to stage');
    }

    setSelectedStageForAddContact(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kanban board...</p>
        </div>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No Pipeline Found</h3>
        <p className="text-gray-500 mt-2">Create a pipeline to start managing your contacts.</p>
        <button
          onClick={() => setShowStageSettings(true)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <CogIcon className="h-4 w-4 mr-2" />
          Setup Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Contact Pipeline</h1>
            <span className="text-sm text-gray-500">
              {pipeline.stages.reduce((total, stage) => total + stage.contacts.length, 0)} contacts
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add Contact */}
            <Link
              href="/dashboard/contacts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Contact
            </Link>

            {/* Settings */}
            <button
              onClick={() => setShowStageSettings(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto bg-gray-50">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full p-6 space-x-6 min-w-max">
            {pipeline.stages.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                {/* Stage Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      ></div>
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({filteredContacts(stage.contacts).length})
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Contact Cards */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : 'bg-transparent'
                      }`}
                    >
                      {filteredContacts(stage.contacts).map((contact, index) => (
                        <Draggable
                          key={contact.id}
                          draggableId={contact.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleContactClick(contact.id)}
                              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              {/* Contact Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    {contact.avatar ? (
                                      <img
                                        src={contact.avatar}
                                        alt={contact.firstName}
                                        className="w-10 h-10 rounded-full"
                                      />
                                    ) : (
                                      <UserIcon className="h-6 w-6 text-gray-600" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {contact.firstName} {contact.lastName || ''}
                                    </h4>
                                    {contact.jobTitle && (
                                      <p className="text-xs text-gray-500">{contact.jobTitle}</p>
                                    )}
                                  </div>
                                </div>
                                
                                {contact.leadScore && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeadScoreColor(contact.leadScore)}`}>
                                    {contact.leadScore}
                                  </span>
                                )}
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-2">
                                {contact.email && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                                    <span className="truncate">{contact.email}</span>
                                  </div>
                                )}
                                
                                {contact.phone && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <PhoneIcon className="h-4 w-4 mr-2" />
                                    <span>{contact.phone}</span>
                                  </div>
                                )}
                                
                                {contact.company && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                                    <span className="truncate">{contact.company.name}</span>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {contact.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {contact.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {contact.tags.length > 3 && (
                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                      +{contact.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Last Activity */}
                              {contact.lastActivity && (
                                <div className="mt-3 text-xs text-gray-500">
                                  Last activity: {new Date(contact.lastActivity).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Add Contact to Stage */}
                      <button
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => handleAddContactToStage(stage.id, stage.name)}
                      >
                        <PlusIcon className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm">Add Contact</span>
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Contact Details Modal */}
      {selectedContactId && (
        <ContactDetailsModal
          contactId={selectedContactId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContactId(null);
          }}
          onContactUpdated={handleContactUpdated}
        />
      )}

      {/* Contact Selection Modal */}
      {selectedStageForAddContact && (
        <ContactSelectionModal
          isOpen={showContactSelection}
          onClose={() => {
            setShowContactSelection(false);
            setSelectedStageForAddContact(null);
          }}
          onContactsSelected={handleContactsSelected}
          stageId={selectedStageForAddContact.id}
          stageName={selectedStageForAddContact.name}
          excludeContactIds={
            pipeline?.stages
              .find(stage => stage.id === selectedStageForAddContact.id)
              ?.contacts.map(contact => contact.id) || []
          }
        />
      )}
    </div>
  );
} 