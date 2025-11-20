import React, { useState, useEffect } from 'react';
import { apiGet } from '../../../services/api';

interface DatabaseFile {
  filename: string;
  path: string;
  category: string;
  size_kb: number;
  record_count: number | null;
  last_modified: number;
  type: string;
}

interface DatabaseExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Database Explorer Modal (Read-Only)
 * Browse and view JSON database files
 */
const DatabaseExplorerModal: React.FC<DatabaseExplorerModalProps> = ({ isOpen, onClose }) => {
  const [groupedFiles, setGroupedFiles] = useState<Record<string, DatabaseFile[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected file and records
  const [selectedFile, setSelectedFile] = useState<DatabaseFile | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(50);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Selected record for detail view
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedFile) {
      fetchRecords();
    }
  }, [selectedFile, currentPage, searchQuery]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet('/api/admin/database-explorer/files?grouped=true');

      if (data.success && data.data) {
        setGroupedFiles(data.data.files);
      } else {
        setError(data.message || 'Failed to load database files');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load database files');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!selectedFile) return;

    try {
      setLoadingRecords(true);
      const offset = (currentPage - 1) * recordsPerPage;

      const params = new URLSearchParams({
        limit: recordsPerPage.toString(),
        offset: offset.toString()
      });
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/database-explorer/files/${selectedFile.filename}?${params}`,
        { credentials: 'include' }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setRecords(data.data.records || []);
        setTotalRecords(data.data.total_count || 0);
      } else {
        setRecords([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Failed to load records:', err);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSelectFile = (file: DatabaseFile) => {
    setSelectedFile(file);
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedRecord(null);
    setRecords([]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedRecord(null);
  };

  const formatFileSize = (kb: number): string => {
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };

  const formatDate = (timestamp: number): string => {
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'crm': 'CRM Data',
      'market_data': 'Market Data',
      'system': 'System',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  const getRecordDisplayValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Database Explorer</h3>
            <p className="text-sm text-gray-600 mt-1">Browse JSON database files (read-only)</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              Loading database files...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
              </div>
            </div>
          ) : (
            <>
              {/* Left Sidebar - File List */}
              <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Database Files</h4>
                  {Object.entries(groupedFiles).map(([category, files]) => (
                    files.length > 0 && (
                      <div key={category} className="mb-4">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          {getCategoryLabel(category)}
                        </h5>
                        <div className="space-y-1">
                          {files.map((file) => (
                            <button
                              key={file.filename}
                              onClick={() => handleSelectFile(file)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                selectedFile?.filename === file.filename
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="font-medium truncate">{file.filename}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {file.record_count !== null ? `${file.record_count} records` : 'Unknown'} • {formatFileSize(file.size_kb)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Center/Right - Records View */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedFile ? (
                  <>
                    {/* File Info & Search */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="text-lg font-semibold">{selectedFile.filename}</h4>
                          <p className="text-xs text-gray-600">
                            {totalRecords} records • {formatFileSize(selectedFile.size_kb)} • Last modified: {formatDate(selectedFile.last_modified)}
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search records..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    {/* Records Table */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {loadingRecords ? (
                        <div className="text-center text-gray-600 py-8">Loading records...</div>
                      ) : records.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          No records found
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {records.map((record, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedRecord(record)}
                              className={`p-3 rounded border cursor-pointer transition-colors ${
                                selectedRecord === record
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {Object.entries(record).slice(0, 6).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-semibold text-gray-600">{key}: </span>
                                    <span className="text-gray-800 truncate inline-block max-w-xs">
                                      {getRecordDisplayValue(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * recordsPerPage) + 1}-{Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Record Detail View */}
                    {selectedRecord && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50" style={{maxHeight: '40%', overflowY: 'auto'}}>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-semibold text-gray-700">Record Detail (Read-Only)</h5>
                          <button
                            onClick={() => setSelectedRecord(null)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Close
                          </button>
                        </div>
                        <div className="bg-white rounded border border-gray-200 p-3 text-xs font-mono overflow-x-auto">
                          <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a file from the sidebar to view its contents
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
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

export default DatabaseExplorerModal;
