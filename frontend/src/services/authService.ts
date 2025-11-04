/**
 * Authentication service
 */
import { apiGet, apiPost, ApiResponse } from './api';

export interface User {
  id: string;
  username: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

/**
 * Login with username and password
 */
export async function login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
  return apiPost('/api/auth/login', credentials);
}

/**
 * Logout current user
 */
export async function logout(): Promise<ApiResponse> {
  return apiPost('/api/auth/logout');
}

/**
 * Check authentication status
 */
export async function getAuthStatus(): Promise<ApiResponse<AuthStatus>> {
  return apiGet('/api/auth/status');
}
