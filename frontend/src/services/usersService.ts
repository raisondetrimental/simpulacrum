/**
 * User Management API Service
 */
import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, ApiResponse } from '../types/users';

/**
 * Get all users
 */
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  return apiGet<User[]>('/api/users');
};

/**
 * Get a specific user by ID
 */
export const getUser = async (userId: string): Promise<ApiResponse<User>> => {
  return apiGet<User>(`/api/users/${userId}`);
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
  return apiPost<User>('/api/users', userData);
};

/**
 * Update user details (not password)
 */
export const updateUser = async (userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> => {
  return apiPut<User>(`/api/users/${userId}`, userData);
};

/**
 * Change user password
 */
export const changePassword = async (userId: string, passwordData: ChangePasswordRequest): Promise<ApiResponse> => {
  return apiPut(`/api/users/${userId}/password`, passwordData);
};

/**
 * Delete (deactivate) a user
 */
export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  return apiDelete(`/api/users/${userId}`);
};
