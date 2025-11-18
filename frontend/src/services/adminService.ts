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
  ApiResponse,
  AuditLogResponse,
  AuditLogFilters,
  AuditLogStats
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

/**
 * Get audit log entries with filters
 */
export const getAuditLog = async (filters: AuditLogFilters = {}): Promise<ApiResponse<AuditLogResponse>> => {
  const params = new URLSearchParams();

  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());
  if (filters.user_id) params.append('user_id', filters.user_id);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity_type) params.append('entity_type', filters.entity_type);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(`${API_BASE_URL}/api/admin/audit-log?${params.toString()}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (): Promise<ApiResponse<AuditLogStats>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/audit-log/stats`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Export audit log to CSV
 */
export const exportAuditLogCSV = async (filters: AuditLogFilters = {}): Promise<void> => {
  const params = new URLSearchParams();

  if (filters.user_id) params.append('user_id', filters.user_id);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity_type) params.append('entity_type', filters.entity_type);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  params.append('format', 'csv');

  const response = await fetch(`${API_BASE_URL}/api/admin/audit-log?${params.toString()}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to export audit log');
  }

  const data = await response.json();

  // Convert to CSV
  if (data.success && data.data.entries.length > 0) {
    const entries = data.data.entries;
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Affected Count', 'Success', 'Error Message'];
    const csvRows = [
      headers.join(','),
      ...entries.map((entry: any) => [
        entry.timestamp,
        entry.username,
        entry.action,
        entry.entity_type,
        entry.affected_count,
        entry.success ? 'Yes' : 'No',
        entry.error_message || ''
      ].map(field => `"${field}"`).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// ============================================================================
// Shared Announcement Whiteboard
// ============================================================================

export interface Announcement {
  content: string;
  last_updated: string;
  last_updated_by: string;
}

/**
 * Get the shared announcement whiteboard content
 */
export const getAnnouncement = async (): Promise<ApiResponse<Announcement>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/announcement`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Update the shared announcement whiteboard content
 */
export const updateAnnouncement = async (content: string): Promise<ApiResponse<Announcement>> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/announcement`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ content })
  });
  return response.json();
};
