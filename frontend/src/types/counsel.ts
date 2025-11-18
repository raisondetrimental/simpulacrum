/**
 * TypeScript type definitions for Counsel module
 * Legal Advisor > Contact hierarchy
 */

// Import investment preferences from liquidity module (reuse exact structure)
import {
  InvestmentPreferences,
  PREFERENCE_GROUPS,
  PREFERENCE_LABELS
} from './liquidity';

// Re-export for convenience
export type CounselPreferences = InvestmentPreferences;
export { PREFERENCE_GROUPS as COUNSEL_PREFERENCE_GROUPS };
export { PREFERENCE_LABELS as COUNSEL_PREFERENCE_LABELS };

// ============================================================================
// Legal Advisor (Law firm/legal counsel organization)
// ============================================================================

export interface LegalAdvisor {
  id: string;
  name: string;
  type: string;
  country: string;
  headquarters_location: string;
  counsel_preferences: CounselPreferences;
  relationship: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes: string;
  starred?: boolean;
  countries?: string[];
  created_at: string;
  last_updated: string;
}

// ============================================================================
// Counsel Contact (Individual lawyer/legal professional)
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
  assigned_to?: Array<{
    user_id: string;
    username: string;
    full_name: string;
  }>;
}

export interface CounselContact {
  id: string;
  legal_advisor_id: string;
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

export interface CounselContactWithLegalAdvisor extends CounselContact {
  legal_advisor?: LegalAdvisor;
}

export interface LegalAdvisorWithStats extends LegalAdvisor {
  contacts_count?: number;
}

export interface LegalAdvisorWithContacts extends LegalAdvisor {
  contacts: CounselContact[];
}

// ============================================================================
// Meeting Reminder
// ============================================================================

export interface CounselMeetingReminder {
  contact: CounselContact;
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

export interface LegalAdvisorFormData {
  name: string;
  type?: string;
  country: string;
  headquarters_location?: string;
  counsel_preferences?: Partial<CounselPreferences>;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes?: string;
  countries?: string[];
}

export interface CounselContactFormData {
  legal_advisor_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  disc_profile?: string;
  contact_notes?: string;
}

export interface CounselMeetingNoteFormData {
  contact_id: string;
  contact_updates?: Partial<CounselContactFormData>;
  legal_advisor_updates?: Partial<LegalAdvisorFormData>;
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

export const LEGAL_ADVISOR_TYPES = [
  'International Law Firm',
  'Local Law Firm',
  'Boutique Firm',
  'Big Law',
  'Regional Firm',
  'Other'
];
