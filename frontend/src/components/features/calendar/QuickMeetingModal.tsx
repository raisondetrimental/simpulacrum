/**
 * Quick Meeting Modal - Create a new meeting from calendar
 * Allows searching for contacts across all 4 CRM modules
 */

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Contact } from '../../../types/liquidity';
import { SponsorContact } from '../../../types/sponsors';
import { CounselContact } from '../../../types/counsel';
import { AgentContact } from '../../../types/agents';
import { apiPost } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface QuickMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  allContacts: {
    liquidity: Contact[];
    sponsors: SponsorContact[];
    counsel: CounselContact[];
    agents: AgentContact[];
  };
  onMeetingCreated: () => void;
}

type ContactWithModule = {
  module: 'liquidity' | 'sponsors' | 'counsel' | 'agents';
  organizationType: 'capital_partner' | 'sponsor' | 'counsel' | 'agent';
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  capital_partner_name?: string;
  sponsor_name?: string;
  firm_name?: string;
  agent_name?: string;
}

const QuickMeetingModal: React.FC<QuickMeetingModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  allContacts,
  onMeetingCreated,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactWithModule | null>(null);
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState('');
  const [meetingTime, setMeetingTime] = useState('09:00');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if selected date is in the past
  const isPastMeeting = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  }, [selectedDate]);

  // Flatten all contacts with module info
  const allContactsFlat: ContactWithModule[] = useMemo(() => {
    const contacts: ContactWithModule[] = [];

    allContacts.liquidity.forEach(contact => {
      contacts.push({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        capital_partner_name: (contact as any).capital_partner_name,
        module: 'liquidity',
        organizationType: 'capital_partner'
      });
    });

    allContacts.sponsors.forEach(contact => {
      contacts.push({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        sponsor_name: (contact as any).sponsor_name,
        module: 'sponsors',
        organizationType: 'sponsor'
      });
    });

    allContacts.counsel.forEach(contact => {
      contacts.push({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        firm_name: (contact as any).firm_name,
        module: 'counsel',
        organizationType: 'counsel'
      });
    });

    allContacts.agents.forEach(contact => {
      contacts.push({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        agent_name: (contact as any).agent_name,
        module: 'agents',
        organizationType: 'agent'
      });
    });

    return contacts;
  }, [allContacts]);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allContactsFlat.filter(contact => {
      const nameMatch = contact.name.toLowerCase().includes(query);
      const roleMatch = contact.role?.toLowerCase().includes(query);
      const organizationName =
        ('capital_partner_name' in contact) ? contact.capital_partner_name :
        ('sponsor_name' in contact) ? contact.sponsor_name :
        ('firm_name' in contact) ? contact.firm_name :
        ('agent_name' in contact) ? contact.agent_name :
        '';
      const orgMatch = organizationName?.toLowerCase().includes(query);

      return nameMatch || roleMatch || orgMatch;
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, allContactsFlat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContact) {
      setError('Please select a contact');
      return;
    }

    if (!notes.trim()) {
      setError(isPastMeeting ? 'Please enter meeting notes' : 'Please enter meeting details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const [hours, minutes] = meetingTime.split(':').map(Number);
      const meetingDateTime = new Date(selectedDate);
      meetingDateTime.setHours(hours, minutes, 0, 0);

      const result = await apiPost('/api/quick-meeting', {
        contact_id: selectedContact.id,
        organization_type: selectedContact.organizationType,
        date: meetingDateTime.toISOString(),
        notes: notes.trim(),
        participants: participants.trim(),
        next_follow_up: nextFollowUp || undefined,
        assigned_user_ids: user ? [user.id] : [],
      });

      if (result.success) {
        onMeetingCreated();
        // Reset form
        setSelectedContact(null);
        setSearchQuery('');
        setNotes('');
        setParticipants('');
        setMeetingTime('09:00');
        setNextFollowUp('');
      } else {
        setError(result.message || 'Failed to create meeting');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error creating meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact: ContactWithModule) => {
    setSelectedContact(contact);
    setSearchQuery('');
  };

  const getModuleLabel = (module: string) => {
    switch (module) {
      case 'liquidity': return 'Liquidity';
      case 'sponsors': return 'Sponsor';
      case 'counsel': return 'Counsel';
      case 'agents': return 'Agent';
      default: return module;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'liquidity': return 'bg-green-100 text-green-800 border-green-300';
      case 'sponsors': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'counsel': return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'agents': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isPastMeeting ? 'Record Past Meeting' : 'Schedule Meeting'}
                </h2>
                {isPastMeeting ? (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-medium">
                    Past
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded text-xs font-medium">
                    Future
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Contact <span className="text-red-500">*</span>
              </label>

              {selectedContact ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getModuleColor(selectedContact.module)}`}>
                        {getModuleLabel(selectedContact.module)}
                      </span>
                      <span className="font-medium text-gray-900">{selectedContact.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{selectedContact.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, or organization..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />

                  {/* Search Results */}
                  {searchQuery && filteredContacts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredContacts.map((contact) => {
                        const organizationName =
                          ('capital_partner_name' in contact) ? contact.capital_partner_name :
                          ('sponsor_name' in contact) ? contact.sponsor_name :
                          ('firm_name' in contact) ? contact.firm_name :
                          ('agent_name' in contact) ? contact.agent_name :
                          '';

                        return (
                          <button
                            key={`${contact.module}-${contact.id}`}
                            type="button"
                            onClick={() => handleContactSelect(contact)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getModuleColor(contact.module)}`}>
                                {getModuleLabel(contact.module)}
                              </span>
                              <span className="font-medium text-gray-900">{contact.name}</span>
                            </div>
                            <p className="text-sm text-gray-600">{contact.role}</p>
                            {organizationName && (
                              <p className="text-xs text-gray-500 mt-0.5">{organizationName}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {searchQuery && filteredContacts.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                      <p className="text-sm text-gray-500">No contacts found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meeting Time */}
            <div>
              <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700 mb-1">
                {isPastMeeting ? 'Meeting Time' : 'Scheduled Time'} <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="meetingTime"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {isPastMeeting ? 'What time did the meeting take place?' : 'What time is the meeting scheduled for?'}
              </p>
            </div>

            {/* Meeting Notes/Details */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                {isPastMeeting ? 'Meeting Notes' : 'Meeting Agenda / Details'} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isPastMeeting ? 'What was discussed in this meeting?' : 'What will be discussed? Meeting agenda or topics...'}
                required
              />
            </div>

            {/* Participants */}
            <div>
              <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                Participants
              </label>
              <input
                type="text"
                id="participants"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isPastMeeting ? 'Who attended? (e.g., John, Sarah, David)' : 'Who will attend? (e.g., John, Sarah, David)'}
              />
            </div>

            {/* Next Follow-Up */}
            <div>
              <label htmlFor="nextFollowUp" className="block text-sm font-medium text-gray-700 mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                id="nextFollowUp"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Set a reminder for when you should follow up
              </p>
            </div>

            {/* Assignment Info */}
            <div className={`${isPastMeeting ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} border rounded-md p-3`}>
              <p className={`text-sm ${isPastMeeting ? 'text-gray-800' : 'text-blue-800'}`}>
                <strong>Note:</strong> This {isPastMeeting ? 'meeting record' : 'scheduled meeting'} will be automatically assigned to you ({user?.full_name || user?.username}).
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={loading || !selectedContact}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isPastMeeting ? 'Recording...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isPastMeeting ? 'Record Meeting' : 'Schedule Meeting'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingModal;
