/**
 * TypeScript type definitions for Agents module
 * Agent > Contact hierarchy
 */

// ============================================================================
// Agent Preferences (same 10 fields as Sponsors)
// ============================================================================

export interface AgentPreferences {
  transport_infra: string;
  energy_infra: string;
  us_market: string;
  emerging_markets: string;
  asia_em: string;
  africa_em: string;
  emea_em: string;
}

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
// Agent Types (Transaction Agent roles)
// ============================================================================

export const AGENT_TYPES = [
  'Placement Agent',
  'Underwriter',
  'Settlement Agent',
  'Clearing Agent',
  'Trustee',
  'Paying Agent',
  'Fiscal Agent',
  'Administrative Agent',
  'Collateral Agent',
  'Other'
];

// Infrastructure and Region types (for compatibility)
export const INFRASTRUCTURE_TYPES = [
  { key: 'transport_infra', label: 'Transport Infrastructure' },
  { key: 'energy_infra', label: 'Energy Infrastructure' }
];

export const REGION_OPTIONS = [
  { key: 'us_market', label: 'US Market' },
  { key: 'emerging_markets', label: 'Emerging Markets' },
  { key: 'asia_em', label: 'Asia EM' },
  { key: 'africa_em', label: 'Africa EM' },
  { key: 'emea_em', label: 'EMEA EM' }
];

// ============================================================================
// Agent (Transaction agent organization or individual)
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  agent_type: string;
  country: string;
  headquarters_location: string;
  agent_preferences: AgentPreferences;
  relationship: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes: string;
  starred?: boolean;
  countries?: string[];
  investment_need_min?: number;
  investment_need_max?: number;
  currency?: string;
  deal_precedents?: any[];
  created_at: string;
  last_updated: string;
}

// ============================================================================
// Agent Contact (Individual person at an agent organization)
// ============================================================================

export interface MeetingHistoryEntry {
  id: string;
  date: string;
  notes: string;
  participants: string;
  next_follow_up: string | null;
  created_by?: {
    user_id: string;
    username: string;
    full_name?: string;
  };
  updated_at?: string;
  updated_by?: {
    user_id: string;
    username: string;
    full_name?: string;
  };
  assigned_to?: Array<{
    user_id: string;
    username: string;
    full_name: string;
  }>;
}

export interface AgentContact {
  id: string;
  agent_id: string;
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

export interface AgentContactWithAgent extends AgentContact {
  agent?: Agent;
}

export interface AgentWithStats extends Agent {
  contacts_count?: number;
}

export interface AgentWithContacts extends Agent {
  contacts: AgentContact[];
}

// ============================================================================
// Meeting Reminder
// ============================================================================

export interface AgentMeetingReminder {
  contact: AgentContact;
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

export interface AgentFormData {
  name: string;
  agent_type: string;
  country: string;
  headquarters_location?: string;
  agent_preferences?: Partial<AgentPreferences>;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes?: string;
  countries?: string[];
}

export interface AgentContactFormData {
  agent_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  disc_profile?: string;
  contact_notes?: string;
}

export interface AgentMeetingNoteFormData {
  contact_id: string;
  contact_updates?: Partial<AgentContactFormData>;
  agent_updates?: Partial<AgentFormData>;
  meeting_note?: {
    notes: string;
    participants: string;
    next_follow_up: string | null;
  };
}

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
// Preference Labels and Groups
// ============================================================================

export const AGENT_PREFERENCE_LABELS: Record<keyof AgentPreferences, string> = {
  transport_infra: 'Transport Infrastructure',
  energy_infra: 'Energy Infrastructure',
  us_market: 'US Market',
  emerging_markets: 'Emerging Markets (General)',
  asia_em: 'Asia EM',
  africa_em: 'Africa EM',
  emea_em: 'EMEA EM'
};

export const AGENT_PREFERENCE_GROUPS = [
  {
    title: 'Infrastructure',
    keys: ['transport_infra', 'energy_infra'] as Array<keyof AgentPreferences>
  },
  {
    title: 'Geographic Markets',
    keys: [
      'us_market',
      'emerging_markets',
      'asia_em',
      'africa_em',
      'emea_em'
    ] as Array<keyof AgentPreferences>
  }
];
