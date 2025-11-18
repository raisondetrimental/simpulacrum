import React from 'react';
import { Link } from 'react-router-dom';

const InfraGapsOverviewPage: React.FC = () => {
  const dashboards = [
    {
      title: 'Transit Friction',
      description: 'Analyze transportation and logistics barriers across emerging markets',
      path: '/dashboard/transit-friction',
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      available: true
    },
    {
      title: 'Internet Coverage',
      description: 'Track digital infrastructure and connectivity gaps',
      path: '/dashboard/internet-coverage',
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      available: true
    },
    {
      title: 'Energy Infrastructure',
      description: 'Power generation and distribution capacity analysis',
      icon: (
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      available: false
    },
    {
      title: 'Water & Sanitation',
      description: 'Water supply and wastewater infrastructure metrics',
      icon: (
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      available: false
    },
    {
      title: 'Financial Infrastructure',
      description: 'Banking access and financial services availability',
      icon: (
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      available: false
    },
    {
      title: 'Healthcare Access',
      description: 'Medical facilities and healthcare service distribution',
      icon: (
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      available: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Infrastructure Gaps Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive analysis and tracking of infrastructure gaps across emerging markets
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard) => (
          dashboard.available ? (
            <Link
              key={dashboard.title}
              to={dashboard.path!}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
                    {dashboard.icon}
                  </div>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{dashboard.title}</h3>
                <p className="text-gray-600 text-sm flex-grow">{dashboard.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={dashboard.title}
              className="card bg-gray-50 opacity-60 cursor-not-allowed"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gray-100">
                    {dashboard.icon}
                  </div>
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">{dashboard.title}</h3>
                <p className="text-gray-500 text-sm flex-grow">{dashboard.description}</p>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Info Section */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">About Infrastructure Gaps</h4>
            <p className="text-sm text-blue-800">
              Our infrastructure gap analysis helps identify critical deficiencies in emerging market infrastructure.
              These dashboards combine data from multilateral development banks, government sources, and proprietary research
              to provide actionable insights for infrastructure investment opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfraGapsOverviewPage;