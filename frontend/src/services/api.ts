/**
 * Base API client for Meridian Dashboard
 * Provides common fetch utilities and error handling
 */

// Get API URL from config
import { apiUrl } from '../config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  success: false;
  message: string;
  status?: number;
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = apiUrl(endpoint);

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // If not JSON, it's likely an authentication redirect (HTML)
    if (!isJson) {
      console.error('[API] Non-JSON response received - likely authentication redirect');
      // This usually means Flask-Login redirected to login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return {
        success: false,
        message: 'Authentication required - redirecting to login',
      } as ApiResponse<T>;
    }

    // Handle authentication errors (401 Unauthorized)
    if (response.status === 401) {
      console.error('[API] 401 Unauthorized received');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return {
        success: false,
        message: 'Authentication required',
      } as ApiResponse<T>;
    }

    const data = await response.json();

    if (!response.ok) {
      throw {
        success: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return data;
  } catch (error: any) {
    console.error(`[API] Error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * GET request
 */
export async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { method: 'DELETE' });
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<ApiResponse> {
  return apiGet('/api/health');
}
