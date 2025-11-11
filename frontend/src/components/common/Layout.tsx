import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  lastUpdated?: string;
}

type ActiveDropdown = 'dashboard' | 'crm' | 'origination' | 'whiteboard' | null;

const Layout: React.FC<LayoutProps> = ({ children, lastUpdated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Refs to track menu item positions
  const dashboardRef = useRef<HTMLDivElement>(null);
  const crmRef = useRef<HTMLDivElement>(null);
  const originationRef = useRef<HTMLDivElement>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;
  const isWhiteboardRoute = () => location.pathname.startsWith('/whiteboard');
  const isDashboardRoute = () => location.pathname.startsWith('/dashboard');
  const isMarketsRoute = () => location.pathname.startsWith('/dashboard/markets') || location.pathname === '/dashboard/sovereign' || location.pathname === '/dashboard/corporate' || location.pathname === '/dashboard/fx' || location.pathname === '/dashboard/central-banks' || location.pathname === '/dashboard/ratings' || location.pathname === '/dashboard/usa-historical-yields';
  const isCountryReportsRoute = () => location.pathname === '/dashboard/armenia' || location.pathname === '/dashboard/mongolia' || location.pathname === '/dashboard/turkiye' || location.pathname === '/dashboard/uzbekistan' || location.pathname === '/dashboard/vietnam';
  const isInfraGapsRoute = () => location.pathname === '/dashboard/infra-gaps' || location.pathname === '/dashboard/transit-friction' || location.pathname === '/dashboard/internet-coverage';
  const isAboutMeridianRoute = () => location.pathname === '/the-firm' || location.pathname === '/this-website' || location.pathname === '/firm-research' || location.pathname === '/firm-theory';
  const isOriginationRoute = () => location.pathname.startsWith('/deals') || location.pathname === '/investment-strategies';
  const isToolsroute = () => location.pathname.startsWith('/crm/all') || location.pathname.startsWith('/liquidity') || location.pathname.startsWith('/sponsors') || location.pathname.startsWith('/counsel') || location.pathname.startsWith('/agents');
  const isCalendarRoute = () => location.pathname === '/liquidity/calendar';

  const whiteboardPages = [
    { name: 'Overview', path: '/whiteboard' },
    { name: 'Weekly Whiteboard', path: '/whiteboard/weekly' },
    { name: 'General Posts', path: '/whiteboard/general' }
  ];

  const marketPages = [
    { name: 'Markets', path: '/dashboard/markets' },
    { name: 'FX Markets', path: '/dashboard/fx' },
    { name: 'US Sovereign Yields', path: '/dashboard/usa-historical-yields' },
    { name: 'Global Corporate Bonds', path: '/dashboard/corporate-yields' },
    { name: 'US Corporate Bonds', path: '/dashboard/corporate' },
    { name: 'Policy Rates', path: '/dashboard/central-banks' },
    { name: 'Sovereign Yields', path: '/dashboard/sovereign' }
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

  const dashboardCategories = [
    {
      name: 'Country Reports',
      path: null, // No overview page for country reports
      pages: countryReportsPages
    },
    {
      name: 'Markets',
      path: '/dashboard/markets',
      pages: marketPages
    },
    {
      name: 'Dashboards',
      path: '/dashboard/infra-gaps',
      pages: infraGapsPages
    }
  ];

  const originationCategories = [
    {
      name: 'Deals',
      path: '/deals',
      pages: [
        { name: 'All Deals', path: '/deals' },
        { name: 'New Deal', path: '/deals/new' }
      ]
    },
    {
      name: 'Strategies',
      path: '/investment-strategies',
      pages: [
        { name: 'Investment Strategies', path: '/investment-strategies' }
      ]
    }
  ];

  const desCategories = [
    {
      name: 'All',
      path: '/crm/all',
      pages: [
        {name: 'Overview', path: '/crm/all'},
        {name: 'Organisations', path: '/crm/all/organizations'},
        {name: 'Contacts', path: '/crm/all/contacts'},
        {name: 'Table View', path: '/crm/all/table'},
        {name: 'Meeting History', path: '/crm/all/meeting-notes'}
      ]
    },
    {
      name: 'Liquidity',
      path: '/liquidity',
      pages: [
        {name: 'Overview', path: '/liquidity'},
        {name: 'Capital Partners', path: '/liquidity/capital-partners'},
        {name: 'Contacts', path: '/liquidity/contacts'},
        {name: 'Table View', path: '/liquidity/capital-partners-table'},
        {name: 'Meeting Notes', path: '/liquidity/meeting'}
      ]
    },
    {
      name: 'Sponsors',
      path: '/sponsors',
      pages: [
        {name: 'Overview', path: '/sponsors'},
        {name: 'Corporates', path: '/sponsors/corporates'},
        {name: 'Contacts', path: '/sponsors/contacts'},
        {name: 'Table View', path: '/sponsors/corporates-table'},
        {name: 'Meeting Notes', path: '/sponsors/meeting'}
      ]
    },
    {
      name: 'Counsel',
      path: '/counsel',
      pages: [
        {name: 'Overview', path: '/counsel'},
        {name: 'Legal Advisors', path: '/counsel/legal-advisors'},
        {name: 'Contacts', path: '/counsel/contacts'},
        {name: 'Table View', path: '/counsel/legal-advisors-table'},
        {name: 'Meeting Notes', path: '/counsel/meeting'}
      ]
    },
    {
      name: 'Transaction Agents',
      path: '/agents',
      pages: [
        {name: 'Overview', path: '/agents'},
        {name: 'Agents', path: '/agents/list'},
        {name: 'Contacts', path: '/agents/contacts'},
        {name: 'Table View', path: '/agents/table'},
        {name: 'Meeting Notes', path: '/agents/meeting'}
      ]
    }
  ]

  const aboutMeridianPages = [
    { name: 'Meridian', path: '/meridian' },
    { name: 'Firm Philosophy', path: '/the-firm' },
    { name: 'This Website', path: '/this-website' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-black shadow-sm border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src="/assets/logo-1.jpg"
                  alt="Meridian Universal"
                  className="h-10 w-auto mr-3"
                />
                <h1 className="text-xl font-bold text-white mr-8">Meridian Universal</h1>
              </Link>

              {/* Navigation Menu */}
              <nav className="hidden md:flex space-x-6">
                {/* Home */}
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/')
                      ? 'text-white opacity-100'
                      : 'text-white opacity-70 hover:opacity-100'
                  }`}
                >
                  Home
                </Link>

                {/* Market Intelligence */}
                <div
                  ref={dashboardRef}
                  onMouseEnter={() => setActiveDropdown('dashboard')}
                  className="pb-2"
                >
                  <div
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isDashboardRoute()
                        ? 'text-white opacity-100'
                        : 'text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    Market Intelligence
                    <svg className="ml-1 w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: activeDropdown === 'dashboard' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* CRM Platform */}
                <div
                  ref={crmRef}
                  onMouseEnter={() => setActiveDropdown('crm')}
                  className="pb-2"
                >
                  <Link
                    to="/crm/all"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isToolsroute()
                        ? 'text-white opacity-100'
                        : 'text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    CRM Platform
                    <svg className="ml-1 w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: activeDropdown === 'crm' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>

                {/* Origination */}
                <div
                  ref={originationRef}
                  onMouseEnter={() => setActiveDropdown('origination')}
                  className="pb-2"
                >
                  <div
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isOriginationRoute()
                        ? 'text-white opacity-100'
                        : 'text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    Origination
                    <svg className="ml-1 w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: activeDropdown === 'origination' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Whiteboard */}
                <div
                  ref={whiteboardRef}
                  onMouseEnter={() => setActiveDropdown('whiteboard')}
                  className="pb-2"
                >
                  <Link
                    to="/whiteboard"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isWhiteboardRoute()
                        ? 'text-white opacity-100'
                        : 'text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    Whiteboard
                    <svg className="ml-1 w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: activeDropdown === 'whiteboard' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>

                {/* Calendar - Standalone Link */}
                <Link
                  to="/liquidity/calendar"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isCalendarRoute()
                      ? 'text-white opacity-100'
                      : 'text-white opacity-70 hover:opacity-100'
                  }`}
                >
                  Calendar
                </Link>
              </nav>
            </div>

            {/* User Menu and Logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  {/* Clickable username to access account page */}
                  <Link
                    to="/account"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      location.pathname === '/account'
                        ? 'text-white opacity-100'
                        : 'text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    {user.full_name || user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white opacity-70 border border-white/70 hover:bg-white hover:text-black hover:opacity-100 hover:border-white transition-all"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-Width Dropdown Panel */}
      <div
        className={`fixed left-0 right-0 bg-black border-b border-gray-700 shadow-2xl transition-all duration-300 ease-in-out z-40 ${
          activeDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          top: '57px',
          paddingTop: '16px',
          paddingBottom: '16px',
          transform: activeDropdown ? 'translateY(0)' : 'translateY(-20px)'
        }}
        onMouseEnter={() => {
          // Keep dropdown open when hovering over the panel
          if (activeDropdown) {
            setActiveDropdown(activeDropdown);
          }
        }}
        onMouseLeave={() => {
          setActiveDropdown(null);
          setHoveredCategory(null);
        }}
      >
        <div className="relative">
          {/* Market Intelligence Content */}
          {activeDropdown === 'dashboard' && (
            <div
              className="pt-6"
              style={{
                marginLeft: dashboardRef.current?.offsetLeft || 0
              }}
            >
              <div className="flex">
                {/* Left Column - Subheadings */}
                <div className="flex flex-col space-y-1 pr-6">
                  {dashboardCategories.map((category) => (
                    category.path ? (
                      <Link
                        key={category.name}
                        to={category.path}
                        onMouseEnter={() => setHoveredCategory(category.name)}
                        onClick={() => {
                          setActiveDropdown(null);
                          setHoveredCategory(null);
                        }}
                        className={`px-4 py-2.5 text-sm text-white font-medium cursor-pointer transition-all duration-200 min-w-[180px] flex items-center ${
                          hoveredCategory === category.name
                            ? 'opacity-100'
                            : 'opacity-70'
                        }`}
                      >
                        <span className={`mr-2 ${hoveredCategory === category.name ? 'opacity-100' : 'opacity-0'}`}>›</span>
                        {category.name}
                      </Link>
                    ) : (
                      <div
                        key={category.name}
                        onMouseEnter={() => setHoveredCategory(category.name)}
                        className={`px-4 py-2.5 text-sm text-white font-medium cursor-pointer transition-all duration-200 min-w-[180px] flex items-center ${
                          hoveredCategory === category.name
                            ? 'opacity-100'
                            : 'opacity-70'
                        }`}
                      >
                        <span className={`mr-2 ${hoveredCategory === category.name ? 'opacity-100' : 'opacity-0'}`}>›</span>
                        {category.name}
                      </div>
                    )
                  ))}
                </div>

                {/* Right Column - Pages (shown on hover) */}
                <div
                  className="relative min-w-[220px] pl-4 transition-all duration-200"
                  style={{
                    minHeight: hoveredCategory
                      ? `${(dashboardCategories.find(c => c.name === hoveredCategory)?.pages.length || 0) * 42}px`
                      : '0px'
                  }}
                  onMouseEnter={(e) => {
                    // Keep the current hovered category active when mouse is over pages
                    e.stopPropagation();
                  }}
                >
                  {dashboardCategories.map((category) => (
                    <div
                      key={category.name}
                      className={`absolute top-0 left-0 w-full pl-4 transition-all duration-200 ${
                        hoveredCategory === category.name
                          ? 'opacity-100 visible'
                          : 'opacity-0 invisible pointer-events-none'
                      }`}
                    >
                      {category.pages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          onClick={() => {
                            setActiveDropdown(null);
                            setHoveredCategory(null);
                          }}
                          className={`block px-4 py-2 text-sm font-light transition-all duration-200 ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-gray-300 opacity-70 hover:opacity-100 hover:text-white'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CRM Platform Content */}
          {activeDropdown === 'crm' && (
            <div
              className="pt-6"
              style={{
                marginLeft: crmRef.current?.offsetLeft || 0
              }}
            >
              <div className="flex">
                {/* Left Column - Subheadings */}
                <div className="flex flex-col space-y-1 pr-6">
                  {desCategories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      onMouseEnter={() => setHoveredCategory(category.name)}
                      onClick={() => {
                        setActiveDropdown(null);
                        setHoveredCategory(null);
                      }}
                      className={`px-4 py-2.5 text-sm text-white font-medium cursor-pointer transition-all duration-200 min-w-[180px] flex items-center ${
                        hoveredCategory === category.name
                          ? 'opacity-100'
                          : 'opacity-70'
                      }`}
                    >
                      <span className={`mr-2 ${hoveredCategory === category.name ? 'opacity-100' : 'opacity-0'}`}>›</span>
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Right Column - Pages (shown on hover) */}
                <div
                  className="relative min-w-[220px] pl-4 transition-all duration-200"
                  style={{
                    minHeight: hoveredCategory
                      ? `${(desCategories.find(c => c.name === hoveredCategory)?.pages.length || 0) * 42}px`
                      : '0px'
                  }}
                  onMouseEnter={(e) => {
                    // Keep the current hovered category active when mouse is over pages
                    e.stopPropagation();
                  }}
                >
                  {desCategories.map((category) => (
                    <div
                      key={category.name}
                      className={`absolute top-0 left-0 w-full pl-4 transition-all duration-200 ${
                        hoveredCategory === category.name
                          ? 'opacity-100 visible'
                          : 'opacity-0 invisible pointer-events-none'
                      }`}
                    >
                      {category.pages.map((page) => (
                        page.name === '---' ? (
                          <div key={page.path} className="border-t border-gray-700 my-1"></div>
                        ) : (
                          <Link
                            key={page.path}
                            to={page.path}
                            onClick={() => {
                              setActiveDropdown(null);
                              setHoveredCategory(null);
                            }}
                            className={`block px-4 py-2 text-sm font-light transition-all duration-200 ${
                              isActiveRoute(page.path)
                                ? 'text-white opacity-100'
                                : 'text-gray-300 opacity-70 hover:opacity-100 hover:text-white'
                            }`}
                          >
                            {page.name}
                          </Link>
                        )
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Origination Content */}
          {activeDropdown === 'origination' && (
            <div
              className="pt-6"
              style={{
                marginLeft: originationRef.current?.offsetLeft || 0
              }}
            >
              <div className="flex">
                {/* Left Column - Subheadings */}
                <div className="flex flex-col space-y-1 pr-6">
                  {originationCategories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      onMouseEnter={() => setHoveredCategory(category.name)}
                      onClick={() => {
                        setActiveDropdown(null);
                        setHoveredCategory(null);
                      }}
                      className={`px-4 py-2.5 text-sm text-white font-medium cursor-pointer transition-all duration-200 min-w-[180px] flex items-center ${
                        hoveredCategory === category.name
                          ? 'opacity-100'
                          : 'opacity-70'
                      }`}
                    >
                      <span className={`mr-2 ${hoveredCategory === category.name ? 'opacity-100' : 'opacity-0'}`}>›</span>
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Right Column - Pages (shown on hover) */}
                <div
                  className="relative min-w-[220px] pl-4 transition-all duration-200"
                  style={{
                    minHeight: hoveredCategory
                      ? `${(originationCategories.find(c => c.name === hoveredCategory)?.pages.length || 0) * 42}px`
                      : '0px'
                  }}
                  onMouseEnter={(e) => {
                    // Keep the current hovered category active when mouse is over pages
                    e.stopPropagation();
                  }}
                >
                  {originationCategories.map((category) => (
                    <div
                      key={category.name}
                      className={`absolute top-0 left-0 w-full pl-4 transition-all duration-200 ${
                        hoveredCategory === category.name
                          ? 'opacity-100 visible'
                          : 'opacity-0 invisible pointer-events-none'
                      }`}
                    >
                      {category.pages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          onClick={() => {
                            setActiveDropdown(null);
                            setHoveredCategory(null);
                          }}
                          className={`block px-4 py-2 text-sm font-light transition-all duration-200 ${
                            isActiveRoute(page.path)
                              ? 'text-white opacity-100'
                              : 'text-gray-300 opacity-70 hover:opacity-100 hover:text-white'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Whiteboard Content */}
          {activeDropdown === 'whiteboard' && (
            <div
              className="pt-6"
              style={{
                marginLeft: whiteboardRef.current?.offsetLeft || 0
              }}
            >
              <div className="flex flex-col space-y-1">
                {whiteboardPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={() => {
                      setActiveDropdown(null);
                      setHoveredCategory(null);
                    }}
                    className={`block px-4 py-2.5 text-sm font-light transition-all duration-200 rounded-md min-w-[180px] ${
                      isActiveRoute(page.path)
                        ? 'text-white opacity-100'
                        : 'text-gray-300 opacity-70 hover:opacity-100 hover:text-white'
                    }`}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isHeaderDropdownOpen={activeDropdown !== null} />

      {/* Main content - centered */}
      <main
        className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 pt-24"
        style={{ maxWidth: isCountryReportsRoute() ? '1300px' : '1200px' }}
      >
        <div className="py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;