/**
 * CRM All - Overview Page
 *
 * Consolidated dashboard showing statistics and quick actions across all CRM modules
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCRMStatistics } from '../../services/crmService';
import { UnifiedCRMStats } from '../../types/crm';
import UnifiedStatsCard from '../../components/features/crm/UnifiedStatsCard';

const AllOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<UnifiedCRMStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await getCRMStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error loading CRM statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">CRM Overview</h1>
        <p className="text-gray-600 mt-1">Consolidated view across all organisation types</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organisations Stats */}
        <UnifiedStatsCard
          title="Total Organisations"
          total={stats.organizations.total}
          breakdown={stats.organizations.by_type}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        {/* Contacts Stats */}
        <UnifiedStatsCard
          title="Total Contacts"
          total={stats.contacts.total}
          breakdown={stats.contacts.by_organization_type}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        {/* Meetings Stats */}
        <UnifiedStatsCard
          title="Total Meetings"
          total={stats.meetings.total_meetings}
          breakdown={stats.meetings.by_organization_type}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Starred Organisations */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Starred</p>
              <p className="text-2xl font-bold text-gray-900">{stats.organizations.starred_count}</p>
            </div>
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        {/* Overdue Reminders */}
        <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-500">
          <div>
            <p className="text-sm font-medium text-red-700">Overdue Reminders</p>
            <p className="text-2xl font-bold text-red-900">{stats.contacts.overdue_reminders}</p>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-orange-50 rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div>
            <p className="text-sm font-medium text-orange-700">Upcoming (7 days)</p>
            <p className="text-2xl font-bold text-orange-900">{stats.contacts.upcoming_reminders}</p>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="bg-blue-50 rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div>
            <p className="text-sm font-medium text-blue-700">Recent (30 days)</p>
            <p className="text-2xl font-bold text-blue-900">{stats.meetings.recent_meetings_count}</p>
          </div>
        </div>
      </div>

      {/* Relationship Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organisations by Relationship</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stats.organizations.by_relationship).map(([level, count]) => (
            <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">{level}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* View All Organisations */}
        <Link
          to="/crm/all/organizations"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-2 border-green-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-green-900">All Organisations</h3>
            <p className="text-sm text-green-700 text-center mt-1">View and manage all organisations</p>
          </div>
        </Link>

        {/* View All Contacts */}
        <Link
          to="/crm/all/contacts"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-2 border-blue-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-900">All Contacts</h3>
            <p className="text-sm text-blue-700 text-center mt-1">Browse all contacts across modules</p>
          </div>
        </Link>

        {/* View Table */}
        <Link
          to="/crm/all/table"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-purple-50 border-2 border-purple-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-purple-900">Table View</h3>
            <p className="text-sm text-purple-700 text-center mt-1">Comprehensive data table</p>
          </div>
        </Link>

        {/* View Meeting Notes */}
        <Link
          to="/crm/all/meeting-notes"
          className="card hover:shadow-lg transition-shadow cursor-pointer bg-orange-50 border-2 border-orange-200"
        >
          <div className="flex items-center justify-center flex-col py-6">
            <svg className="w-12 h-12 text-orange-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-semibold text-orange-900">Meeting Notes</h3>
            <p className="text-sm text-orange-700 text-center mt-1">View all meeting history</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AllOverviewPage;
