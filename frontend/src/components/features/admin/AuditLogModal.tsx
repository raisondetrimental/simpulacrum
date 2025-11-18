import React, { useState, useEffect } from 'react';
import { getAuditLog, getAuditLogStats, exportAuditLogCSV } from '../../../services/adminService';
import type { AuditLogEntry, AuditLogFilters, AuditLogStats } from '../../../types/admin';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Audit Log Modal
 * View all super admin actions with filtering and export capabilities
 */
const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [entriesPerPage] = useState(50);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    action: '',
    entity_type: '',
    user_id: '',
    start_date: '',
    end_date: ''
  });

  // Selected entry for detail view
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Available filter options (populated from stats)
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [entityTypeOptions, setEntityTypeOptions] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      fetchAuditLog();
    }
  }, [isOpen, currentPage, filters]);

  const fetchStats = async () => {
    try {
      const response = await getAuditLogStats();
      if (response.success && response.data) {
        setStats(response.data);

        // Populate filter options from stats
        setActionOptions(Object.keys(response.data.by_action || {}));
        setEntityTypeOptions(Object.keys(response.data.by_entity_type || {}));
        setUserOptions(Object.keys(response.data.by_user || {}));
      }
    } catch (err) {
      console.error('Failed to load audit stats:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * entriesPerPage;
      const response = await getAuditLog({
        ...filters,
        limit: entriesPerPage,
        offset
      });

      if (response.success && response.data) {
        setEntries(response.data.entries || []);
        setTotalEntries(response.data.pagination.total);
        setHasMore(response.data.pagination.has_more);
      } else {
        setError(response.message || 'Failed to load audit log');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      entity_type: '',
      user_id: '',
      start_date: '',
      end_date: ''
    });
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      await exportAuditLogCSV(filters);
    } catch (err) {
      alert('Failed to export audit log');
      console.error('Export error:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedEntry(null);
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getActionBadgeColor = (action: string): string => {
    const colorMap: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      bulk_update: 'bg-purple-100 text-purple-800',
      bulk_export: 'bg-indigo-100 text-indigo-800',
      archive: 'bg-orange-100 text-orange-800',
      restore: 'bg-teal-100 text-teal-800',
      api_key_update: 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[action] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">Audit Log</h3>
              <p className="text-sm text-gray-600 mt-1">View all super admin actions and system operations</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Total Entries</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total_entries.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Successful</p>
                <p className="text-2xl font-bold text-green-700">{stats.successful_operations.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-700">{stats.failed_operations.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-blue-700">{stats.success_rate.toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                {actionOptions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entity Type</label>
              <select
                value={filters.entity_type}
                onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                {entityTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">User</label>
              <select
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Users</option>
                {userOptions.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
            >
              Export to CSV
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              Loading audit log...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
              </div>
            </div>
          ) : (
            <>
              {/* Entries Table */}
              <div className="flex-1 overflow-y-auto">
                {entries.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No audit log entries found
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Entity Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Affected</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {entries.map((entry) => (
                        <tr
                          key={entry.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatTimestamp(entry.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.username}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getActionBadgeColor(entry.action)}`}>
                              {entry.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {entry.entity_type}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {entry.affected_count} {entry.affected_count === 1 ? 'record' : 'records'}
                          </td>
                          <td className="px-4 py-3">
                            {entry.success ? (
                              <span className="text-green-600 text-sm">✓ Success</span>
                            ) : (
                              <span className="text-red-600 text-sm">✗ Failed</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-600 hover:text-blue-800">
                            View →
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Detail Panel */}
              {selectedEntry && (
                <div className="w-96 border-l border-gray-200 overflow-y-auto bg-gray-50 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold">Entry Details</h4>
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedEntry.id}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Timestamp</label>
                      <p className="text-sm text-gray-900">{formatTimestamp(selectedEntry.timestamp)}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">User</label>
                      <p className="text-sm text-gray-900">{selectedEntry.username} ({selectedEntry.user_id})</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Action</label>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getActionBadgeColor(selectedEntry.action)}`}>
                        {selectedEntry.action}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Entity Type</label>
                      <p className="text-sm text-gray-900">{selectedEntry.entity_type}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                      <p className="text-sm">
                        {selectedEntry.success ? (
                          <span className="text-green-600 font-semibold">✓ Successful</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗ Failed</span>
                        )}
                      </p>
                    </div>

                    {selectedEntry.error_message && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Error Message</label>
                        <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                          {selectedEntry.error_message}
                        </p>
                      </div>
                    )}

                    {selectedEntry.affected_ids && selectedEntry.affected_ids.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Affected IDs ({selectedEntry.affected_count})
                        </label>
                        <div className="bg-white p-2 rounded border border-gray-200 max-h-32 overflow-y-auto">
                          <ul className="text-xs font-mono space-y-1">
                            {selectedEntry.affected_ids.slice(0, 20).map((id, idx) => (
                              <li key={idx} className="text-gray-700">{id}</li>
                            ))}
                            {selectedEntry.affected_ids.length > 20 && (
                              <li className="text-gray-500 italic">
                                ... and {selectedEntry.affected_ids.length - 20} more
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Metadata</label>
                        <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(selectedEntry.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedEntry.old_values && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Old Values</label>
                        <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(selectedEntry.old_values, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedEntry.new_values && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">New Values</label>
                        <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(selectedEntry.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Pagination */}
        {!loading && !error && entries.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries.toLocaleString()} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogModal;
