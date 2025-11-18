import React from 'react';
import { Link } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  badge?: string;
}

interface QuickActionsGridProps {
  upcomingCount?: number;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ upcomingCount = 0 }) => {
  const actions: QuickAction[] = [
    {
      title: 'View Calendar',
      description: 'All upcoming meetings',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      path: '/liquidity/calendar',
      color: 'from-orange-500 to-red-600',
      badge: upcomingCount > 0 ? upcomingCount.toString() : undefined
    },
    {
      title: 'See All Contacts',
      description: 'View all CRM contacts',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      path: '/crm/all/contacts',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'See All Organizations',
      description: 'View all organizations',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      path: '/crm/all/organizations',
      color: 'from-slate-500 to-gray-700'
    },
    {
      title: 'Create Deal',
      description: 'Start a new deal pipeline',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/deals/new',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Investment Matching',
      description: 'Find compatible partners',
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      path: '/investment-strategies',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Market Data',
      description: 'Live yields & spreads',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      path: '/dashboard/markets',
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  return (
    <div className="card bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Command Center</h2>
          <p className="text-sm text-gray-600 mt-1">Quick access to key platform actions</p>
        </div>
        <div className="bg-slate-700 rounded-full px-4 py-2">
          <p className="text-sm text-white font-semibold">{actions.length} Actions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="group relative bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-slate-400 hover:shadow-lg transition-all duration-300"
          >
            {/* Badge */}
            {action.badge && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                {action.badge}
              </div>
            )}

            {/* Icon with Gradient */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-slate-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>

            {/* Arrow Indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
