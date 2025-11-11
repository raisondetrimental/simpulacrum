/**
 * Market Navigation Grid Component
 * Quick links to detailed market analysis pages
 */
import React from 'react';
import { Link } from 'react-router-dom';

const MarketNavigationGrid: React.FC = () => {
  const marketPages = [
    {
      name: 'USA Historical Yields',
      path: '/dashboard/usa-historical-yields',
      icon: '📈',
      description: 'Full US Treasury yield curve analysis with 90-day trends',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400'
    },
    {
      name: 'Corporate Bonds',
      path: '/dashboard/corporate',
      icon: '🏢',
      description: 'AAA to high yield credit market data and spreads',
      color: 'bg-green-50 border-green-200 hover:border-green-400'
    },
    {
      name: 'FX Markets',
      path: '/dashboard/fx',
      icon: '💱',
      description: 'Currency trends and historical exchange rates',
      color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
    },
    {
      name: 'Central Banks',
      path: '/dashboard/central-banks',
      icon: '🏦',
      description: 'Policy rates and monetary policy timeline',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400'
    },
    {
      name: 'Corporate Spreads',
      path: '/dashboard/corporate-spreads',
      icon: '📊',
      description: 'Option-adjusted spreads for global and EM credit',
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
    },
    {
      name: 'Corporate Yields',
      path: '/dashboard/corporate-yields',
      icon: '💼',
      description: 'Effective yields breakdown by region and rating',
      color: 'bg-pink-50 border-pink-200 hover:border-pink-400'
    },
    {
      name: 'Sovereign Yields',
      path: '/dashboard/sovereign',
      icon: '🌍',
      description: 'Multi-country government bond yield curves',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400'
    },
    {
      name: 'Infrastructure Gaps',
      path: '/dashboard/infra-gaps',
      icon: '🏗️',
      description: 'Infrastructure investment opportunities analysis',
      color: 'bg-gray-50 border-gray-200 hover:border-gray-400'
    }
  ];

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Market Intelligence Quick Links</h2>
        <p className="text-sm text-gray-600">Navigate to detailed analysis pages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className={`border-2 rounded-lg p-5 transition-all ${page.color} group`}
          >
            <div className="flex flex-col h-full">
              {/* Icon and Title */}
              <div className="flex items-start mb-3">
                <div className="text-3xl mr-3">{page.icon}</div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {page.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 mb-3 flex-1">
                {page.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center text-blue-600 font-medium text-xs group-hover:translate-x-1 transition-transform">
                View
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MarketNavigationGrid;
