/**
 * Shared Constants - Frontend Implementation
 *
 * ⚠️ GENERATED FROM shared/ - DO NOT EDIT MANUALLY
 * See shared/constants/ for canonical definitions
 *
 * When updating these constants:
 * 1. Update canonical definition in shared/constants/*.md
 * 2. Update this file
 * 3. Update backend/src/constants/shared.py
 * 4. Run: python shared/scripts/validate-sync.py
 */

// ============================================================================
// Deal Stages
// ============================================================================
// Canonical definition: shared/constants/deal-stages.md

export const DEAL_STAGES = [
  'identified',
  'introduced',
  'in_diligence',
  'term_sheet',
  'closed',
  'dead'
] as const;

export type DealStage = typeof DEAL_STAGES[number];

// ============================================================================
// Deal Action Types
// ============================================================================
// Canonical definition: shared/constants/action-types.md

export const ACTION_TYPES = [
  'email_sent',
  'meeting_scheduled',
  'meeting_completed',
  'memo_generated',
  'stage_changed',
  'note_added'
] as const;

export type DealActionType = typeof ACTION_TYPES[number];

// ============================================================================
// Investment Preference Keys (Shared)
// ============================================================================
// Canonical definition: shared/constants/preferences.md
// These 10 keys are used for cross-CRM matching

export const SHARED_PREFERENCE_KEYS = [
  'transport_infra',
  'energy_infra',
  'us_market',
  'emerging_markets',
  'asia_em',
  'africa_em',
  'emea_em',
  'vietnam',
  'mongolia',
  'turkey'
] as const;

export type SharedPreferenceKey = typeof SHARED_PREFERENCE_KEYS[number];

// ============================================================================
// Profile Categories
// ============================================================================

export const PROFILE_CATEGORIES = [
  'capital_partner',
  'capital_partner_team',
  'sponsor'
] as const;

export type ProfileCategory = typeof PROFILE_CATEGORIES[number];

// ============================================================================
// Relationship Status Values
// ============================================================================

export const RELATIONSHIP_STATUSES = [
  'Strong',
  'Medium',
  'Developing',
  'Cold'
] as const;

export type RelationshipStatus = typeof RELATIONSHIP_STATUSES[number];
