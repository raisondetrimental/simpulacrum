/**
 * Profile Management API Service
 * For users to manage their own account
 */
import { apiGet, apiPut } from './api';

export interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ApiResponse<ProfileData>> => {
  return apiGet<ProfileData>('/api/profile');
};

/**
 * Update current user's profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> => {
  return apiPut<ProfileData>('/api/profile', data);
};

/**
 * Change current user's password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse> => {
  return apiPut('/api/profile/password', data);
};
