/**
 * Investment service (Investment Strategies & Matching)
 * Handles investment strategies, profiles, and cross-CRM matching
 */
import { apiGet, apiPost, ApiResponse } from './api';

// Types
export interface InvestmentStrategy {
  id: string;
  name: string;
  description?: string;
  criteria: {
    ticket_size_min?: number;
    ticket_size_max?: number;
    preferences?: Record<string, any>;
    countries?: string[];
    infrastructure_types?: string[];
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface InvestmentProfile {
  id: string;
  entity_type: 'capital_partner' | 'sponsor';
  entity_id: string;
  name: string;
  ticket_size_min?: number;
  ticket_size_max?: number;
  preferences: Record<string, any>;
  countries?: string[];
  infrastructure_types?: string[];
  metadata?: {
    parent_entity_id?: string;
    parent_entity_name?: string;
    [key: string]: any;
  };
}

export interface InvestmentMatch {
  capital_partner_profile: InvestmentProfile;
  sponsor_profile: InvestmentProfile;
  match_score: number;
  compatibility_details: {
    preferences_match: boolean;
    ticket_size_overlap: boolean;
    geographic_fit: boolean;
    sector_fit: boolean;
    [key: string]: any;
  };
}

export interface MatchRequest {
  strategy: InvestmentStrategy;
}

export interface MatchResponse {
  strategy_id: string;
  total_matches: number;
  matches: InvestmentMatch[];
  filtered_capital_partners: number;
  filtered_sponsors: number;
}

// Investment Strategies API
/**
 * Get all saved investment strategies
 */
export async function getInvestmentStrategies(): Promise<ApiResponse<InvestmentStrategy[]>> {
  return apiGet('/api/investment-strategies');
}

/**
 * Save investment strategies
 */
export async function saveInvestmentStrategies(strategies: InvestmentStrategy[]): Promise<ApiResponse<{ count: number }>> {
  return apiPost('/api/investment-strategies/save', { strategies });
}

// Investment Profiles API
/**
 * Get all investment profiles (normalized from CRM data)
 */
export async function getInvestmentProfiles(): Promise<ApiResponse<InvestmentProfile[]>> {
  return apiGet('/api/investment-profiles');
}

// Investment Matching API
/**
 * Get cross-CRM matches for an investment strategy
 */
export async function getInvestmentMatches(strategy: InvestmentStrategy): Promise<ApiResponse<MatchResponse>> {
  return apiPost('/api/investment-matches', { strategy });
}
