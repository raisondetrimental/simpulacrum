/**
 * Markets service
 * Handles market data and historical yields
 */
import { apiGet, apiPost, ApiResponse } from './api';
import { apiUrl } from '../config';

// Types
export interface HistoricalYieldDataPoint {
  date: string;
  value: number | null;
}

export interface HistoricalYieldDataItem {
  date: string;
  '1_month': number | null;
  '3_month': number | null;
  '6_month': number | null;
  '1_year': number | null;
  '2_year': number | null;
  '3_year': number | null;
  '5_year': number | null;
  '7_year': number | null;
  '10_year': number | null;
  '20_year': number | null;
  '30_year': number | null;
}

export interface HistoricalYield {
  meta: {
    source: string;
    endpoint: string;
    series_ids: { [key: string]: string };
    observation_window_days: number;
    generated_utc: string;
    notes: string;
  };
  data: HistoricalYieldDataItem[];
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
  const result = await apiGet<CorporateBondsYield>('/api/corporate-bonds/yields');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch corporate bonds yields');
  }
  return result.data as CorporateBondsYield;
}

/**
 * Refresh corporate bonds yields data from FRED API
 */
export async function refreshCorporateBondsYields(): Promise<{ success: boolean; message: string }> {
  const result = await apiPost<{ success: boolean; message: string }>('/api/corporate-bonds/yields/refresh');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh corporate bonds yields');
  }
  return result.data as { success: boolean; message: string };
}

/**
 * Get corporate bond spreads (OAS) data from FRED
 */
export async function getCorporateSpreads(): Promise<CorporateSpreadsData> {
  const result = await apiGet<CorporateSpreadsData>('/api/corporate-spreads');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch corporate spreads');
  }
  return result.data as CorporateSpreadsData;
}

/**
 * Refresh corporate spreads data from FRED API
 */
export async function refreshCorporateSpreads(): Promise<{ success: boolean; message: string }> {
  const result = await apiPost<{ success: boolean; message: string }>('/api/corporate-spreads/refresh');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh corporate spreads');
  }
  return result.data as { success: boolean; message: string };
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
  const result = await apiGet<CorporateYieldsData>('/api/corporate-yields');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch corporate yields');
  }
  return result.data as CorporateYieldsData;
}

/**
 * Refresh corporate yields data from FRED API
 */
export async function refreshCorporateYields(): Promise<{ success: boolean; message: string }> {
  const result = await apiPost<{ success: boolean; message: string }>('/api/corporate-yields/refresh');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh corporate yields');
  }
  return result.data as { success: boolean; message: string };
}

// ============================================================================
// Markets Overview (Aggregated Data)
// ============================================================================

export interface MarketsOverviewData {
  timestamp: string;
  us_yields: HistoricalYield | null;
  corporate_bonds: CorporateBondsYield | null;
  corporate_yields: CorporateYieldsData | null;
  corporate_spreads: CorporateSpreadsData | null;
  policy_rates: PolicyRatesData | null;
  fx_rates: any | null; // FX Yahoo data structure
  countries: any[]; // Country fundamentals array
}

/**
 * Get aggregated markets overview data
 */
export async function getMarketsOverview(): Promise<MarketsOverviewData> {
  const result = await apiGet<MarketsOverviewData>('/api/markets/overview');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch markets overview');
  }
  return result.data as MarketsOverviewData;
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
  const result = await apiGet<PolicyRatesData>('/api/policy-rates');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch policy rates');
  }
  return result.data as PolicyRatesData;
}

/**
 * Refresh policy rates data from BIS SDMX API
 */
export async function refreshPolicyRates(): Promise<{ success: boolean; message: string }> {
  const result = await apiPost<{ success: boolean; message: string }>('/api/policy-rates/refresh');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh policy rates');
  }
  return result.data as { success: boolean; message: string };
}

// ============================================================================
// Weekly Report Generation
// ============================================================================

/**
 * Generate and open comprehensive weekly markets HTML report in new window
 */
export async function generateWeeklyMarketsReport(): Promise<void> {
  try {
    // Use apiUrl for consistency but keep custom fetch for HTML response
    const response = await fetch(apiUrl('/api/reports/markets/weekly'), {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate weekly report');
    }

    // Get HTML content
    const htmlContent = await response.text();

    // Open in new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      throw new Error('Failed to open new window. Please check your popup blocker settings.');
    }
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
}

// ============================================================================
// Turkey Yield Curve
// ============================================================================

export interface TurkeyYieldCurveDataPoint {
  maturity: string;
  maturity_text: string;
  maturity_years: number;
  yield: {
    last: number;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
  price: {
    last: number | null;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
  capital_growth: number | null;
  last_update: string;
}

export interface TurkeyYieldCurveData {
  last_updated: string;
  country: string;
  currency: string;
  data_source: string;
  yields: TurkeyYieldCurveDataPoint[];
  notes?: string;
}

/**
 * Fetch Turkey sovereign yield curve data
 */
export async function getTurkeyYieldCurve() {
  const result = await apiGet<TurkeyYieldCurveData>('/api/turkey-yield-curve');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch Turkey yield curve data');
  }
  return result.data as TurkeyYieldCurveData;
}

/**
 * Refresh Turkey yield curve data by running the fetch script
 */
export async function refreshTurkeyYieldCurve() {
  const result = await apiPost<TurkeyYieldCurveData>('/api/refresh/turkey-yield-curve');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh Turkey yield curve data');
  }
  return result.data as TurkeyYieldCurveData;
}

// ============================================================================
// Vietnam Yield Curve
// ============================================================================

export interface VietnamYieldCurveDataPoint {
  maturity: string;
  maturity_text: string;
  maturity_years: number;
  yield: {
    last: number;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
  price: {
    last: number | null;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
  capital_growth: number | null;
  last_update: string;
}

export interface VietnamYieldCurveData {
  last_updated: string;
  country: string;
  currency: string;
  data_source: string;
  yields: VietnamYieldCurveDataPoint[];
  notes?: string;
}

/**
 * Fetch Vietnam sovereign yield curve data
 */
export async function getVietnamYieldCurve() {
  const result = await apiGet<VietnamYieldCurveData>('/api/vietnam-yield-curve');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch Vietnam yield curve data');
  }
  return result.data as VietnamYieldCurveData;
}

/**
 * Refresh Vietnam yield curve data by running the fetch script
 */
export async function refreshVietnamYieldCurve() {
  const result = await apiPost<VietnamYieldCurveData>('/api/refresh/vietnam-yield-curve');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh Vietnam yield curve data');
  }
  return result.data as VietnamYieldCurveData;
}

// ============================================================================
// UK Yield Curve
// ============================================================================

export interface UKYieldCurveDataPoint {
  maturity: string;
  maturity_text: string;
  maturity_years: number;
  yield: {
    last: number;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
  price: {
    last: number | null;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
  capital_growth: number | null;
  last_update: string;
}

export interface UKYieldCurveData {
  last_updated: string;
  country: string;
  currency: string;
  data_source: string;
  yields: UKYieldCurveDataPoint[];
  notes?: string;
}

/**
 * Fetch UK sovereign yield curve data
 */
export async function getUKYieldCurve() {
  const result = await apiGet<UKYieldCurveData>('/api/uk-yield-curve');
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch UK yield curve data');
  }
  return result.data as UKYieldCurveData;
}

/**
 * Refresh UK yield curve data by running the fetch script
 */
export async function refreshUKYieldCurve() {
  const result = await apiPost<UKYieldCurveData>('/api/refresh/uk-yield-curve');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh UK yield curve data');
  }
  return result.data as UKYieldCurveData;
}

// ============================================================================
// Comprehensive Market Data Refresh
// ============================================================================

export interface RefreshResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string | null;
}

export interface RefreshAllResponse {
  success: boolean;
  completed_at: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: RefreshResult[];
}

/**
 * Refresh ALL market data sources (US yields, corporate data, FX, policy rates, yield curves)
 */
export async function refreshAllMarketsData(): Promise<RefreshAllResponse> {
  const result = await apiPost<RefreshAllResponse>('/api/markets/refresh-all');
  if (!result.success) {
    throw new Error(result.message || 'Failed to refresh market data');
  }
  return result.data as RefreshAllResponse;
}