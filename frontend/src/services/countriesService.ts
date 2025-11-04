/**
 * Countries Service
 * API client for country fundamentals data
 */

import { apiGet } from './api';
import { apiUrl } from '../config';
import type { CountryFundamentals, CountryListItem, CountryCompleteData } from '../types/country';

/**
 * Get list of all countries
 */
export async function getAllCountries() {
  return apiGet<CountryListItem[]>('/api/countries');
}

/**
 * Get detailed fundamentals for a specific country
 * @param slug - Country slug (e.g., 'armenia', 'mongolia', 'turkiye')
 */
export async function getCountryFundamentals(slug: string) {
  return apiGet<CountryFundamentals>(`/api/countries/${slug}`);
}

/**
 * Get comprehensive country data including IMF, EBRD/ADB, and IMI sections
 * @param slug - Country slug (e.g., 'armenia', 'mongolia', 'turkiye')
 */
export async function getCountryCompleteData(slug: string) {
  return apiGet<CountryCompleteData>(`/api/countries/${slug}/complete`);
}

/**
 * Export country key metrics to CSV
 * @param slug - Country slug (e.g., 'armenia', 'mongolia', 'turkiye')
 */
export async function exportCountryCSV(slug: string): Promise<void> {
  try {
    const url = apiUrl(`/api/countries/${slug}/export/csv`);

    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to export CSV: ${response.statusText}`);
    }

    // Create blob from response
    const blob = await response.blob();

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${slug}_key_metrics.csv`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error exporting country CSV:', error);
    throw error;
  }
}

/**
 * Export country key metrics to XLSX
 * @param slug - Country slug (e.g., 'armenia', 'mongolia', 'turkiye')
 */
export async function exportCountryXLSX(slug: string): Promise<void> {
  try {
    const url = apiUrl(`/api/countries/${slug}/export/xlsx`);

    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to export XLSX: ${response.statusText}`);
    }

    // Create blob from response
    const blob = await response.blob();

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${slug}_key_metrics.xlsx`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error exporting country XLSX:', error);
    throw error;
  }
}
