/**
 * Markets service
 * Handles market data and historical yields
 */
import { apiGet, ApiResponse } from './api';
import { API_BASE_URL } from '../config';

// Types
export interface HistoricalYieldDataPoint {
  date: string;
  value: number | null;
}

export interface HistoricalYield {
  dates: string[];
  maturities: {
    '1M': (number | null)[];
    '3M': (number | null)[];
    '6M': (number | null)[];
    '1Y': (number | null)[];
    '2Y': (number | null)[];
    '3Y': (number | null)[];
    '5Y': (number | null)[];
    '7Y': (number | null)[];
    '10Y': (number | null)[];
    '20Y': (number | null)[];
    '30Y': (number | null)[];
    [maturity: string]: (number | null)[];
  };
}

export interface CorporateBondsYield {
  meta: {
    source: string;
    endpoint: string;
    series_ids: { [key: string]: string };
    observation_window_days: number;
    generated_utc: string;
    notes: string;
  };
  data: {
    date: string;
    aaa: number | null;
    aa: number | null;
    a: number | null;
    bbb: number | null;
    bb: number | null;
    high_yield: number | null;
  }[];
}

export interface CorporateSpreadsData {
  meta: {
    source: string;
    endpoint: string;
    series_ids: { [key: string]: string };
    generated_utc: string;
    notes: string;
    total_days: number;
    date_range: {
      start: string | null;
      end: string | null;
    };
  };
  data: {
    date: string;
    global_hy: number | null;
    global_ig: number | null;
    em_corporate: number | null;
    em_asia: number | null;
    em_emea: number | null;
    em_latam: number | null;
  }[];
}

// Historical Yields API
/**
 * Get USA historical yields (3 months of data)
 */
export async function getHistoricalYieldsUSA(): Promise<ApiResponse<HistoricalYield>> {
  return apiGet('/api/historical-yields/usa');
}

/**
 * Get corporate bonds yields (90 days of data from FRED)
 */
export async function getCorporateBondsYields(): Promise<CorporateBondsYield> {
  const response = await fetch(`${API_BASE_URL}/api/corporate-bonds/yields`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch corporate bonds yields');
  }

  return response.json();
}

/**
 * Refresh corporate bonds yields data from FRED API
 */
export async function refreshCorporateBondsYields(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/corporate-bonds/yields/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh corporate bonds yields');
  }

  return response.json();
}

/**
 * Get corporate bond spreads (OAS) data from FRED
 */
export async function getCorporateSpreads(): Promise<CorporateSpreadsData> {
  const response = await fetch(`${API_BASE_URL}/api/corporate-spreads`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch corporate spreads');
  }

  return response.json();
}

/**
 * Refresh corporate spreads data from FRED API
 */
export async function refreshCorporateSpreads(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/corporate-spreads/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh corporate spreads');
  }

  return response.json();
}

export interface CorporateYieldsData {
  meta: {
    source: string;
    endpoint: string;
    series_ids: { [key: string]: string };
    generated_utc: string;
    notes: string;
    total_days: number;
    date_range: {
      start: string | null;
      end: string | null;
    };
  };
  data: {
    date: string;
    global_hy: number | null;
    global_ig_bbb: number | null;
    em_corporate: number | null;
    em_asia: number | null;
    em_emea: number | null;
    em_latam: number | null;
  }[];
}

/**
 * Get corporate bond yields (Effective Yields) data from FRED
 */
export async function getCorporateYields(): Promise<CorporateYieldsData> {
  const response = await fetch(`${API_BASE_URL}/api/corporate-yields`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch corporate yields');
  }

  return response.json();
}

/**
 * Refresh corporate yields data from FRED API
 */
export async function refreshCorporateYields(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/corporate-yields/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh corporate yields');
  }

  return response.json();
}

// ============================================================================
// Policy Rates (BIS SDMX)
// ============================================================================

export interface PolicyRatesData {
  meta: {
    source: string;
    endpoint: string;
    dataset: string;
    countries: { [key: string]: string };
    generated_utc: string;
    notes: string;
    total_days: number;
    date_range: {
      start: string | null;
      end: string | null;
    };
  };
  data: {
    date: string;
    US: number | null;
    GB: number | null;
    KR: number | null;
    AU: number | null;
    TR: number | null;
    XM: number | null;
  }[];
}

/**
 * Get policy rates data from BIS SDMX
 */
export async function getPolicyRates(): Promise<PolicyRatesData> {
  const response = await fetch(`${API_BASE_URL}/api/policy-rates`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch policy rates');
  }

  return response.json();
}

/**
 * Refresh policy rates data from BIS SDMX API
 */
export async function refreshPolicyRates(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/policy-rates/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh policy rates');
  }

  return response.json();
}
