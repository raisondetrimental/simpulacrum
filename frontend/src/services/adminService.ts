/**
 * System Administration API Service
 */
import { apiGet, apiPost, apiPut, apiDownload, apiFetch } from './api';
import { apiUrl } from '../config';
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
  return apiGet<SystemStats>('/api/admin/stats');
};

/**
 * List all database files with metadata
 */
export const getDatabaseFiles = async (): Promise<ApiResponse<DatabaseFile[]>> => {
  return apiGet<DatabaseFile[]>('/api/admin/database/files');
};

/**
 * Get total database size breakdown
 */
export const getDatabaseSize = async (): Promise<ApiResponse<DatabaseSizeInfo>> => {
  return apiGet<DatabaseSizeInfo>('/api/admin/database/size');
};

/**
 * List available log files
 */
export const getSystemLogs = async (): Promise<ApiResponse<LogFile[]>> => {
  return apiGet<LogFile[]>('/api/admin/logs');
};

/**
 * Download a specific log file
 */
export const downloadLogFile = async (filename: string): Promise<void> => {
  return apiDownload(`/api/admin/logs/${filename}`, filename);
};

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<ApiResponse<SystemHealth>> => {
  return apiGet<SystemHealth>('/api/admin/system/health');
};

/**
 * Manually trigger database backup
 */
export const triggerBackup = async (): Promise<ApiResponse<BackupResult>> => {
  return apiPost<BackupResult>('/api/admin/database/backup');
};

/**
 * Get security configuration (read-only)
 */
export const getSecurityConfig = async (): Promise<ApiResponse<any>> => {
  return apiGet('/api/admin/config/security');
};

/**
 * Get API keys (masked)
 */
export const getApiKeys = async (): Promise<ApiResponse<any>> => {
  return apiGet('/api/admin/config/api-keys');
};

/**
 * Update API key
 */
export const updateApiKey = async (keyName: string, apiKey: string): Promise<ApiResponse<any>> => {
  return apiPut(`/api/admin/config/api-keys/${keyName}`, { api_key: apiKey });
};

/**
 * Test API key validity
 */
export const testApiKey = async (keyName: string, apiKey: string): Promise<ApiResponse<any>> => {
  return apiPost('/api/admin/config/api-keys/test', { key_name: keyName, api_key: apiKey });
};

/**
 * Get archive statistics
 */
export const getArchiveStats = async (): Promise<ApiResponse<any>> => {
  return apiGet('/api/admin/archive/stats');
};

/**
 * Archive records
 */
export const archiveRecords = async (entityType: string, recordIds: string[]): Promise<ApiResponse<any>> => {
  return apiPost(`/api/admin/archive/${entityType}`, { record_ids: recordIds });
};

/**
 * List archived records
 */
export const listArchivedRecords = async (entityType: string, limit?: number, offset?: number): Promise<ApiResponse<any>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  return apiGet(`/api/admin/archive/${entityType}/list?${params.toString()}`);
};

/**
 * Restore archived records
 */
export const restoreArchivedRecords = async (entityType: string, recordIds: string[]): Promise<ApiResponse<any>> => {
  return apiPost(`/api/admin/archive/${entityType}/restore`, { record_ids: recordIds });
};

/**
 * Scan for data quality issues
 */
export const scanDataIssues = async (): Promise<ApiResponse<any>> => {
  return apiGet('/api/admin/cleanup/scan');
};

/**
 * Fix data quality issues
 */
export const fixDataIssues = async (fixType: string, recordIds: string[]): Promise<ApiResponse<any>> => {
  return apiPost('/api/admin/cleanup/fix', { fix_type: fixType, record_ids: recordIds });
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
  return apiPost('/api/admin/bulk/update', {
    entity_type: entityType,
    filters,
    updates,
    dry_run: dryRun
  });
};

/**
 * Bulk export records
 */
export const bulkExportRecords = async (
  entityType: string,
  filters: any,
  format: 'csv' | 'json' = 'csv'
): Promise<Response> => {
  const response = await fetch(apiUrl('/api/admin/bulk/export'), {
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
  return apiGet('/api/admin/feature-flags');
};

/**
 * Toggle a feature flag
 */
export const toggleFeatureFlag = async (flagName: string, enabled: boolean): Promise<ApiResponse<any>> => {
  return apiPut(`/api/admin/feature-flags/${flagName}`, { enabled });
};

/**
 * Get metadata for a specific feature flag
 */
export const getFeatureFlagMetadata = async (flagName: string): Promise<ApiResponse<any>> => {
  return apiGet(`/api/admin/feature-flags/${flagName}/metadata`);
};

/**
 * Reset all feature flags to defaults
 */
export const resetFeatureFlags = async (): Promise<ApiResponse<any>> => {
  return apiPost('/api/admin/feature-flags/reset');
};

/**
 * Get all API endpoints (optionally grouped by blueprint)
 */
export const getApiEndpoints = async (grouped: boolean = true): Promise<ApiResponse<any>> => {
  return apiGet(`/api/admin/api-playground/endpoints?grouped=${grouped}`);
};

/**
 * Search API endpoints
 */
export const searchApiEndpoints = async (query: string): Promise<ApiResponse<any>> => {
  return apiGet(`/api/admin/api-playground/endpoints/search?q=${encodeURIComponent(query)}`);
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
  return apiPost('/api/admin/api-playground/execute', {
    path,
    method,
    headers,
    query_params: queryParams,
    body
  });
};

/**
 * List database files (optionally grouped by category)
 */
export const getDatabaseExplorerFiles = async (grouped: boolean = true): Promise<ApiResponse<any>> => {
  return apiGet(`/api/admin/database-explorer/files?grouped=${grouped}`);
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

  return apiGet(`/api/admin/database-explorer/files/${filename}?${params}`);
};

/**
 * Get schema for a database file
 */
export const getDatabaseFileSchema = async (filename: string): Promise<ApiResponse<any>> => {
  return apiGet(`/api/admin/database-explorer/files/${filename}/schema`);
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

  return apiGet(`/api/admin/audit-log?${params.toString()}`);
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (): Promise<ApiResponse<AuditLogStats>> => {
  return apiGet<AuditLogStats>('/api/admin/audit-log/stats');
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

  const response = await fetch(apiUrl(`/api/admin/audit-log?${params.toString()}`), {
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
  return apiGet<Announcement>('/api/admin/announcement');
};

/**
 * Update the shared announcement whiteboard content
 */
export const updateAnnouncement = async (content: string): Promise<ApiResponse<Announcement>> => {
  return apiPut<Announcement>('/api/admin/announcement', { content });
};
