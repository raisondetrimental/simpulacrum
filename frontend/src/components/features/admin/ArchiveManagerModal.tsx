import React, { useState, useEffect } from 'react';
import { apiGet } from '../../../services/api';

interface ArchiveStats {
  deals: {
    total_archived: number;
    archive_file_size_kb: number;
    oldest_archive: string | null;
    newest_archive: string | null;
  };
  organizations: {
    total_archived: number;
    archive_file_size_kb: number;
    oldest_archive: string | null;
    newest_archive: string | null;
  };
  contacts: {
    total_archived: number;
    archive_file_size_kb: number;
    oldest_archive: string | null;
    newest_archive: string | null;
  };
}

interface ArchivedRecord {
  id: string;
  [key: string]: any;
}

interface ArchiveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Archive Manager Modal
 * View archived records and restore them
 */
const ArchiveManagerModal: React.FC<ArchiveManagerModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<'deals' | 'organizations' | 'contacts'>('deals');
  const [archivedRecords, setArchivedRecords] = useState<ArchivedRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchArchiveStats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedEntityType) {
      fetchArchivedRecords();
    }
  }, [selectedEntityType, isOpen]);

  const fetchArchiveStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet('/api/admin/archive/stats');

      if (data.success && data.data) {
        setStats(data.data.stats);
      } else {
        setError(data.message || 'Failed to load archive statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load archive statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedRecords = async () => {
    try {
      setLoadingRecords(true);
      setSelectedRecords(new Set());

      const response = await fetch(
        `${API_BASE_URL}/api/admin/archive/${selectedEntityType}/list?limit=100`,
        { credentials: 'include' }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setArchivedRecords(data.data.records);
      } else {
        setArchivedRecords([]);
      }
    } catch (err) {
      console.error('Failed to load archived records:', err);
      setArchivedRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === archivedRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(archivedRecords.map(r => r.id)));
    }
  };

  const handleRestore = async () => {
    if (selectedRecords.size === 0) {
      setMessage({type: 'error', text: 'Please select records to restore'});
      return;
    }

    if (!confirm(`Restore ${selectedRecords.size} selected ${selectedEntityType}?`)) {
      return;
    }

    try {
      setRestoring(true);
      setMessage(null);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/archive/${selectedEntityType}/restore`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            record_ids: Array.from(selectedRecords)
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully restored ${data.data.restored_count} ${selectedEntityType}`
        });
        // Refresh both stats and records
        await fetchArchiveStats();
        await fetchArchivedRecords();
      } else {
        setMessage({type: 'error', text: data.message || 'Failed to restore records'});
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to restore records'
      });
    } finally {
      setRestoring(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getRecordDisplayName = (record: ArchivedRecord): string => {
    return record.name || record.deal_name || record.id;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Archive Manager</h3>
            <p className="text-sm text-gray-600 mt-1">View and restore archived records</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center text-gray-600 py-8">Loading archive statistics...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Message */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Archive Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-600 mb-1">Deals Archived</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats?.deals.total_archived || 0}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {stats?.deals.archive_file_size_kb.toFixed(2)} KB
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">Organizations Archived</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {stats?.organizations.total_archived || 0}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {stats?.organizations.archive_file_size_kb.toFixed(2)} KB
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-600 mb-1">Contacts Archived</div>
                  <div className="text-2xl font-bold text-green-900">
                    {stats?.contacts.total_archived || 0}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {stats?.contacts.archive_file_size_kb.toFixed(2)} KB
                  </div>
                </div>
              </div>

              {/* Entity Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Archived Records
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedEntityType('deals')}
                    className={`px-4 py-2 rounded ${
                      selectedEntityType === 'deals'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Deals ({stats?.deals.total_archived || 0})
                  </button>
                  <button
                    onClick={() => setSelectedEntityType('organizations')}
                    className={`px-4 py-2 rounded ${
                      selectedEntityType === 'organizations'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Organizations ({stats?.organizations.total_archived || 0})
                  </button>
                  <button
                    onClick={() => setSelectedEntityType('contacts')}
                    className={`px-4 py-2 rounded ${
                      selectedEntityType === 'contacts'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Contacts ({stats?.contacts.total_archived || 0})
                  </button>
                </div>
              </div>

              {/* Archived Records List */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Archived {selectedEntityType.charAt(0).toUpperCase() + selectedEntityType.slice(1)}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      {selectedRecords.size === archivedRecords.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={handleRestore}
                      disabled={selectedRecords.size === 0 || restoring}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {restoring ? 'Restoring...' : `Restore Selected (${selectedRecords.size})`}
                    </button>
                  </div>
                </div>

                {loadingRecords ? (
                  <div className="text-center text-gray-600 py-8">Loading archived records...</div>
                ) : archivedRecords.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No archived {selectedEntityType} found
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            <input
                              type="checkbox"
                              checked={selectedRecords.size === archivedRecords.length && archivedRecords.length > 0}
                              onChange={handleSelectAll}
                              className="rounded"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archived At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {archivedRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedRecords.has(record.id)}
                                onChange={() => handleSelectRecord(record.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{getRecordDisplayName(record)}</td>
                            <td className="px-4 py-2 text-sm font-mono text-gray-600">{record.id}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatDate(record.archived_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Archived records are stored in separate files and can be restored at any time.
                      Restoring a record will move it back to the main database and make it visible in the application again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveManagerModal;
