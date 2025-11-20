/**
 * Super Admin Home Page
 * Comprehensive dashboard for Cameron's portal
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { apiGet } from '../../services/api';

interface SystemStats {
  users: {
    total: number;
    active: number;
    admin: number;
  };
  crm: {
    organizations: number;
    contacts: number;
    reminders_due: number;
  };
  deals: {
    total: number;
    by_status: { [key: string]: number };
  };
  database: {
    size_mb: number;
    file_count: number;
  };
}

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

const SuperAdminHome: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch system stats and recent notes in parallel
      const [statsData, notesData] = await Promise.all([
        apiGet<SystemStats>('/api/admin/stats'),
        apiGet<Note[]>('/api/admin/notes')
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (notesData.success) {
        setRecentNotes(notesData.data.slice(0, 5)); // Get 5 most recent
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickAccessCards = [
    {
      title: 'My Notes',
      description: 'Personal notes and ideas',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      link: '/admin/super/notes',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'The Playbook',
      description: 'Manage deal playbook',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      link: '/admin/super/playbook',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      title: 'Countries Master',
      description: 'Manage country preferences',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/admin/super/countries',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: '/admin/super/settings',
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {getCurrentGreeting()}, {user?.full_name || 'Cameron'}
            </h1>
            <p className="text-lg text-purple-100">
              Welcome to your super admin portal
            </p>
          </div>
          <div className="hidden md:block">
            <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* System Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stat */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold">Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.users.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.users.active} active • {stats.users.admin} admins
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Organizations Stat */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold">Organizations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.crm.organizations}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.crm.contacts} contacts</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Deals Stat */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold">Deals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.deals.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Object.keys(stats.deals.by_status).length} statuses
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Database Stat */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold">Database</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.database.size_mb} MB</p>
                <p className="text-xs text-gray-500 mt-1">{stats.database.file_count} files</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow group"
            >
              <div className={`bg-gradient-to-br ${card.color} text-white p-3 rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Notes & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Notes</h2>
            <Link to="/admin/super/notes" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to="/admin/super/notes"
                  className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {note.content.substring(0, 60)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Reminders</h2>
            <Link to="/liquidity/calendar" className="text-sm text-blue-600 hover:text-blue-800">
              View calendar →
            </Link>
          </div>

          {stats && stats.crm.reminders_due > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Follow-ups due</p>
                    <p className="text-sm text-gray-500">Next 7 days</p>
                  </div>
                </div>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.crm.reminders_due}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>Portal powered by Meridian Universal Dashboard</p>
      </div>
    </div>
  );
};

export default SuperAdminHome;
