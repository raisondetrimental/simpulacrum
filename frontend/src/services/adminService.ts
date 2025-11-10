/**
 * System Administration API Service
 */
import { API_BASE_URL } from '../config';
import type {
  SystemStats,
  DatabaseFile,
  DatabaseSizeInfo,
  LogFile,
  SystemHealth,
  BackupResult,
  ApiResponse
} from '../types/admin';

/**
 * Get comprehensive system statistics
 */
export const getSystemStats = async (): Promise<ApiResponse<SystemStats>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * List all database files with metadata
 */
export const getDatabaseFiles = async (): Promise<ApiResponse<DatabaseFile[]>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/database/files`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get total database size breakdown
 */
export const getDatabaseSize = async (): Promise<ApiResponse<DatabaseSizeInfo>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/database/size`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * List available log files
 */
export const getSystemLogs = async (): Promise<ApiResponse<LogFile[]>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Download a specific log file
 */
export const downloadLogFile = async (filename: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/logs/${filename}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to download log file');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<ApiResponse<SystemHealth>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/system/health`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Manually trigger database backup
 */
export const triggerBackup = async (): Promise<ApiResponse<BackupResult>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/database/backup`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get security configuration (read-only)
 */
export const getSecurityConfig = async (): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/config/security`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get API keys (masked)
 */
export const getApiKeys = async (): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/config/api-keys`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Update API key
 */
export const updateApiKey = async (keyName: string, apiKey: string): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/config/api-keys/${keyName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ api_key: apiKey })
  });
  return response.json();
};

/**
 * Test API key validity
 */
export const testApiKey = async (keyName: string, apiKey: string): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/config/api-keys/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ key_name: keyName, api_key: apiKey })
  });
  return response.json();
};

/**
 * Get archive statistics
 */
export const getArchiveStats = async (): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/archive/stats`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Archive records
 */
export const archiveRecords = async (entityType: string, recordIds: string[]): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/archive/${entityType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ record_ids: recordIds })
  });
  return response.json();
};

/**
 * List archived records
 */
export const listArchivedRecords = async (entityType: string, limit?: number, offset?: number): Promise<ApiResponse<any>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const response = await fetch(`${API_BASE_URL}/api/admin/archive/${entityType}/list?${params.toString()}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Restore archived records
 */
export const restoreArchivedRecords = async (entityType: string, recordIds: string[]): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/archive/${entityType}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ record_ids: recordIds })
  });
  return response.json();
};

/**
 * Scan for data quality issues
 */
export const scanDataIssues = async (): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/cleanup/scan`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Fix data quality issues
 */
export const fixDataIssues = async (fixType: string, recordIds: string[]): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/cleanup/fix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ fix_type: fixType, record_ids: recordIds })
  });
  return response.json();
};

/**
 * Bulk update records
 */
export const bulkUpdateRecords = async (
  entityType: string,
  filters: any,
  updates: any,
  dryRun: boolean = true
): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/bulk/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ entity_type: entityType, filters, updates, dry_run: dryRun })
  });
  return response.json();
};

/**
 * Bulk export records
 */
export const bulkExportRecords = async (
  entityType: string,
  filters: any,
  format: 'csv' | 'json' = 'csv'
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/bulk/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ entity_type: entityType, filters, format })
  });
  return response;
};

/**
 * Get all feature flags
 */
export const getFeatureFlags = async (): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/feature-flags`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Toggle a feature flag
 */
export const toggleFeatureFlag = async (flagName: string, enabled: boolean): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${flagName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  return response.json();
};

/**
 * Get metadata for a specific feature flag
 */
export const getFeatureFlagMetadata = async (flagName: string): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${flagName}/metadata`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Reset all feature flags to defaults
 */
export const resetFeatureFlags = async (): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/feature-flags/reset`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get all API endpoints (optionally grouped by blueprint)
 */
export const getApiEndpoints = async (grouped: boolean = true): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/api-playground/endpoints?grouped=${grouped}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Search API endpoints
 */
export const searchApiEndpoints = async (query: string): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/api-playground/endpoints/search?q=${encodeURIComponent(query)}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Execute an API request through the playground
 */
export const executeApiRequest = async (
  path: string,
  method: string,
  headers: Record<string, string> = {},
  queryParams: Record<string, string> = {},
  body: any = null
): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/api-playground/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ path, method, headers, query_params: queryParams, body })
  });
  return response.json();
};

/**
 * List database files (optionally grouped by category)
 */
export const getDatabaseExplorerFiles = async (grouped: boolean = true): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/database-explorer/files?grouped=${grouped}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Read records from a database file
 */
export const readDatabaseFile = async (
  filename: string,
  limit: number = 50,
  offset: number = 0,
  search: string = ''
): Promise<ApiResponse<any>> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  });
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/database-explorer/files/${filename}?${params}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get schema for a database file
 */
export const getDatabaseFileSchema = async (filename: string): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/database-explorer/files/${filename}/schema`, {
    credentials: 'include'
  });
  return response.json();
};
