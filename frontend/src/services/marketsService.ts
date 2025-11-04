/**
 * Markets service
 * Handles market data and historical yields
 */
import { apiGet, ApiResponse } from './api';

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

// Historical Yields API
/**
 * Get USA historical yields (3 months of data)
 */
export async function getHistoricalYieldsUSA(): Promise<ApiResponse<HistoricalYield>> {
  return apiGet('/api/historical-yields/usa');
}
