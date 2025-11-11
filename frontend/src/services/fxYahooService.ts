/**
 * FX Rates Service - Yahoo Finance (yfinance) integration
 */
import { API_BASE_URL } from '../config';
import type { FXRatesYahooData, CurrencyCode } from '../types/fxYahoo';

export const fxYahooService = {
  /**
   * Get FX rates from Yahoo Finance (90 days of historical data)
   */
  async getYahooRates(): Promise<FXRatesYahooData> {
    const response = await fetch(`${API_BASE_URL}/api/fx-rates-yahoo`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch FX rates from Yahoo Finance');
    }

    return response.json();
  },

  /**
   * Refresh FX rates from Yahoo Finance (fetch last 7 days, add only new dates)
   */
  async refreshYahooRates(): Promise<{ success: boolean; message: string; output?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/fx-rates-yahoo/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to refresh FX rates from Yahoo Finance');
    }

    return response.json();
  },

  /**
   * Get latest rates for all currencies in a format compatible with country pages
   * Returns structure matching old ExchangeRate API format
   */
  async getLatest(): Promise<{
    rates: {
      [key: string]: {
        rate: number;
        name: string;
        changes: {
          '1D': number | null;
          '1W': number | null;
          '1M': number | null;
        };
      };
    };
  }> {
    const data = await this.getYahooRates();

    const rates: { [key: string]: any } = {};

    // For each currency, extract latest rate and calculate changes
    const currencies: CurrencyCode[] = ['VND', 'TRY', 'MNT', 'UZS', 'AMD', 'GBP'];

    for (const currency of currencies) {
      // Find latest non-null value
      let latestRate: number | null = null;
      let latestIndex = -1;

      for (let i = data.data.length - 1; i >= 0; i--) {
        if (data.data[i][currency] !== null) {
          latestRate = data.data[i][currency];
          latestIndex = i;
          break;
        }
      }

      if (latestRate === null) continue;

      // Calculate changes
      const findValueAtIndex = (daysBack: number): number | null => {
        const targetIndex = Math.max(0, latestIndex - daysBack);
        for (let i = targetIndex; i >= 0; i--) {
          if (data.data[i][currency] !== null) {
            return data.data[i][currency];
          }
        }
        return null;
      };

      const day1Value = findValueAtIndex(1);
      const week1Value = findValueAtIndex(7);
      const month1Value = findValueAtIndex(30);

      const calculateChange = (oldValue: number | null): number | null => {
        if (latestRate === null || oldValue === null) return null;
        return ((latestRate - oldValue) / oldValue) * 100;
      };

      rates[currency] = {
        rate: latestRate,
        name: data.meta.currencies[currency],
        changes: {
          '1D': calculateChange(day1Value),
          '1W': calculateChange(week1Value),
          '1M': calculateChange(month1Value)
        }
      };
    }

    return { rates };
  }
};
