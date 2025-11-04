/**
 * Calendar Page - Visualize contact follow-up reminders in calendar view
 * Includes Liquidity, Sponsor, Counsel, and Agent contacts
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Contact, ApiResponse } from '../../types/liquidity';
import { SponsorContact, ApiResponse as SponsorApiResponse } from '../../types/sponsors';
import { CounselContact, ApiResponse as CounselApiResponse } from '../../types/counsel';
import { AgentContact, ApiResponse as AgentApiResponse } from '../../types/agents';
import { API_BASE_URL } from '../../config';

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
  meeting_date: string;
  notes: string;
  participants: string;
}

interface SponsorMeetingEvent {
  contact: SponsorContact;
  meeting_date: string;
  notes: string;
  participants: string;
}

interface CounselReminderData {
  contact: CounselContact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

interface CounselMeetingEvent {
  contact: CounselContact;
  meeting_date: string;
  notes: string;
  participants: string;
}

interface AgentReminderData {
  contact: AgentContact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

interface AgentMeetingEvent {
  contact: AgentContact;
  meeting_date: string;
  notes: string;
  participants: string;
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

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sponsorContacts, setSponsorContacts] = useState<SponsorContact[]>([]);
  const [counselContacts, setCounselContacts] = useState<CounselContact[]>([]);
  const [agentContacts, setAgentContacts] = useState<AgentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch liquidity contacts/reminders, sponsor contacts, counsel contacts, and agent contacts
      const [remindersRes, contactsRes, sponsorContactsRes, counselContactsRes, agentContactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/meeting-notes/reminders`),
        fetch(`${API_BASE_URL}/api/contacts-new`),
        fetch(`${API_BASE_URL}/api/sponsor-contacts`),
        fetch(`${API_BASE_URL}/api/counsel-contacts`),
        fetch(`${API_BASE_URL}/api/agent-contacts`)
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
        contact.meeting_history.forEach((meeting, index) => {
          const meetingDate = new Date(meeting.date);
          const meetingEvent: MeetingEvent = {
            contact,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
          };
          allEvents.push({
            id: `meeting-${contact.id}-${index}`,
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
        contact.meeting_history.forEach((meeting, index) => {
          const meetingDate = new Date(meeting.date);
          const sponsorMeetingEvent: SponsorMeetingEvent = {
            contact,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
          };
          allEvents.push({
            id: `sponsor-meeting-${contact.id}-${index}`,
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
        contact.meeting_history.forEach((meeting, index) => {
          const meetingDate = new Date(meeting.date);
          const counselMeetingEvent: CounselMeetingEvent = {
            contact,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
          };
          allEvents.push({
            id: `counsel-meeting-${contact.id}-${index}`,
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
        contact.meeting_history.forEach((meeting, index) => {
          const meetingDate = new Date(meeting.date);
          const agentMeetingEvent: AgentMeetingEvent = {
            contact,
            meeting_date: meeting.date,
            notes: meeting.notes,
            participants: meeting.participants,
          };
          allEvents.push({
            id: `agent-meeting-${contact.id}-${index}`,
            title: `Agent Meeting: ${contact.name}`,
            start: meetingDate,
            end: meetingDate,
            resource: agentMeetingEvent,
            eventType: 'agent-meeting',
          });
        });
      }
    });

    return allEvents;
  }, [reminders, contacts, sponsorContacts, counselContacts, agentContacts]);

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
        borderRadius: '4px',
        padding: '2px 5px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    };
  }, []);

  // Handle event click - navigate to appropriate page
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.eventType === 'sponsor-reminder' || event.eventType === 'sponsor-meeting') {
      const sponsorContact = event.resource.contact as SponsorContact;
      navigate(`/sponsors/contacts/${sponsorContact.id}`);
    } else if (event.eventType === 'counsel-reminder' || event.eventType === 'counsel-meeting') {
      const counselContact = event.resource.contact as CounselContact;
      navigate(`/counsel/contacts/${counselContact.id}`);
    } else if (event.eventType === 'agent-reminder' || event.eventType === 'agent-meeting') {
      const agentContact = event.resource.contact as AgentContact;
      navigate(`/agents/contacts/${agentContact.id}`);
    } else {
      const liquidityContact = event.resource.contact as Contact;
      navigate(`/liquidity/contacts/${liquidityContact.id}`);
    }
  }, [navigate]);

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Handle navigate
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

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
            {events.filter(e => e.eventType === 'meeting').length} past meeting(s) • {reminders.length} upcoming follow-up(s)
          </p>
        </div>
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
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
            <p className="text-gray-600 text-lg">No follow-ups scheduled</p>
            <p className="text-gray-400 text-sm mt-1">
              Create meetings and set follow-up dates to see them here
            </p>
          </div>
        ) : (
          <Calendar
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
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            popup
            tooltipAccessor={(event: CalendarEvent) => {
              if (event.eventType === 'meeting') {
                const meetingData = event.resource as MeetingEvent;
                const preview = meetingData.notes.length > 50
                  ? meetingData.notes.substring(0, 50) + '...'
                  : meetingData.notes;
                return `Liquidity: ${meetingData.contact.name} - ${meetingData.contact.role}\nMeeting notes: ${preview}\nParticipants: ${meetingData.participants || 'N/A'}\nClick to view details`;
              } else if (event.eventType === 'sponsor-meeting') {
                const meetingData = event.resource as SponsorMeetingEvent;
                const preview = meetingData.notes.length > 50
                  ? meetingData.notes.substring(0, 50) + '...'
                  : meetingData.notes;
                return `Sponsor: ${meetingData.contact.name} - ${meetingData.contact.role}\nMeeting notes: ${preview}\nParticipants: ${meetingData.participants || 'N/A'}\nClick to view details`;
              } else if (event.eventType === 'counsel-meeting') {
                const meetingData = event.resource as CounselMeetingEvent;
                const preview = meetingData.notes.length > 50
                  ? meetingData.notes.substring(0, 50) + '...'
                  : meetingData.notes;
                return `Counsel: ${meetingData.contact.name} - ${meetingData.contact.role}\nMeeting notes: ${preview}\nParticipants: ${meetingData.participants || 'N/A'}\nClick to view details`;
              } else if (event.eventType === 'agent-meeting') {
                const meetingData = event.resource as AgentMeetingEvent;
                const preview = meetingData.notes.length > 50
                  ? meetingData.notes.substring(0, 50) + '...'
                  : meetingData.notes;
                return `Agent: ${meetingData.contact.name} - ${meetingData.contact.role}\nMeeting notes: ${preview}\nParticipants: ${meetingData.participants || 'N/A'}\nClick to view details`;
              } else if (event.eventType === 'reminder') {
                const reminderData = event.resource as ReminderData;
                const { contact, days_until, overdue } = reminderData;
                const status = overdue
                  ? `${Math.abs(days_until)} days overdue`
                  : days_until === 0
                  ? 'Today'
                  : `In ${days_until} days`;
                return `Liquidity: ${contact.name} - ${contact.role}\nFollow-up: ${status}\nClick to view details`;
              } else if (event.eventType === 'sponsor-reminder') {
                const sponsorReminderData = event.resource as SponsorReminderData;
                const { contact, days_until, overdue } = sponsorReminderData;
                const status = overdue
                  ? `${Math.abs(days_until)} days overdue`
                  : days_until === 0
                  ? 'Today'
                  : `In ${days_until} days`;
                return `Sponsor: ${contact.name} - ${contact.role}\nFollow-up: ${status}\nClick to view details`;
              } else if (event.eventType === 'counsel-reminder') {
                const counselReminderData = event.resource as CounselReminderData;
                const { contact, days_until, overdue } = counselReminderData;
                const status = overdue
                  ? `${Math.abs(days_until)} days overdue`
                  : days_until === 0
                  ? 'Today'
                  : `In ${days_until} days`;
                return `Counsel: ${contact.name} - ${contact.role}\nFollow-up: ${status}\nClick to view details`;
              } else {
                const agentReminderData = event.resource as AgentReminderData;
                const { contact, days_until, overdue } = agentReminderData;
                const status = overdue
                  ? `${Math.abs(days_until)} days overdue`
                  : days_until === 0
                  ? 'Today'
                  : `In ${days_until} days`;
                return `Agent: ${contact.name} - ${contact.role}\nFollow-up: ${status}\nClick to view details`;
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
                  {events.filter((e) => e.eventType === 'meeting').length}
                </p>
                <p className="text-sm text-green-700">Past Meetings</p>
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
                  {reminders.filter((r) => r.overdue).length}
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
                  {reminders.filter((r) => !r.overdue && r.days_until <= 7).length}
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
                  {reminders.filter((r) => !r.overdue && r.days_until > 7).length}
                </p>
                <p className="text-sm text-blue-700">Future</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
