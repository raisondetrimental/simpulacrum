/**
 * TypeScript type definitions for Liquidity module
 * Partner > Team > Contact hierarchy
 */

// ============================================================================
// Deal Precedent (Historical Deal Information)
// ============================================================================

export interface DealPrecedent {
  id: string;
  deal_date: string;
  deal_name: string;
  structure: string;
  pricing: string;
  spread_bps: number;
  currency: string;
  size: number;
  maturity: string;
  notes: string;
  created_at: string;
}

// ============================================================================
// Investment Preferences (Y/N toggles)
// ============================================================================

export interface InvestmentPreferences {
  investment_grade: string;
  high_yield: string;
  infra_debt: string;
  senior_secured: string;
  subordinated: string;
  bonds: string;
  loan_agreement: string;
  quasi_sovereign_only: string;
  public_bond_high_yield: string;
  us_market: string;
  emerging_markets: string;
  asia_em: string;
  africa_em: string;
  emea_em: string;
  vietnam: string;
  mongolia: string;
  turkey: string;
  coal: string;
  energy_infra: string;
  transport_infra: string;
  more_expensive_than_usual: string;
  require_bank_guarantee: string;
}

// ============================================================================
// Capital Partner (Organization)
// ============================================================================

export interface CapitalPartner {
  id: string;
  name: string;
  type: string;
  country: string;
  headquarters_location: string;
  relationship: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes: string;
  company_description?: string;
  deal_precedents?: DealPrecedent[];
  preferences: InvestmentPreferences;
  investment_min: number;
  investment_max: number;
  currency: string;
  created_at: string;
  last_updated: string;
}

// ============================================================================
// Contact (Individual person at capital partner)
// ============================================================================

export interface MeetingHistoryEntry {
  date: string;
  notes: string;
  participants: string;
  next_follow_up: string | null;
  created_by?: {
    user_id: string;
    username: string;
    full_name?: string;
  };
}

export interface Contact {
  id: string;
  capital_partner_id: string;
  team_name: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  relationship: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  disc_profile: string;
  meeting_history: MeetingHistoryEntry[];
  contact_notes: string;
  last_contact_date: string | null;
  next_contact_reminder: string | null;
  created_at: string;
  last_updated: string;
}

// ============================================================================
// Enhanced types with joined data for display
// ============================================================================

export interface ContactWithPartner extends Contact {
  capital_partner?: CapitalPartner;
}

export interface CapitalPartnerWithStats extends CapitalPartner {
  contacts_count?: number;
}

// ============================================================================
// Meeting Reminder
// ============================================================================

export interface MeetingReminder {
  contact: Contact;
  reminder_date: string;
  days_until: number;
  overdue: boolean;
}

// ============================================================================
// API Response types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

// ============================================================================
// Form data types (for creating/updating)
// ============================================================================

export interface CapitalPartnerFormData {
  name: string;
  type: string;
  country: string;
  headquarters_location?: string;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes?: string;
  company_description?: string;
  deal_precedents?: DealPrecedent[];
  preferences?: Partial<InvestmentPreferences>;
  investment_min?: number;
  investment_max?: number;
  currency?: string;
}

export interface ContactFormData {
  capital_partner_id: string;
  team_name?: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  disc_profile?: string;
  contact_notes?: string;
}

export interface MeetingNoteFormData {
  contact_id: string;
  contact_updates?: Partial<ContactFormData>;
  partner_updates?: Partial<CapitalPartnerFormData>;
  meeting_note?: {
    notes: string;
    participants: string;
    next_follow_up: string | null;
  };
}

// ============================================================================
// Preference display configuration
// ============================================================================

export interface PreferenceGroup {
  title: string;
  keys: Array<keyof InvestmentPreferences>;
}

export const PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    title: 'Credit & Structure',
    keys: [
      'investment_grade',
      'high_yield',
      'infra_debt',
      'senior_secured',
      'subordinated'
    ]
  },
  {
    title: 'Instrument Type',
    keys: [
      'bonds',
      'loan_agreement',
      'quasi_sovereign_only',
      'public_bond_high_yield'
    ]
  },
  {
    title: 'Geographic Markets',
    keys: [
      'us_market',
      'emerging_markets',
      'asia_em',
      'africa_em',
      'emea_em',
      'vietnam',
      'mongolia',
      'turkey'
    ]
  },
  {
    title: 'Sector Focus',
    keys: [
      'coal',
      'energy_infra',
      'transport_infra'
    ]
  },
  {
    title: 'Special Requirements',
    keys: [
      'more_expensive_than_usual',
      'require_bank_guarantee'
    ]
  }
];

// Map of preference keys to display labels
export const PREFERENCE_LABELS: Record<keyof InvestmentPreferences, string> = {
  investment_grade: 'Investment Grade',
  high_yield: 'High Yield',
  infra_debt: 'Infra Debt',
  senior_secured: 'Senior Secured',
  subordinated: 'Subordinated',
  bonds: 'Bonds',
  loan_agreement: 'Loan Agreement',
  quasi_sovereign_only: 'Quasi-Sovereign Only',
  public_bond_high_yield: 'Public Bond High Yield',
  us_market: 'US Market',
  emerging_markets: 'Emerging Markets',
  asia_em: 'Asia EM',
  africa_em: 'Africa EM',
  emea_em: 'EMEA EM',
  vietnam: 'Vietnam',
  mongolia: 'Mongolia',
  turkey: 'Turkey',
  coal: 'Coal',
  energy_infra: 'Energy Infra',
  transport_infra: 'Transport Infra',
  more_expensive_than_usual: 'More Expensive than Usual',
  require_bank_guarantee: 'Require Bank Guarantee'
};

// ============================================================================
// Utility types
// ============================================================================

export type RelationshipLevel = 'Strong' | 'Medium' | 'Developing' | 'Cold';

export const RELATIONSHIP_LEVELS: RelationshipLevel[] = [
  'Strong',
  'Medium',
  'Developing',
  'Cold'
];

export const ORGANIZATION_TYPES = [
  'Pension Fund',
  'Sovereign Wealth Fund',
  'Insurance Company',
  'Asset Manager',
  'Bank',
  'Family Office',
  'Endowment',
  'Foundation',
  'Other'
];

export const DISC_PROFILES = [
  'D',
  'I',
  'S',
  'C',
  'DC',
  'DI',
  'DS',
  'IC',
  'IS',
  'SC',
  ''
];

// ============================================================================
// Deal Precedent Constants
// ============================================================================

export const DEAL_STRUCTURES = [
  'Senior Secured',
  'Senior Unsecured',
  'Subordinated',
  'Mezzanine',
  'Hybrid',
  'Convertible',
  'Bridge Loan',
  'Term Loan',
  'Revolving Credit',
  'Bond',
  'Other'
];

export const DEAL_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'VND',
  'TRY',
  'MNT',
  'UZS',
  'AMD',
  'Other'
];
