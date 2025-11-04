export interface InvestmentProfile {
  profile_id: string;
  category: 'capital_partner' | 'capital_partner_team' | 'sponsor';
  entity_id: string;
  name: string;
  organization_name: string;
  relationship?: string | null;
  currency?: string | null;
  ticket_min?: number | null;
  ticket_max?: number | null;
  preferences: Record<string, string>;
  capital_partner_id?: string | null;
  capital_partner_name?: string | null;
  metadata?: Record<string, unknown>;
}

export interface MatchEntrySummary {
  profile_id: string;
  entity_id: string;
  name: string;
  organization_name: string;
  capital_partner_id?: string | null;
  capital_partner_name?: string | null;
  overlap_preferences: string[];
  overlap_size: number;
  ticket_overlap: {
    min: number | null;
    max: number | null;
  };
  ticket_min?: number | null;
  ticket_max?: number | null;
  relationship?: string | null;
}

export interface SponsorMatchEntry {
  sponsor_profile: InvestmentProfile;
  capital_partners: MatchEntrySummary[];
  capital_partner_teams: MatchEntrySummary[];
}

export interface InvestmentMatchesResponse {
  success: boolean;
  generated_at?: string;
  preference_keys: string[];
  filters_applied: {
    preferenceFilters: Record<string, string>;
    ticketRange: Record<string, unknown>;
    includeCategories: string[];
  };
  counts: {
    capital_partners: number;
    capital_partner_teams: number;
    sponsors: number;
  };
  results: {
    capital_partners: InvestmentProfile[];
    capital_partner_teams: InvestmentProfile[];
    sponsors: InvestmentProfile[];
  };
  pairings: {
    by_sponsor: SponsorMatchEntry[];
  };
  message?: string;
}
