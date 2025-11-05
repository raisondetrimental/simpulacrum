import React from 'react';

/**
 * Super Admin Settings Page
 * System configuration and advanced tools
 */
const SuperAdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">System configuration and advanced tools</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">System Status</div>
          <div className="text-2xl font-bold text-green-600">Online</div>
          <div className="text-xs text-gray-500 mt-1">All services running</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-xs text-gray-500 mt-1">Active accounts</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Database Size</div>
          <div className="text-2xl font-bold text-gray-900">~2.4 MB</div>
          <div className="text-xs text-gray-500 mt-1">JSON storage</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Last Backup</div>
          <div className="text-2xl font-bold text-gray-900">Today</div>
          <div className="text-xs text-gray-500 mt-1">Automated backups</div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">System Configuration</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Database Settings</div>
              <div className="text-sm text-gray-500">Configure JSON storage and backups</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">API Configuration</div>
              <div className="text-sm text-gray-500">Manage API keys and endpoints</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Security Settings</div>
              <div className="text-sm text-gray-500">CORS, authentication, permissions</div>
            </button>
          </div>
        </div>

        {/* Advanced Tools */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Advanced Tools</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Data Migration</div>
              <div className="text-sm text-gray-500">Import/export and migration tools</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">System Logs</div>
              <div className="text-sm text-gray-500">View application and error logs</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Performance Monitor</div>
              <div className="text-sm text-gray-500">API response times and metrics</div>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Data Management</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Bulk Operations</div>
              <div className="text-sm text-gray-500">Mass update, delete, or migrate records</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Data Cleanup</div>
              <div className="text-sm text-gray-500">Remove duplicates and orphaned records</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Archive Manager</div>
              <div className="text-sm text-gray-500">Archive old deals and contacts</div>
            </button>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Developer Tools</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">API Playground</div>
              <div className="text-sm text-gray-500">Test API endpoints directly</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Database Explorer</div>
              <div className="text-sm text-gray-500">Browse and edit JSON data</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <div className="font-medium text-gray-900">Feature Flags</div>
              <div className="text-sm text-gray-500">Enable/disable experimental features</div>
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Backend Version</div>
            <div className="font-mono text-sm text-gray-900">Flask 3.0.0</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Frontend Version</div>
            <div className="font-mono text-sm text-gray-900">React 18.2.0</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Python Version</div>
            <div className="font-mono text-sm text-gray-900">3.12</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Node Version</div>
            <div className="font-mono text-sm text-gray-900">Latest LTS</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Database</div>
            <div className="font-mono text-sm text-gray-900">JSON File Storage</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Deployment</div>
            <div className="font-mono text-sm text-gray-900">Local Dev</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
