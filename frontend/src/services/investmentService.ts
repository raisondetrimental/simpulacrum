/**
 * Investment Service - Simplified Version
 * API client for investment strategies
 */

import { API_BASE_URL } from '../config';
import { InvestmentMatchesResponse, SavedStrategy } from '../types/investment';

export const getInvestmentStrategies = async (): Promise<{ success: boolean; data: SavedStrategy[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/investment-strategies`, {
    credentials: 'include'
  });
  return response.json();
};

export const saveInvestmentStrategies = async (strategies: SavedStrategy[]): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/investment-strategies/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(strategies),
    credentials: 'include'
  });
  return response.json();
};

export const getInvestmentMatches = async (
  preferenceFilters: Record<string, string>,
  ticketRange: { minInvestment: number; maxInvestment: number; unit: string }
): Promise<InvestmentMatchesResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/investment-matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferenceFilters,
      ticketRange
    }),
    credentials: 'include'
  });
  return response.json();
};
