import React from 'react';

const ThisWebsitePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">This Website</h1>
        <p className="mt-2 text-gray-600">Comprehensive financial intelligence platform integrating markets data, infrastructure analysis, CRM capabilities, and collaborative workflows</p>
      </div>

      {/* Website Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 mb-4">
            The Meridian Universal Dashboard is an integrated intelligence platform designed for infrastructure investment professionals.
            The system combines real-time financial markets data, geospatial infrastructure analysis, multi-module CRM capabilities,
            deal pipeline management, and team collaboration tools into a unified workspace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Financial Markets</h4>
              <p className="text-sm text-blue-800">
                Real-time sovereign yields, corporate bonds, FX rates, central bank policy rates, and credit ratings
                with automated Excel-based data refresh and historical trend analysis.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Infrastructure Intelligence</h4>
              <p className="text-sm text-green-800">
                Interactive geospatial mapping of transport corridors, infrastructure gaps, transit friction analysis,
                internet coverage metrics, and energy infrastructure tracking across emerging markets.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">CRM System</h4>
              <p className="text-sm text-purple-800">
                Four specialized relationship management modules: Liquidity (capital partners), Sponsors (corporates),
                Counsel (legal advisors), and Agents (transaction agents) with investment criteria tracking.
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">Deals & Investment Matching</h4>
              <p className="text-sm text-indigo-800">
                Deal pipeline management with participant tracking, investment strategy builder, and cross-CRM
                matching engine to identify compatible capital partners and sponsors.
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Collaboration Hub</h4>
              <p className="text-sm text-orange-800">
                Unified calendar with follow-up reminders across all CRM modules, whiteboard system for team posts
                and threaded discussions, and centralized contact management.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Country Deep Dives</h4>
              <p className="text-sm text-gray-800">
                Dedicated analysis pages for priority markets including Vietnam, Mongolia, Turkey, Armenia, and
                Uzbekistan with market-specific intelligence and investment frameworks.
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            Built with React, TypeScript, and Flask, the platform provides interactive visualizations, automated ETL pipelines,
            CSV export capabilities, PDF report generation, and role-based access control for investment teams,
            policy advisors, and infrastructure analysts.
          </p>
        </div>
      </div>

      {/* Core Modules */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Modules</h2>

        <div className="space-y-6">
          {/* Markets Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Markets
            </h3>
            <p className="text-gray-700 mb-3">
              Real-time financial markets data with Excel-based ETL pipeline and automated refresh capabilities:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Sovereign Yields</h4>
                <p className="text-xs text-gray-600">Government bond yields (domestic & USD) with change tracking</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Corporate Bonds</h4>
                <p className="text-xs text-gray-600">AAA to High Yield ratings with spread analysis</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">FX Rates</h4>
                <p className="text-xs text-gray-600">Currency pairs with historical data and API integration</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Central Banks</h4>
                <p className="text-xs text-gray-600">Policy rates and monetary policy indicators</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Credit Ratings</h4>
                <p className="text-xs text-gray-600">Sovereign ratings with yield comparisons</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">USA Historical</h4>
                <p className="text-xs text-gray-600">90-day yield curves (1M to 30Y maturities)</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Country Pages</h4>
                <p className="text-xs text-gray-600">Vietnam, Mongolia, Turkey, Armenia, Uzbekistan</p>
              </div>
              <div className="border border-blue-300 bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 text-sm mb-1">Tools</h4>
                <p className="text-xs text-blue-700">Excel refresh controls & PDF generation</p>
              </div>
            </div>
          </div>

          {/* Infrastructure Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Infrastructure
            </h3>
            <p className="text-gray-700 mb-3">
              Geospatial analysis and infrastructure intelligence for emerging markets:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Infrastructure Gaps</h4>
                <p className="text-xs text-gray-600">Regional infrastructure deficit analysis and investment needs</p>
              </div>
              <div className="border border-green-300 bg-green-50 rounded-lg p-3">
                <h4 className="font-medium text-green-900 text-sm mb-1">Transit Friction</h4>
                <p className="text-xs text-green-700">Interactive map of transport corridors and border efficiency</p>
              </div>
              <div className="border border-green-300 bg-green-50 rounded-lg p-3">
                <h4 className="font-medium text-green-900 text-sm mb-1">Internet Coverage</h4>
                <p className="text-xs text-green-700">Global bandwidth choropleth with digital infrastructure gaps</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Energy Metrics</h4>
                <p className="text-xs text-gray-600">Energy infrastructure and resource development tracking</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">News Feed</h4>
                <p className="text-xs text-gray-600">Curated infrastructure and emerging markets intelligence</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Deals Outlook</h4>
                <p className="text-xs text-gray-600">Infrastructure deal pipeline and investment opportunities</p>
              </div>
            </div>
          </div>

          {/* CRM System */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              CRM System (Four Modules)
            </h3>
            <p className="text-gray-700 mb-3">
              Comprehensive relationship management across four stakeholder categories with investment criteria tracking:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-medium text-green-900 mb-2">Liquidity Module (Capital Partners)</h4>
                <p className="text-sm text-green-800 mb-2">
                  Institutional investors, family offices, and capital providers with detailed investment preferences.
                </p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Investment criteria: asset classes, sectors, geographies</li>
                  <li>• Ticket size ranges (min/max/currency)</li>
                  <li>• Contact management with meeting notes and reminders</li>
                  <li>• CSV export and table view capabilities</li>
                </ul>
              </div>
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-medium text-purple-900 mb-2">Sponsors Module (Corporates)</h4>
                <p className="text-sm text-purple-800 mb-2">
                  Project sponsors, infrastructure developers, and corporate entities seeking capital.
                </p>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Corporate profiles with sector and geography focus</li>
                  <li>• Investment needs and project pipeline tracking</li>
                  <li>• Contact management with sponsor-specific workflows</li>
                  <li>• Meeting notes with cascading updates</li>
                </ul>
              </div>
              <div className="border-2 border-violet-200 rounded-lg p-4 bg-violet-50">
                <h4 className="font-medium text-violet-900 mb-2">Counsel Module (Legal Advisors)</h4>
                <p className="text-sm text-violet-800 mb-2">
                  Law firms and legal advisory practices with transaction expertise and market coverage.
                </p>
                <ul className="text-xs text-violet-700 space-y-1">
                  <li>• Legal advisor profiles with practice area specialization</li>
                  <li>• Investment preference tracking (similar to Liquidity)</li>
                  <li>• Lawyer contact management with reminder system</li>
                  <li>• Relationship status and engagement tracking</li>
                </ul>
              </div>
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">Agents Module (Transaction Agents)</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Transaction advisors, placement agents, and deal facilitators with market networks.
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Agent profiles with transaction history and expertise</li>
                  <li>• Geographic and sector coverage tracking</li>
                  <li>• Contact management with follow-up workflows</li>
                  <li>• Meeting notes and relationship development</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Deals & Investment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Deals & Investment Matching
            </h3>
            <p className="text-gray-700 mb-3">
              Deal pipeline management and intelligent cross-CRM matching engine:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Deal Pipeline</h4>
                <p className="text-xs text-gray-600">Track deals by stage, sector, geography, and transaction size</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Deal Participants</h4>
                <p className="text-xs text-gray-600">Link capital partners, sponsors, counsel, and agents to deals</p>
              </div>
              <div className="border border-indigo-300 bg-indigo-50 rounded-lg p-3">
                <h4 className="font-medium text-indigo-900 text-sm mb-1">Investment Strategies</h4>
                <p className="text-xs text-indigo-700">Build criteria sets and match compatible partners/sponsors</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Profile Generation</h4>
                <p className="text-xs text-gray-600">Automated normalization of investment preferences across modules</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Analytics</h4>
                <p className="text-xs text-gray-600">Deal statistics, stage distribution, and pipeline metrics</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">CSV Export</h4>
                <p className="text-xs text-gray-600">Export deals list for external analysis and reporting</p>
              </div>
            </div>
          </div>

          {/* Collaboration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Collaboration Tools
            </h3>
            <p className="text-gray-700 mb-3">
              Team coordination with unified calendar, whiteboard discussions, and reminder system:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="border border-orange-300 bg-orange-50 rounded-lg p-3">
                <h4 className="font-medium text-orange-900 text-sm mb-1">Unified Calendar</h4>
                <p className="text-xs text-orange-700">All CRM follow-ups in one view with color-coding and urgency indicators</p>
              </div>
              <div className="border border-orange-300 bg-orange-50 rounded-lg p-3">
                <h4 className="font-medium text-orange-900 text-sm mb-1">Whiteboard</h4>
                <p className="text-xs text-orange-700">Weekly posts with threaded replies and team collaboration</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Meeting Notes</h4>
                <p className="text-xs text-gray-600">Contact-level meeting history with next follow-up tracking</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Reminder System</h4>
                <p className="text-xs text-gray-600">Automated overdue tracking with color-coded urgency (red/orange/green)</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">WYSIWYG Editor</h4>
                <p className="text-xs text-gray-600">Rich text formatting with TipTap editor for notes and posts</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">User Profiles</h4>
                <p className="text-xs text-gray-600">Personal profile management and password changes</p>
              </div>
            </div>
          </div>

          {/* Administration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Administration & Security
            </h3>
            <p className="text-gray-700 mb-3">
              Role-based access control and system administration:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">User Management</h4>
                <p className="text-xs text-gray-600">Admin-only user creation, editing, and role assignment</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Authentication</h4>
                <p className="text-xs text-gray-600">Flask-Login with bcrypt password hashing and secure sessions</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Role-Based Access</h4>
                <p className="text-xs text-gray-600">Admin vs. Standard user roles with protected routes</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Data Backups</h4>
                <p className="text-xs text-gray-600">Automatic .bak files created on every JSON write operation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Architecture */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Architecture & ETL Pipeline</h2>

        <div className="space-y-6">
          {/* Markets Data Pipeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Markets Data Pipeline
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Source:</strong> Markets Dashboard (Macro Enabled) (version 3).xlsm
              </p>
              <p className="text-sm text-blue-800">
                <strong>ETL Process:</strong> Python-based extraction using openpyxl (read-only mode) with cell-range-specific extraction
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">Extracted Data</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Sovereign yields (rows 15-33): Domestic & USD bonds</li>
                  <li>• Corporate bonds (rows 39-44): AAA to High Yield</li>
                  <li>• FX rates (rows 50-53): Currency pairs with changes</li>
                  <li>• Central bank rates (rows 92-95): Policy rates</li>
                  <li>• Credit ratings (rows 220-241): Sovereign ratings & yields</li>
                  <li>• USA historical (rows 31-44): 90-day yield curves (1M-30Y)</li>
                </ul>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">Output Files</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <code className="bg-blue-100 px-1 rounded">storage/dashboard.json</code> - Main markets data</li>
                  <li>• <code className="bg-blue-100 px-1 rounded">storage/usa_historical_yields.json</code> - USA curves</li>
                  <li>• Served via Flask API endpoints</li>
                  <li>• Frontend fetches JSON for visualization</li>
                  <li>• Automatic refresh triggers ETL regeneration</li>
                </ul>
              </div>
            </div>
            <div className="border-l-4 border-blue-500 bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <strong>Windows-Only Features:</strong> Excel COM automation (macro execution) requires Windows environment.
                ETL extraction works cross-platform (read-only), but macro refresh is Windows-specific via win32com.
              </p>
            </div>
          </div>

          {/* CRM Data Storage */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              CRM Data Storage (JSON Databases)
            </h3>
            <p className="text-gray-700 mb-3">
              All CRM data is stored in JSON files located in <code className="bg-gray-100 px-2 py-1 rounded text-sm">backend/data/json/</code> with automatic
              backup creation on every write operation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                <h4 className="font-medium text-green-900 text-sm mb-1">Liquidity Module</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• <code>capital_partners.json</code></li>
                  <li>• <code>contacts.json</code></li>
                </ul>
              </div>
              <div className="border border-purple-200 bg-purple-50 rounded-lg p-3">
                <h4 className="font-medium text-purple-900 text-sm mb-1">Sponsors Module</h4>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• <code>corporates.json</code></li>
                  <li>• <code>sponsor_contacts.json</code></li>
                </ul>
              </div>
              <div className="border border-violet-200 bg-violet-50 rounded-lg p-3">
                <h4 className="font-medium text-violet-900 text-sm mb-1">Counsel Module</h4>
                <ul className="text-xs text-violet-700 space-y-1">
                  <li>• <code>legal_advisors.json</code></li>
                  <li>• <code>counsel_contacts.json</code></li>
                </ul>
              </div>
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 text-sm mb-1">Agents Module</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <code>agents.json</code></li>
                  <li>• <code>agent_contacts.json</code></li>
                </ul>
              </div>
              <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-3">
                <h4 className="font-medium text-indigo-900 text-sm mb-1">Deals & Investment</h4>
                <ul className="text-xs text-indigo-700 space-y-1">
                  <li>• <code>deals.json</code></li>
                  <li>• <code>deal_participants.json</code></li>
                  <li>• <code>investment_strategies.json</code></li>
                  <li>• <code>investment_profiles.json</code></li>
                </ul>
              </div>
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">System & Collaboration</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <code>users.json</code></li>
                  <li>• <code>whiteboard_posts.json</code></li>
                  <li>• <code>fx_rates.json</code></li>
                  <li>• <code>fx_rates_history.json</code></li>
                </ul>
              </div>
            </div>
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-900">
                <strong>Backup System:</strong> All write operations automatically create <code>.bak</code> files before overwriting.
                This ensures data recovery capability and audit trails for all CRM operations.
              </p>
            </div>
          </div>

          {/* Data Flow Diagram */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Data Flow Architecture</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
              <div className="space-y-3 text-sm text-gray-700 font-mono">
                <div className="flex items-center">
                  <span className="bg-blue-100 px-2 py-1 rounded">Excel Files</span>
                  <span className="mx-2">→</span>
                  <span className="bg-green-100 px-2 py-1 rounded">ETL Scripts (Python)</span>
                  <span className="mx-2">→</span>
                  <span className="bg-purple-100 px-2 py-1 rounded">JSON (storage/)</span>
                </div>
                <div className="flex items-center ml-8">
                  <span className="mr-2">↓</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-orange-100 px-2 py-1 rounded">Flask API</span>
                  <span className="mx-2">→</span>
                  <span className="bg-indigo-100 px-2 py-1 rounded">React Frontend</span>
                  <span className="mx-2">→</span>
                  <span className="bg-pink-100 px-2 py-1 rounded">User Visualizations</span>
                </div>
                <div className="flex items-center mt-4">
                  <span className="bg-violet-100 px-2 py-1 rounded">CRM Operations</span>
                  <span className="mx-2">→</span>
                  <span className="bg-green-100 px-2 py-1 rounded">JSON Databases</span>
                  <span className="mx-2">→</span>
                  <span className="bg-yellow-100 px-2 py-1 rounded">.bak Backups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Stack & Architecture</h2>

        <div className="space-y-6">
          {/* Three-Tier Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="font-semibold text-blue-900">Frontend</h3>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• React 18.2.0 with Hooks</li>
                <li>• TypeScript 5.0.2 for type safety</li>
                <li>• Vite 4.4.5 (build tool)</li>
                <li>• Tailwind CSS 3.3.0 (styling)</li>
                <li>• React Router 6.15.0 (routing)</li>
                <li>• Recharts 2.8.0 (charts)</li>
                <li>• TipTap 3.9.0 (rich text editor)</li>
                <li>• React Big Calendar 1.19.4</li>
                <li>• Mermaid 11.12.0 (diagrams)</li>
              </ul>
            </div>
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <h3 className="font-semibold text-green-900">Backend</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Flask 3.0.0 (web framework)</li>
                <li>• Flask-Login 0.6.3 (authentication)</li>
                <li>• Flask-CORS 4.0.0 (CORS)</li>
                <li>• bcrypt 4.1.2 (password hashing)</li>
                <li>• pandas 2.1.4 (data processing)</li>
                <li>• openpyxl 3.1.2 (Excel reading)</li>
                <li>• gunicorn 21.2.0 (WSGI server)</li>
                <li>• ReportLab (PDF generation)</li>
              </ul>
            </div>
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <h3 className="font-semibold text-purple-900">Data Layer</h3>
              </div>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• JSON file-based databases</li>
                <li>• Excel workbooks (markets data)</li>
                <li>• Python ETL scripts (openpyxl)</li>
                <li>• Automatic backup system (.bak)</li>
                <li>• FX rates API integration</li>
                <li>• COM automation (Windows)</li>
                <li>• Session-based auth storage</li>
              </ul>
            </div>
          </div>

          {/* Architecture Patterns */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Architecture Patterns & Design Principles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Backend Architecture</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Flask application factory pattern</li>
                  <li>• Blueprint-based route organization</li>
                  <li>• Service layer for business logic</li>
                  <li>• Configuration by environment (dev/prod/test)</li>
                  <li>• Session-based authentication with secure cookies</li>
                  <li>• CORS configured for localhost development</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Frontend Architecture</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Component-based React architecture</li>
                  <li>• TypeScript for type safety and IDE support</li>
                  <li>• React Context for global state (Auth, etc.)</li>
                  <li>• Service layer for API communication</li>
                  <li>• Protected routes with authentication checks</li>
                  <li>• Responsive mobile-first design with Tailwind</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Deployment Architecture */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Deployment Architecture</h3>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">LOCAL DEV</span>
                    Windows Environment
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Full stack: Frontend (Vite) + Backend (Flask)</li>
                    <li>• Excel COM automation available (Windows-only)</li>
                    <li>• CORS: localhost:5173, localhost:3000</li>
                    <li>• Development ports: 5000 (backend), 5173 (frontend)</li>
                    <li>• Direct file system access for JSON databases</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">PRODUCTION</span>
                    Azure (Hybrid)
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Frontend: Azure Static Web Apps (planned)</li>
                    <li>• Backend: Azure App Service Linux (planned)</li>
                    <li>• Excel COM: Windows local only (not cloud-deployable)</li>
                    <li>• Production ports: 8000 (gunicorn)</li>
                    <li>• Environment variables for config management</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Critical Constraint:</strong> Excel COM automation requires Windows environment and cannot run on Azure App Service Linux.
                  For production deployment, COM features must remain on Windows local environment while other features can deploy to Azure.
                </p>
              </div>
            </div>
          </div>

          {/* Development Tools */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Development Tools & Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Python Development</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• pytest - Testing framework</li>
                  <li>• black - Code formatter</li>
                  <li>• flake8 - Linter</li>
                  <li>• mypy - Type checker</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">TypeScript Development</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Vitest 1.0.4 - Testing framework</li>
                  <li>• ESLint - Linter</li>
                  <li>• TypeScript compiler - Type checking</li>
                  <li>• Vite - Build tool and dev server</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Summary */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">Real-Time Markets Data</h4>
            </div>
            <p className="text-xs text-gray-600">Automated Excel-based ETL with macro refresh capabilities</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">Multi-Module CRM</h4>
            </div>
            <p className="text-xs text-gray-600">Four specialized modules with investment criteria tracking</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">Investment Matching</h4>
            </div>
            <p className="text-xs text-gray-600">Cross-CRM matching engine with intelligent profile normalization</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">Collaboration Tools</h4>
            </div>
            <p className="text-xs text-gray-600">Unified calendar, whiteboard system, and reminder tracking</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">Interactive Mapping</h4>
            </div>
            <p className="text-xs text-gray-600">Geospatial visualization for infrastructure and transit analysis</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">CSV Export</h4>
            </div>
            <p className="text-xs text-gray-600">Export capabilities across all CRM modules and deal pipeline</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">PDF Reports</h4>
            </div>
            <p className="text-xs text-gray-600">Automated market report generation with conditional formatting</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 text-sm">Role-Based Access</h4>
            </div>
            <p className="text-xs text-gray-600">Secure authentication with admin and standard user roles</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Meridian Universal Dashboard</h3>
          <p className="text-gray-600">
            Comprehensive financial intelligence platform for infrastructure investment professionals
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Platform Version 3.0
          </span>
          <span className="hidden md:inline text-gray-400">•</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last Updated: {new Date().toLocaleDateString()}
          </span>
          <span className="hidden md:inline text-gray-400">•</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            React + TypeScript + Flask
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-500">
            For technical support, data inquiries, or infrastructure analysis questions, please contact the Meridian Universal team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThisWebsitePage;