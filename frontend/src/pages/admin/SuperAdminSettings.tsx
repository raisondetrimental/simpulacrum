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
import AuditLogModal from '../../components/features/admin/AuditLogModal';

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
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
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

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (healthResponse.success && healthResponse.data) {
        setHealth(healthResponse.data);
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
      // Failed to load logs
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
      // Failed to load database files
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
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden" style={{ borderLeftColor: health?.status === 'online' ? '#10b981' : health?.status === 'degraded' ? '#f59e0b' : '#ef4444' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 font-medium">System Status</div>
            <div className={`w-3 h-3 rounded-full ${health?.status === 'online' ? 'bg-green-500 animate-pulse' : health?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          </div>
          <div className={`text-2xl font-bold ${health?.status === 'online' ? 'text-green-600' : health?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
            {health?.status ? health.status.charAt(0).toUpperCase() + health.status.slice(1) : 'Unknown'}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {health?.status === 'online' ? 'All services running' : 'Check system health'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 font-medium">Total Users</div>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</div>
          <div className="text-xs text-gray-500 mt-2">
            <div className="flex items-center justify-between">
              <span>{stats?.users.active || 0} active</span>
              <span className="text-blue-600 font-semibold">{stats?.users.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${stats?.users.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 font-medium">Database Size</div>
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.database.size_mb.toFixed(2) || 0} MB</div>
          <div className="text-xs text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {stats?.database.file_count || 0} files · {stats?.database.backup_count || 0} backups
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 font-medium">Last Backup</div>
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.database.last_backup ? new Date(stats.database.last_backup).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.database.last_backup ? (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(stats.database.last_backup).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : 'No backups created'}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="text-sm text-gray-600 font-semibold">CRM Statistics</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Organizations</span>
              <span className="text-lg font-bold text-gray-900">{stats?.crm.organizations || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Contacts</span>
              <span className="text-lg font-bold text-gray-900">{stats?.crm.contacts || 0}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reminders Due
                </span>
                <span className="text-sm font-bold text-orange-600">{stats?.crm.reminders_due || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Overdue
                </span>
                <span className="text-sm font-bold text-red-600">{stats?.crm.overdue_reminders || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm text-gray-600 font-semibold">Deals Pipeline</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Deals</span>
              <span className="text-lg font-bold text-gray-900">{stats?.deals.total || 0}</span>
            </div>
            {stats?.deals.by_status && Object.entries(stats.deals.by_status).map(([status, count]) => {
              const statusColors: Record<string, string> = {
                active: 'text-blue-600',
                pipeline: 'text-yellow-600',
                closed: 'text-green-600',
                archived: 'text-gray-500'
              };
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 capitalize flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${statusColors[status]?.replace('text-', 'bg-') || 'bg-gray-400'}`}></span>
                    {status}
                  </span>
                  <span className={`text-sm font-bold ${statusColors[status] || 'text-gray-900'}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div className="text-sm text-gray-600 font-semibold">Whiteboard</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Posts</span>
              <span className="text-lg font-bold text-gray-900">{stats?.whiteboard.total_posts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                This Week
              </span>
              <span className="text-sm font-bold text-green-600">{stats?.whiteboard.weekly_posts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">General Posts</span>
              <span className="text-sm font-semibold text-gray-900">{stats?.whiteboard.general_posts || 0}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                Collaboration activity tracking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Monitoring */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleViewLogs}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">System Logs</div>
                <div className="text-sm text-gray-500">View and download application logs</div>
              </div>
            </button>
            <button
              onClick={() => setShowAuditLogModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Audit Log</div>
                <div className="text-sm text-gray-500">View all super admin actions and operations</div>
              </div>
            </button>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleViewDatabase}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Database Settings</div>
                <div className="text-sm text-gray-500">View JSON files and storage details</div>
              </div>
            </button>
            <button
              onClick={handleTriggerBackup}
              disabled={backingUp}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {backingUp ? 'Creating Backup...' : 'Manual Backup'}
                </div>
                <div className="text-sm text-gray-500">Create timestamped backup of all data</div>
              </div>
            </button>
            <button
              onClick={() => setShowDatabaseExplorerModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Database Explorer</div>
                <div className="text-sm text-gray-500">Browse JSON data (read-only)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Developer Tools</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowApiPlaygroundModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">API Playground</div>
                <div className="text-sm text-gray-500">Test API endpoints directly</div>
              </div>
            </button>
            <button
              onClick={() => setShowFeatureFlagsModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Feature Flags</div>
                <div className="text-sm text-gray-500">Enable/disable experimental features</div>
              </div>
            </button>
            <button
              onClick={() => setShowApiConfigModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">API Configuration</div>
                <div className="text-sm text-gray-500">Manage API keys and endpoints</div>
              </div>
            </button>
            <button
              onClick={() => setShowSecurityModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Security Settings</div>
                <div className="text-sm text-gray-500">CORS, authentication, permissions (Read-only)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Bulk Operations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Operations</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowBulkOpsModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Bulk Operations</div>
                <div className="text-sm text-gray-500">Mass update and export records</div>
              </div>
            </button>
            <button
              onClick={() => setShowCleanupModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Data Cleanup</div>
                <div className="text-sm text-gray-500">Remove duplicates and orphaned records</div>
              </div>
            </button>
            <button
              onClick={() => setShowArchiveModal(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Archive Manager</div>
                <div className="text-sm text-gray-500">Archive old deals and contacts</div>
              </div>
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
      <AuditLogModal
        isOpen={showAuditLogModal}
        onClose={() => setShowAuditLogModal(false)}
      />
    </div>
  );
};

export default SuperAdminSettings;
