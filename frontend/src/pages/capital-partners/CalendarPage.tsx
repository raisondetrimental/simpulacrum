/**
 * Calendar Page - Visualize contact follow-up reminders in calendar view
 * Includes Liquidity, Sponsor, Counsel, and Agent contacts
 * Now with click-to-create, drag-and-drop, and event details modal
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent, View, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Contact, ApiResponse } from '../../types/liquidity';
import { SponsorContact, ApiResponse as SponsorApiResponse } from '../../types/sponsors';
import { CounselContact, ApiResponse as CounselApiResponse } from '../../types/counsel';
import { AgentContact, ApiResponse as AgentApiResponse } from '../../types/agents';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import QuickMeetingModal from '../../components/features/calendar/QuickMeetingModal';
import EventDetailsModal from '../../components/features/calendar/EventDetailsModal';

interface ReminderData {
  contact: Contact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

interface SponsorReminderData {
  contact: SponsorContact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

interface MeetingEvent {
  contact: Contact;
  meeting_id: string;
  meeting_date: string;
  notes: string;
  participants: string;
  assigned_to?: Array<{
    user_id: string;
    username: string;
    full_name: string;
  }>;
}

interface SponsorMeetingEvent {
  contact: SponsorContact;
  meeting_id: string;
  meeting_date: string;
  notes: string;
  participants: string;
  assigned_to?: Array<{
    user_id: string;
    username: string;
    full_name: string;
  }>;
}

interface CounselReminderData {
  contact: CounselContact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

interface CounselMeetingEvent {
  contact: CounselContact;
  meeting_id: string;
  meeting_date: string;
  notes: string;
  participants: string;
  assigned_to?: Array<{
    user_id: string;
    username: string;
    full_name: string;
  }>;
}

interface AgentReminderData {
  contact: AgentContact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

interface AgentMeetingEvent {
  contact: AgentContact;
  meeting_id: string;
  meeting_date: string;
  notes: string;
  participants: string;
  assigned_to?: Array<{
    user_id: string;
    username: string;
    full_name: string;
  }>;
}

interface CalendarEvent extends BigCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ReminderData | MeetingEvent | SponsorReminderData | SponsorMeetingEvent | CounselReminderData | CounselMeetingEvent | AgentReminderData | AgentMeetingEvent;
  eventType: 'reminder' | 'meeting' | 'sponsor-reminder' | 'sponsor-meeting' | 'counsel-reminder' | 'counsel-meeting' | 'agent-reminder' | 'agent-meeting';
}

// Configure date-fns localizer
const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Create drag-and-drop calendar
const DragAndDropCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sponsorContacts, setSponsorContacts] = useState<SponsorContact[]>([]);
  const [counselContacts, setCounselContacts] = useState<CounselContact[]>([]);
  const [agentContacts, setAgentContacts] = useState<AgentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [showOnlyMyMeetings, setShowOnlyMyMeetings] = useState(false);

  // Modal states
  const [showQuickMeetingModal, setShowQuickMeetingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch liquidity contacts/reminders, sponsor contacts, counsel contacts, and agent contacts
      // CRITICAL: Added credentials: 'include' to all fetch calls
      const [remindersRes, contactsRes, sponsorContactsRes, counselContactsRes, agentContactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/meeting-notes/reminders`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/contacts-new`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/sponsor-contacts`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/counsel-contacts`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/agent-contacts`, { credentials: 'include' })
      ]);

      const remindersResult: ApiResponse<ReminderData[]> = await remindersRes.json();
      const contactsResult: ApiResponse<Contact[]> = await contactsRes.json();
      const sponsorContactsResult: SponsorApiResponse<SponsorContact[]> = await sponsorContactsRes.json();
      const counselContactsResult: CounselApiResponse<CounselContact[]> = await counselContactsRes.json();
      const agentContactsResult: AgentApiResponse<AgentContact[]> = await agentContactsRes.json();

      if (remindersResult.success && remindersResult.data) {
        setReminders(remindersResult.data);
      }

      if (contactsResult.success && contactsResult.data) {
        setContacts(contactsResult.data);
      }

      if (sponsorContactsResult.success && sponsorContactsResult.data) {
        setSponsorContacts(sponsorContactsResult.data);
      }

      if (counselContactsResult.success && counselContactsResult.data) {
        setCounselContacts(counselContactsResult.data);
      }

      if (agentContactsResult.success && agentContactsResult.data) {
        setAgentContacts(agentContactsResult.data);
      }

      setError(null);
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // Transform reminders and meetings into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // Add liquidity follow-up reminders
    reminders.forEach((reminder) => {
      const reminderDate = new Date(reminder.reminder_date);
      allEvents.push({
        id: `reminder-${reminder.contact.id}`,
        title: `Liquidity: ${reminder.contact.name}`,
        start: reminderDate,
        end: reminderDate,
        resource: reminder,
        eventType: 'reminder',
      });
    });

    // Add liquidity past meetings from all contacts
    contacts.forEach((contact) => {
      if (contact.meeting_history && contact.meeting_history.length > 0) {
        contact.meeting_history.forEach((meeting) => {
          const meetingDate = new Date(meeting.date);
          const meetingEvent: MeetingEvent = {
            contact,
            meeting_id: meeting.id,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
            assigned_to: meeting.assigned_to,
          };
          allEvents.push({
            id: `meeting-${contact.id}-${meeting.id}`,
            title: `Liquidity Meeting: ${contact.name}`,
            start: meetingDate,
            end: meetingDate,
            resource: meetingEvent,
            eventType: 'meeting',
          });
        });
      }
    });

    // Add sponsor follow-up reminders
    sponsorContacts.forEach((contact) => {
      if (contact.next_contact_reminder) {
        const reminderDate = new Date(contact.next_contact_reminder);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const sponsorReminder: SponsorReminderData = {
          contact,
          reminder_date: contact.next_contact_reminder,
          days_until: daysUntil,
          overdue: daysUntil < 0,
        };

        allEvents.push({
          id: `sponsor-reminder-${contact.id}`,
          title: `Sponsor: ${contact.name}`,
          start: reminderDate,
          end: reminderDate,
          resource: sponsorReminder,
          eventType: 'sponsor-reminder',
        });
      }
    });

    // Add sponsor past meetings
    sponsorContacts.forEach((contact) => {
      if (contact.meeting_history && contact.meeting_history.length > 0) {
        contact.meeting_history.forEach((meeting) => {
          const meetingDate = new Date(meeting.date);
          const sponsorMeetingEvent: SponsorMeetingEvent = {
            contact,
            meeting_id: meeting.id,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
            assigned_to: meeting.assigned_to,
          };
          allEvents.push({
            id: `sponsor-meeting-${contact.id}-${meeting.id}`,
            title: `Sponsor Meeting: ${contact.name}`,
            start: meetingDate,
            end: meetingDate,
            resource: sponsorMeetingEvent,
            eventType: 'sponsor-meeting',
          });
        });
      }
    });

    // Add counsel follow-up reminders
    counselContacts.forEach((contact) => {
      if (contact.next_contact_reminder) {
        const reminderDate = new Date(contact.next_contact_reminder);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const counselReminder: CounselReminderData = {
          contact,
          reminder_date: contact.next_contact_reminder,
          days_until: daysUntil,
          overdue: daysUntil < 0,
        };

        allEvents.push({
          id: `counsel-reminder-${contact.id}`,
          title: `Counsel: ${contact.name}`,
          start: reminderDate,
          end: reminderDate,
          resource: counselReminder,
          eventType: 'counsel-reminder',
        });
      }
    });

    // Add counsel past meetings
    counselContacts.forEach((contact) => {
      if (contact.meeting_history && contact.meeting_history.length > 0) {
        contact.meeting_history.forEach((meeting) => {
          const meetingDate = new Date(meeting.date);
          const counselMeetingEvent: CounselMeetingEvent = {
            contact,
            meeting_id: meeting.id,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
            assigned_to: meeting.assigned_to,
          };
          allEvents.push({
            id: `counsel-meeting-${contact.id}-${meeting.id}`,
            title: `Counsel Meeting: ${contact.name}`,
            start: meetingDate,
            end: meetingDate,
            resource: counselMeetingEvent,
            eventType: 'counsel-meeting',
          });
        });
      }
    });

    // Add agent follow-up reminders
    agentContacts.forEach((contact) => {
      if (contact.next_contact_reminder) {
        const reminderDate = new Date(contact.next_contact_reminder);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const agentReminder: AgentReminderData = {
          contact,
          reminder_date: contact.next_contact_reminder,
          days_until: daysUntil,
          overdue: daysUntil < 0,
        };

        allEvents.push({
          id: `agent-reminder-${contact.id}`,
          title: `Agent: ${contact.name}`,
          start: reminderDate,
          end: reminderDate,
          resource: agentReminder,
          eventType: 'agent-reminder',
        });
      }
    });

    // Add agent past meetings
    agentContacts.forEach((contact) => {
      if (contact.meeting_history && contact.meeting_history.length > 0) {
        contact.meeting_history.forEach((meeting) => {
          const meetingDate = new Date(meeting.date);
          const agentMeetingEvent: AgentMeetingEvent = {
            contact,
            meeting_id: meeting.id,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
            assigned_to: meeting.assigned_to,
          };
          allEvents.push({
            id: `agent-meeting-${contact.id}-${meeting.id}`,
            title: `Agent Meeting: ${contact.name}`,
            start: meetingDate,
            end: meetingDate,
            resource: agentMeetingEvent,
            eventType: 'agent-meeting',
          });
        });
      }
    });

    // Filter events if "My Meetings" toggle is on
    if (showOnlyMyMeetings && user) {
      const filteredEvents = allEvents.filter(event => {
        // Always show reminder events (follow-ups don't have assignments)
        if (event.eventType === 'reminder' || event.eventType === 'sponsor-reminder' ||
            event.eventType === 'counsel-reminder' || event.eventType === 'agent-reminder') {
          return true;
        }

        // For meeting events, check if current user is in assigned_to array
        if (event.eventType === 'meeting' || event.eventType === 'sponsor-meeting' ||
            event.eventType === 'counsel-meeting' || event.eventType === 'agent-meeting') {
          const meetingEvent = event.resource as MeetingEvent | SponsorMeetingEvent | CounselMeetingEvent | AgentMeetingEvent;

          // If no assignments, don't show in "My Meetings" view
          if (!meetingEvent.assigned_to || meetingEvent.assigned_to.length === 0) {
            return false;
          }

          // Check if current user is in the assigned_to array
          return meetingEvent.assigned_to.some(assignee => assignee.user_id === user.id);
        }

        return false;
      });
      return filteredEvents;
    }

    return allEvents;
  }, [reminders, contacts, sponsorContacts, counselContacts, agentContacts, showOnlyMyMeetings, user]);

  // Event style getter - color code by module, with urgency for reminders
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#3b82f6'; // blue (default)
    let borderColor = '#2563eb';

    // Liquidity meetings (past events) - green
    if (event.eventType === 'meeting') {
      backgroundColor = '#10b981'; // green
      borderColor = '#059669';
    }
    // Liquidity reminders (future follow-ups) - check urgency
    else if (event.eventType === 'reminder') {
      const reminderData = event.resource as ReminderData;
      const { overdue, days_until } = reminderData;

      if (overdue) {
        backgroundColor = '#ef4444'; // red - overdue
        borderColor = '#dc2626';
      } else if (days_until <= 7) {
        backgroundColor = '#f97316'; // orange - due within 7 days
        borderColor = '#ea580c';
      } else {
        backgroundColor = '#10b981'; // green - future
        borderColor = '#059669';
      }
    }
    // Sponsor meetings (past events) - purple
    else if (event.eventType === 'sponsor-meeting') {
      backgroundColor = '#8b5cf6'; // purple
      borderColor = '#7c3aed';
    }
    // Sponsor reminders (future follow-ups) - check urgency
    else if (event.eventType === 'sponsor-reminder') {
      const sponsorReminderData = event.resource as SponsorReminderData;
      const { overdue, days_until } = sponsorReminderData;

      if (overdue) {
        backgroundColor = '#ef4444'; // red - overdue
        borderColor = '#dc2626';
      } else if (days_until <= 7) {
        backgroundColor = '#f97316'; // orange - due within 7 days
        borderColor = '#ea580c';
      } else {
        backgroundColor = '#8b5cf6'; // purple - future
        borderColor = '#7c3aed';
      }
    }
    // Counsel meetings (past events) - violet
    else if (event.eventType === 'counsel-meeting') {
      backgroundColor = '#a855f7'; // violet
      borderColor = '#9333ea';
    }
    // Counsel reminders (future follow-ups) - check urgency
    else if (event.eventType === 'counsel-reminder') {
      const counselReminderData = event.resource as CounselReminderData;
      const { overdue, days_until } = counselReminderData;

      if (overdue) {
        backgroundColor = '#ef4444'; // red - overdue
        borderColor = '#dc2626';
      } else if (days_until <= 7) {
        backgroundColor = '#f97316'; // orange - due within 7 days
        borderColor = '#ea580c';
      } else {
        backgroundColor = '#a855f7'; // violet - future
        borderColor = '#9333ea';
      }
    }
    // Agent meetings (past events) - cyan
    else if (event.eventType === 'agent-meeting') {
      backgroundColor = '#06b6d4'; // cyan
      borderColor = '#0891b2';
    }
    // Agent reminders (future follow-ups) - check urgency
    else if (event.eventType === 'agent-reminder') {
      const agentReminderData = event.resource as AgentReminderData;
      const { overdue, days_until } = agentReminderData;

      if (overdue) {
        backgroundColor = '#ef4444'; // red - overdue
        borderColor = '#dc2626';
      } else if (days_until <= 7) {
        backgroundColor = '#f97316'; // orange - due within 7 days
        borderColor = '#ea580c';
      } else {
        backgroundColor = '#06b6d4'; // cyan - future
        borderColor = '#0891b2';
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        color: 'white',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '0.875rem',
        fontWeight: '500',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    };
  }, []);

  // Handle event click - show details modal
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  }, []);

  // Handle slot select - create new meeting
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setShowQuickMeetingModal(true);
  }, []);

  // Handle event drop (drag-and-drop rescheduling)
  const handleEventDrop = useCallback(async ({ event, start }: { event: CalendarEvent; start: Date }) => {
    // Only allow rescheduling meetings, not reminders
    if (!event.eventType.includes('meeting')) {
      alert('Only meetings can be rescheduled. To change a follow-up reminder, please edit the contact.');
      return;
    }

    const meetingEvent = event.resource as MeetingEvent | SponsorMeetingEvent | CounselMeetingEvent | AgentMeetingEvent;
    const organizationType = event.eventType.includes('sponsor') ? 'sponsor' :
                             event.eventType.includes('counsel') ? 'counsel' :
                             event.eventType.includes('agent') ? 'agent' :
                             'capital_partner';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/quick-meeting/${meetingEvent.contact.id}/${meetingEvent.meeting_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            date: start.toISOString(),
            organization_type: organizationType,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        // Refresh data to show updated meeting date
        await fetchData();
      } else {
        alert(`Failed to reschedule meeting: ${result.message}`);
      }
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
      alert('Failed to reschedule meeting. Please try again.');
    }
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Handle navigate
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  // Handle meeting created successfully
  const handleMeetingCreated = useCallback(() => {
    setShowQuickMeetingModal(false);
    fetchData(); // Refresh calendar data
  }, []);

  // Navigate to contact detail page
  const handleNavigateToContact = useCallback((contactId: string, organizationType: string) => {
    if (organizationType === 'sponsor') {
      navigate(`/sponsors/contacts/${contactId}`);
    } else if (organizationType === 'counsel') {
      navigate(`/counsel/contacts/${contactId}`);
    } else if (organizationType === 'agent') {
      navigate(`/agents/contacts/${contactId}`);
    } else {
      navigate(`/liquidity/contacts/${contactId}`);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={fetchData} className="mt-2 text-sm text-red-600 hover:text-red-800">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings & Follow-ups Calendar</h1>
          <p className="text-gray-600 mt-1">
            {events.filter(e => e.eventType.includes('meeting')).length} meeting(s) • {events.filter(e => e.eventType.includes('reminder')).length} follow-up(s)
            {showOnlyMyMeetings && <span className="text-blue-600 font-medium"> (Showing: My Meetings)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOnlyMyMeetings(!showOnlyMyMeetings)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              showOnlyMyMeetings
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Meetings
          </button>
          <button
            onClick={fetchData}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Instruction Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Calendar Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Click on any date/time</strong> to create a new meeting</li>
              <li>• <strong>Click on an event</strong> to view details or navigate to contact</li>
              <li>• <strong>Drag and drop meetings</strong> to reschedule them</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Color Legend:</h3>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
            <span className="text-gray-700">Liquidity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded border-2 border-purple-600"></div>
            <span className="text-gray-700">Sponsors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-500 rounded border-2 border-violet-600"></div>
            <span className="text-gray-700">Counsel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded border-2 border-cyan-600"></div>
            <span className="text-gray-700">Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
            <span className="text-gray-700">Overdue Follow-up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-600"></div>
            <span className="text-gray-700">Due within 7 days</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200" style={{ minHeight: '600px' }}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 text-lg">No meetings or follow-ups scheduled</p>
            <p className="text-gray-400 text-sm mt-1">
              Click on any date to create a new meeting
            </p>
          </div>
        ) : (
          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            selectable
            resizable={false}
            popup
            tooltipAccessor={(event: CalendarEvent) => {
              const timeStr = format(event.start, 'h:mm a');
              if (event.eventType.includes('meeting')) {
                const meetingData = event.resource as MeetingEvent | SponsorMeetingEvent | CounselMeetingEvent | AgentMeetingEvent;
                const preview = meetingData.notes.length > 50
                  ? meetingData.notes.substring(0, 50) + '...'
                  : meetingData.notes;
                const moduleLabel = event.eventType.includes('sponsor') ? 'Sponsor' :
                                  event.eventType.includes('counsel') ? 'Counsel' :
                                  event.eventType.includes('agent') ? 'Agent' :
                                  'Liquidity';
                return `${moduleLabel}: ${meetingData.contact.name}\nTime: ${timeStr}\nMeeting notes: ${preview}\nParticipants: ${meetingData.participants || 'N/A'}\nDrag to reschedule • Click for details`;
              } else {
                const reminderData = event.resource as ReminderData | SponsorReminderData | CounselReminderData | AgentReminderData;
                const { contact, days_until, overdue } = reminderData;
                const status = overdue
                  ? `${Math.abs(days_until)} days overdue`
                  : days_until === 0
                  ? 'Today'
                  : `In ${days_until} days`;
                const moduleLabel = event.eventType.includes('sponsor') ? 'Sponsor' :
                                  event.eventType.includes('counsel') ? 'Counsel' :
                                  event.eventType.includes('agent') ? 'Agent' :
                                  'Liquidity';
                return `${moduleLabel}: ${contact.name}\nFollow-up: ${status}\nClick for details`;
              }
            }}
          />
        )}
      </div>

      {/* Quick Stats */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {events.filter((e) => e.eventType.includes('meeting')).length}
                </p>
                <p className="text-sm text-green-700">Total Meetings</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {events.filter((e) => {
                    if (!e.eventType.includes('reminder')) return false;
                    const reminderData = e.resource as ReminderData | SponsorReminderData | CounselReminderData | AgentReminderData;
                    return reminderData.overdue;
                  }).length}
                </p>
                <p className="text-sm text-red-700">Overdue</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {events.filter((e) => {
                    if (!e.eventType.includes('reminder')) return false;
                    const reminderData = e.resource as ReminderData | SponsorReminderData | CounselReminderData | AgentReminderData;
                    return !reminderData.overdue && reminderData.days_until <= 7;
                  }).length}
                </p>
                <p className="text-sm text-orange-700">Due This Week</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {events.filter((e) => {
                    if (!e.eventType.includes('reminder')) return false;
                    const reminderData = e.resource as ReminderData | SponsorReminderData | CounselReminderData | AgentReminderData;
                    return !reminderData.overdue && reminderData.days_until > 7;
                  }).length}
                </p>
                <p className="text-sm text-blue-700">Future</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Meeting Modal */}
      {showQuickMeetingModal && selectedSlot && (
        <QuickMeetingModal
          isOpen={showQuickMeetingModal}
          onClose={() => setShowQuickMeetingModal(false)}
          selectedDate={selectedSlot.start}
          allContacts={{
            liquidity: contacts,
            sponsors: sponsorContacts,
            counsel: counselContacts,
            agents: agentContacts,
          }}
          onMeetingCreated={handleMeetingCreated}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <EventDetailsModal
          isOpen={showEventDetailsModal}
          onClose={() => setShowEventDetailsModal(false)}
          event={selectedEvent}
          onNavigateToContact={handleNavigateToContact}
        />
      )}
    </div>
  );
};

export default CalendarPage;
