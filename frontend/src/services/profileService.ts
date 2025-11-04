/**
 * Profile Management API Service
 * For users to manage their own account
 */
import { API_BASE_URL } from '../config';

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
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Update current user's profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> => {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Change current user's password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
};
