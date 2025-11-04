/**
 * User Management API Service
 */
import { API_BASE_URL } from '../config';
import type { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, ApiResponse } from '../types/users';

/**
 * Get all users
 */
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Get a specific user by ID
 */
export const getUser = async (userId: string): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    credentials: 'include'
  });
  return response.json();
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return response.json();
};

/**
 * Update user details (not password)
 */
export const updateUser = async (userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return response.json();
};

/**
 * Change user password
 */
export const changePassword = async (userId: string, passwordData: ChangePasswordRequest): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(passwordData),
  });
  return response.json();
};

/**
 * Delete (deactivate) a user
 */
export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
};
