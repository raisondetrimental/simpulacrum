/**
 * Sponsors Overview Page - Landing page for sponsors/corporates module
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SponsorReminders from '../../components/features/sponsors/SponsorReminders';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { SponsorContact, MeetingHistoryEntry, ApiResponse } from '../../types/sponsors';
import { apiGet } from '../../services/api';
import { updateSponsorMeetingNote, deleteSponsorMeetingNote } from '../../services/sponsorsService';

const SponsorsOverview: React.FC = () => {
  const [contacts, setContacts] = useState<SponsorContact[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<{ meeting: MeetingHistoryEntry; contact: SponsorContact } | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const result = await apiGet<SponsorContact[]>('/api/sponsor-contacts');
      if (result.success && result.data) {
        setContacts(result.data);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!selectedMeeting) return;
    await updateSponsorMeetingNote(selectedMeeting.contact.id, meetingId, data);
    await fetchContacts();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!selectedMeeting) return;
    await deleteSponsorMeetingNote(selectedMeeting.contact.id, meetingId);
    await fetchContacts();
    setSelectedMeeting(null);
  };

  const handleMeetingClick = (meeting: MeetingHistoryEntry, contact: SponsorContact) => {
    setSelectedMeeting({ meeting, contact });
  };

  // Get last 5 meetings across all contacts
  const recentMeetings = (() => {
    const allMeetings: Array<{ meeting: MeetingHistoryEntry; contact: SponsorContact }> = [];
    contacts.forEach(contact => {
      if (contact.meeting_history && contact.meeting_history.length > 0) {
        contact.meeting_history.forEach(meeting => {
          allMeetings.push({ meeting, contact });
        });
      }
    });
    allMeetings.sort((a, b) =>
      new Date(b.meeting.date).getTime() - new Date(a.meeting.date).getTime()
    );
    return allMeetings.slice(0, 5);
  })();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Sponsors</h1>
        <p className="text-gray-600 mt-1">Manage corporate relationships and infrastructure projects</p>
      </div>

      {/* Contact Reminders Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Meetings
        </h2>
        <SponsorReminders />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Add Corporate */}
        <Link
          to="/sponsors/corporates?add=true"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-2 border-blue-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Add Corporate</h3>
            <p className="text-sm text-gray-600 mt-1">Create new corporate</p>
          </div>
        </Link>

        {/* Meeting Notes - Quick Access */}
        <Link
          to="/sponsors/meeting"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-orange-50 border-2 border-orange-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-orange-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Meeting Notes</h3>
            <p className="text-sm text-gray-600 mt-1">Record meetings & update contacts</p>
          </div>
        </Link>

        {/* Corporates - Main Interface */}
        <Link
          to="/sponsors/corporates"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-2 border-green-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Corporates</h3>
            <p className="text-sm text-gray-600 mt-1">Browse corporates & contacts</p>
          </div>
        </Link>

        {/* Table View */}
        <Link
          to="/sponsors/corporates-table"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-2 border-green-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Table View</h3>
            <p className="text-sm text-gray-600 mt-1">Filter by infrastructure & region</p>
          </div>
        </Link>
      </div>

      {/* Recent Meeting Notes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Meeting Notes (Last 5)
        </h2>
        {recentMeetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No meeting notes yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMeetings.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleMeetingClick(item.meeting, item.contact)}
                className="w-full text-left border border-gray-200 rounded-md p-4 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(item.meeting.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs md:text-sm text-orange-600 font-medium">
                      {item.contact.name} ({item.contact.role})
                    </span>
                  </div>
                  {item.meeting.next_follow_up && (
                    <span className="text-xs text-orange-600">
                      Follow-up: {new Date(item.meeting.next_follow_up).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {item.meeting.participants && (
                  <p className="text-xs text-gray-600 mb-1">
                    Participants: {item.meeting.participants}
                  </p>
                )}
                {item.meeting.assigned_to && item.meeting.assigned_to.length > 0 && (
                  <p className="text-xs text-blue-600 mb-1">
                    Assigned: {item.meeting.assigned_to.map(u => u.full_name).join(', ')}
                  </p>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-2">
                  {item.meeting.notes}
                </p>
                <p className="mt-2 text-xs font-semibold text-orange-600">Open full details</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="sponsor"
          meeting={selectedMeeting.meeting}
          contactName={selectedMeeting.contact.name}
          contactRole={selectedMeeting.contact.role}
          contactId={selectedMeeting.contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            selectedMeeting.contact.email && { label: 'Email', value: selectedMeeting.contact.email },
            selectedMeeting.contact.phone && { label: 'Phone', value: selectedMeeting.contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}
    </div>
  );
};

export default SponsorsOverview;
