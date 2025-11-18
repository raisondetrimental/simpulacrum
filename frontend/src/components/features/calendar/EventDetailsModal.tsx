/**
 * Event Details Modal - View meeting or reminder details from calendar
 */

import React from 'react';
import { format } from 'date-fns';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any; // CalendarEvent type
  onNavigateToContact: (contactId: string, organizationType: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onNavigateToContact,
}) => {
  if (!isOpen || !event) return null;

  const isReminder = event.eventType.includes('reminder');
  const isMeeting = event.eventType.includes('meeting');

  // Check if meeting is in the future
  const isFutureMeeting = isMeeting && new Date(event.start) > new Date();

  const getModuleInfo = () => {
    if (event.eventType.includes('sponsor')) {
      return { label: 'Sponsor', color: 'bg-purple-100 text-purple-800 border-purple-300', organizationType: 'sponsor' };
    } else if (event.eventType.includes('counsel')) {
      return { label: 'Counsel', color: 'bg-violet-100 text-violet-800 border-violet-300', organizationType: 'counsel' };
    } else if (event.eventType.includes('agent')) {
      return { label: 'Agent', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', organizationType: 'agent' };
    } else {
      return { label: 'Liquidity', color: 'bg-green-100 text-green-800 border-green-300', organizationType: 'capital_partner' };
    }
  };

  const moduleInfo = getModuleInfo();
  const contact = event.resource.contact;

  const handleViewContact = () => {
    // For future meetings, navigate to the meeting page to edit the scheduled meeting
    if (isFutureMeeting && isMeeting) {
      const meetingId = (event.resource as any).meeting_id;
      const baseRoute = moduleInfo.organizationType === 'capital_partner' ? '/liquidity' :
                       moduleInfo.organizationType === 'sponsor' ? '/sponsors' :
                       moduleInfo.organizationType === 'counsel' ? '/counsel' :
                       '/agents';
      window.location.href = `${baseRoute}/meeting?contact=${contact.id}&meeting=${meetingId}`;
    } else {
      // For past meetings and reminders, go to contact detail page
      onNavigateToContact(contact.id, moduleInfo.organizationType);
    }
  };

  const getStatusBadge = () => {
    if (isReminder) {
      const { overdue, days_until } = event.resource;
      if (overdue) {
        return <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-sm font-medium">{Math.abs(days_until)} days overdue</span>;
      } else if (days_until === 0) {
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-sm font-medium">Due today</span>;
      } else if (days_until <= 7) {
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-sm font-medium">Due in {days_until} days</span>;
      } else {
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-sm font-medium">Due in {days_until} days</span>;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-sm font-semibold rounded border ${moduleInfo.color}`}>
                  {moduleInfo.label}
                </span>
                {isReminder && getStatusBadge()}
                {isFutureMeeting && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-medium">
                    Scheduled
                  </span>
                )}
                {isMeeting && !isFutureMeeting && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-xs font-medium">
                    Completed
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isReminder ? 'Follow-Up Reminder' : isFutureMeeting ? 'Scheduled Meeting' : 'Meeting Details'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {format(event.start, 'EEEE, MMMM d, yyyy')}
                {isMeeting && (
                  <span className="ml-2 font-medium text-gray-700">
                    at {format(event.start, 'h:mm a')}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Contact Information
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                </div>
                {contact.role && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">{contact.role}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-600">{contact.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Notes/Agenda (for meetings only) */}
            {isMeeting && event.resource.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {isFutureMeeting ? 'Meeting Agenda / Details' : 'Meeting Notes'}
                </h3>
                <div className={`${isFutureMeeting ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.resource.notes}</p>
                </div>
              </div>
            )}

            {/* Participants (for meetings only) */}
            {isMeeting && event.resource.participants && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Participants
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">{event.resource.participants}</p>
                </div>
              </div>
            )}

            {/* Assigned To (for meetings only) */}
            {isMeeting && event.resource.assigned_to && event.resource.assigned_to.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Assigned To
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {event.resource.assigned_to.map((assignee: any) => (
                      <span
                        key={assignee.user_id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-sm font-medium"
                      >
                        {assignee.full_name || assignee.username}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reminder Info (for reminders only) */}
            {isReminder && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">Follow-Up Reminder</h4>
                    <p className="text-sm text-yellow-800">
                      This is a reminder to follow up with <strong>{contact.name}</strong>.
                      Visit the contact page to update meeting notes and set a new follow-up date.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Future Meeting Call-to-Action */}
          {isFutureMeeting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Upcoming Meeting</h4>
                  <p className="text-sm text-blue-800">
                    This meeting is scheduled for the future. Visit the contact page to update the agenda,
                    add additional details, or complete meeting notes after the meeting takes place.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleViewContact}
              className={`px-4 py-2 ${isFutureMeeting ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFutureMeeting ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                )}
              </svg>
              {isFutureMeeting ? 'Update Meeting Details' : 'View Full Contact'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
