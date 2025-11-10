/**
 * CRM All - Meeting Notes Page
 *
 * Consolidated view of all meeting notes across all CRM modules
 * with quick-start meeting functionality
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllContacts, updateMeetingNote, deleteMeetingNote } from '../../services/crmService';
import { UnifiedContact, OrganizationTypeFilter as FilterType, MeetingHistoryEntry } from '../../types/crm';
import OrganizationTypeBadge from '../../components/features/crm/OrganizationTypeBadge';
import OrganizationTypeFilter from '../../components/features/crm/OrganizationTypeFilter';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { getCapitalPartners } from '../../services/capitalPartnersService';
import { getCorporates } from '../../services/sponsorsService';
import { getLegalAdvisors } from '../../services/counselService';
import { getAgents } from '../../services/agentsService';

interface MeetingWithContext extends MeetingHistoryEntry {
  contact_id: string;
  contact_name: string;
  organization_id: string;
  organization_name?: string;
  organization_type: 'capital_partner' | 'sponsor' | 'counsel' | 'agent';
}

interface OrganizationSearchResult {
  id: string;
  name: string;
  type: 'capital_partner' | 'sponsor' | 'counsel' | 'agent';
  headquarters_location?: string;
  country?: string;
}

const AllMeetingNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingWithContext[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'older'>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithContext | null>(null);

  // Organization search state
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgSearchResults, setOrgSearchResults] = useState<OrganizationSearchResult[]>([]);
  const [showOrgSearchResults, setShowOrgSearchResults] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [meetings, typeFilter, searchTerm, dateFilter]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const contacts = await getAllContacts();

      // Extract all meetings from all contacts
      const allMeetings: MeetingWithContext[] = [];
      contacts.forEach(contact => {
        if (contact.meeting_history && contact.meeting_history.length > 0) {
          contact.meeting_history.forEach(meeting => {
            allMeetings.push({
              ...meeting,
              contact_id: contact.id,
              contact_name: contact.name,
              organization_id: contact.organization_id,
              organization_name: contact.organization_name,
              organization_type: contact.organization_type
            });
          });
        }
      });

      // Sort by date (most recent first)
      allMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...meetings];

    // Apply type filter
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.organization_type === typeFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (dateFilter === 'recent') {
        filtered = filtered.filter(meeting => new Date(meeting.date) >= thirtyDaysAgo);
      } else if (dateFilter === 'older') {
        filtered = filtered.filter(meeting => new Date(meeting.date) < thirtyDaysAgo);
      }
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.contact_name.toLowerCase().includes(searchLower) ||
        (meeting.organization_name && meeting.organization_name.toLowerCase().includes(searchLower)) ||
        meeting.notes.toLowerCase().includes(searchLower) ||
        (meeting.participants && meeting.participants.toLowerCase().includes(searchLower))
      );
    }

    setFilteredMeetings(filtered);
  };

  const getContactLink = (meeting: MeetingWithContext): string => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/contacts',
      sponsor: '/sponsors/contacts',
      counsel: '/counsel/contacts',
      agent: '/agents/contacts'
    };
    return `${routes[meeting.organization_type]}/${meeting.contact_id}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Organization search functionality
  const searchOrganizations = async (term: string) => {
    if (!term || term.length < 2) {
      setOrgSearchResults([]);
      setShowOrgSearchResults(false);
      return;
    }

    try {
      // Fetch all organizations in parallel
      const [capitalPartnersRes, corporatesRes, legalAdvisorsRes, agentsRes] = await Promise.all([
        getCapitalPartners(),
        getCorporates(),
        getLegalAdvisors(),
        getAgents()
      ]);

      // Extract data arrays from API responses
      const capitalPartners = capitalPartnersRes.data || [];
      const corporates = corporatesRes.data || [];
      const legalAdvisors = legalAdvisorsRes.data || [];
      const agents = agentsRes.data || [];

      // Map to unified search results
      const allOrgs: OrganizationSearchResult[] = [
        ...capitalPartners.map(cp => ({
          id: cp.id,
          name: cp.name,
          type: 'capital_partner' as const,
          headquarters_location: cp.headquarters_location,
          country: cp.country
        })),
        ...corporates.map(corp => ({
          id: corp.id,
          name: corp.name,
          type: 'sponsor' as const,
          headquarters_location: corp.headquarters_location,
          country: corp.country
        })),
        ...legalAdvisors.map(legal => ({
          id: legal.id,
          name: legal.name,
          type: 'counsel' as const,
          headquarters_location: legal.headquarters_location,
          country: legal.country
        })),
        ...agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: 'agent' as const,
          headquarters_location: agent.headquarters_location,
          country: agent.country
        }))
      ];

      // Filter and score results
      const searchLower = term.toLowerCase();
      const matches = allOrgs
        .map(org => {
          const nameLower = org.name.toLowerCase();
          let score = 0;

          // Exact match
          if (nameLower === searchLower) score = 100;
          // Starts with search term
          else if (nameLower.startsWith(searchLower)) score = 80;
          // Contains search term
          else if (nameLower.includes(searchLower)) score = 60;
          // Word starts with search term
          else if (nameLower.split(' ').some(word => word.startsWith(searchLower))) score = 40;
          else return null;

          return { ...org, score };
        })
        .filter(result => result !== null)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, 5) as OrganizationSearchResult[];

      setOrgSearchResults(matches);
      setShowOrgSearchResults(true);
    } catch (error) {
      console.error('Error searching organizations:', error);
    }
  };

  const handleOrgSearchChange = (value: string) => {
    setOrgSearchTerm(value);
    searchOrganizations(value);
  };

  const handleOrgSelect = (org: OrganizationSearchResult) => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/meeting',
      sponsor: '/sponsors/meeting',
      counsel: '/counsel/meeting',
      agent: '/agents/meeting'
    };

    navigate(`${routes[org.type]}?org=${org.id}`);
  };

  const handleQuickStart = (type: 'capital_partner' | 'sponsor' | 'counsel' | 'agent') => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/meeting',
      sponsor: '/sponsors/meeting',
      counsel: '/counsel/meeting',
      agent: '/agents/meeting'
    };

    navigate(routes[type]);
  };

  const handleMeetingClick = (meeting: MeetingWithContext) => {
    setSelectedMeeting(meeting);
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!selectedMeeting) return;
    await updateMeetingNote(selectedMeeting.organization_type, selectedMeeting.contact_id, meetingId, data);
    await loadMeetings();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!selectedMeeting) return;
    await deleteMeetingNote(selectedMeeting.organization_type, selectedMeeting.contact_id, meetingId);
    await loadMeetings();
    setSelectedMeeting(null);
  };

  const getModuleType = (orgType: 'capital_partner' | 'sponsor' | 'counsel' | 'agent'): 'liquidity' | 'sponsor' | 'counsel' | 'agent' => {
    if (orgType === 'capital_partner') return 'liquidity';
    return orgType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Notes</h1>
            <p className="text-gray-600 mt-1">
              {filteredMeetings.length} of {meetings.length} meetings
            </p>
          </div>
        </div>
      </div>

      {/* Start Meeting Section */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Start a Meeting</h2>

        {/* Organization Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for organization
          </label>
          <div className="relative">
            <input
              type="text"
              value={orgSearchTerm}
              onChange={(e) => handleOrgSearchChange(e.target.value)}
              onFocus={() => orgSearchResults.length > 0 && setShowOrgSearchResults(true)}
              placeholder="Type to search organizations..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showOrgSearchResults && orgSearchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {orgSearchResults.map((org) => (
                <button
                  key={`${org.type}-${org.id}`}
                  onClick={() => {
                    handleOrgSelect(org);
                    setShowOrgSearchResults(false);
                    setOrgSearchTerm('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-sm text-gray-500">
                        {org.headquarters_location || org.country || 'No location'}
                      </p>
                    </div>
                    <OrganizationTypeBadge type={org.type} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Start Cards */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Or start a meeting with:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Capital Partner */}
            <button
              onClick={() => handleQuickStart('capital_partner')}
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-4 text-center transition-colors group"
            >
              <svg className="mx-auto h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="font-medium text-gray-900">Capital Partner</p>
            </button>

            {/* Corporate */}
            <button
              onClick={() => handleQuickStart('sponsor')}
              className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg p-4 text-center transition-colors group"
            >
              <svg className="mx-auto h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="font-medium text-gray-900">Corporate</p>
            </button>

            {/* Legal Advisor */}
            <button
              onClick={() => handleQuickStart('counsel')}
              className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg p-4 text-center transition-colors group"
            >
              <svg className="mx-auto h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <p className="font-medium text-gray-900">Legal Advisor</p>
            </button>

            {/* Transaction Agent */}
            <button
              onClick={() => handleQuickStart('agent')}
              className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg p-4 text-center transition-colors group"
            >
              <svg className="mx-auto h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="font-medium text-gray-900">Transaction Agent</p>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <OrganizationTypeFilter
            value={typeFilter}
            onChange={setTypeFilter}
          />

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'recent' | 'older')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
            >
              <option value="all">All Time</option>
              <option value="recent">Last 30 Days</option>
              <option value="older">Older than 30 Days</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes, contacts, organizations..."
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Meeting Notes List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No meeting notes found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeetings.map((meeting, index) => {
            const colorClasses = {
              capital_partner: {
                hover: 'hover:bg-blue-50',
                focus: 'focus:ring-blue-500',
                text: 'text-blue-600'
              },
              sponsor: {
                hover: 'hover:bg-green-50',
                focus: 'focus:ring-green-500',
                text: 'text-green-600'
              },
              counsel: {
                hover: 'hover:bg-purple-50',
                focus: 'focus:ring-purple-500',
                text: 'text-purple-600'
              },
              agent: {
                hover: 'hover:bg-orange-50',
                focus: 'focus:ring-orange-500',
                text: 'text-orange-600'
              }
            };
            const colors = colorClasses[meeting.organization_type];

            return (
              <button
                key={`${meeting.contact_id}-${meeting.date}-${index}`}
                type="button"
                onClick={() => handleMeetingClick(meeting)}
                className={`w-full text-left border border-gray-200 rounded-md p-4 ${colors.hover} focus:outline-none focus:ring-2 ${colors.focus} transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(meeting.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs md:text-sm ${colors.text} font-medium`}>
                        {meeting.contact_name}
                      </span>
                      <OrganizationTypeBadge type={meeting.organization_type} size="sm" />
                    </div>
                  </div>
                  {meeting.next_follow_up && (
                    <span className={`text-xs ${colors.text}`}>
                      Follow-up: {new Date(meeting.next_follow_up).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {meeting.organization_name && (
                  <p className="text-xs text-gray-600 mb-1">
                    Organization: {meeting.organization_name}
                  </p>
                )}
                {meeting.participants && (
                  <p className="text-xs text-gray-600 mb-1">
                    Participants: {meeting.participants}
                  </p>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-2">
                  {meeting.notes}
                </p>
                <p className={`mt-2 text-xs font-semibold ${colors.text}`}>Click to view and edit</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module={getModuleType(selectedMeeting.organization_type)}
          meeting={selectedMeeting}
          contactName={selectedMeeting.contact_name}
          contactId={selectedMeeting.contact_id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            selectedMeeting.organization_name && { label: 'Organization', value: selectedMeeting.organization_name },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}
    </div>
  );
};

export default AllMeetingNotesPage;