/**
 * Countries Service
 * API client for country fundamentals data
 */

import { apiGet, apiDownload } from './api';
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
  return apiDownload(`/api/countries/${slug}/export/csv`, `${slug}_key_metrics.csv`);
}

/**
 * Export country key metrics to XLSX
 * @param slug - Country slug (e.g., 'armenia', 'mongolia', 'turkiye')
 */
export async function exportCountryXLSX(slug: string): Promise<void> {
  return apiDownload(`/api/countries/${slug}/export/xlsx`, `${slug}_key_metrics.xlsx`);
}
