/**
 * TypeScript types for Playbook Management System
 * All sheets from The Playbook Excel file
 */

/**
 * External Contact (from External Contacts sheet)
 */
export interface PlaybookContact {
  id: string;
  name: string;
  email: string;
  role: string;
  contact_level: number; // 1-5 priority level
  region: string;
  last_contact: string | null; // ISO datetime string
  should_contact: string | null; // ISO datetime or text like "Soon", "Medium", "N/A"
  notes: string;
}

/**
 * Calendar Entry (from Calendar sheet)
 */
export interface PlaybookCalendarEntry {
  id: string;
  date: string | null; // ISO datetime string
  tasks: string;
  internal_ents: string; // Internal entities/participants
  external_ents: string; // External entities/participants
  where: string; // Location
  other_notes: string;
  other_external: string;
}

/**
 * Deal Flow (from Deal Flow sheet)
 * Separate from main deals.json - Playbook-specific tracking
 */
export interface PlaybookDeal {
  id: string;
  mu_id: string; // Meridian Universal ID
  deal_acronym: string;
  deal: string; // Deal name
  fx: string; // Currency
  total_facility: number | null;
  sponsor: string;
  financial_close: string | null; // ISO datetime string
  lead: string; // Team lead initials
  type: string; // Deal type
  security: string; // Security type
  benchmark: string; // Benchmark name
  benchmark_value: number | null;
  spread: number | null; // Spread in basis points
  rate: number | null; // Final rate
}

/**
 * Team Member (from People sheet)
 */
export interface PlaybookPerson {
  id: string;
  team_member: string; // Name
  location: string; // Office location
  role: string; // Job title
  tasks: string; // Responsibilities
  disc_profile: string; // DISC personality profile
  facts_interests: string; // Personal info
}

/**
 * Workstream Subtask (child task within a workstream)
 */
export interface PlaybookSubtask {
  id: string;
  process: string;
  category: string;
  deliverable: string;
  done: boolean; // From Excel "Done" column
  completed: boolean; // Checkbox for completion tracking
}

/**
 * Workstream (from Workstream sheet)
 * Hierarchical structure with parent tasks and subtasks
 */
export interface PlaybookWorkstream {
  id: string;
  mission_goal: string; // Main task name (e.g., "O1 Onboarding")
  process: string; // Process description
  category: string; // Category (e.g., "Intelligence and Research", "Organisation")
  deliverable: string; // Expected deliverable
  done: boolean; // From Excel "Done" column
  key: string; // Key/classification (A-E, O, etc.)
  description: string; // Description/category label
  completed: boolean; // Checkbox for parent task completion tracking
  subtasks: PlaybookSubtask[]; // Array of child tasks
}

/**
 * Filing Instructions (from Filing sheet)
 */
export interface PlaybookFiling {
  content: string; // Rich text content
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

/**
 * Form states for UI
 */
export type FormStatus = 'idle' | 'saving' | 'success' | 'error';

/**
 * Tab names for Playbook Manager
 */
export type PlaybookTab =
  | 'contacts'
  | 'calendar'
  | 'deals'
  | 'people'
  | 'workstreams'
  | 'filing';

/**
 * Contact level options (1-5 priority)
 */
export const CONTACT_LEVELS = [
  { value: 1, label: 'Level 1 (Highest)' },
  { value: 2, label: 'Level 2 (High)' },
  { value: 3, label: 'Level 3 (Medium)' },
  { value: 4, label: 'Level 4 (Low)' },
  { value: 5, label: 'Level 5 (Lowest)' }
] as const;

/**
 * Workstream Classifiers
 * These define the category/type of each workstream task
 */
export const WORKSTREAM_CLASSIFIERS = [
  { key: 'A', label: 'Personal Research', description: 'Personal development and research tasks' },
  { key: 'B', label: 'Transactions', description: 'Deal financing and transaction-related work' },
  { key: 'C', label: 'Research', description: 'Firm research and analysis projects' },
  { key: 'D', label: 'Market Intelligence', description: 'Market intelligence and competitive analysis' },
  { key: 'O', label: 'Other', description: 'Miscellaneous tasks and operations' },
  { key: 'E', label: 'External', description: 'External-facing activities and relationships' }
] as const;

/**
 * DISC Profile options
 */
export const DISC_PROFILES = [
  'D - Dominance',
  'I - Influence',
  'S - Steadiness',
  'C - Conscientiousness',
  'DI - Dominance/Influence',
  'DC - Dominance/Conscientiousness',
  'IS - Influence/Steadiness',
  'IC - Influence/Conscientiousness',
  'SI - Steadiness/Influence',
  'SC - Steadiness/Conscientiousness',
  'CD - Conscientiousness/Dominance',
  'CS - Conscientiousness/Steadiness'
] as const;

/**
 * Team member names for calendar assignments
 */
export const TEAM_MEMBERS = [
  { key: 'nav', label: 'Naveen' },
  { key: 'aijan', label: 'Aijan' },
  { key: 'lavinia', label: 'Lavinia' },
  { key: 'kush', label: 'Kush' },
  { key: 'amgalan', label: 'Amgalan' },
  { key: 'max', label: 'Max' }
] as const;

/**
 * Currency options for Deal Flow
 */
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF',
  'TRY', 'VND', 'MNT', 'UZS', 'AMD'
] as const;

/**
 * Deal types
 */
export const DEAL_TYPES = [
  'Infrastructure',
  'Energy',
  'Transport',
  'Utilities',
  'Telecoms',
  'Social Infrastructure',
  'Other'
] as const;

/**
 * Security types
 */
export const SECURITY_TYPES = [
  'Senior Secured',
  'Senior Unsecured',
  'Subordinated',
  'Mezzanine',
  'Equity',
  'Hybrid'
] as const;
