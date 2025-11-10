import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

/**
 * Super Admin Layout with permanent sidebar
 * Only for Cameron's super admin portal
 */
const SuperAdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Permanent Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-900 to-blue-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">My Portal</h2>
          <p className="text-purple-200 text-sm">Super Admin</p>
        </div>

        <nav className="mt-6">
          <NavLink
            to="/admin/super"
            end
            className={({ isActive }) =>
              `block px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-white/20 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </div>
          </NavLink>

          <NavLink
            to="/admin/super/notes"
            className={({ isActive }) =>
              `block px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-white/20 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              My Notes
            </div>
          </NavLink>

          <NavLink
            to="/admin/super/playbook"
            className={({ isActive }) =>
              `block px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-white/20 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              The Playbook
            </div>
          </NavLink>

          <NavLink
            to="/admin/super/countries"
            className={({ isActive }) =>
              `block px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-white/20 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Countries Master
            </div>
          </NavLink>

          <NavLink
            to="/admin/super/settings"
            className={({ isActive }) =>
              `block px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-white/20 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </div>
          </NavLink>

          {/* Divider */}
          <div className="my-4 mx-6 border-t border-white/20"></div>

          {/* Back to Main App */}
          <NavLink
            to="/"
            className="block px-6 py-3 transition-colors hover:bg-white/10 text-purple-200"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </div>
          </NavLink>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
