/**
 * Application configuration
 * Uses environment variables for API URL with fallback to localhost
 */

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
export const API_URL = API_BASE_URL.replace(/\/$/, '');

// Helper function for API calls
export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};
