import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

interface ScanResults {
  scan_timestamp: string;
  duplicates: {
    organizations: any[];
    contacts: any[];
    deals: any[];
  };
  total_duplicate_groups: number;
  orphaned_contacts: any[];
  total_orphaned: number;
  invalid_references: any[];
  total_invalid_references: number;
  integrity_issues: {
    organizations: any[];
    contacts: any[];
    deals: any[];
  };
  total_integrity_issues: number;
}

interface DataCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Data Cleanup Modal
 * Scan for and fix data quality issues
 */
const DataCleanupModal: React.FC<DataCleanupModalProps> = ({ isOpen, onClose }) => {
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      handleScan();
    }
  }, [isOpen]);

  const handleScan = async () => {
    try {
      setScanning(true);
      setError(null);
      setMessage(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/cleanup/scan`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.data) {
        setScanResults(data.data);
      } else {
        setError(data.message || 'Failed to scan for issues');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan for issues');
    } finally {
      setScanning(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleFixOrphaned = async () => {
    if (!scanResults || scanResults.orphaned_contacts.length === 0) return;

    if (!confirm(`Delete ${scanResults.orphaned_contacts.length} orphaned contacts? This cannot be undone.`)) {
      return;
    }

    try {
      setFixing(true);
      setMessage(null);

      const contactIds = scanResults.orphaned_contacts.map(c => c.id);

      const response = await fetch(`${API_BASE_URL}/api/admin/cleanup/fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          fix_type: 'orphaned_contacts',
          record_ids: contactIds
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully deleted ${data.data.deleted_count} orphaned contacts`
        });
        // Re-scan after fix
        await handleScan();
      } else {
        setMessage({type: 'error', text: data.message || 'Failed to fix orphaned contacts'});
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fix orphaned contacts'
      });
    } finally {
      setFixing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleFixInvalidReferences = async () => {
    if (!scanResults || scanResults.invalid_references.length === 0) return;

    if (!confirm(`Delete ${scanResults.invalid_references.length} invalid references? This cannot be undone.`)) {
      return;
    }

    try {
      setFixing(true);
      setMessage(null);

      const participantIds = scanResults.invalid_references.map(r => r.participant.id);

      const response = await fetch(`${API_BASE_URL}/api/admin/cleanup/fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          fix_type: 'invalid_references',
          record_ids: participantIds
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully deleted ${data.data.deleted_count} invalid references`
        });
        // Re-scan after fix
        await handleScan();
      } else {
        setMessage({type: 'error', text: data.message || 'Failed to fix invalid references'});
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fix invalid references'
      });
    } finally {
      setFixing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (!isOpen) return null;

  const totalIssues = scanResults ? (
    scanResults.total_duplicate_groups +
    scanResults.total_orphaned +
    scanResults.total_invalid_references +
    scanResults.total_integrity_issues
  ) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Data Cleanup</h3>
            <p className="text-sm text-gray-600 mt-1">Scan for and fix data quality issues</p>
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
          {scanning ? (
            <div className="text-center text-gray-600 py-8">Scanning for data issues...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : scanResults ? (
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

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Scan Summary</h4>
                    <p className="text-sm text-gray-600">Last scanned: {formatDate(scanResults.scan_timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${totalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {totalIssues}
                    </div>
                    <div className="text-sm text-gray-600">Total Issues</div>
                  </div>
                </div>
              </div>

              {/* Issue Categories */}
              <div className="grid grid-cols-2 gap-4">
                {/* Duplicates */}
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-yellow-600 font-semibold">Duplicate Records</div>
                      <div className="text-2xl font-bold text-yellow-900">{scanResults.total_duplicate_groups}</div>
                    </div>
                    <button
                      onClick={() => toggleSection('duplicates')}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      {expandedSections.has('duplicates') ? 'Hide' : 'View'}
                    </button>
                  </div>
                  {expandedSections.has('duplicates') && (
                    <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                      {scanResults.total_duplicate_groups === 0 ? (
                        <p className="text-sm text-gray-600">No duplicates found</p>
                      ) : (
                        <>
                          {scanResults.duplicates.organizations.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Organizations ({scanResults.duplicates.organizations.length} groups)</p>
                              {scanResults.duplicates.organizations.slice(0, 3).map((group, idx) => (
                                <p key={idx} className="text-xs text-gray-600 ml-2">
                                  {group.count} records with key: {group.key}
                                </p>
                              ))}
                            </div>
                          )}
                          {scanResults.duplicates.contacts.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Contacts ({scanResults.duplicates.contacts.length} groups)</p>
                              {scanResults.duplicates.contacts.slice(0, 3).map((group, idx) => (
                                <p key={idx} className="text-xs text-gray-600 ml-2">
                                  {group.count} records with key: {group.key}
                                </p>
                              ))}
                            </div>
                          )}
                          {scanResults.duplicates.deals.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Deals ({scanResults.duplicates.deals.length} groups)</p>
                              {scanResults.duplicates.deals.slice(0, 3).map((group, idx) => (
                                <p key={idx} className="text-xs text-gray-600 ml-2">
                                  {group.count} records with key: {group.key}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 italic mt-2">
                            Note: Duplicates must be manually reviewed and merged
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Orphaned Contacts */}
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-red-600 font-semibold">Orphaned Contacts</div>
                      <div className="text-2xl font-bold text-red-900">{scanResults.total_orphaned}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleSection('orphaned')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        {expandedSections.has('orphaned') ? 'Hide' : 'View'}
                      </button>
                      {scanResults.total_orphaned > 0 && (
                        <button
                          onClick={handleFixOrphaned}
                          disabled={fixing}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                        >
                          {fixing ? 'Fixing...' : 'Fix'}
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedSections.has('orphaned') && (
                    <div className="mt-4 max-h-64 overflow-y-auto">
                      {scanResults.total_orphaned === 0 ? (
                        <p className="text-sm text-gray-600">No orphaned contacts found</p>
                      ) : (
                        <div className="space-y-1">
                          {scanResults.orphaned_contacts.map((contact, idx) => (
                            <div key={idx} className="text-xs text-gray-700 bg-red-50 p-2 rounded">
                              <span className="font-semibold">{contact.name}</span> (ID: {contact.id})
                              <br />
                              <span className="text-gray-600">Missing org: {contact.organization_id}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Invalid References */}
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-orange-600 font-semibold">Invalid References</div>
                      <div className="text-2xl font-bold text-orange-900">{scanResults.total_invalid_references}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleSection('references')}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                      >
                        {expandedSections.has('references') ? 'Hide' : 'View'}
                      </button>
                      {scanResults.total_invalid_references > 0 && (
                        <button
                          onClick={handleFixInvalidReferences}
                          disabled={fixing}
                          className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                        >
                          {fixing ? 'Fixing...' : 'Fix'}
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedSections.has('references') && (
                    <div className="mt-4 max-h-64 overflow-y-auto">
                      {scanResults.total_invalid_references === 0 ? (
                        <p className="text-sm text-gray-600">No invalid references found</p>
                      ) : (
                        <div className="space-y-1">
                          {scanResults.invalid_references.map((ref, idx) => (
                            <div key={idx} className="text-xs text-gray-700 bg-orange-50 p-2 rounded">
                              <span className="font-semibold">Participant ID: {ref.participant.id}</span>
                              <br />
                              {ref.issues.map((issue: string, i: number) => (
                                <span key={i} className="text-gray-600 block">{issue}</span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Integrity Issues */}
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-purple-600 font-semibold">Integrity Issues</div>
                      <div className="text-2xl font-bold text-purple-900">{scanResults.total_integrity_issues}</div>
                    </div>
                    <button
                      onClick={() => toggleSection('integrity')}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                    >
                      {expandedSections.has('integrity') ? 'Hide' : 'View'}
                    </button>
                  </div>
                  {expandedSections.has('integrity') && (
                    <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                      {scanResults.total_integrity_issues === 0 ? (
                        <p className="text-sm text-gray-600">No integrity issues found</p>
                      ) : (
                        <>
                          {scanResults.integrity_issues.organizations.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Organizations ({scanResults.integrity_issues.organizations.length})</p>
                              {scanResults.integrity_issues.organizations.slice(0, 3).map((issue, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-purple-50 p-1 rounded ml-2">
                                  {issue.name}: {issue.issues.join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                          {scanResults.integrity_issues.contacts.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Contacts ({scanResults.integrity_issues.contacts.length})</p>
                              {scanResults.integrity_issues.contacts.slice(0, 3).map((issue, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-purple-50 p-1 rounded ml-2">
                                  {issue.name}: {issue.issues.join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                          {scanResults.integrity_issues.deals.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Deals ({scanResults.integrity_issues.deals.length})</p>
                              {scanResults.integrity_issues.deals.slice(0, 3).map((issue, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-purple-50 p-1 rounded ml-2">
                                  {issue.name}: {issue.issues.join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 italic mt-2">
                            Note: Integrity issues must be manually corrected
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Banner */}
              {totalIssues === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        <strong>All clear!</strong> No data quality issues detected. Your database is in good shape.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {scanning ? 'Scanning...' : 'Re-scan'}
          </button>
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

export default DataCleanupModal;
