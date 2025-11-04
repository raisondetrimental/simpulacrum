import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isHeaderDropdownOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isHeaderDropdownOpen = false }) => {
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isCountryReportsOpen, setIsCountryReportsOpen] = useState(false);
  const [isInfraGapsOpen, setIsInfraGapsOpen] = useState(false);
  const [isOriginationOpen, setIsOriginationOpen] = useState(false);
  const [isDealsOpen, setIsDealsOpen] = useState(false);
  const [isStrategiesOpen, setIsStrategiesOpen] = useState(false);
  const [isAboutMeridianOpen, setIsAboutMeridianOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isLiquidityOpen, setIsLiquidityOpen] = useState(false);
  const [isSponsorsOpen, setIsSponsorsOpen] = useState(false);
  const [isCounselOpen, setIsCounselOpen] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (path: string) => location.pathname === path;
  const isWhiteboardRoute = () => location.pathname.startsWith('/whiteboard');
  const isDashboardRoute = () => location.pathname.startsWith('/dashboard');
  const isMarketsRoute = () => location.pathname.startsWith('/dashboard/markets') || location.pathname === '/dashboard/sovereign' || location.pathname === '/dashboard/corporate' || location.pathname === '/dashboard/fx' || location.pathname === '/dashboard/central-banks' || location.pathname === '/dashboard/ratings' || location.pathname === '/dashboard/usa-historical-yields';
  const isCountryReportsRoute = () => location.pathname === '/dashboard/armenia' || location.pathname === '/dashboard/mongolia' || location.pathname === '/dashboard/turkiye' || location.pathname === '/dashboard/uzbekistan' || location.pathname === '/dashboard/vietnam';
  const isInfraGapsRoute = () => location.pathname === '/dashboard/infra-gaps' || location.pathname === '/dashboard/transit-friction' || location.pathname === '/dashboard/internet-coverage';
  const isOriginationRoute = () => location.pathname.startsWith('/deals') || location.pathname === '/investment-strategies' || location.pathname.startsWith('/strategies');
  const isAboutMeridianRoute = () => location.pathname === '/the-firm' || location.pathname === '/this-website' || location.pathname === '/firm-research' || location.pathname === '/firm-theory';
  const isToolsRoute = () => location.pathname.startsWith('/liquidity') || location.pathname.startsWith('/sponsors') || location.pathname.startsWith('/counsel') || location.pathname.startsWith('/agents');

  const whiteboardPages = [
    { name: 'Overview', path: '/whiteboard' },
    { name: 'Weekly Whiteboard', path: '/whiteboard/weekly' },
    { name: 'General Posts', path: '/whiteboard/general' }
  ];

  const marketPages = [
    { name: 'Overview', path: '/dashboard/markets' },
    { name: 'Sovereign Yields', path: '/dashboard/sovereign' },
    { name: 'Corporate Bonds', path: '/dashboard/corporate' },
    { name: 'FX Markets', path: '/dashboard/fx' },
    { name: 'Policy Rates', path: '/dashboard/central-banks' },
    { name: 'Credit Ratings', path: '/dashboard/ratings' },
    { name: 'USA Historical Yields', path: '/dashboard/usa-historical-yields' }
    // Tools page removed - Excel COM not available in cloud deployment
  ];

  const countryReportsPages = [
    { name: 'Armenia', path: '/dashboard/armenia' },
    { name: 'Mongolia', path: '/dashboard/mongolia' },
    { name: 'Türkiye', path: '/dashboard/turkiye' },
    { name: 'Uzbekistan', path: '/dashboard/uzbekistan' },
    { name: 'Vietnam', path: '/dashboard/vietnam' }
  ];

  const infraGapsPages = [
    { name: 'Overview', path: '/dashboard/infra-gaps' },
    { name: 'Transit Friction', path: '/dashboard/transit-friction' },
    { name: 'Internet Coverage', path: '/dashboard/internet-coverage' }
  ];

  const dealsPages = [
    { name: 'All Deals', path: '/deals' },
    { name: 'New Deal', path: '/deals/new' }
  ];

  const aboutMeridianPages = [
    { name: 'Meridian', path: '/meridian' },
    { name: 'Firm Philosophy', path: '/the-firm' },
    { name: 'This Website', path: '/this-website' },
  ];

  const liquidityPages = [
    { name: 'Overview', path: '/liquidity' },
    { name: 'Capital Partners', path: '/liquidity/capital-partners' },
    { name: 'Contacts', path: '/liquidity/contacts' },
    { name: 'Table View', path: '/liquidity/capital-partners-table' },
    { name: 'Meeting Notes', path: '/liquidity/meeting' }
  ];

  const sponsorsPages = [
    { name: 'Overview', path: '/sponsors' },
    { name: 'Corporates', path: '/sponsors/corporates' },
    { name: 'Contacts', path: '/sponsors/contacts' },
    { name: 'Table View', path: '/sponsors/corporates-table' },
    { name: 'Meeting Notes', path: '/sponsors/meeting' }
  ];

  const counselPages = [
    { name: 'Overview', path: '/counsel' },
    { name: 'Legal Advisors', path: '/counsel/legal-advisors' },
    { name: 'Contacts', path: '/counsel/contacts' },
    { name: 'Table View', path: '/counsel/legal-advisors-table' },
    { name: 'Meeting Notes', path: '/counsel/meeting' }
  ];

  const agentsPages = [
    { name: 'Overview', path: '/agents' },
    { name: 'Agents', path: '/agents/list' },
    { name: 'Contacts', path: '/agents/contacts' },
    { name: 'Table View', path: '/agents/table' },
    { name: 'Meeting Notes', path: '/agents/meeting' }
  ];

  const strategiesPages = [
    { name: 'Investment Strategies', path: '/investment-strategies' }
  ];

  return (
    <>
      {/* Hover trigger area with visible icon */}
      <div className="fixed left-0 top-0 w-8 h-full z-40 group">
        {/* Sidebar indicator icon */}
        <div className={`fixed left-0 top-24 bg-black shadow-md rounded-r-lg border-r border-t border-b border-gray-700 p-2 group-hover:invisible transition-all duration-200 ${isHeaderDropdownOpen ? 'hidden' : ''}`}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

        {/* Sliding sidebar */}
        <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-black shadow-xl border-r border-gray-800 transform -translate-x-64 group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 flex-shrink-0">
              {/* Navigation Title */}
              <div className="mb-4 pb-2 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Navigation</h2>
              </div>
            </div>

            <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-2">
          {/* Home */}
          <Link
            to="/"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActiveRoute('/')
                ? 'text-white opacity-100'
                : 'text-white opacity-70 hover:opacity-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>

          {/* Market Intelligence */}
          <div>
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDashboardRoute()
                  ? 'text-white opacity-100'
                  : 'text-white opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Market Intelligence
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Market Intelligence Main Dropdown */}
            {isDashboardOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {/* Markets Subcategory */}
                <div>
                  <button
                    onClick={() => setIsMarketsOpen(!isMarketsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Markets</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isMarketsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Markets Pages */}
                  {isMarketsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {marketPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Country Reports Subcategory */}
                <div>
                  <button
                    onClick={() => setIsCountryReportsOpen(!isCountryReportsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Country Reports</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isCountryReportsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Country Reports Pages */}
                  {isCountryReportsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {countryReportsPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dashboards Subcategory */}
                <div>
                  <button
                    onClick={() => setIsInfraGapsOpen(!isInfraGapsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Dashboards</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isInfraGapsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dashboards Pages */}
                  {isInfraGapsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {infraGapsPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CRM Platform */}
          <div>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isToolsRoute()
                  ? 'text-white opacity-100'
                  : 'text-white opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                CRM
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* CRM Main Dropdown */}
            {isToolsOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {/* Liquidity Subcategory */}
                <div>
                  <button
                    onClick={() => setIsLiquidityOpen(!isLiquidityOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Liquidity</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isLiquidityOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Liquidity Pages */}
                  {isLiquidityOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {liquidityPages.map((page) => (
                        page.name === '---' ? (
                          <div key={page.path} className="border-t border-gray-700 my-2"></div>
                        ) : (
                          <Link
                            key={page.path}
                            to={page.path}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActiveRoute(page.path)
                                ? 'bg-gray-800 text-white font-medium'
                                : 'text-white hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            {page.name}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Sponsors Subcategory */}
                <div>
                  <button
                    onClick={() => setIsSponsorsOpen(!isSponsorsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Sponsors</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isSponsorsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Sponsors Pages */}
                  {isSponsorsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {sponsorsPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Counsel Subcategory */}
                <div>
                  <button
                    onClick={() => setIsCounselOpen(!isCounselOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Counsel</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isCounselOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Counsel Pages */}
                  {isCounselOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {counselPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agents Subcategory */}
                <div>
                  <button
                    onClick={() => setIsAgentsOpen(!isAgentsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Transaction Agents</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isAgentsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Agents Pages */}
                  {isAgentsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {agentsPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Origination */}
          <div>
            <button
              onClick={() => setIsOriginationOpen(!isOriginationOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isOriginationRoute()
                  ? 'text-white opacity-100'
                  : 'text-white opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Origination
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isOriginationOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Origination Main Dropdown */}
            {isOriginationOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {/* Deals Subcategory */}
                <div>
                  <button
                    onClick={() => setIsDealsOpen(!isDealsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Deals</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDealsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Deals Pages */}
                  {isDealsOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {dealsPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strategies Subcategory */}
                <div>
                  <button
                    onClick={() => setIsStrategiesOpen(!isStrategiesOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-light text-white opacity-70 hover:opacity-100 transition-colors"
                  >
                    <span>Strategies</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isStrategiesOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Strategies Pages */}
                  {isStrategiesOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {strategiesPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          className={`block px-3 py-2 rounded-lg text-sm font-light transition-colors ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-white opacity-70 hover:opacity-100'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Whiteboard */}
          <div>
            <button
              onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isWhiteboardRoute()
                  ? 'text-white opacity-100'
                  : 'text-white opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Whiteboard
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isWhiteboardOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Whiteboard Dropdown */}
            {isWhiteboardOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {whiteboardPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActiveRoute(page.path)
                        ? 'bg-gray-800 text-white font-medium'
                        : 'text-white hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Calendar - Standalone Link */}
          <Link
            to="/liquidity/calendar"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/liquidity/calendar'
                ? 'text-white opacity-100'
                : 'text-white opacity-70 hover:opacity-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;