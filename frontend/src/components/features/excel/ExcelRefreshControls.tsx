import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../../services/api';

interface RefreshOperation {
  id: string;
  action: string;
  status: 'idle' | 'started' | 'running' | 'completed' | 'failed' | 'partial_success';
  message: string;
  progress: number;
  completed_at?: number;
}

interface LastOperationTimes {
  lastRefresh?: string;
  lastArchive?: string;
}

const ExcelRefreshControls: React.FC = () => {
  const [operations, setOperations] = useState<Record<string, RefreshOperation>>({});
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');
  const [lastOperationTimes, setLastOperationTimes] = useState<LastOperationTimes>({});

  // Load last operation times from localStorage on component mount
  useEffect(() => {
    const savedTimes = localStorage.getItem('excel_operation_times');
    if (savedTimes) {
      setLastOperationTimes(JSON.parse(savedTimes));
    }
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await apiPost('/api/excel/test', {});

      setConnectionStatus(result.success ? 'connected' : 'failed');

      if (!result.success) {
        alert(`Connection test failed: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus('failed');
      alert(`Connection test failed: ${error}`);
    }
  };

  const regenerateJson = async () => {
    try {
      const result = await apiPost('/api/excel/regenerate-json', {});

      if (result.success) {
        // Force page reload to clear cache and fetch new JSON
        if (confirm('Dashboard JSON regenerated successfully! Click OK to reload the page and see updated data.')) {
          window.location.reload();
        }
      } else {
        throw new Error(result.message || 'Failed to regenerate JSON');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const detailedMessage = errorMessage.includes('Failed to fetch')
        ? `Cannot connect to API server. Please ensure:\n1. Flask API is running (python api/excel_api.py)\n2. Server is accessible at port 5000\n3. No firewall blocking the connection`
        : `JSON regeneration failed: ${errorMessage}`;

      alert(detailedMessage);
      console.error('Failed to regenerate JSON:', error);
    }
  };

  const triggerOperation = async (action: 'refresh' | 'archive' | 'refresh-and-archive') => {
    try {
      const result = await apiPost(`/api/excel/${action}`, {});

      if (result.operation_id) {
        const newOperation: RefreshOperation = {
          id: result.operation_id,
          action,
          status: 'started',
          message: result.message,
          progress: 0
        };

        setOperations(prev => ({
          ...prev,
          [result.operation_id]: newOperation
        }));

        // Start polling for status
        pollOperationStatus(result.operation_id);
      } else {
        throw new Error(result.message || 'No operation ID returned');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const detailedMessage = errorMessage.includes('Failed to fetch')
        ? `Cannot connect to API server. Please ensure:\n1. Flask API is running (python api/excel_api.py)\n2. Server is accessible at port 5000\n3. No firewall blocking the connection`
        : `Excel ${action} operation failed: ${errorMessage}`;

      alert(detailedMessage);
      console.error(`Failed to trigger ${action}:`, error);
    }
  };

  const pollOperationStatus = async (operationId: string) => {
    try {
      const status = await apiGet(`/api/excel/status/${operationId}`);

      setOperations(prev => ({
        ...prev,
        [operationId]: status
      }));

      // If operation completed successfully, update last operation times
      if (status.status === 'completed' && status.completed_at) {
        const completedTime = new Date(status.completed_at * 1000).toISOString();

        let updatedTimes: LastOperationTimes = { ...lastOperationTimes };

        if (status.action === 'refresh' || status.action === 'both') {
          updatedTimes.lastRefresh = completedTime;
        }
        if (status.action === 'archive' || status.action === 'both') {
          updatedTimes.lastArchive = completedTime;
        }

        setLastOperationTimes(updatedTimes);
        localStorage.setItem('excel_operation_times', JSON.stringify(updatedTimes));
      }

      // Continue polling if operation is still running
      if (status.status === 'started' || status.status === 'running') {
        setTimeout(() => pollOperationStatus(operationId), 2000);
      }
    } catch (error) {
      console.error(`Failed to poll status for ${operationId}:`, error);
    }
  };

  const getButtonClass = (disabled: boolean = false) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    if (disabled) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'partial_success': return 'text-yellow-600';
      case 'running': case 'started': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const hasRunningOperations = Object.values(operations).some(
    op => op.status === 'started' || op.status === 'running'
  );


  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Excel Data Controls</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'failed' ? 'bg-red-500' :
            connectionStatus === 'testing' ? 'bg-yellow-500' :
            'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600">
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'failed' ? 'Connection Failed' :
             connectionStatus === 'testing' ? 'Testing...' :
             'Unknown'}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> These controls execute Excel macros which can be a security risk.
              Only use with trusted Excel files. Ensure Excel is not open in another window.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className={getButtonClass(connectionStatus === 'testing')}
        >
          {connectionStatus === 'testing' ? 'Testing Connection...' : 'Test Excel Connection'}
        </button>
      </div>

      {/* Last Operation Times */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Last Operation Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Data Refresh:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDateTime(lastOperationTimes.lastRefresh)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Data Archive:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDateTime(lastOperationTimes.lastArchive)}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => triggerOperation('refresh')}
          disabled={hasRunningOperations}
          className={getButtonClass(hasRunningOperations)}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data (C5)
          </div>
        </button>

        <button
          onClick={() => triggerOperation('archive')}
          disabled={hasRunningOperations}
          className={getButtonClass(hasRunningOperations)}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m-6-6h7m0 0V4m-6 10l6-6m-6 6v4a2 2 0 002 2h4m4-4l-6-6m6 6h-7m0 0v7" />
            </svg>
            Archive Data (C7)
          </div>
        </button>

        <button
          onClick={regenerateJson}
          disabled={hasRunningOperations}
          className={getButtonClass(hasRunningOperations)}
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate JSON
          </div>
        </button>
      </div>

      {/* Operations Status */}
      {Object.keys(operations).length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operation Status</h3>
          <div className="space-y-3">
            {Object.values(operations)
              .sort((a, b) => b.id.localeCompare(a.id))
              .slice(0, 5) // Show last 5 operations
              .map((operation) => (
                <div key={operation.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {operation.action.replace('-', ' & ')}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(operation.status)} capitalize`}>
                      {operation.status.replace('_', ' ')}
                    </span>
                  </div>

                  {operation.progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${operation.progress}%` }}
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-600">{operation.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelRefreshControls;