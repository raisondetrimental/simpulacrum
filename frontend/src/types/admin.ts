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
