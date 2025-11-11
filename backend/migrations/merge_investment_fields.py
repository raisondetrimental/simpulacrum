"""
Migration Script: Merge Investment Need Fields into Investment Min/Max

This script merges investment_need_min and investment_need_max into
investment_min and investment_max for sponsor organizations, then
removes the old 'need' fields.

Date: 2025-11-11
"""

import json
from pathlib import Path
from datetime import datetime


def merge_investment_fields():
    """Merge investment_need_min/max into investment_min/max for sponsors"""

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

    # Process each organization
    for org in organizations:
        org_type = org.get('organization_type', '')

        # Only process sponsor organizations
        if org_type == 'sponsor':
            sponsors.append(org)

            # Check if investment_need fields exist
            need_min = org.get('investment_need_min')
            need_max = org.get('investment_need_max')

            if need_min is not None or need_max is not None:
                # Merge into investment_min/max (prefer need values if they exist)
                if need_min is not None:
                    org['investment_min'] = need_min
                if need_max is not None:
                    org['investment_max'] = need_max

                # Remove old fields
                if 'investment_need_min' in org:
                    del org['investment_need_min']
                if 'investment_need_max' in org:
                    del org['investment_need_max']

                updated_count += 1
                print(f"[OK] Updated sponsor: {org.get('name')} (ID: {org.get('id')})")
                print(f"  Investment range: {org.get('investment_min', 0)} - {org.get('investment_max', 0)}")

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
    print(f"Backup created: {backup_file}")
    print("="*60)

    # Show sample sponsor after migration
    if sponsors:
        print("\nSample sponsor after migration:")
        sample = sponsors[0]
        print(f"  Name: {sample.get('name')}")
        print(f"  ID: {sample.get('id')}")
        print(f"  investment_min: {sample.get('investment_min', 'NOT SET')}")
        print(f"  investment_max: {sample.get('investment_max', 'NOT SET')}")
        print(f"  investment_need_min: {sample.get('investment_need_min', 'REMOVED')}")
        print(f"  investment_need_max: {sample.get('investment_need_max', 'REMOVED')}")


if __name__ == '__main__':
    print("Starting migration: Merge Investment Fields")
    print("="*60)
    merge_investment_fields()
    print("\nMigration complete!")
