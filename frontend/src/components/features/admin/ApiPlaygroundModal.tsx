import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../../services/api';

interface Endpoint {
  path: string;
  methods: string[];
  blueprint: string;
  blueprint_label: string;
  endpoint: string;
  description: string;
  requires_auth: boolean;
}

interface ApiPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiResponse {
  status_code: number;
  status_text: string;
  headers: Record<string, string>;
  body: any;
  execution_time_ms: number;
}

/**
 * API Playground Modal
 * Test internal API endpoints directly from the UI
 */
const ApiPlaygroundModal: React.FC<ApiPlaygroundModalProps> = ({ isOpen, onClose }) => {
  const [groupedEndpoints, setGroupedEndpoints] = useState<Record<string, Endpoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request builder state
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [requestMethod, setRequestMethod] = useState('GET');
  const [requestPath, setRequestPath] = useState('');
  const [requestHeaders, setRequestHeaders] = useState<Array<{key: string, value: string}>>([]);
  const [requestParams, setRequestParams] = useState<Array<{key: string, value: string}>>([]);
  const [requestBody, setRequestBody] = useState('');

  // Response state
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [executing, setExecuting] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);

  // UI state
  const [expandedBlueprints, setExpandedBlueprints] = useState<Set<string>>(new Set(['auth', 'deals']));

  useEffect(() => {
    if (isOpen) {
      fetchEndpoints();
    }
  }, [isOpen]);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet('/api/admin/api-playground/endpoints?grouped=true');

      if (data.success && data.data) {
        setGroupedEndpoints(data.data.endpoints);
      } else {
        setError(data.message || 'Failed to load endpoints');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEndpoint = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestPath(endpoint.path);
    setRequestMethod(endpoint.methods[0]); // Default to first available method
    setRequestHeaders([]);
    setRequestParams([]);
    setRequestBody('');
    setResponse(null);
    setResponseError(null);
  };

  const toggleBlueprint = (blueprint: string) => {
    setExpandedBlueprints(prev => {
      const next = new Set(prev);
      if (next.has(blueprint)) {
        next.delete(blueprint);
      } else {
        next.add(blueprint);
      }
      return next;
    });
  };

  const addHeader = () => {
    setRequestHeaders([...requestHeaders, {key: '', value: ''}]);
  };

  const removeHeader = (index: number) => {
    setRequestHeaders(requestHeaders.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...requestHeaders];
    updated[index][field] = value;
    setRequestHeaders(updated);
  };

  const addParam = () => {
    setRequestParams([...requestParams, {key: '', value: ''}]);
  };

  const removeParam = (index: number) => {
    setRequestParams(requestParams.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...requestParams];
    updated[index][field] = value;
    setRequestParams(updated);
  };

  const handleExecute = async () => {
    if (!requestPath) {
      setResponseError('Please select an endpoint');
      return;
    }

    try {
      setExecuting(true);
      setResponse(null);
      setResponseError(null);

      // Build headers object
      const headers: Record<string, string> = {};
      requestHeaders.forEach(h => {
        if (h.key && h.value) {
          headers[h.key] = h.value;
        }
      });

      // Build params object
      const params: Record<string, string> = {};
      requestParams.forEach(p => {
        if (p.key && p.value) {
          params[p.key] = p.value;
        }
      });

      // Parse body if present
      let body = null;
      if (requestBody && requestBody.trim()) {
        try {
          body = JSON.parse(requestBody);
        } catch (e) {
          setResponseError('Invalid JSON in request body');
          return;
        }
      }

      const data = await apiPost('/api/admin/api-playground/execute', {
        path: requestPath,
        method: requestMethod,
        headers,
        query_params: params,
        body
      });

      if (data.success && data.data) {
        setResponse(data.data);
      } else {
        setResponseError(data.message || 'Request failed');
      }
    } catch (err) {
      setResponseError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">API Playground</h3>
            <p className="text-sm text-gray-600 mt-1">Test internal API endpoints</p>
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
              Loading endpoints...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
              </div>
            </div>
          ) : (
            <>
              {/* Left Sidebar - Endpoints */}
              <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Endpoints</h4>
                  {Object.entries(groupedEndpoints).map(([blueprint, endpoints]) => (
                    <div key={blueprint} className="mb-2">
                      <button
                        onClick={() => toggleBlueprint(blueprint)}
                        className="w-full text-left flex items-center justify-between px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        <span className="text-xs font-medium text-gray-700">
                          {endpoints[0]?.blueprint_label || blueprint}
                        </span>
                        <span className="text-gray-400">
                          {expandedBlueprints.has(blueprint) ? '▼' : '▶'}
                        </span>
                      </button>
                      {expandedBlueprints.has(blueprint) && (
                        <div className="ml-2 mt-1 space-y-1">
                          {endpoints.map((endpoint, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectEndpoint(endpoint)}
                              className={`w-full text-left px-2 py-1 rounded text-xs ${
                                selectedEndpoint?.path === endpoint.path
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                {endpoint.methods.map(method => (
                                  <span
                                    key={method}
                                    className={`px-1 rounded text-[10px] font-mono ${
                                      method === 'GET' ? 'bg-green-100 text-green-800' :
                                      method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                      method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                      method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {method}
                                  </span>
                                ))}
                              </div>
                              <div className="font-mono truncate">{endpoint.path.replace('/api/', '')}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center/Right - Request Builder & Response */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Request Builder */}
                <div className="p-6 border-b border-gray-200 overflow-y-auto" style={{maxHeight: '50%'}}>
                  <h4 className="text-lg font-semibold mb-4">Request</h4>

                  {/* Method & Path */}
                  <div className="mb-4 flex gap-2">
                    <select
                      value={requestMethod}
                      onChange={(e) => setRequestMethod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    >
                      {selectedEndpoint?.methods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      )) || <option value="GET">GET</option>}
                    </select>
                    <input
                      type="text"
                      value={requestPath}
                      onChange={(e) => setRequestPath(e.target.value)}
                      placeholder="/api/..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    />
                  </div>

                  {selectedEndpoint && (
                    <p className="text-xs text-gray-600 mb-4">{selectedEndpoint.description}</p>
                  )}

                  {/* Headers */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Headers</label>
                      <button onClick={addHeader} className="text-xs text-blue-600 hover:text-blue-800">
                        + Add Header
                      </button>
                    </div>
                    {requestHeaders.map((header, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                          placeholder="Header name"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={() => removeHeader(idx)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Query Params */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Query Parameters</label>
                      <button onClick={addParam} className="text-xs text-blue-600 hover:text-blue-800">
                        + Add Parameter
                      </button>
                    </div>
                    {requestParams.map((param, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => updateParam(idx, 'key', e.target.value)}
                          placeholder="Parameter name"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateParam(idx, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={() => removeParam(idx)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Body (JSON) */}
                  {['POST', 'PUT', 'PATCH'].includes(requestMethod) && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Body (JSON)</label>
                      <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-xs font-mono"
                      />
                    </div>
                  )}

                  {/* Execute Button */}
                  <button
                    onClick={handleExecute}
                    disabled={executing || !requestPath}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {executing ? 'Executing...' : 'Send Request'}
                  </button>
                </div>

                {/* Response Viewer */}
                <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                  <h4 className="text-lg font-semibold mb-4">Response</h4>

                  {responseError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-4">
                      {responseError}
                    </div>
                  )}

                  {response && (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded font-semibold ${
                          response.status_code >= 200 && response.status_code < 300
                            ? 'bg-green-100 text-green-800'
                            : response.status_code >= 400
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {response.status_code} {response.status_text}
                        </span>
                        <span className="text-sm text-gray-600">
                          {response.execution_time_ms}ms
                        </span>
                      </div>

                      {/* Headers */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Headers</h5>
                        <div className="bg-white rounded border border-gray-200 p-3 text-xs font-mono max-h-32 overflow-y-auto">
                          {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="text-blue-600">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Body */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Body</h5>
                        <div className="bg-white rounded border border-gray-200 p-3 text-xs font-mono overflow-x-auto">
                          <pre>{JSON.stringify(response.body, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {!response && !responseError && (
                    <p className="text-sm text-gray-500">No response yet. Send a request to see results.</p>
                  )}
                </div>
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

export default ApiPlaygroundModal;
