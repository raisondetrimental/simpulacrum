import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Super Admin Home Page
 * Simple welcome banner for Cameron
 */
const SuperAdminHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">
            Welcome, {user?.full_name || 'Cameron Thomas'}
          </h1>
          <p className="text-xl text-purple-100">
            Your exclusive super admin portal
          </p>

          {/* Decorative Element */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-1 w-20 bg-white/30 rounded"></div>
            <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <div className="h-1 w-20 bg-white/30 rounded"></div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 text-gray-600">
          <p className="text-sm">
            Use the sidebar to navigate to different sections of your portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminHome;
