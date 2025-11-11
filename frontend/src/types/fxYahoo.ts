/**
 * FX Rates Types - Yahoo Finance (yfinance) integration
 */

export interface FXRatesYahooMeta {
  source: string;
  generated_utc: string;
  total_days: number;
  date_range: {
    start: string | null;
    end: string | null;
  };
  currencies: {
    [key: string]: string;
  };
  notes: string;
}

export interface FXRatesYahooDataPoint {
  date: string;
  VND: number | null;
  TRY: number | null;
  MNT: number | null;
  UZS: number | null;
  AMD: number | null;
  GBP: number | null;
}

export interface FXRatesYahooData {
  meta: FXRatesYahooMeta;
  data: FXRatesYahooDataPoint[];
}

export type CurrencyCode = 'VND' | 'TRY' | 'MNT' | 'UZS' | 'AMD' | 'GBP';
