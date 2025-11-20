import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../../../services/api';

interface ApiKey {
  name: string;
  key_name: string;
  masked_value: string;
  configured: boolean;
  description: string;
  endpoint: string;
}

// ApiKeysData interface removed - not needed

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * API Configuration Modal
 * Allows editing of existing API keys (ExchangeRate API, etc.)
 */
const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchApiKeys();
    }
  }, [isOpen]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet('/api/admin/config/api-keys');

      if (data.success && data.data) {
        setApiKeys(data.data.api_keys);
      } else {
        setError(data.message || 'Failed to load API keys');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (keyId: string) => {
    setEditingKey(keyId);
    setNewKeyValue('');
    setTestResult(null);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setNewKeyValue('');
    setTestResult(null);
  };

  const handleTest = async (keyName: string) => {
    if (!newKeyValue.trim()) {
      setTestResult({type: 'error', message: 'Please enter an API key to test'});
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const data = await apiPost('/api/admin/config/api-keys/test', {
        key_name: keyName,
        api_key: newKeyValue.trim()
      });

      if (data.success) {
        setTestResult({type: 'success', message: data.message || 'API key is valid'});
      } else {
        setTestResult({type: 'error', message: data.message || 'API key test failed'});
      }
    } catch (err) {
      setTestResult({type: 'error', message: err instanceof Error ? err.message : 'Test failed'});
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (keyName: string) => {
    if (!newKeyValue.trim()) {
      setTestResult({type: 'error', message: 'Please enter an API key'});
      return;
    }

    if (!confirm(`Update ${keyName}? This will be saved to the .env file.`)) {
      return;
    }

    try {
      setSaving(true);
      setTestResult(null);

      const data = await apiPut(`/api/admin/config/api-keys/${keyName}`, {
        api_key: newKeyValue.trim()
      });

      if (data.success) {
        setTestResult({type: 'success', message: 'API key updated successfully'});
        // Refresh the keys list
        await fetchApiKeys();
        // Close edit mode after short delay
        setTimeout(() => {
          handleCancel();
        }, 1500);
      } else {
        setTestResult({type: 'error', message: data.message || 'Failed to update API key'});
      }
    } catch (err) {
      setTestResult({type: 'error', message: err instanceof Error ? err.message : 'Failed to update API key'});
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">API Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">Manage API keys for external services</p>
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
          {loading ? (
            <div className="text-center text-gray-600 py-8">Loading API configuration...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(apiKeys).map(([keyId, apiKey]) => (
                <div key={keyId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{apiKey.description}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{apiKey.endpoint}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      apiKey.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>

                  {editingKey === keyId ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={newKeyValue}
                          onChange={(e) => setNewKeyValue(e.target.value)}
                          placeholder="Enter new API key"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {testResult && (
                        <div className={`p-3 rounded-md ${
                          testResult.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {testResult.message}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTest(apiKey.key_name)}
                          disabled={testing || saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {testing ? 'Testing...' : 'Test Key'}
                        </button>
                        <button
                          onClick={() => handleSave(apiKey.key_name)}
                          disabled={testing || saving}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={testing || saving}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-700">Current Value: </span>
                        <span className="text-sm font-mono text-gray-900">{apiKey.masked_value}</span>
                      </div>
                      <button
                        onClick={() => handleEdit(keyId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit Key
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {Object.keys(apiKeys).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No API keys configured
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> API keys are stored in the .env file and will be persisted across restarts.
                      Always test the key before saving to ensure it works correctly.
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

export default ApiConfigModal;
