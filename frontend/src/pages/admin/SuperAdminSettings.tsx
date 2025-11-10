import React, { useState, useEffect } from 'react';
import {
  getSystemStats,
  getDatabaseFiles,
  getSystemLogs,
  downloadLogFile,
  getSystemHealth,
  triggerBackup
} from '../../services/adminService';
import type { SystemStats, LogFile, DatabaseFile, SystemHealth } from '../../types/admin';
import SecuritySettingsModal from '../../components/features/admin/SecuritySettingsModal';
import ApiConfigModal from '../../components/features/admin/ApiConfigModal';
import ArchiveManagerModal from '../../components/features/admin/ArchiveManagerModal';
import DataCleanupModal from '../../components/features/admin/DataCleanupModal';
import BulkOperationsModal from '../../components/features/admin/BulkOperationsModal';
import FeatureFlagsModal from '../../components/features/admin/FeatureFlagsModal';
import ApiPlaygroundModal from '../../components/features/admin/ApiPlaygroundModal';
import DatabaseExplorerModal from '../../components/features/admin/DatabaseExplorerModal';

/**
 * Super Admin Settings Page
 * System configuration and advanced tools
 */
const SuperAdminSettings: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [showBulkOpsModal, setShowBulkOpsModal] = useState(false);
  const [showFeatureFlagsModal, setShowFeatureFlagsModal] = useState(false);
  const [showApiPlaygroundModal, setShowApiPlaygroundModal] = useState(false);
  const [showDatabaseExplorerModal, setShowDatabaseExplorerModal] = useState(false);
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [databaseFiles, setDatabaseFiles] = useState<DatabaseFile[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Backup state
  const [backingUp, setBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, healthResponse] = await Promise.all([
        getSystemStats(),
        getSystemHealth()
      ]);

      console.log('Stats Response:', statsResponse);
      console.log('Health Response:', healthResponse);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        console.error('Stats failed:', statsResponse.message);
      }

      if (healthResponse.success && healthResponse.data) {
        setHealth(healthResponse.data);
      } else {
        console.error('Health failed:', healthResponse.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemData();
    setRefreshing(false);
  };

  const handleViewLogs = async () => {
    setShowLogsModal(true);
    setModalLoading(true);

    try {
      const response = await getSystemLogs();
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownloadLog = async (filename: string) => {
    try {
      await downloadLogFile(filename);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download log file');
    }
  };

  const handleViewDatabase = async () => {
    setShowDatabaseModal(true);
    setModalLoading(true);

    try {
      const response = await getDatabaseFiles();
      if (response.success && response.data) {
        setDatabaseFiles(response.data);
      }
    } catch (err) {
      console.error('Failed to load database files:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleTriggerBackup = async () => {
    if (!confirm('Create a manual backup of all database files?')) {
      return;
    }

    setBackingUp(true);
    setBackupMessage(null);

    try {
      const response = await triggerBackup();
      if (response.success && response.data) {
        setBackupMessage(`Successfully backed up ${response.data.backed_up.length} files`);
        // Refresh stats to show new backup time
        await fetchSystemData();
      } else {
        setBackupMessage(response.message || 'Backup failed');
      }
    } catch (err) {
      setBackupMessage(err instanceof Error ? err.message : 'Backup failed');
    } finally {
      setBackingUp(false);
      // Clear message after 5 seconds
      setTimeout(() => setBackupMessage(null), 5000);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Never';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatFileSize = (sizeKB: number) => {
    if (sizeKB < 1024) {
      return `${sizeKB.toFixed(2)} KB`;
    }
    return `${(sizeKB / 1024).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading system data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">System configuration and advanced tools</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Backup Message */}
      {backupMessage && (
        <div className={`p-4 rounded-lg ${backupMessage.includes('Success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {backupMessage}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">System Status</div>
          <div className={`text-2xl font-bold ${health?.status === 'online' ? 'text-green-600' : health?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
            {health?.status ? health.status.charAt(0).toUpperCase() + health.status.slice(1) : 'Unknown'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {health?.status === 'online' ? 'All services running' : 'Check system health'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.users.active || 0} active · {stats?.users.admin || 0} admin
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Database Size</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.database.size_mb || 0} MB</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.database.file_count || 0} files · {stats?.database.backup_count || 0} backups
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Last Backup</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.database.last_backup ? new Date(stats.database.last_backup).toLocaleDateString() : 'Never'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.database.last_backup ? formatDate(stats.database.last_backup).split(',')[1] : 'No backups'}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">CRM Statistics</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Organizations</span>
              <span className="text-sm font-semibold">{stats?.crm.organizations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Contacts</span>
              <span className="text-sm font-semibold">{stats?.crm.contacts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Reminders Due</span>
              <span className="text-sm font-semibold text-orange-600">{stats?.crm.reminders_due || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Overdue</span>
              <span className="text-sm font-semibold text-red-600">{stats?.crm.overdue_reminders || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Deals Statistics</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Total Deals</span>
              <span className="text-sm font-semibold">{stats?.deals.total || 0}</span>
            </div>
            {stats?.deals.by_status && Object.entries(stats.deals.by_status).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="text-sm text-gray-700 capitalize">{status}</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Whiteboard</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Total Posts</span>
              <span className="text-sm font-semibold">{stats?.whiteboard.total_posts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Weekly Posts</span>
              <span className="text-sm font-semibold">{stats?.whiteboard.weekly_posts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">General Posts</span>
              <span className="text-sm font-semibold">{stats?.whiteboard.general_posts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">System Configuration</h2>
          <div className="space-y-3">
            <button
              onClick={handleViewDatabase}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">Database Settings</div>
              <div className="text-sm text-gray-500">View JSON files and storage details</div>
            </button>
            <button
              onClick={() => setShowApiConfigModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">API Configuration</div>
              <div className="text-sm text-gray-500">Manage API keys and endpoints</div>
            </button>
            <button
              onClick={() => setShowSecurityModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">Security Settings</div>
              <div className="text-sm text-gray-500">CORS, authentication, permissions (Read-only)</div>
            </button>
          </div>
        </div>

        {/* Advanced Tools */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Advanced Tools</h2>
          <div className="space-y-3">
            <button
              onClick={handleTriggerBackup}
              disabled={backingUp}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-medium text-gray-900">
                {backingUp ? 'Creating Backup...' : 'Manual Backup'}
              </div>
              <div className="text-sm text-gray-500">Create timestamped backup of all data</div>
            </button>
            <button
              onClick={handleViewLogs}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">System Logs</div>
              <div className="text-sm text-gray-500">View and download application logs</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-not-allowed opacity-50">
              <div className="font-medium text-gray-900">Performance Monitor</div>
              <div className="text-sm text-gray-500">API response times and metrics (Coming soon)</div>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Data Management</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowBulkOpsModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">Bulk Operations</div>
              <div className="text-sm text-gray-500">Mass update and export records</div>
            </button>
            <button
              onClick={() => setShowCleanupModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">Data Cleanup</div>
              <div className="text-sm text-gray-500">Remove duplicates and orphaned records</div>
            </button>
            <button
              onClick={() => setShowArchiveModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">Archive Manager</div>
              <div className="text-sm text-gray-500">Archive old deals and contacts</div>
            </button>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Developer Tools</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowApiPlaygroundModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">API Playground</div>
              <div className="text-sm text-gray-500">Test API endpoints directly</div>
            </button>
            <button
              onClick={() => setShowDatabaseExplorerModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="font-medium text-gray-900">Database Explorer</div>
              <div className="text-sm text-gray-500">Browse JSON data (read-only)</div>
            </button>
            <button
              onClick={() => setShowFeatureFlagsModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
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
            <div className="text-sm text-gray-600 mb-1">Database</div>
            <div className="font-mono text-sm text-gray-900">JSON File Storage</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Deployment</div>
            <div className="font-mono text-sm text-gray-900">Local Development</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Last Updated</div>
            <div className="font-mono text-sm text-gray-900">
              {stats?.timestamp ? formatDate(stats.timestamp) : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* System Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">System Logs</h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {modalLoading ? (
                <div className="text-center text-gray-600">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-center text-gray-600">No log files found</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modified</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.filename}>
                        <td className="px-4 py-2 text-sm font-mono">{log.filename}</td>
                        <td className="px-4 py-2 text-sm">{formatFileSize(log.size_kb)}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(log.modified)}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleDownloadLog(log.filename)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Database Files Modal */}
      {showDatabaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Database Files</h3>
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {modalLoading ? (
                <div className="text-center text-gray-600">Loading database files...</div>
              ) : databaseFiles.length === 0 ? (
                <div className="text-center text-gray-600">No database files found</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {databaseFiles.map((file) => (
                      <tr key={file.path}>
                        <td className="px-4 py-2 text-sm font-mono">{file.filename}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${file.type === 'database' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {file.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{formatFileSize(file.size_kb)}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(file.last_modified)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Feature Modals */}
      <SecuritySettingsModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
      <ApiConfigModal
        isOpen={showApiConfigModal}
        onClose={() => setShowApiConfigModal(false)}
      />
      <ArchiveManagerModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
      />
      <DataCleanupModal
        isOpen={showCleanupModal}
        onClose={() => setShowCleanupModal(false)}
      />
      <BulkOperationsModal
        isOpen={showBulkOpsModal}
        onClose={() => setShowBulkOpsModal(false)}
      />
      <FeatureFlagsModal
        isOpen={showFeatureFlagsModal}
        onClose={() => setShowFeatureFlagsModal(false)}
      />
      <ApiPlaygroundModal
        isOpen={showApiPlaygroundModal}
        onClose={() => setShowApiPlaygroundModal(false)}
      />
      <DatabaseExplorerModal
        isOpen={showDatabaseExplorerModal}
        onClose={() => setShowDatabaseExplorerModal(false)}
      />
    </div>
  );
};

export default SuperAdminSettings;
