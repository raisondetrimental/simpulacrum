/**
 * System Administration Type Definitions
 */

export interface SystemStats {
  users: UserStats;
  crm: CRMStats;
  deals: DealsStats;
  database: DatabaseStats;
  whiteboard: WhiteboardStats;
  timestamp: string;
}

export interface UserStats {
  total: number;
  active: number;
  admin: number;
  super_admin: number;
}

export interface CRMStats {
  organizations: number;
  by_type: Record<string, number>;
  contacts: number;
  reminders_due: number;
  overdue_reminders: number;
}

export interface DealsStats {
  total: number;
  by_status: Record<string, number>;
  total_value: number;
}

export interface DatabaseStats {
  size_mb: number;
  json_size_mb: number;
  storage_size_mb: number;
  file_count: number;
  backup_count: number;
  last_backup: string | null;
}

export interface WhiteboardStats {
  total_posts: number;
  weekly_posts: number;
  general_posts: number;
}

export interface DatabaseFile {
  filename: string;
  path: string;
  size: number;
  size_kb: number;
  last_modified: string;
  type: 'database' | 'generated';
}

export interface DatabaseSizeInfo {
  total_mb: number;
  by_type: {
    json_database_mb: number;
    generated_storage_mb: number;
  };
}

export interface LogFile {
  filename: string;
  size: number;
  size_kb: number;
  created: string;
  modified: string;
  type: string;
}

export interface SystemHealth {
  status: 'online' | 'degraded' | 'error';
  services: {
    database: 'ok' | 'error';
    storage: 'ok' | 'error';
    users: 'ok' | 'error';
  };
  timestamp: string;
  message?: string;
}

export interface BackupResult {
  backed_up: string[];
  failed: string[];
  backup_path: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  action: string;
  entity_type: string;
  affected_ids: string[];
  affected_count: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata: Record<string, any>;
  success: boolean;
  error_message?: string;
}

export interface AuditLogPagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  pagination: AuditLogPagination;
}

export interface AuditLogFilters {
  user_id?: string;
  action?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  total_entries: number;
  by_action: Record<string, number>;
  by_user: Record<string, number>;
  by_entity_type: Record<string, number>;
  successful_operations: number;
  failed_operations: number;
  success_rate: number;
}
