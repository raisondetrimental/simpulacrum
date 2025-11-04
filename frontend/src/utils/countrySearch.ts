/**
 * Country Search Utility
 * Cross-tab search functionality for country reports
 */

import type { CountryFundamentals, CountryCompleteData } from '../types/country';

export interface TabSearchResult {
  tabId: string;
  matchCount: number;
  matches: string[]; // Sample of matching text snippets
}

/**
 * Searches specific fields and returns match info
 */
const searchFields = (obj: any, fields: string[], query: string, maxMatches = 5): Set<string> => {
  const matches = new Set<string>();
  if (!query || matches.size >= maxMatches) return matches;

  const lowerQuery = query.toLowerCase();

  for (const field of fields) {
    if (matches.size >= maxMatches) break;

    const value = obj[field];
    if (value === null || value === undefined) continue;

    if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
      // Extract context around match
      const index = value.toLowerCase().indexOf(lowerQuery);
      const start = Math.max(0, index - 40);
      const end = Math.min(value.length, index + query.length + 40);
      let snippet = value.substring(start, end).trim();

      if (start > 0) snippet = '...' + snippet;
      if (end < value.length) snippet = snippet + '...';

      matches.add(`${field}: ${snippet}`);
    } else if (typeof value === 'number' && value.toString().includes(query)) {
      matches.add(`${field}: ${value}`);
    }
  }

  return matches;
};

/**
 * Search across all tabs in country data
 */
export const searchCountryData = (
  fundamentals: CountryFundamentals,
  completeData: CountryCompleteData,
  query: string,
  hasStructuredData: boolean
): Map<string, TabSearchResult> => {
  const results = new Map<string, TabSearchResult>();

  if (!query.trim()) {
    return results;
  }

  const imf = completeData.IMF_Article_IV;

  // Search Overview tab (fundamentals) - search all fundamentals fields
  const overviewFields = ['name', 'capital', 'region', 'government_type'];
  const overviewMatches = searchFields(fundamentals, overviewFields, query);

  // Also search industries
  if (fundamentals.top_industries) {
    fundamentals.top_industries.forEach(ind => {
      if (ind.name.toLowerCase().includes(query.toLowerCase())) {
        overviewMatches.add(`Industry: ${ind.name}`);
      }
    });
  }

  if (overviewMatches.size > 0) {
    results.set('overview', {
      tabId: 'overview',
      matchCount: overviewMatches.size,
      matches: Array.from(overviewMatches)
    });
  }

  // Search Macro Analysis tab - macro-specific fields
  const macroFields = [
    'macro_overview', 'policy_stance', 'key_risks',
    'gdp_growth_current', 'gdp_growth_forecast',
    'inflation_current', 'inflation_outlook',
    'fiscal_balance_current', 'fiscal_balance_outlook',
    'public_debt_current', 'public_debt_trajectory',
    'monetary_policy_current', 'monetary_policy_outlook',
    'exchange_rate_current', 'exchange_rate_policy',
    'reserves_current', 'reserves_adequacy',
    'current_account_current', 'current_account_outlook',
    'baseline_growth_outlook', 'fiscal_consolidation_path'
  ];
  const macroMatches = searchFields(imf, macroFields, query);
  if (macroMatches.size > 0) {
    results.set('macro', {
      tabId: 'macro',
      matchCount: macroMatches.size,
      matches: Array.from(macroMatches)
    });
  }

  // Search Financial Sector tab (structured data only) - FSI fields
  if (hasStructuredData) {
    const financialFields = [
      'fsi_car', 'fsi_npl', 'fsi_roe', 'fsi_lcr',
      'macroprudential_measures',
      'financial_sector_overview', 'banking_sector_risks',
      'financial_sector_reforms', 'npl_ratio',
      'capital_adequacy', 'profitability_liquidity'
    ];
    const financialMatches = searchFields(imf, financialFields, query);
    if (financialMatches.size > 0) {
      results.set('financial', {
        tabId: 'financial',
        matchCount: financialMatches.size,
        matches: Array.from(financialMatches)
      });
    }

    // Search Capital Markets tab - DSA and debt fields
    const capitalMarketsFields = [
      'dsa_risk_rating', 'dsa_heatmap_summary',
      'gross_financing_needs_gdp', 'stress_tests_bind',
      'debt_profile', 'fiscal_rules',
      'sovereign_issuance_notes', 'investor_base_notes', 'market_depth_notes'
    ];
    const capitalMarketsMatches = searchFields(imf, capitalMarketsFields, query);
    if (capitalMarketsMatches.size > 0) {
      results.set('capital-markets', {
        tabId: 'capital-markets',
        matchCount: capitalMarketsMatches.size,
        matches: Array.from(capitalMarketsMatches)
      });
    }
  }

  // Search Strategy tab - EBRD/ADB data
  if (completeData.EBRD_ADB) {
    const strategyMatches = new Set<string>();
    const ebrdData = completeData.EBRD_ADB;

    // Search all string fields in EBRD_ADB
    for (const key in ebrdData) {
      if (strategyMatches.size >= 5) break;
      const value = ebrdData[key];
      if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
        const index = value.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, index - 40);
        const end = Math.min(value.length, index + query.length + 40);
        let snippet = value.substring(start, end).trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < value.length) snippet = snippet + '...';
        strategyMatches.add(snippet);
      }
    }

    if (strategyMatches.size > 0) {
      results.set('strategy', {
        tabId: 'strategy',
        matchCount: strategyMatches.size,
        matches: Array.from(strategyMatches)
      });
    }
  }

  // Search Infrastructure tab - IMI data
  if (completeData.IMI) {
    const infraMatches = new Set<string>();
    const imiData = completeData.IMI;

    // Search all string fields in IMI
    for (const key in imiData) {
      if (infraMatches.size >= 5) break;
      const value = imiData[key];
      if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
        const index = value.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, index - 40);
        const end = Math.min(value.length, index + query.length + 40);
        let snippet = value.substring(start, end).trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < value.length) snippet = snippet + '...';
        infraMatches.add(snippet);
      }
    }

    if (infraMatches.size > 0) {
      results.set('infrastructure', {
        tabId: 'infrastructure',
        matchCount: infraMatches.size,
        matches: Array.from(infraMatches)
      });
    }
  }

  // Search Climate tab (narrative format only) - climate fields
  if (!hasStructuredData) {
    const climateFields = [
      'climate_vulnerability', 'energy_transition',
      'climate_risks', 'climate_policy'
    ];
    const climateMatches = searchFields(imf, climateFields, query);
    if (climateMatches.size > 0) {
      results.set('climate', {
        tabId: 'climate',
        matchCount: climateMatches.size,
        matches: Array.from(climateMatches)
      });
    }
  }

  return results;
};
