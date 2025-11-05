"""
Shared Constants - Backend Implementation

⚠️ GENERATED FROM shared/ - DO NOT EDIT MANUALLY
See shared/constants/ for canonical definitions

When updating these constants:
1. Update canonical definition in shared/constants/*.md
2. Update this file
3. Update frontend/src/constants/shared.ts
4. Run: python shared/scripts/validate-sync.py
"""

# ============================================================================
# Deal Stages
# ============================================================================
# Canonical definition: shared/constants/deal-stages.md

DEAL_STAGES = [
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "closed",
    "dead"
]

# ============================================================================
# Deal Action Types
# ============================================================================
# Canonical definition: shared/constants/action-types.md

ACTION_TYPES = [
    "email_sent",
    "meeting_scheduled",
    "meeting_completed",
    "memo_generated",
    "stage_changed",
    "note_added"
]

# ============================================================================
# Investment Preference Keys (Shared)
# ============================================================================
# Canonical definition: shared/constants/preferences.md
# These 10 keys are used for cross-CRM matching

SHARED_PREFERENCE_KEYS = (
    "transport_infra",
    "energy_infra",
    "us_market",
    "emerging_markets",
    "asia_em",
    "africa_em",
    "emea_em",
    "vietnam",
    "mongolia",
    "turkey",
)

# ============================================================================
# Profile Categories
# ============================================================================

PROFILE_CATEGORIES = [
    "capital_partner",
    "capital_partner_team",
    "sponsor",
    "agent",
    "counsel"
]

# ============================================================================
# Relationship Status Values
# ============================================================================

RELATIONSHIP_STATUSES = [
    "Strong",
    "Medium",
    "Developing",
    "Cold"
]
