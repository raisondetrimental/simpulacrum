export interface DashboardData {
  metadata: {
    last_updated: string;
    source_file: string;
    generated_by: string;
  };
  sections: {
    sovereign_yields: SovereignYieldsData;
    corporate_yields: CorporateYieldsData;
    fx_rates: FXRatesData;
    central_bank_rates: CentralBankRatesData;
    credit_ratings: CreditRatingsData;
    benchmark_yields: BenchmarkYieldsData;
    summary: SummaryData;
  };
}

export interface SovereignYieldsData {
  domestic_currency: Record<string, Record<string, number>>;
  usd_denominated: Record<string, Record<string, {
    rate: number;
    changes?: {
      '1D': number | null;
      '1W': number | null;
      '1M': number | null;
    };
  }>>;
}

export interface CorporateYieldsData {
  [rating: string]: {
    effective_yield: number;
    changes: {
      '1D': number | null;
      '1W': number | null;
      '1M': number | null;
    };
  };
}

export interface FXRatesData {
  [currency: string]: {
    name: string;
    rate: number;
    changes: {
      '1D': number | null;
      '1W': number | null;
      '1M': number | null;
    };
  };
}

export interface CentralBankRatesData {
  [country: string]: {
    policy_rate: number;
  };
}

export interface CreditRatingsData {
  [rating: string]: {
    benchmark_yields: {
      '10Y': number;
    };
  };
}

export interface BenchmarkYieldsData {
  [country: string]: Record<string, number>;
}

export interface SummaryData {
  total_countries: number;
  fx_pairs: number;
  credit_ratings: number;
  corporate_ratings: number;
  key_metrics: Record<string, string>;
}