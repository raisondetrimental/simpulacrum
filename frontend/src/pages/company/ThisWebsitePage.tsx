import React from 'react';

const ThisWebsitePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">This Website</h1>
        <p className="mt-2 text-gray-600">
          A unified platform for infrastructure finance intelligence, combining market data, CRM capabilities, deal pipeline management, and team collaboration
        </p>
      </div>

      {/* Platform Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
        <p className="text-gray-700 mb-6">
          The Meridian Universal Dashboard is an integrated web application designed for infrastructure investment professionals working in emerging markets.
          The platform consolidates financial markets intelligence, relationship management, deal pipeline tracking, and collaborative workflows into a single,
          role-based access system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="font-semibold text-blue-900">Markets Intelligence</h3>
            </div>
            <p className="text-sm text-blue-800">
              Real-time sovereign yields, corporate bonds, FX rates, policy rates, and credit data across emerging and developed markets
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="font-semibold text-purple-900">Unified CRM System</h3>
            </div>
            <p className="text-sm text-purple-800">
              Four-module relationship management for capital partners, sponsors, legal advisors, and transaction agents with unified data architecture
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 border border-indigo-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="font-semibold text-indigo-900">Deal Pipeline</h3>
            </div>
            <p className="text-sm text-indigo-800">
              Track deals through stages with participant management, investment matching, and strategy alignment
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-2 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-green-900">Country Intelligence</h3>
            </div>
            <p className="text-sm text-green-800">
              Deep-dive analysis of priority emerging markets including Armenia, Mongolia, Türkiye, Uzbekistan, and Vietnam
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-2 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-orange-900">Collaboration Hub</h3>
            </div>
            <p className="text-sm text-orange-800">
              Unified calendar, whiteboard system for team posts, threaded discussions, and meeting notes across all CRM modules
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h3 className="font-semibold text-gray-900">Super Admin Portal</h3>
            </div>
            <p className="text-sm text-gray-800">
              System statistics, data quality tools, archive management, feature flags, and operational management tools
            </p>
          </div>
        </div>
      </div>

      {/* Core Architecture */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Architecture</h2>

        <div className="space-y-6">
          {/* Unified Data Model */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-5 rounded-r-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Unified Data Model (Key Architecture)
            </h3>
            <p className="text-sm text-purple-800 mb-4">
              The platform uses a <strong>unified data architecture</strong> where all organizations (capital partners, sponsors, legal advisors, and agents)
              are stored in a single <code className="bg-purple-200 px-2 py-1 rounded text-purple-900">organizations.json</code> file,
              differentiated by an <code className="bg-purple-200 px-2 py-1 rounded text-purple-900">organization_type</code> discriminator field.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Data Files</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">organizations.json</code> - All organizations</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">unified_contacts.json</code> - All contacts</li>
                  <li>• Discriminator field: <code className="bg-gray-100 px-1 rounded">organization_type</code></li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Organization Types</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">capital_partner</code> - Liquidity module</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">sponsor</code> - Sponsors module</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">counsel</code> - Counsel module</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">agent</code> - Agents module</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 bg-purple-100 border border-purple-300 rounded p-3">
              <p className="text-xs text-purple-900">
                <strong>Benefits:</strong> This unified approach eliminates data duplication, enables cross-module investment matching,
                simplifies data management, and provides a single source of truth for all CRM data.
              </p>
            </div>
          </div>

          {/* Session-Based Authentication */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Authentication & Authorization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Session-Based Auth</h4>
                <p className="text-xs text-gray-700">
                  Flask-Login with secure session cookies and bcrypt password hashing (not JWT-based)
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Role-Based Access</h4>
                <p className="text-xs text-gray-700">
                  Three levels: Standard users, Admins (user management), and Super Admins (full system access)
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Frontend Integration</h4>
                <p className="text-xs text-gray-700">
                  All API calls include credentials for session cookie transmission with protected routes
                </p>
              </div>
            </div>
          </div>

          {/* JSON Storage */}
          <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              JSON-Based Storage with Automatic Backups
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              All application data is stored in JSON files with automatic backup creation on every write operation.
              This approach provides simplicity, portability, and automatic versioning without database complexity.
            </p>
            <div className="bg-white rounded-lg p-4 border border-yellow-300">
              <p className="text-xs text-yellow-900">
                <strong>Backup Strategy:</strong> Every data modification creates a <code className="bg-yellow-100 px-1 rounded">.bak</code> file
                before overwriting, plus timestamped backups in <code className="bg-yellow-100 px-1 rounded">data/json/backups/</code> directory
                for data recovery and audit trails.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CRM System */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Four-Module CRM System</h2>
        <p className="text-gray-700 mb-5">
          Comprehensive relationship management across four stakeholder categories with investment criteria tracking, meeting history, and unified calendar integration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Liquidity Module */}
          <div className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900">Liquidity (Capital Partners)</h3>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Institutional investors, family offices, and capital providers seeking infrastructure investment opportunities.
            </p>
            <ul className="text-xs text-green-700 space-y-1.5">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Investment preferences (asset classes, sectors, geographies, ticket sizes)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact management with meeting notes and follow-up reminders</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Investment matching engine for sponsor alignment</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>CSV export, table views, and starred organization tracking</span>
              </li>
            </ul>
          </div>

          {/* Sponsors Module */}
          <div className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="bg-purple-500 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Sponsors (Corporates)</h3>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Project sponsors, infrastructure developers, and corporate entities seeking capital for projects.
            </p>
            <ul className="text-xs text-purple-700 space-y-1.5">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Corporate profiles with sector focus and geographic coverage</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Investment needs and project pipeline tracking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact management with sponsor-specific workflows</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Meeting notes with cascading updates to organization records</span>
              </li>
            </ul>
          </div>

          {/* Counsel Module */}
          <div className="border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="bg-violet-500 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-violet-900">Counsel (Legal Advisors)</h3>
            </div>
            <p className="text-sm text-violet-800 mb-3">
              Law firms and legal advisory practices with transaction expertise and market coverage.
            </p>
            <ul className="text-xs text-violet-700 space-y-1.5">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Legal advisor profiles with practice area specialization</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Investment preference tracking for deal type and jurisdiction</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Lawyer contact management with reminder system</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Relationship status and engagement tracking</span>
              </li>
            </ul>
          </div>

          {/* Agents Module */}
          <div className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <div className="bg-blue-500 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Agents (Transaction Agents)</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Transaction advisors, placement agents, and deal facilitators with market networks.
            </p>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Agent profiles with transaction history and expertise</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Geographic and sector coverage tracking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact management with follow-up workflows</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Meeting notes and relationship development tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Unified Features */}
        <div className="mt-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5 border-2 border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-3">Unified CRM Features Across All Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h4 className="font-medium text-purple-900 text-sm mb-1">Investment Matching</h4>
              <p className="text-xs text-purple-800">Cross-module matching based on preferences, geographies, and ticket sizes</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h4 className="font-medium text-purple-900 text-sm mb-1">Unified Calendar</h4>
              <p className="text-xs text-purple-800">All meeting reminders and follow-ups consolidated in one calendar view</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <h4 className="font-medium text-purple-900 text-sm mb-1">CSV Export</h4>
              <p className="text-xs text-purple-800">Export organizations and contacts from any module for external analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Markets Intelligence */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Markets Intelligence & Data</h2>
        <p className="text-gray-700 mb-5">
          Real-time financial markets data covering sovereign debt, corporate bonds, FX markets, and monetary policy indicators across emerging and developed economies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 rounded p-2 mr-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-blue-900">Sovereign Yields</h3>
            </div>
            <p className="text-sm text-gray-700">Government bond yields in domestic currency and USD with change tracking and historical trends</p>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 rounded p-2 mr-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-900">Corporate Bonds</h3>
            </div>
            <p className="text-sm text-gray-700">US corporate bond yields and spreads from AAA to High Yield ratings with spread analysis</p>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="bg-purple-100 rounded p-2 mr-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-purple-900">FX Markets</h3>
            </div>
            <p className="text-sm text-gray-700">Foreign exchange rates with historical data for key currency pairs including emerging market currencies</p>
          </div>

          <div className="bg-white border-2 border-orange-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="bg-orange-100 rounded p-2 mr-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-orange-900">Policy Rates</h3>
            </div>
            <p className="text-sm text-gray-700">Central bank policy rates and monetary policy indicators across major economies</p>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="bg-red-100 rounded p-2 mr-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-red-900">USA Historical Yields</h3>
            </div>
            <p className="text-sm text-gray-700">90-day historical yield curves for US Treasuries (1M to 30Y maturities) with trend analysis</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="bg-gray-100 rounded p-2 mr-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Country Reports</h3>
            </div>
            <p className="text-sm text-gray-700">Deep-dive market analysis for Armenia, Mongolia, Türkiye, Uzbekistan, and Vietnam</p>
          </div>
        </div>
      </div>

      {/* Deal Pipeline & Investment Matching */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Deal Pipeline & Investment Matching</h2>
        <p className="text-gray-700 mb-5">
          Comprehensive deal tracking system with participant management and intelligent investment matching engine to align capital partners with sponsors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">Deal Pipeline Management</h3>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track deals through stages: Prospecting, Due Diligence, Negotiation, Closing</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Link participants from all CRM modules (capital partners, sponsors, counsel, agents)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Deal statistics, stage distribution, and pipeline metrics</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>CSV export for external analysis and reporting</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-pink-900 mb-3">Investment Matching Engine</h3>
            <ul className="space-y-2 text-sm text-pink-800">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Build investment strategies with specific criteria (sectors, geographies, ticket sizes)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Match capital partners with sponsors based on preference alignment</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Country overlap analysis for geographic alignment</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ticket size range overlap to ensure financial compatibility</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Collaboration Tools */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Collaboration & Team Tools</h2>
        <p className="text-gray-700 mb-5">
          Integrated tools for team coordination, knowledge sharing, and follow-up management across all CRM activities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-5">
            <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-orange-900 mb-2">Unified Calendar</h3>
            <p className="text-sm text-orange-800">
              Consolidated view of all meeting reminders and follow-ups across all CRM modules with color-coded urgency indicators (red/orange/green).
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
            <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Whiteboard System</h3>
            <p className="text-sm text-blue-800">
              Weekly whiteboard posts and general posts with threaded replies for team collaboration, updates, and knowledge sharing.
            </p>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
            <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Meeting Notes</h3>
            <p className="text-sm text-green-800">
              Contact-level meeting history with TipTap rich text editor, next follow-up tracking, and automatic calendar integration.
            </p>
          </div>
        </div>
      </div>

      {/* Super Admin Portal */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Super Admin Portal</h2>
        <p className="text-gray-700 mb-5">
          Comprehensive system administration tools for data management, quality control, and operational oversight (super admin access required).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">System Statistics Dashboard</h3>
            <p className="text-xs text-gray-700">Real-time metrics for users, organizations, contacts, deals, and database size</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Countries Master Manager</h3>
            <p className="text-xs text-gray-700">Manage 90+ countries list for investment preferences with usage tracking</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Database Explorer</h3>
            <p className="text-xs text-gray-700">Read-only view of all JSON files with pagination and schema inspection</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Data Quality Scanner</h3>
            <p className="text-xs text-gray-700">Find orphaned contacts, invalid participants, and data integrity issues</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Archive Management</h3>
            <p className="text-xs text-gray-700">Archive and restore old records with auto-archive capabilities</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Feature Flags</h3>
            <p className="text-xs text-gray-700">Toggle system features on/off for controlled rollouts</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Bulk Operations</h3>
            <p className="text-xs text-gray-700">Bulk update, export, and import with dry-run preview and validation</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">API Playground</h3>
            <p className="text-xs text-gray-700">Test API endpoints with custom requests and response inspection</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Audit Log</h3>
            <p className="text-xs text-gray-700">View all super admin actions with filters and statistics</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Playbook Manager</h3>
            <p className="text-xs text-gray-700">Operational management tools for contacts, calendar, deals, and workstreams</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">My Notes</h3>
            <p className="text-xs text-gray-700">Personal notes manager with TipTap rich text editor</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Security Configuration</h3>
            <p className="text-xs text-gray-700">View CORS, session, auth settings, and API key management</p>
          </div>
        </div>
      </div>

      {/* Technical Stack */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Stack</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Frontend */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Frontend</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• React 18.2.0 with Hooks</li>
              <li>• TypeScript 5.0.2</li>
              <li>• Vite 4.4.5 (build tool)</li>
              <li>• Tailwind CSS 3.3.0</li>
              <li>• React Router 6.15.0</li>
              <li>• Recharts 2.8.0 (charts)</li>
              <li>• TipTap 3.9.0 (WYSIWYG)</li>
              <li>• React Big Calendar 1.19.4</li>
              <li>• Mermaid 11.12.0 (diagrams)</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900">Backend</h3>
            </div>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• Flask 3.0.0</li>
              <li>• Flask-Login 0.6.3</li>
              <li>• Flask-CORS 4.0.0</li>
              <li>• bcrypt 4.1.2</li>
              <li>• pandas 2.1.4</li>
              <li>• openpyxl 3.1.2</li>
              <li>• Gunicorn 21.2.0</li>
              <li>• ReportLab (PDFs)</li>
            </ul>
          </div>

          {/* Data & Deployment */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Data & Deploy</h3>
            </div>
            <ul className="text-sm text-purple-800 space-y-2">
              <li>• JSON file-based storage</li>
              <li>• Automatic backups (.bak)</li>
              <li>• Python ETL (openpyxl)</li>
              <li>• FX rates API integration</li>
              <li>• Session-based auth</li>
              <li>• Azure deployment ready</li>
              <li>• Windows development</li>
              <li>• Git version control</li>
            </ul>
          </div>
        </div>

        {/* Architecture Patterns */}
        <div className="mt-5 bg-gray-50 rounded-lg p-5 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-3">Architecture Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Backend</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Flask application factory pattern</li>
                <li>• Blueprint-based route organization</li>
                <li>• Service layer for business logic</li>
                <li>• Unified Data Access Layer (DAL)</li>
                <li>• Configuration by environment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Frontend</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Component-based React architecture</li>
                <li>• TypeScript for type safety</li>
                <li>• React Context for global state</li>
                <li>• Service layer for API calls</li>
                <li>• Protected routes with auth checks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-3">Meridian Universal Dashboard</h3>
          <p className="text-blue-100 mb-4">
            A comprehensive platform for infrastructure finance professionals working in emerging markets
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">React + TypeScript</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Flask + Python</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Unified CRM</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Real-Time Markets</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Investment Matching</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThisWebsitePage;
