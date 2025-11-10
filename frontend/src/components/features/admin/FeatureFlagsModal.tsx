import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

interface FeatureFlag {
  enabled: boolean;
  name: string;
  description: string;
  category: string;
  requires_restart: boolean;
  impact: string;
  last_modified: string | null;
  modified_by: string | null;
}

interface FeatureFlagsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Feature Flags Modal
 * Toggle experimental and optional features
 */
const FeatureFlagsModal: React.FC<FeatureFlagsModalProps> = ({ isOpen, onClose }) => {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFeatureFlags();
    }
  }, [isOpen]);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/feature-flags`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.data) {
        setFlags(data.data.flags);
      } else {
        setError(data.message || 'Failed to load feature flags');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flagName: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const flagData = flags[flagName];

    // Confirmation dialog with impact warning
    const action = newValue ? 'enable' : 'disable';
    const confirmMessage = `${action.charAt(0).toUpperCase() + action.slice(1)} "${flagData.name}"?\n\nImpact: ${flagData.impact}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setToggling(flagName);
      setMessage(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${flagName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ enabled: newValue })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || `Successfully ${action}d ${flagData.name}`
        });

        // Update local state
        setFlags(prev => ({
          ...prev,
          [flagName]: {
            ...prev[flagName],
            enabled: newValue,
            last_modified: new Date().toISOString(),
            modified_by: data.data?.flag_data?.modified_by || null
          }
        }));

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || `Failed to ${action} feature flag`
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : `Failed to ${action} feature flag`
      });
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Never modified';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getCategoryFlags = (category: string) => {
    return Object.entries(flags).filter(([_, flag]) => flag.category === category);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Feature Flags</h3>
            <p className="text-sm text-gray-600 mt-1">Toggle experimental and optional features</p>
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
            <div className="text-center text-gray-600 py-8">Loading feature flags...</div>
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

              {/* Integration Features */}
              {getCategoryFlags('integration').length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Integration Features</h4>
                  <div className="space-y-4">
                    {getCategoryFlags('integration').map(([flagName, flag]) => (
                      <div key={flagName} className="bg-white rounded-lg p-4 border border-gray-300">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-gray-900">{flag.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {flag.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              <strong>Impact:</strong> {flag.impact}
                            </p>
                            {flag.last_modified && (
                              <p className="text-xs text-gray-500">
                                Last modified: {formatDate(flag.last_modified)}
                                {flag.modified_by && ` by ${flag.modified_by}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggle(flagName, flag.enabled)}
                            disabled={toggling === flagName}
                            className={`ml-4 px-4 py-2 rounded font-medium transition-colors ${
                              flag.enabled
                                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                            } disabled:cursor-not-allowed`}
                          >
                            {toggling === flagName ? 'Updating...' : (flag.enabled ? 'Disable' : 'Enable')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Management Features */}
              {getCategoryFlags('data_management').length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Data Management Features</h4>
                  <div className="space-y-4">
                    {getCategoryFlags('data_management').map(([flagName, flag]) => (
                      <div key={flagName} className="bg-white rounded-lg p-4 border border-gray-300">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-gray-900">{flag.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {flag.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              <strong>Impact:</strong> {flag.impact}
                            </p>
                            {flag.last_modified && (
                              <p className="text-xs text-gray-500">
                                Last modified: {formatDate(flag.last_modified)}
                                {flag.modified_by && ` by ${flag.modified_by}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggle(flagName, flag.enabled)}
                            disabled={toggling === flagName}
                            className={`ml-4 px-4 py-2 rounded font-medium transition-colors ${
                              flag.enabled
                                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                            } disabled:cursor-not-allowed`}
                          >
                            {toggling === flagName ? 'Updating...' : (flag.enabled ? 'Disable' : 'Enable')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UI Features */}
              {getCategoryFlags('ui').length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">UI Features</h4>
                  <div className="space-y-4">
                    {getCategoryFlags('ui').map(([flagName, flag]) => (
                      <div key={flagName} className="bg-white rounded-lg p-4 border border-gray-300">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-gray-900">{flag.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {flag.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              <strong>Impact:</strong> {flag.impact}
                            </p>
                            {flag.last_modified && (
                              <p className="text-xs text-gray-500">
                                Last modified: {formatDate(flag.last_modified)}
                                {flag.modified_by && ` by ${flag.modified_by}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggle(flagName, flag.enabled)}
                            disabled={toggling === flagName}
                            className={`ml-4 px-4 py-2 rounded font-medium transition-colors ${
                              flag.enabled
                                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                            } disabled:cursor-not-allowed`}
                          >
                            {toggling === flagName ? 'Updating...' : (flag.enabled ? 'Disable' : 'Enable')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      Feature flags allow you to enable or disable experimental and optional functionality.
                      Changes take effect immediately unless noted otherwise. Always review the impact before toggling.
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

export default FeatureFlagsModal;
