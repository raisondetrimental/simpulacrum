/**
 * Investment Strategies Types - Simplified Version
 */

export interface InvestmentProfile {
  profile_id: string;
  entity_id: string;
  name: string;
  organization_name: string;
  category: 'capital_partner' | 'sponsor' | 'agent' | 'counsel';
  relationship?: string | null;
  ticket_min?: number | null;
  ticket_max?: number | null;
  currency?: string | null;
  preferences: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  team_name?: string;
  parent_org_id: string;
  parent_org_name: string;
  parent_org_type: 'capital_partner' | 'sponsor' | 'agent' | 'counsel';
  relationship?: string | null;
  last_contact_date?: string | null;
  next_contact_reminder?: string | null;
  meeting_history_count: number;
}

export interface InvestmentMatchesResponse {
  success: boolean;
  counts: {
    capital_partners: number;
    sponsors: number;
    agents: number;
    counsel: number;
  };
  results: {
    capital_partners: InvestmentProfile[];
    sponsors: InvestmentProfile[];
    agents: InvestmentProfile[];
    counsel: InvestmentProfile[];
  };
  all_contacts: Contact[];
  contact_stats: {
    total: number;
    overdue_reminders: number;
    upcoming_reminders: number;
  };
  message?: string;
}

export interface SavedStrategy {
  id: string;
  name: string;
  preferenceFilters: Record<string, 'any' | 'Y' | 'N'>;
  sizeFilter: {
    minInvestment: number;
    maxInvestment: number;
  };
  createdAt: string;
}
