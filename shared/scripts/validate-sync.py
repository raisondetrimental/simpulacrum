#!/usr/bin/env python3
"""
Validation script to ensure frontend and backend constants are in sync.

Run this script whenever you update shared constants to verify consistency.
Usage: python shared/scripts/validate-sync.py
"""
import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

from constants.shared import (
    DEAL_STAGES,
    ACTION_TYPES,
    SHARED_PREFERENCE_KEYS,
    PROFILE_CATEGORIES,
    RELATIONSHIP_STATUSES
)

# Canonical definitions from shared/constants/
CANONICAL_DEAL_STAGES = [
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "closed",
    "dead"
]

CANONICAL_ACTION_TYPES = [
    "email_sent",
    "meeting_scheduled",
    "meeting_completed",
    "memo_generated",
    "stage_changed",
    "note_added"
]

CANONICAL_SHARED_PREFERENCES = (
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

CANONICAL_PROFILE_CATEGORIES = [
    "capital_partner",
    "capital_partner_team",
    "sponsor"
]

CANONICAL_RELATIONSHIP_STATUSES = [
    "Strong",
    "Medium",
    "Developing",
    "Cold"
]


def validate_list(name: str, actual: list, canonical: list) -> bool:
    """Validate that actual list matches canonical definition."""
    if actual != list(canonical):
        print(f"[FAIL] {name} mismatch!")
        print(f"   Expected: {canonical}")
        print(f"   Got:      {actual}")
        return False
    print(f"[PASS] {name} matches")
    return True


def main():
    """Run all validation checks."""
    print("Validating backend constants against canonical definitions...")
    print("")

    all_valid = True

    # Validate deal stages
    all_valid &= validate_list("DEAL_STAGES", DEAL_STAGES, CANONICAL_DEAL_STAGES)

    # Validate action types
    all_valid &= validate_list("ACTION_TYPES", ACTION_TYPES, CANONICAL_ACTION_TYPES)

    # Validate shared preferences
    all_valid &= validate_list("SHARED_PREFERENCE_KEYS", list(SHARED_PREFERENCE_KEYS), list(CANONICAL_SHARED_PREFERENCES))

    # Validate profile categories
    all_valid &= validate_list("PROFILE_CATEGORIES", PROFILE_CATEGORIES, CANONICAL_PROFILE_CATEGORIES)

    # Validate relationship statuses
    all_valid &= validate_list("RELATIONSHIP_STATUSES", RELATIONSHIP_STATUSES, CANONICAL_RELATIONSHIP_STATUSES)

    print("")
    if all_valid:
        print("[SUCCESS] All constants are in sync!")
        print("")
        print("Next steps:")
        print("  1. Verify frontend builds: cd frontend && npm run build")
        print("  2. Verify backend runs: cd backend && python src/app.py")
        return 0
    else:
        print("[ERROR] Constants are out of sync!")
        print("")
        print("To fix:")
        print("  1. Check canonical definitions in shared/constants/*.md")
        print("  2. Update backend/src/constants/shared.py")
        print("  3. Update frontend/src/constants/shared.ts")
        print("  4. Run this script again")
        return 1


if __name__ == "__main__":
    sys.exit(main())
