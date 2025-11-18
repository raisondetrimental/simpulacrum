import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface UpcomingMeeting {
  id: string;
  contactName: string;
  organizationName: string;
  date: string;
  module: 'liquidity' | 'sponsors' | 'counsel' | 'agents';
}

interface MonthlyCalendarWidgetProps {
  meetings: UpcomingMeeting[];
  loading?: boolean;
}

const MonthlyCalendarWidget: React.FC<MonthlyCalendarWidgetProps> = ({ meetings, loading = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getMeetingsForDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const meetingDateStr = `${meetingDate.getFullYear()}-${String(meetingDate.getMonth() + 1).padStart(2, '0')}-${String(meetingDate.getDate()).padStart(2, '0')}`;
      return meetingDateStr === dateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayMeetings = getMeetingsForDate(day);
      const isCurrentDay = isToday(day);
      const hasMeetings = dayMeetings.length > 0;

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center text-sm relative ${
            isCurrentDay
              ? 'bg-blue-600 text-white rounded-full font-bold'
              : 'text-gray-700 hover:bg-gray-100 rounded-lg'
          }`}
        >
          <span className="z-10">{day}</span>
          {hasMeetings && !isCurrentDay && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            </div>
          )}
          {hasMeetings && isCurrentDay && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="card bg-white border-gray-200 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white border-gray-200 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        <Link to="/liquidity/calendar" className="text-sm text-slate-600 hover:text-slate-800">
          View Full Calendar →
        </Link>
      </div>

      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="text-base font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>Has meetings</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarWidget;
