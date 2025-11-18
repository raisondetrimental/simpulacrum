import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RelatedContentSidebarProps {
  country: {
    name: string;
    slug: string;
  };
  availableData?: {
    sovereignYields?: boolean;
    fxMarkets?: boolean;
    corporateBonds?: boolean;
  };
}

const RelatedContentSidebar: React.FC<RelatedContentSidebarProps> = ({
  country,
  availableData = {
    sovereignYields: true,
    fxMarkets: true,
    corporateBonds: true,
  }
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const relatedLinks = [
    {
      category: 'Sovereign Markets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      links: [
        {
          title: 'Sovereign Yields Overview',
          path: '/dashboard/sovereign',
          description: 'Global sovereign bond yields and spreads',
          available: availableData.sovereignYields
        },
        ...(country.slug === 'turkiye' ? [{
          title: 'Turkey Sovereign Yield Curve',
          path: '/dashboard/turkiye/yield-curve',
          description: 'Turkey government bond yields across maturities',
          available: true
        }] : []),
        ...(country.slug === 'vietnam' ? [{
          title: 'Vietnam Sovereign Yield Curve',
          path: '/dashboard/vietnam/yield-curve',
          description: 'Vietnam government bond yields across maturities',
          available: true
        }] : [])
      ]
    },
    {
      category: 'FX Markets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      links: [
        {
          title: 'FX Markets Overview',
          path: '/dashboard/fx',
          description: `${country.name} currency rates and analysis`,
          available: availableData.fxMarkets
        }
      ]
    },
    {
      category: 'Corporate Markets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      links: [
        {
          title: 'Corporate Bonds',
          path: '/dashboard/corporate',
          description: 'Corporate bond yields and credit spreads',
          available: availableData.corporateBonds
        }
      ]
    },
    {
      category: 'Market Intelligence',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      links: [
        {
          title: 'Markets Overview',
          path: '/dashboard/markets',
          description: 'Global markets dashboard and analytics',
          available: true
        },
        {
          title: 'Infrastructure Gaps',
          path: '/dashboard/infra-gaps',
          description: 'Infrastructure financing opportunities',
          available: true
        },
        {
          title: 'Deals Outlook',
          path: '/dashboard/deals-outlook',
          description: 'Transaction pipeline and deal flow',
          available: true
        }
      ]
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Related Market Data
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
        <div className="p-4 space-y-6">
          {relatedLinks.map((section, idx) => (
            <div key={idx} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-blue-600">{section.icon}</span>
                {section.category}
              </div>

              {/* Links */}
              <div className="space-y-2 ml-7">
                {section.links.map((link, linkIdx) => (
                  <div key={linkIdx}>
                    {link.available ? (
                      <button
                        onClick={() => navigate(link.path)}
                        className="block w-full text-left group"
                      >
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-800 group-hover:underline">
                          {link.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {link.description}
                        </div>
                      </button>
                    ) : (
                      <div className="opacity-50 cursor-not-allowed">
                        <div className="text-sm font-medium text-gray-400">
                          {link.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Data not available
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={() => navigate('/dashboard/country-reports')}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View All Country Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelatedContentSidebar;
