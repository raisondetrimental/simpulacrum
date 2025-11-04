import { apiGet, apiPost } from './api';
import type { FXRatesData } from '../types/dashboard';

export interface FXRatesResponse {
  last_updated: string;
  source: string;
  base_currency: string;
  rates: FXRatesData;
}

export const fxService = {
  /**
   * Get latest FX rates from local storage
   */
  async getLatest(): Promise<FXRatesResponse> {
    const response = await apiGet<FXRatesResponse>('/api/fx-rates/latest');
    return response.data!;
  },

  /**
   * Refresh FX rates from ExchangeRate-API
   */
  async refresh(): Promise<FXRatesResponse> {
    const response = await apiPost<FXRatesResponse>('/api/fx-rates/refresh');
    return response.data!;
  }
};
