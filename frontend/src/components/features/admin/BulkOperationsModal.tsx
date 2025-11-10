import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bulk Operations Modal
 * Bulk update fields and export data
 */
const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'update' | 'export'>('update');
  const [entityType, setEntityType] = useState<'organizations' | 'contacts' | 'deals'>('organizations');

  // Bulk Update State
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [updateField, setUpdateField] = useState('');
  const [updateValue, setUpdateValue] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  // Bulk Export State
  const [exportFilterField, setExportFilterField] = useState('');
  const [exportFilterValue, setExportFilterValue] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exporting, setExporting] = useState(false);

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handlePreview = async () => {
    if (!updateField || !updateValue) {
      setMessage({type: 'error', text: 'Please specify both update field and value'});
      return;
    }

    try {
      setUpdating(true);
      setMessage(null);

      const filters = filterField && filterValue ? {[filterField]: filterValue} : {};
      const updates = {[updateField]: updateValue};

      const response = await fetch(`${API_BASE_URL}/api/admin/bulk/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          entity_type: entityType,
          filters,
          updates,
          dry_run: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.data);
        setMessage({
          type: 'success',
          text: `Preview: ${data.data.matched_count} records will be updated`
        });
      } else {
        setMessage({type: 'error', text: data.message || 'Failed to preview updates'});
      }
    } catch (err) {
      setMessage({type: 'error', text: err instanceof Error ? err.message : 'Failed to preview'});
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyUpdate = async () => {
    if (!preview || preview.matched_count === 0) {
      setMessage({type: 'error', text: 'Please preview changes first'});
      return;
    }

    if (!confirm(`Apply updates to ${preview.matched_count} ${entityType}? This cannot be undone.`)) {
      return;
    }

    try {
      setUpdating(true);
      setMessage(null);

      const filters = filterField && filterValue ? {[filterField]: filterValue} : {};
      const updates = {[updateField]: updateValue};

      const response = await fetch(`${API_BASE_URL}/api/admin/bulk/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          entity_type: entityType,
          filters,
          updates,
          dry_run: false
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully updated ${data.data.updated_count} ${entityType}`
        });
        setPreview(null);
        // Reset form
        setFilterField('');
        setFilterValue('');
        setUpdateField('');
        setUpdateValue('');
      } else {
        setMessage({type: 'error', text: data.message || 'Failed to apply updates'});
      }
    } catch (err) {
      setMessage({type: 'error', text: err instanceof Error ? err.message : 'Failed to apply updates'});
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);

      const filters = exportFilterField && exportFilterValue ? {[exportFilterField]: exportFilterValue} : undefined;

      const response = await fetch(`${API_BASE_URL}/api/admin/bulk/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          entity_type: entityType,
          filters,
          format: exportFormat
        })
      });

      if (response.ok) {
        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entityType}_export.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage({type: 'success', text: `Successfully exported ${entityType}`});
      } else {
        const data = await response.json();
        setMessage({type: 'error', text: data.message || 'Failed to export'});
      }
    } catch (err) {
      setMessage({type: 'error', text: err instanceof Error ? err.message : 'Failed to export'});
    } finally {
      setExporting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Bulk Operations</h3>
            <p className="text-sm text-gray-600 mt-1">Mass update and export records</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Entity Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setEntityType('organizations')}
                className={`px-4 py-2 rounded ${
                  entityType === 'organizations'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Organizations
              </button>
              <button
                onClick={() => setEntityType('contacts')}
                className={`px-4 py-2 rounded ${
                  entityType === 'contacts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Contacts
              </button>
              <button
                onClick={() => setEntityType('deals')}
                className={`px-4 py-2 rounded ${
                  entityType === 'deals'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Deals
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('update')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'update'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bulk Update
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bulk Export
              </button>
            </div>
          </div>

          {/* Bulk Update Tab */}
          {activeTab === 'update' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Filter Records (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                    <input
                      type="text"
                      value={filterField}
                      onChange={(e) => setFilterField(e.target.value)}
                      placeholder="e.g., country, status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      placeholder="e.g., USA, active"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-3">Update Fields</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                    <input
                      type="text"
                      value={updateField}
                      onChange={(e) => setUpdateField(e.target.value)}
                      placeholder="e.g., relationship, starred"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Value *</label>
                    <input
                      type="text"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      placeholder="e.g., Strong, true"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {preview && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Preview</h4>
                  <p className="text-sm text-gray-700">
                    <strong>{preview.matched_count}</strong> {entityType} will be updated
                  </p>
                  {preview.preview && preview.preview.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-semibold mb-1">Sample records:</p>
                      <div className="max-h-32 overflow-y-auto">
                        {preview.preview.map((record: any, idx: number) => (
                          <div key={idx} className="mb-1">
                            {record.name || record.deal_name || record.id}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handlePreview}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? 'Loading...' : 'Preview Changes'}
                </button>
                <button
                  onClick={handleApplyUpdate}
                  disabled={updating || !preview}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Apply Updates
                </button>
              </div>
            </div>
          )}

          {/* Bulk Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Filter Records (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                    <input
                      type="text"
                      value={exportFilterField}
                      onChange={(e) => setExportFilterField(e.target.value)}
                      placeholder="e.g., country, status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={exportFilterValue}
                      onChange={(e) => setExportFilterValue(e.target.value)}
                      placeholder="e.g., USA, active"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Export Format</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">CSV (Excel-compatible)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={() => setExportFormat('json')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">JSON (for import)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {exporting ? 'Exporting...' : `Export ${entityType} to ${exportFormat.toUpperCase()}`}
              </button>
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

export default BulkOperationsModal;
