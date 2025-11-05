/**
 * CRM All - Meeting History Page
 *
 * Consolidated view of all meeting history across all CRM modules
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllContacts } from '../../services/crmService';
import { UnifiedContact, OrganizationTypeFilter as FilterType, MeetingHistoryEntry } from '../../types/crm';
import OrganizationTypeBadge from '../../components/features/crm/OrganizationTypeBadge';
import OrganizationTypeFilter from '../../components/features/crm/OrganizationTypeFilter';

interface MeetingWithContext extends MeetingHistoryEntry {
  contact_id: string;
  contact_name: string;
  organization_id: string;
  organization_name?: string;
  organization_type: 'capital_partner' | 'sponsor' | 'counsel' | 'agent';
}

const AllMeetingHistoryPage: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingWithContext[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'older'>('all');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* In Progress Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-yellow-700 italic">In Progress</p>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Meeting History</h1>
            <p className="text-gray-600 mt-1">
              {filteredMeetings.length} of {meetings.length} meetings
            </p>
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
        <div className="space-y-4">
          {filteredMeetings.map((meeting, index) => (
            <div key={`${meeting.contact_id}-${meeting.date}-${index}`} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                {/* Meeting Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(meeting.date)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({getRelativeTime(meeting.date)})
                      </span>
                      <OrganizationTypeBadge type={meeting.organization_type} size="sm" />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <Link
                        to={getContactLink(meeting)}
                        className="flex items-center hover:text-primary-600 font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {meeting.contact_name}
                      </Link>
                      {meeting.organization_name && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {meeting.organization_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meeting Notes */}
                <div className="prose prose-sm max-w-none mb-4">
                  <div className="text-gray-700 whitespace-pre-wrap">{meeting.notes}</div>
                </div>

                {/* Participants */}
                {meeting.participants && (
                  <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <span className="font-medium">Participants:</span> {meeting.participants}
                    </div>
                  </div>
                )}

                {/* Next Follow-up */}
                {meeting.next_follow_up && (
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-blue-700">
                      <span className="font-medium">Next follow-up:</span> {formatDate(meeting.next_follow_up)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer - Link to Contact */}
              <div className="bg-gray-50 px-6 py-3">
                <Link
                  to={getContactLink(meeting)}
                  className="text-sm text-primary-600 hover:text-primary-900 font-medium flex items-center"
                >
                  View contact details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMeetingHistoryPage;
