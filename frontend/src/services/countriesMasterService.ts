/**
 * Countries Master Service
 * API client for managing the master list of countries
 */

import { Country, CountryUsage, CountryPreferencesStats } from '../types/countriesMaster';

const API_BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL || ''
  : 'http://localhost:5000';

/**
 * Get all countries from the master list
 */
export const getCountriesMaster = async (): Promise<Country[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/countries-master`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch countries master list');
  }

  const data = await response.json();
  return data.countries;
};

/**
 * Get only active countries (for use in forms)
 * Public endpoint - no admin privileges required
 */
export const getActiveCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/countries-master/active`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active countries');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch active countries');
    }

    return data.countries;
  } catch (error) {
    console.error('Error fetching active countries:', error);
    throw error;
  }
};

/**
 * Create a new country
 */
export const createCountry = async (country: Omit<Country, 'display_order'>): Promise<Country> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/countries-master`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(country)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create country');
  }

  const data = await response.json();
  return data.country;
};

/**
 * Update an existing country
 */
export const updateCountry = async (id: string, updates: Partial<Country>): Promise<Country> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/countries-master/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update country');
  }

  const data = await response.json();
  return data.country;
};

/**
 * Deactivate a country (soft delete)
 */
export const deactivateCountry = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/countries-master/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to deactivate country');
  }
};

/**
 * Get usage statistics for all countries
 */
export const getCountryUsage = async (): Promise<CountryUsage[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/countries-master/usage`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch country usage statistics');
  }

  const data = await response.json();
  return data.usage;
};

/**
 * Export country preferences report to CSV
 */
export const downloadCountryPreferencesCSV = async (filters?: { org_type?: string; country?: string }) => {
  const params = new URLSearchParams();
  if (filters?.org_type) params.append('org_type', filters.org_type);
  if (filters?.country) params.append('country', filters.country);

  const url = `${API_BASE_URL}/api/reports/country-preferences/csv?${params.toString()}`;

  const response = await fetch(url, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to export country preferences');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `country_preferences_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
};

/**
 * Export country preferences matrix to CSV
 */
export const downloadCountryMatrixCSV = async () => {
  const response = await fetch(`${API_BASE_URL}/api/reports/country-preferences/matrix/csv`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to export country matrix');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `country_preferences_matrix_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Get country preferences statistics
 */
export const getCountryPreferencesStats = async (): Promise<CountryPreferencesStats> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/country-preferences/stats`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch country preferences statistics');
  }

  const data = await response.json();
  return data.stats;
};
