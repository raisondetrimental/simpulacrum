/**
 * Investment Service - Simplified Version
 * API client for investment strategies
 */

import { apiGet, apiPost } from './api';
import { InvestmentMatchesResponse, SavedStrategy } from '../types/investment';

export const getInvestmentStrategies = async (): Promise<{ success: boolean; data: SavedStrategy[] }> => {
  return apiGet<SavedStrategy[]>('/api/investment-strategies') as Promise<{ success: boolean; data: SavedStrategy[] }>;
};

export const saveInvestmentStrategies = async (strategies: SavedStrategy[]): Promise<{ success: boolean; message?: string }> => {
  return apiPost('/api/investment-strategies/save', strategies) as Promise<{ success: boolean; message?: string }>;
};

export const getInvestmentMatches = async (
  preferenceFilters: Record<string, string>,
  ticketRange: { minInvestment: number; maxInvestment: number; unit: string },
  countryFilters?: string[]
): Promise<InvestmentMatchesResponse> => {
  return apiPost<InvestmentMatchesResponse>('/api/investment-matches', {
    preferenceFilters,
    ticketRange,
    countryFilters: countryFilters || null
  }) as Promise<InvestmentMatchesResponse>;
};
