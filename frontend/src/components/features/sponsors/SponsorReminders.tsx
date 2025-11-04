/**
 * Sponsor Reminders Widget
 * Shows upcoming sponsor contact follow-ups on sponsors landing page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SponsorContact, ApiResponse } from '../../../types/sponsors';
import { API_BASE_URL } from '../../../config';

interface ReminderData {
  contact: SponsorContact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

const SponsorReminders: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sponsor-meetings/reminders`);
      const result: ApiResponse<ReminderData[]> = await response.json();

      if (result.success && result.data) {
        setReminders(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load reminders');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>No upcoming follow-ups</p>
        <p className="text-xs text-gray-400 mt-1">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const isToday = reminder.days_until === 0;
        const isOverdue = reminder.overdue;

        return (
          <Link
            key={reminder.contact.id}
            to={`/sponsors/contacts/${reminder.contact.id}`}
            className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              isOverdue
                ? 'bg-red-50 border-red-300 hover:border-red-400'
                : isToday
                ? 'bg-orange-50 border-orange-300 hover:border-orange-400'
                : 'bg-green-50 border-green-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{reminder.contact.name}</h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      isOverdue
                        ? 'bg-red-100 text-red-800'
                        : isToday
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {isOverdue
                      ? `${Math.abs(reminder.days_until)} days overdue`
                      : isToday
                      ? 'Today'
                      : `In ${reminder.days_until} days`}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{reminder.contact.role}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Follow-up: {new Date(reminder.reminder_date).toLocaleDateString()}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        );
      })}

      {reminders.length > 0 && (
        <Link
          to="/sponsors/corporates"
          className="block text-center text-sm text-green-600 hover:text-green-800 pt-2"
        >
          View all corporates →
        </Link>
      )}
    </div>
  );
};

export default SponsorReminders;
