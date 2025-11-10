#!/usr/bin/env python3
"""
Migration Script: Convert Individual Country Flags to Countries Array

This script migrates investment preference data from individual country flags
(vietnam, mongolia, turkey) to a unified countries array field.

Migration Details:
- Reads organizations.json
- For each organization with preferences:
  - Creates 'countries' array from Y-flagged countries
  - Removes individual country flags from preferences object
- Creates backup before modifying data
- Handles all organization types: capital_partner, sponsor, counsel, agent

Date: 2025-11-09
"""

import json
import shutil
from pathlib import Path
from datetime import datetime

# Country mappings (old preference key -> new country id)
# Note: "turkey" maps to "turkiye" to match country_fundamentals.json
COUNTRY_MAPPINGS = {
    "vietnam": "vietnam",
    "mongolia": "mongolia",
    "turkey": "turkiye",  # Update slug to match country_fundamentals
}


def migrate_organization(org: dict) -> dict:
    """
    Migrate a single organization's country preferences.

    Args:
        org: Organization dictionary

    Returns:
        Updated organization dictionary with countries array
    """
    # Initialize countries array if not present
    if "countries" not in org:
        org["countries"] = []

    # Check if organization has preferences
    if "preferences" in org:
        preferences = org["preferences"]

        # Extract countries where value is "Y"
        selected_countries = []
        for old_key, new_id in COUNTRY_MAPPINGS.items():
            if old_key in preferences:
                if preferences[old_key] == "Y":
                    selected_countries.append(new_id)
                # Remove the old individual flag
                del preferences[old_key]

        # Add selected countries to the countries array (avoid duplicates)
        for country in selected_countries:
            if country not in org["countries"]:
                org["countries"].append(country)

    # Also check infrastructure_types and regions for sponsors/agents
    # (Some organizations might have split structure)
    if "regions" in org:
        regions = org["regions"]
        selected_countries = []

        for old_key, new_id in COUNTRY_MAPPINGS.items():
            if old_key in regions:
                if regions[old_key] == "Y":
                    selected_countries.append(new_id)
                # Remove the old individual flag
                del regions[old_key]

        # Add to countries array
        for country in selected_countries:
            if country not in org["countries"]:
                org["countries"].append(country)

    return org


def main():
    """Main migration function."""
    # Paths
    base_dir = Path(__file__).parent.parent
    data_file = base_dir / "data" / "json" / "organizations.json"
    backup_file = base_dir / "data" / "json" / f"organizations_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    print(f"Country Preferences Migration")
    print(f"=" * 60)
    print(f"Data file: {data_file}")
    print(f"Backup file: {backup_file}")
    print()

    # Check if file exists
    if not data_file.exists():
        print(f"ERROR: {data_file} not found!")
        return 1

    # Load data
    print("Loading organizations.json...")
    with open(data_file, 'r', encoding='utf-8') as f:
        organizations = json.load(f)

    print(f"Loaded {len(organizations)} organizations")
    print()

    # Create backup
    print(f"Creating backup...")
    shutil.copy2(data_file, backup_file)
    print(f"Backup created: {backup_file}")
    print()

    # Migrate each organization
    print("Migrating organizations...")
    stats = {
        "total": len(organizations),
        "migrated": 0,
        "skipped": 0,
        "countries_found": {
            "vietnam": 0,
            "mongolia": 0,
            "turkiye": 0,
        }
    }

    for i, org in enumerate(organizations):
        org_type = org.get("organization_type", "unknown")
        org_name = org.get("name", "Unknown")

        # Track countries before migration
        countries_before = []
        if "preferences" in org:
            for old_key in COUNTRY_MAPPINGS.keys():
                if org["preferences"].get(old_key) == "Y":
                    countries_before.append(COUNTRY_MAPPINGS[old_key])

        # Migrate the organization
        organizations[i] = migrate_organization(org)

        # Check if migration occurred
        if countries_before:
            stats["migrated"] += 1
            print(f"  [OK] {org_type}: {org_name}")
            print(f"       Countries: {', '.join(countries_before)}")

            # Update stats
            for country in countries_before:
                if country in stats["countries_found"]:
                    stats["countries_found"][country] += 1
        else:
            stats["skipped"] += 1

    print()
    print("Migration Statistics:")
    print(f"  Total organizations: {stats['total']}")
    print(f"  Migrated: {stats['migrated']}")
    print(f"  Skipped (no countries): {stats['skipped']}")
    print()
    print("Countries found:")
    for country, count in stats["countries_found"].items():
        print(f"  {country}: {count} organizations")
    print()

    # Write updated data
    print("Writing updated organizations.json...")
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(organizations, f, indent=2, ensure_ascii=False)

    print("Migration completed successfully!")
    print()
    print("Next steps:")
    print("1. Verify the migrated data in organizations.json")
    print("2. Update shared constants to remove individual country flags")
    print("3. Update frontend forms to use CountryMultiSelect component")
    print("4. Deploy backend and frontend changes")

    return 0


if __name__ == "__main__":
    exit(main())
