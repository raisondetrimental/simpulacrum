/**
 * TypeScript type definitions for Sponsors module
 * Corporate > Contact hierarchy (simpler than Capital Partners)
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
// Infrastructure & Region Preferences (Y/N toggles)
// ============================================================================

export interface InfrastructureTypes {
  transport_infra: string;
  energy_infra: string;
}

export interface Regions {
  us_market: string;
  emerging_markets: string;
  asia_em: string;
  africa_em: string;
  emea_em: string;
  vietnam: string;
  mongolia: string;
  turkey: string;
}

// ============================================================================
// Corporate (Organization seeking investment)
// ============================================================================

export interface Corporate {
  id: string;
  name: string;
  type: string;
  country: string;
  headquarters_location: string;
  investment_need_min: number;  // Minimum funding needed
  investment_need_max: number;  // Maximum funding needed
  currency: string;
  infrastructure_types: InfrastructureTypes;
  regions: Regions;
  relationship: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes: string;
  company_description?: string;
  deal_precedents?: DealPrecedent[];
  created_at: string;
  last_updated: string;
}

// ============================================================================
// Sponsor Contact (Individual person at a corporate)
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

export interface SponsorContact {
  id: string;
  corporate_id: string;
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

export interface SponsorContactWithCorporate extends SponsorContact {
  corporate?: Corporate;
}

export interface CorporateWithStats extends Corporate {
  contacts_count?: number;
}

export interface CorporateWithContacts extends Corporate {
  contacts: SponsorContact[];
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

export interface CorporateFormData {
  name: string;
  type?: string;
  country: string;
  headquarters_location?: string;
  investment_need_min?: number;
  investment_need_max?: number;
  currency?: string;
  infrastructure_types?: Partial<InfrastructureTypes>;
  regions?: Partial<Regions>;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes?: string;
  company_description?: string;
  deal_precedents?: DealPrecedent[];
}

export interface SponsorContactFormData {
  corporate_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  disc_profile?: string;
  contact_notes?: string;
}

export interface SponsorMeetingNoteFormData {
  contact_id: string;
  contact_updates?: Partial<SponsorContactFormData>;
  corporate_updates?: Partial<CorporateFormData>;
  meeting_note?: {
    notes: string;
    participants: string;
    next_follow_up: string | null;
  };
}

// ============================================================================
// Infrastructure & Region display configuration
// ============================================================================

export interface InfrastructureTypeConfig {
  key: keyof InfrastructureTypes;
  label: string;
}

export interface RegionConfig {
  key: keyof Regions;
  label: string;
}

export const INFRASTRUCTURE_TYPES: InfrastructureTypeConfig[] = [
  { key: 'transport_infra', label: 'Transport Infrastructure' },
  { key: 'energy_infra', label: 'Energy Infrastructure' }
];

export const REGION_OPTIONS: RegionConfig[] = [
  { key: 'us_market', label: 'US Market' },
  { key: 'emerging_markets', label: 'Emerging Markets' },
  { key: 'asia_em', label: 'Asia EM' },
  { key: 'africa_em', label: 'Africa EM' },
  { key: 'emea_em', label: 'EMEA EM' },
  { key: 'vietnam', label: 'Vietnam' },
  { key: 'mongolia', label: 'Mongolia' },
  { key: 'turkey', label: 'Turkey' }
];

// Combined preferences type for PreferencesGrid
export type SponsorPreferences = InfrastructureTypes & Regions;

// Preference groups for collapsible sections
export interface SponsorPreferenceGroup {
  title: string;
  keys: Array<keyof SponsorPreferences>;
}

export const SPONSOR_PREFERENCE_GROUPS: SponsorPreferenceGroup[] = [
  {
    title: 'Infrastructure Types',
    keys: ['transport_infra', 'energy_infra']
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
  }
];

// Labels for all sponsor preferences
export const SPONSOR_PREFERENCE_LABELS: Record<keyof SponsorPreferences, string> = {
  transport_infra: 'Transport Infrastructure',
  energy_infra: 'Energy Infrastructure',
  us_market: 'US Market',
  emerging_markets: 'Emerging Markets',
  asia_em: 'Asia EM',
  africa_em: 'Africa EM',
  emea_em: 'EMEA EM',
  vietnam: 'Vietnam',
  mongolia: 'Mongolia',
  turkey: 'Turkey'
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

export const CORPORATE_TYPES = [
  'Energy Company',
  'Infrastructure Developer',
  'Construction Company',
  'Mining Company',
  'Utility Company',
  'Consulting Firm',
  'Engineering Firm',
  'Technology Company',
  'Other'
];
