import React, { useState, useEffect } from 'react';
import { apiGet } from '../../../services/api';

interface SecurityConfig {
  cors: {
    enabled: boolean;
    allowed_origins: string[];
    supports_credentials: boolean;
  };
  session: {
    permanent_session_lifetime: string;
    session_cookie_secure: boolean;
    session_cookie_httponly: boolean;
    session_cookie_samesite: string;
  };
  authentication: {
    bcrypt_log_rounds: number;
    login_required_endpoints: boolean;
    remember_me_enabled: boolean;
  };
  environment: {
    flask_env: string;
    debug_mode: boolean;
    testing_mode: boolean;
  };
  timestamp: string;
}

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Security Settings Modal (Read-Only)
 * Displays current CORS, session, and authentication settings
 */
const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSecurityConfig();
    }
  }, [isOpen]);

  const fetchSecurityConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet('/api/admin/config/security');

      if (data.success && data.data) {
        setConfig(data.data);
      } else {
        setError(data.message || 'Failed to load security configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security configuration');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Security Settings</h3>
            <p className="text-sm text-gray-600 mt-1">View current security configuration (read-only)</p>
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
            <div className="text-center text-gray-600 py-8">Loading security configuration...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : config ? (
            <div className="space-y-6">
              {/* CORS Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">CORS Configuration</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">CORS Enabled:</span>
                    <span className={`text-sm font-semibold ${config.cors.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {config.cors.enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Supports Credentials:</span>
                    <span className={`text-sm font-semibold ${config.cors.supports_credentials ? 'text-green-600' : 'text-gray-600'}`}>
                      {config.cors.supports_credentials ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-700 block mb-2">Allowed Origins:</span>
                    <div className="bg-white rounded border border-gray-200 p-3">
                      {config.cors.allowed_origins.length > 0 ? (
                        <ul className="space-y-1">
                          {config.cors.allowed_origins.map((origin, index) => (
                            <li key={index} className="text-sm font-mono text-gray-800">
                              {origin}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No origins configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Session Configuration</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Session Lifetime:</span>
                    <span className="text-sm font-mono text-gray-800">{config.session.permanent_session_lifetime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Secure Cookies:</span>
                    <span className={`text-sm font-semibold ${config.session.session_cookie_secure ? 'text-green-600' : 'text-yellow-600'}`}>
                      {config.session.session_cookie_secure ? 'Enabled' : 'Disabled (Dev Mode)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">HttpOnly Cookies:</span>
                    <span className={`text-sm font-semibold ${config.session.session_cookie_httponly ? 'text-green-600' : 'text-red-600'}`}>
                      {config.session.session_cookie_httponly ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">SameSite Policy:</span>
                    <span className="text-sm font-mono text-gray-800">{config.session.session_cookie_samesite}</span>
                  </div>
                </div>
              </div>

              {/* Authentication Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Authentication</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Password Hashing:</span>
                    <span className="text-sm font-mono text-gray-800">bcrypt (rounds: {config.authentication.bcrypt_log_rounds})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Login Required:</span>
                    <span className={`text-sm font-semibold ${config.authentication.login_required_endpoints ? 'text-green-600' : 'text-red-600'}`}>
                      {config.authentication.login_required_endpoints ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Remember Me:</span>
                    <span className={`text-sm font-semibold ${config.authentication.remember_me_enabled ? 'text-green-600' : 'text-gray-600'}`}>
                      {config.authentication.remember_me_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Environment Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Environment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Flask Environment:</span>
                    <span className="text-sm font-mono text-gray-800">{config.environment.flask_env}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Debug Mode:</span>
                    <span className={`text-sm font-semibold ${config.environment.debug_mode ? 'text-yellow-600' : 'text-green-600'}`}>
                      {config.environment.debug_mode ? 'Enabled (Dev)' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Testing Mode:</span>
                    <span className={`text-sm font-semibold ${config.environment.testing_mode ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {config.environment.testing_mode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
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
                      Security settings are read-only and can only be modified through the backend configuration files.
                      For production deployments, ensure Secure Cookies are enabled and Debug Mode is disabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {config && `Last updated: ${new Date(config.timestamp).toLocaleString()}`}
          </div>
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

export default SecuritySettingsModal;
