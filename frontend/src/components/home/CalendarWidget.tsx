import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface UpcomingMeeting {
  id: string;
  contactName: string;
  organizationName: string;
  date: string;
  module: 'liquidity' | 'sponsors' | 'counsel' | 'agents';
}

interface CalendarWidgetProps {
  meetings: UpcomingMeeting[];
  loading?: boolean;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ meetings, loading = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDateColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'text-red-600';
    if (daysUntil === 0) return 'text-orange-600';
    if (daysUntil <= 7) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getModuleBadge = (module: string) => {
    const badges = {
      liquidity: { bg: 'bg-green-100', text: 'text-green-700', label: 'Capital Partner' },
      sponsors: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Sponsor' },
      counsel: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Legal Advisor' },
      agents: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Agent' }
    };
    return badges[module as keyof typeof badges] || badges.liquidity;
  };

  if (loading) {
    return (
      <div className="card bg-white border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
        <Link to="/liquidity/calendar" className="text-sm text-slate-600 hover:text-slate-800">
          View Calendar →
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="mt-2 text-sm text-gray-500">No upcoming meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {meetings.slice(0, 8).map((meeting) => {
            const badge = getModuleBadge(meeting.module);
            return (
              <Link
                key={`${meeting.module}-${meeting.id}`}
                to={
                  meeting.module === 'liquidity'
                    ? `/liquidity/contacts/${meeting.id}`
                    : meeting.module === 'sponsors'
                    ? `/sponsors/contacts/${meeting.id}`
                    : meeting.module === 'counsel'
                    ? `/counsel/contacts/${meeting.id}`
                    : `/agents/contacts/${meeting.id}`
                }
                className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900 text-sm">{meeting.contactName}</p>
                  <p className={`text-xs font-semibold ${getDateColor(meeting.date)}`}>
                    {formatDate(meeting.date)}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mb-2">{meeting.organizationName}</p>
                <span className={`inline-block text-xs px-2 py-1 rounded ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {meetings.length > 8 && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <Link
            to="/liquidity/calendar"
            className="text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            View {meetings.length - 8} more meetings →
          </Link>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
