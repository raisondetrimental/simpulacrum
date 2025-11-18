import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MarketIntelSidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActiveRoute = (path: string) => location.pathname === path;

  const marketPages = [
    {
      name: 'Markets Overview',
      path: '/dashboard/markets',
      description: 'Global markets dashboard and analytics'
    },
    {
      name: 'FX Markets',
      path: '/dashboard/fx',
      description: 'Currency exchange rates and trends'
    },
    {
      name: 'Sovereign Yields',
      path: '/dashboard/sovereign',
      description: 'Compare sovereign bond yields across countries'
    },
    {
      name: 'Global Corporate Bonds',
      path: '/dashboard/corporate-yields',
      description: 'International corporate bond yields'
    },
    {
      name: 'US Corporate Bonds',
      path: '/dashboard/corporate',
      description: 'US corporate bond yields and spreads'
    },
    {
      name: 'Policy Rates',
      path: '/dashboard/central-banks',
      description: 'Central bank policy rates worldwide'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Related Markets
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className={`${isCollapsed ? 'hidden lg:block' : 'block'}`}>
        <div className="p-4 space-y-2">
          {marketPages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className={`block p-3 rounded-lg transition-colors ${
                isActiveRoute(page.path)
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm font-medium ${
                isActiveRoute(page.path) ? 'text-blue-700' : 'text-blue-600 hover:text-blue-800'
              }`}>
                {page.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {page.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketIntelSidebar;
