"""
Migration Script: Remove Vietnam, Mongolia, Turkey Y/N Fields from Regions

This script removes the old vietnam, mongolia, and turkey Y/N fields from
the regions object in sponsor organizations, since these are now handled
by the countries array field.

Date: 2025-11-11
"""

import json
from pathlib import Path
from datetime import datetime


def remove_country_yn_fields():
    """Remove vietnam, mongolia, turkey fields from sponsor regions"""

    # Path to organizations.json
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / 'data' / 'json'
    orgs_file = data_dir / 'organizations.json'
    backup_file = data_dir / f'organizations_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

    print(f"Loading organizations from: {orgs_file}")

    # Load organizations
    with open(orgs_file, 'r', encoding='utf-8') as f:
        organizations = json.load(f)

    print(f"Total organizations: {len(organizations)}")

    # Create backup
    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(organizations, f, indent=2, ensure_ascii=False)

    # Track changes
    updated_count = 0
    sponsors = []
    fields_to_remove = ['vietnam', 'mongolia', 'turkey']

    # Process each organization
    for org in organizations:
        org_type = org.get('organization_type', '')

        # Only process sponsor organizations
        if org_type == 'sponsor':
            sponsors.append(org)

            # Check if organization has regions object
            if 'regions' in org and isinstance(org['regions'], dict):
                regions = org['regions']
                fields_removed = []

                # Remove the old country fields
                for field in fields_to_remove:
                    if field in regions:
                        del regions[field]
                        fields_removed.append(field)

                if fields_removed:
                    updated_count += 1
                    print(f"[OK] Updated sponsor: {org.get('name')} (ID: {org.get('id')})")
                    print(f"  Removed fields: {', '.join(fields_removed)}")

    # Save updated organizations
    print(f"\nSaving updated organizations to: {orgs_file}")
    with open(orgs_file, 'w', encoding='utf-8') as f:
        json.dump(organizations, f, indent=2, ensure_ascii=False)

    # Print summary
    print("\n" + "="*60)
    print("MIGRATION SUMMARY")
    print("="*60)
    print(f"Total sponsors found: {len(sponsors)}")
    print(f"Sponsors updated: {updated_count}")
    print(f"Fields removed: {', '.join(fields_to_remove)}")
    print(f"Backup created: {backup_file}")
    print("="*60)

    # Show sample sponsor after migration
    if sponsors:
        print("\nSample sponsor regions after migration:")
        sample = sponsors[0]
        print(f"  Name: {sample.get('name')}")
        print(f"  ID: {sample.get('id')}")
        print(f"  regions: {sample.get('regions', {})}")


if __name__ == '__main__':
    print("Starting migration: Remove Country Y/N Fields")
    print("="*60)
    remove_country_yn_fields()
    print("\nMigration complete!")
