/**
 * User Management Type Definitions
 */

export interface User {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}
