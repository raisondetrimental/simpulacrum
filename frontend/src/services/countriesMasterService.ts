/**
 * Countries Master Service
 * API client for managing the master list of countries
 */

import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './api';
import { Country, CountryUsage, CountryPreferencesStats } from '../types/countriesMaster';

/**
 * Get all countries from the master list
 */
export const getCountriesMaster = async (): Promise<Country[]> => {
  const result = await apiGet<{ countries: Country[] }>('/api/admin/countries-master');
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch countries master list');
  }
  return result.data.countries;
};

/**
 * Get only active countries (for use in forms)
 * Public endpoint - no admin privileges required
 */
export const getActiveCountries = async (): Promise<Country[]> => {
  try {
    const result = await apiGet<{ countries: Country[] }>('/api/countries-master/active');
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch active countries');
    }
    return result.data.countries;
  } catch (error) {
    console.error('Error fetching active countries:', error);
    throw error;
  }
};

/**
 * Create a new country
 */
export const createCountry = async (country: Omit<Country, 'display_order'>): Promise<Country> => {
  const result = await apiPost<{ country: Country }>('/api/admin/countries-master', country);
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to create country');
  }
  return result.data.country;
};

/**
 * Update an existing country
 */
export const updateCountry = async (id: string, updates: Partial<Country>): Promise<Country> => {
  const result = await apiPut<{ country: Country }>(`/api/admin/countries-master/${id}`, updates);
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to update country');
  }
  return result.data.country;
};

/**
 * Deactivate a country (soft delete)
 */
export const deactivateCountry = async (id: string): Promise<void> => {
  const result = await apiDelete(`/api/admin/countries-master/${id}`);
  if (!result.success) {
    throw new Error(result.message || 'Failed to deactivate country');
  }
};

/**
 * Get usage statistics for all countries
 */
export const getCountryUsage = async (): Promise<CountryUsage[]> => {
  const result = await apiGet<{ usage: CountryUsage[] }>('/api/admin/countries-master/usage');
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch country usage statistics');
  }
  return result.data.usage;
};

/**
 * Export country preferences report to CSV
 */
export const downloadCountryPreferencesCSV = async (filters?: { org_type?: string; country?: string }) => {
  const params = new URLSearchParams();
  if (filters?.org_type) params.append('org_type', filters.org_type);
  if (filters?.country) params.append('country', filters.country);

  const endpoint = `/api/reports/country-preferences/csv?${params.toString()}`;
  const filename = `country_preferences_${new Date().toISOString().split('T')[0]}.csv`;

  return apiDownload(endpoint, filename);
};

/**
 * Export country preferences matrix to CSV
 */
export const downloadCountryMatrixCSV = async () => {
  const filename = `country_preferences_matrix_${new Date().toISOString().split('T')[0]}.csv`;
  return apiDownload('/api/reports/country-preferences/matrix/csv', filename);
};

/**
 * Get country preferences statistics
 */
export const getCountryPreferencesStats = async (): Promise<CountryPreferencesStats> => {
  const result = await apiGet<{ stats: CountryPreferencesStats }>('/api/reports/country-preferences/stats');
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch country preferences statistics');
  }
  return result.data.stats;
};
