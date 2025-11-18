/**
 * Types for Countries Master management
 * Admin-configurable list of countries for investment preferences
 */

export interface Country {
  id: string;
  name: string;
  active: boolean;
  display_order: number;
}

export interface CountryUsage {
  id: string;
  name: string;
  active: boolean;
  count: number;
  by_type?: Record<string, number>;
  organizations: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export interface CountryPreferencesStats {
  total_organizations: number;
  organizations_with_countries: number;
  by_type: Record<string, number>;
  by_country: Record<string, {
    name: string;
    count: number;
    by_type: Record<string, number>;
  }>;
}
