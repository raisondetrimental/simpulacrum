import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../../types/dashboard';
import ModuleCard from '../../components/ui/ModuleCard';
import { API_BASE_URL } from '../../config';

interface NewHomePageProps {
  data: DashboardData;
}

interface CRMStats {
  capitalPartnersCount: number;
  corporatesCount: number;
  legalAdvisorsCount: number;
  upcomingMeetingsCount: number;
  contactsCount: number;
  dealsCount: number;
}

interface UpcomingMeeting {
  id: string;
  contactName: string;
  organizationName: string;
  date: string;
  module: 'liquidity' | 'sponsors' | 'counsel';
}

const NewHomePage: React.FC<NewHomePageProps> = ({ data }) => {
  const [crmStats, setCRMStats] = useState<CRMStats>({
    capitalPartnersCount: 0,
    corporatesCount: 0,
    legalAdvisorsCount: 0,
    upcomingMeetingsCount: 0,
    contactsCount: 0,
    dealsCount: 0
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      // Fetch all CRM data in parallel with credentials for authentication
      const [cpResponse, corpResponse, laResponse, contactsResponse, sponsorContactsResponse, counselContactsResponse, dealsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/capital-partners`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/corporates`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/legal-advisors`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/contacts-new`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/sponsor-contacts`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/counsel-contacts`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/deals`, { credentials: 'include' })
      ]);

      const cpData = await cpResponse.json();
      const corpData = await corpResponse.json();
      const laData = await laResponse.json();
      const contactsData = await contactsResponse.json();
      const sponsorContactsData = await sponsorContactsResponse.json();
      const counselContactsData = await counselContactsResponse.json();
      const dealsData = await dealsResponse.json();

      const capitalPartnersCount = cpData.success ? cpData.data.length : 0;
      const corporatesCount = corpData.success ? corpData.data.length : 0;
      const legalAdvisorsCount = laData.success ? laData.data.length : 0;
      const dealsCount = dealsData.success ? dealsData.data.length : 0;

      const liquidityContacts = contactsData.success ? contactsData.data : [];
      const sponsorContacts = sponsorContactsData.success ? sponsorContactsData.data : [];
      const counselContacts = counselContactsData.success ? counselContactsData.data : [];

      const totalContacts = liquidityContacts.length + sponsorContacts.length + counselContacts.length;

      // Get upcoming meetings from all three modules
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingFromLiquidity = liquidityContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.team_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'liquidity' as const
        }));

      const upcomingFromSponsors = sponsorContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.corporate_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'sponsors' as const
        }));

      const upcomingFromCounsel = counselContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.legal_advisor_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'counsel' as const
        }));

      const allUpcoming = [...upcomingFromLiquidity, ...upcomingFromSponsors, ...upcomingFromCounsel]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setCRMStats({
        capitalPartnersCount,
        corporatesCount,
        legalAdvisorsCount,
        upcomingMeetingsCount: allUpcoming.length,
        contactsCount: totalContacts,
        dealsCount
      });

      setUpcomingMeetings(allUpcoming);
    } catch (error) {
      console.error('Failed to fetch CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Meridian Universal Intelligence Platform
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Real-Time Market Data • CRM & Deal Management • Infrastructure Analytics • CSV Export Tools
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {loading ? '...' : crmStats.capitalPartnersCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Capital Partners</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {loading ? '...' : crmStats.corporatesCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Corporates</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {loading ? '...' : crmStats.legalAdvisorsCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Legal Advisors</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {loading ? '...' : crmStats.contactsCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Contacts</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {loading ? '...' : crmStats.dealsCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active Deals</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {loading ? '...' : crmStats.upcomingMeetingsCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Upcoming Meetings</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="card bg-gray-50 border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            to="/liquidity/calendar"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-slate-400 hover:shadow-md transition-all"
          >
            <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">View Calendar</span>
          </Link>

          <Link
            to="/deals/new"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-slate-400 hover:shadow-md transition-all"
          >
            <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">New Deal</span>
          </Link>

          <Link
            to="/dashboard/markets"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-slate-400 hover:shadow-md transition-all"
          >
            <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Market Data</span>
          </Link>

          <Link
            to="/dashboard/infra-gaps"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-slate-400 hover:shadow-md transition-all"
          >
            <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Dashboards</span>
          </Link>
        </div>
      </div>

      {/* At-a-Glance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar & Upcoming Meetings */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Calendar & Upcoming Meetings</h2>
            <Link to="/liquidity/calendar" className="text-sm text-slate-600 hover:text-slate-800">
              View Full →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading calendar...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mini Calendar Grid */}
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                  {(() => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    const startPadding = firstDay.getDay();
                    const days = [];

                    const monthMeetings = upcomingMeetings.filter(m => {
                      const meetingDate = new Date(m.date);
                      return meetingDate.getMonth() === today.getMonth() &&
                             meetingDate.getFullYear() === today.getFullYear();
                    });

                    for (let i = 0; i < startPadding; i++) {
                      days.push(<div key={`pad-${i}`} className="aspect-square"></div>);
                    }

                    for (let day = 1; day <= lastDay.getDate(); day++) {
                      const date = new Date(today.getFullYear(), today.getMonth(), day);
                      const isToday = day === today.getDate();
                      const hasMeeting = monthMeetings.some(m => {
                        const meetingDate = new Date(m.date);
                        return meetingDate.getDate() === day;
                      });

                      days.push(
                        <div
                          key={day}
                          className={`aspect-square flex items-center justify-center text-xs rounded ${
                            isToday
                              ? 'bg-slate-700 text-white font-bold'
                              : hasMeeting
                              ? 'bg-slate-200 text-slate-900 font-semibold'
                              : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    }

                    return days;
                  })()}
                </div>
                <p className="text-xs text-gray-500 text-center mb-4">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Upcoming Meetings List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Upcoming Meetings {upcomingMeetings.length > 0 && `(${upcomingMeetings.length})`}
                </h3>
                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {upcomingMeetings.map((meeting) => (
                      <Link
                        key={`${meeting.module}-${meeting.id}`}
                        to={
                          meeting.module === 'liquidity'
                            ? `/liquidity/contacts/${meeting.id}`
                            : meeting.module === 'sponsors'
                            ? `/sponsors/contacts/${meeting.id}`
                            : `/counsel/contacts/${meeting.id}`
                        }
                        className="block p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{meeting.contactName}</p>
                            <p className="text-xs text-gray-600">{meeting.organizationName}</p>
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                              meeting.module === 'liquidity'
                                ? 'bg-slate-100 text-slate-700'
                                : meeting.module === 'sponsors'
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}>
                              {meeting.module === 'liquidity' ? 'Capital Partner' : meeting.module === 'sponsors' ? 'Project Sponsor' : 'Legal Advisor'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-semibold ${getDateColor(meeting.date)}`}>
                              {formatDate(meeting.date)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No upcoming meetings scheduled</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Market Snapshot */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Market Snapshot</h2>
            <Link to="/dashboard/markets" className="text-sm text-slate-600 hover:text-slate-800">
              Full Data →
            </Link>
          </div>

          <div className="space-y-4">
            {/* Key US Treasuries */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">US Treasuries</h3>
              <div className="grid grid-cols-4 gap-2">
                {['2Y', '5Y', '10Y', '30Y'].map(maturity => {
                  const yieldValue = data.sections.sovereign_yields.domestic_currency[maturity]?.['USA'];
                  return (
                    <div key={maturity} className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">{maturity}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {yieldValue ? `${yieldValue.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Corporate Spreads */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">US Corporate Spreads</h3>
              <div className="grid grid-cols-3 gap-2">
                {['AAA', 'A', 'BBB'].map(rating => {
                  const spreadValue = data.sections.corporate_yields[rating]?.['USA'];
                  return (
                    <div key={rating} className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">{rating}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {spreadValue ? `${spreadValue.toFixed(0)}bp` : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key FX Rates */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Major FX Rates</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.sections.fx_rates).slice(0, 4).map(([currency, currencyData]) => (
                  <div key={currency} className="bg-gray-50 rounded p-2 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">{currency}/USD</p>
                        <p className="text-sm font-bold text-gray-900">
                          {currencyData.rate ? currencyData.rate.toFixed(3) : 'N/A'}
                        </p>
                      </div>
                      {currencyData.changes['1D'] && (
                        <p className={`text-xs font-semibold ${
                          currencyData.changes['1D'] > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {currencyData.changes['1D'] > 0 ? '+' : ''}
                          {typeof currencyData.changes['1D'] === 'number'
                            ? `${(currencyData.changes['1D'] * 100).toFixed(1)}%`
                            : currencyData.changes['1D']}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Central Bank Rates */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Policy Rates</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(data.sections.central_bank_rates).slice(0, 4).map(([country, rateData]) => (
                  <div key={country} className="bg-gray-50 rounded p-2 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">{country}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {rateData?.rate !== null && rateData?.rate !== undefined ? `${rateData.rate.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Capabilities Banner */}
      <div className="card bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">CSV Export</h3>
              <p className="text-sm text-gray-600">Export all CRM data, deals, and contacts to CSV with one click</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Unified Calendar</h3>
              <p className="text-sm text-gray-600">Track all meetings across Liquidity, Sponsors, and Counsel modules</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Real-Time Data</h3>
              <p className="text-sm text-gray-600">Live market data, sovereign yields, FX rates, and credit ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Markets */}
          <ModuleCard
            title="Markets"
            description="Real-time financial market data and historical analysis"
            color="slate"
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            subLinks={[
              { name: 'Markets Overview', path: '/dashboard/markets' },
              { name: 'Sovereign Yields', path: '/dashboard/sovereign' },
              { name: 'Corporate Bonds', path: '/dashboard/corporate' },
              { name: 'FX Markets', path: '/dashboard/fx' },
              { name: 'Policy Rates', path: '/dashboard/central-banks' },
              { name: 'Credit Ratings', path: '/dashboard/ratings' },
              { name: 'USA Historical Yields', path: '/dashboard/usa-historical-yields' }
            ]}
            preview={
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.metadata?.last_updated
                    ? new Date(data.metadata.last_updated).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>
            }
          />

          {/* Country Reports */}
          <ModuleCard
            title="Country Reports"
            description="Comprehensive country-specific analysis and data"
            color="emerald"
            icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            subLinks={[
              { name: 'Armenia', path: '/dashboard/armenia' },
              { name: 'Mongolia', path: '/dashboard/mongolia' },
              { name: 'Türkiye', path: '/dashboard/turkiye' },
              { name: 'Uzbekistan', path: '/dashboard/uzbekistan' },
              { name: 'Vietnam', path: '/dashboard/vietnam' }
            ]}
          />

          {/* Dashboards */}
          <ModuleCard
            title="Dashboards"
            description="Infrastructure gap analysis and project tracking"
            color="stone"
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            subLinks={[
              { name: 'Infra Gaps Overview', path: '/dashboard/infra-gaps' },
              { name: 'Transit Friction', path: '/dashboard/transit-friction' },
              { name: 'Internet Coverage', path: '/dashboard/internet-coverage' }
            ]}
          />

          {/* Deals Management */}
          <ModuleCard
            title="Deals Management"
            description="Deal pipeline tracking with participant management and CSV export"
            color="blue"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            subLinks={[
              { name: 'All Deals', path: '/deals' },
              { name: 'New Deal', path: '/deals/new' }
            ]}
            preview={
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">{crmStats.dealsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active Deals</p>
              </div>
            }
          />

          {/* CRM - Liquidity */}
          <ModuleCard
            title="CRM - Liquidity"
            description="Capital partner relationship management with CSV export"
            color="zinc"
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            subLinks={[
              { name: 'Overview', path: '/liquidity' },
              { name: 'Capital Partners', path: '/liquidity/capital-partners' },
              { name: 'Teams', path: '/liquidity/teams' },
              { name: 'Contacts', path: '/liquidity/contacts' },
              { name: 'Table View', path: '/liquidity/capital-partners-table' },
              { name: 'Meeting Notes', path: '/liquidity/meeting' }
            ]}
            preview={
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-700">{crmStats.capitalPartnersCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active Partners</p>
              </div>
            }
          />

          {/* CRM - Sponsors */}
          <ModuleCard
            title="CRM - Sponsors"
            description="Corporate sponsor CRM with CSV export capabilities"
            color="neutral"
            icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            subLinks={[
              { name: 'Overview', path: '/sponsors' },
              { name: 'Corporates', path: '/sponsors/corporates' },
              { name: 'Contacts', path: '/sponsors/contacts' },
              { name: 'Table View', path: '/sponsors/corporates-table' },
              { name: 'Meeting Notes', path: '/sponsors/meeting' }
            ]}
            preview={
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-700">{crmStats.corporatesCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active Corporates</p>
              </div>
            }
          />

          {/* CRM - Counsel */}
          <ModuleCard
            title="CRM - Counsel"
            description="Legal advisor relationship management with CSV export"
            color="gray"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            subLinks={[
              { name: 'Overview', path: '/counsel' },
              { name: 'Legal Advisors', path: '/counsel/legal-advisors' },
              { name: 'Contacts', path: '/counsel/contacts' },
              { name: 'Table View', path: '/counsel/legal-advisors-table' },
              { name: 'Meeting Notes', path: '/counsel/meeting' }
            ]}
            preview={
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-700">{crmStats.legalAdvisorsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Legal Advisors</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-center space-x-6 pb-4">
        <Link to="/meridian" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
          About Meridian
        </Link>
        <span className="text-gray-300">•</span>
        <Link to="/the-firm" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
          Firm Philosophy
        </Link>
        <span className="text-gray-300">•</span>
        <Link to="/this-website" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
          Documentation
        </Link>
      </div>
    </div>
  );
};

export default NewHomePage;
