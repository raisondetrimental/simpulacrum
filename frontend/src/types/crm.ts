/**
 * Unified CRM Types - Cross-module type definitions
 *
 * This module provides unified types for working with data across all four
 * organization types: Capital Partners, Sponsors, Counsel, and Agents
 */

import { InvestmentPreferences } from './liquidity';

// ============================================================================
// Organization Type Discrimination
// ============================================================================

export type OrganizationType = 'capital_partner' | 'sponsor' | 'counsel' | 'agent';
export type OrganizationTypeFilter = OrganizationType | 'all';

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  capital_partner: 'Capital Partner',
  sponsor: 'Sponsor',
  counsel: 'Counsel',
  agent: 'Transaction Agent'
};

export const ORGANIZATION_TYPE_COLORS: Record<OrganizationType, { bg: string; text: string }> = {
  capital_partner: { bg: 'bg-green-100', text: 'text-green-800' },
  sponsor: { bg: 'bg-purple-100', text: 'text-purple-800' },
  counsel: { bg: 'bg-violet-100', text: 'text-violet-800' },
  agent: { bg: 'bg-blue-100', text: 'text-blue-800' }
};

// ============================================================================
// Unified Organization Interface
// ============================================================================

export interface UnifiedOrganization {
  id: string;
  name: string;
  organization_type: OrganizationType;
  country: string;
  headquarters_location: string;
  relationship: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  notes: string;
  created_at: string;
  last_updated: string;
  starred?: boolean;

  // Type-specific fields (may be null for non-applicable types)
  type?: string | null;                    // Capital Partner type (Pension Fund, etc.)
  agent_type?: string | null;              // Agent type (Underwriter, Clearing Agent)
  company_description?: string | null;

  // Investment preferences (normalized to 23-field schema)
  preferences?: Partial<InvestmentPreferences>;

  // Investment ranges
  investment_min?: number | null;          // Capital Partners
  investment_max?: number | null;          // Capital Partners
  investment_need_min?: number | null;     // Sponsors
  investment_need_max?: number | null;     // Sponsors
  currency?: string | null;

  // For sponsors: separate infrastructure/region preferences
  infrastructure_types?: Record<string, string>;
  regions?: Record<string, string>;

  // For counsel/agents: specific preference fields
  counsel_preferences?: Partial<InvestmentPreferences>;
  agent_preferences?: Partial<InvestmentPreferences>;
}

// ============================================================================
// Unified Contact Interface
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
}

export interface UnifiedContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;

  // Organization reference
  organization_id: string;
  organization_type: OrganizationType;
  organization_name?: string;              // Populated for display

  // Legacy parent ID fields (for backward compatibility)
  capital_partner_id?: string;
  corporate_id?: string;
  legal_advisor_id?: string;
  agent_id?: string;

  // Contact details
  team_name?: string;
  linkedin?: string;
  relationship?: 'Strong' | 'Medium' | 'Developing' | 'Cold';
  disc_profile?: string;
  contact_notes?: string;

  // Meeting tracking
  meeting_history: MeetingHistoryEntry[];
  last_contact_date: string | null;
  next_contact_reminder: string | null;

  // Metadata
  created_at: string;
  last_updated: string;
}

// ============================================================================
// Statistics and Aggregation Types
// ============================================================================

export interface OrganizationStats {
  total: number;
  by_type: Record<OrganizationType, number>;
  by_relationship: Record<string, number>;
  starred_count: number;
}

export interface ContactStats {
  total: number;
  by_organization_type: Record<OrganizationType, number>;
  overdue_reminders: number;
  upcoming_reminders: number;
  contacts_with_meetings: number;
}

export interface MeetingStats {
  total_meetings: number;
  by_organization_type: Record<OrganizationType, number>;
  recent_meetings_count: number;      // Last 30 days
  scheduled_reminders: number;
}

export interface UnifiedCRMStats {
  organizations: OrganizationStats;
  contacts: ContactStats;
  meetings: MeetingStats;
  last_updated: string;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

export interface OrganizationFilter {
  organization_type?: OrganizationTypeFilter;
  relationship?: string;
  country?: string;
  starred?: boolean;
  search?: string;                     // Search by name
}

export interface ContactFilter {
  organization_type?: OrganizationTypeFilter;
  organization_id?: string;
  has_reminder?: boolean;
  overdue_reminders?: boolean;
  search?: string;                     // Search by name, role, email
}

export interface MeetingFilter {
  organization_type?: OrganizationTypeFilter;
  date_from?: string;
  date_to?: string;
  has_follow_up?: boolean;
}

// ============================================================================
// Display Helper Types
// ============================================================================

export interface OrganizationWithContacts extends UnifiedOrganization {
  contacts_count: number;
  recent_meetings_count: number;
}

export interface ContactWithOrganization extends UnifiedContact {
  organization?: UnifiedOrganization;
}

export interface MeetingWithContext {
  meeting: MeetingHistoryEntry;
  contact: UnifiedContact;
  organization: UnifiedOrganization;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface UnifiedApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  stats?: Partial<UnifiedCRMStats>;
}

// ============================================================================
// Export Helper Types
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  include_preferences?: boolean;
  filter?: OrganizationFilter | ContactFilter;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get organization type label
 */
export function getOrganizationTypeLabel(type: OrganizationType): string {
  return ORGANIZATION_TYPE_LABELS[type];
}

/**
 * Get organization type color classes
 */
export function getOrganizationTypeColor(type: OrganizationType): { bg: string; text: string } {
  return ORGANIZATION_TYPE_COLORS[type];
}

/**
 * Determine parent ID field name based on organization type
 */
export function getParentIdField(type: OrganizationType): string {
  const fields: Record<OrganizationType, string> = {
    capital_partner: 'capital_partner_id',
    sponsor: 'corporate_id',
    counsel: 'legal_advisor_id',
    agent: 'agent_id'
  };
  return fields[type];
}

/**
 * Check if organization has investment preferences
 */
export function hasInvestmentPreferences(type: OrganizationType): boolean {
  return type === 'capital_partner' || type === 'sponsor' || type === 'counsel' || type === 'agent';
}

/**
 * Check if organization is a capital provider (has investment range)
 */
export function isCapitalProvider(type: OrganizationType): boolean {
  return type === 'capital_partner';
}

/**
 * Check if organization is a capital seeker (has investment needs)
 */
export function isCapitalSeeker(type: OrganizationType): boolean {
  return type === 'sponsor';
}

/**
 * Check if organization is a service provider
 */
export function isServiceProvider(type: OrganizationType): boolean {
  return type === 'counsel' || type === 'agent';
}
