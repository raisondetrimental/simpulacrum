#!/usr/bin/env python3
"""
Migration script to transform flat institutions.json into hierarchical structure:
- capital_partners.json (organizations)
- teams.json (teams with investment preferences)
- contacts.json (individuals with meeting history)

Preserves ALL existing data while enabling new features.
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
import uuid


def generate_id(prefix: str, index: int) -> str:
    """Generate a unique ID with prefix"""
    return f"{prefix}_{index:03d}"


def normalize_preference_key(key: str) -> str:
    """Convert display name to snake_case for preferences"""
    # Map of display names to preference keys
    key_map = {
        "Africa EM": "africa_em",
        "Asia EM": "asia_em",
        "Bonds": "bonds",
        "Coal": "coal",
        "EMEA EM": "emea_em",
        "Emerging Markets": "emerging_markets",
        "Energy Infra": "energy_infra",
        "High Yield": "high_yield",
        "Infra Debt": "infra_debt",
        "Investment Grade": "investment_grade",
        "Loan Agreement": "loan_agreement",
        "Mongolia": "mongolia",
        "More Expensive than usual": "more_expensive_than_usual",
        "Public Bond High Yield": "public_bond_high_yield",
        "Quasi-Sovereign Only": "quasi_sovereign_only",
        "Require Bank Guarantee": "require_bank_guarantee",
        "Senior Secured": "senior_secured",
        "Subordinated": "subordinated",
        "Transport Infra": "transport_infra",
        "Turkey": "turkey",
        "US Market": "us_market",
        "Vietnam": "vietnam",
    }
    return key_map.get(key, key.lower().replace(" ", "_"))


def migrate_institutions_to_new_structure():
    """Main migration function"""

    # Paths
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / "data" / "json"
    backup_dir = data_dir / "backups"

    institutions_path = data_dir / "institutions.json"
    contacts_path = data_dir / "contacts.json"

    capital_partners_path = data_dir / "capital_partners.json"
    teams_path = data_dir / "teams.json"
    new_contacts_path = data_dir / "contacts.json"

    # Create backup directory
    backup_dir.mkdir(exist_ok=True)

    print("=" * 70)
    print("LIQUIDITY DATA MIGRATION SCRIPT")
    print("=" * 70)
    print()
    print("This script will transform your flat institutions.json into:")
    print("  1. capital_partners.json (organizations)")
    print("  2. teams.json (teams with preferences)")
    print("  3. contacts.json (updated structure)")
    print()

    # Backup existing files
    print("Step 1: Creating backups...")
    if institutions_path.exists():
        backup_path = backup_dir / f"institutions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        shutil.copy(institutions_path, backup_path)
        print(f"  [OK] Backed up institutions.json to {backup_path.name}")

    if contacts_path.exists():
        backup_path = backup_dir / f"contacts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        shutil.copy(contacts_path, backup_path)
        print(f"  [OK] Backed up contacts.json to {backup_path.name}")

    print()

    # Load existing data
    print("Step 2: Loading existing data...")
    with open(institutions_path, 'r', encoding='utf-8') as f:
        institutions = json.load(f)
    print(f"  [OK] Loaded {len(institutions)} institutions")

    existing_contacts = []
    if contacts_path.exists():
        with open(contacts_path, 'r', encoding='utf-8') as f:
            existing_contacts = json.load(f)
        print(f"  [OK] Loaded {len(existing_contacts)} existing contacts")

    print()

    # Transform data
    print("Step 3: Transforming data structure...")

    capital_partners = []
    teams = []
    contacts = []

    # Preference keys to extract
    preference_keys = [
        "Investment Grade", "High Yield", "Infra Debt", "Senior Secured",
        "Subordinated", "Bonds", "Loan Agreement", "Quasi-Sovereign Only",
        "Public Bond High Yield", "US Market", "Emerging Markets", "Asia EM",
        "Africa EM", "EMEA EM", "Vietnam", "Mongolia", "Turkey", "Coal",
        "Energy Infra", "Transport Infra", "More Expensive than usual",
        "Require Bank Guarantee"
    ]

    for idx, institution in enumerate(institutions, start=1):
        partner_id = generate_id("cp", idx)
        team_id = generate_id("team", idx)

        # Extract capital partner data
        capital_partner = {
            "id": partner_id,
            "name": institution.get("Capital Partner", f"Partner {idx}"),
            "type": institution.get("Type", ""),
            "country": institution.get("Country", ""),
            "headquarters_location": institution.get("Country", ""),  # Default to country
            "relationship": institution.get("Relationship", "Medium"),
            "notes": "",
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        capital_partners.append(capital_partner)

        # Extract team data with preferences
        preferences = {}
        for key in preference_keys:
            if key in institution:
                normalized_key = normalize_preference_key(key)
                preferences[normalized_key] = institution[key]

        team = {
            "id": team_id,
            "capital_partner_id": partner_id,
            "team_name": "Main Team",
            "office_location": institution.get("Country", ""),
            "investment_min": 0,
            "investment_max": 999999999,
            "currency": "USD",
            "preferences": preferences,
            "team_notes": "",
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        teams.append(team)

    print(f"  [OK] Created {len(capital_partners)} capital partners")
    print(f"  [OK] Created {len(teams)} teams (one 'Main Team' per partner)")

    # Migrate existing contacts (if any)
    if existing_contacts:
        print()
        print("Step 4: Migrating existing contacts...")

        # Create mapping of capital partner names to IDs
        partner_name_to_id = {cp["name"]: cp["id"] for cp in capital_partners}
        team_by_partner_id = {team["capital_partner_id"]: team["id"] for team in teams}

        for idx, old_contact in enumerate(existing_contacts, start=1):
            contact_id = generate_id("contact", idx)
            partner_name = old_contact.get("Capital Partner", "")

            # Find matching capital partner and team
            partner_id = partner_name_to_id.get(partner_name)
            team_id = team_by_partner_id.get(partner_id) if partner_id else None

            if not partner_id:
                print(f"  [WARNING] Contact '{old_contact.get('Name')}' has unknown partner '{partner_name}', skipping")
                continue

            contact = {
                "id": contact_id,
                "team_id": team_id,
                "capital_partner_id": partner_id,
                "name": old_contact.get("Name", ""),
                "role": old_contact.get("Role", ""),
                "email": old_contact.get("Email", ""),
                "phone": "",
                "linkedin": "",
                "relationship": old_contact.get("Relationship", "Medium"),
                "disc_profile": old_contact.get("DISC", ""),
                "meeting_history": [],
                "contact_notes": old_contact.get("Notes", ""),
                "last_contact_date": None,
                "next_contact_reminder": None,
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat()
            }
            contacts.append(contact)

        print(f"  [OK] Migrated {len(contacts)} contacts")

    print()

    # Save new files
    print("Step 5: Saving new data files...")

    with open(capital_partners_path, 'w', encoding='utf-8') as f:
        json.dump(capital_partners, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved {capital_partners_path.name}")

    with open(teams_path, 'w', encoding='utf-8') as f:
        json.dump(teams, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved {teams_path.name}")

    with open(new_contacts_path, 'w', encoding='utf-8') as f:
        json.dump(contacts, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved {new_contacts_path.name}")

    print()
    print("=" * 70)
    print("MIGRATION COMPLETE!")
    print("=" * 70)
    print()
    print("Summary:")
    print(f"  - {len(capital_partners)} capital partners created")
    print(f"  - {len(teams)} teams created (one per partner)")
    print(f"  - {len(contacts)} contacts migrated")
    print()
    print("Files created:")
    print(f"  - {capital_partners_path}")
    print(f"  - {teams_path}")
    print(f"  - {new_contacts_path}")
    print()
    print("Backups saved in:")
    print(f"  - {backup_dir}")
    print()
    print("Next steps:")
    print("  1. Review the new JSON files to verify data integrity")
    print("  2. Test the new API endpoints")
    print("  3. Update frontend to use new structure")
    print()


if __name__ == "__main__":
    try:
        migrate_institutions_to_new_structure()
    except Exception as e:
        print()
        print("=" * 70)
        print("ERROR DURING MIGRATION")
        print("=" * 70)
        print(f"Error: {str(e)}")
        print()
        print("Your original files are safe in the backups/ directory.")
        print("Please review the error and try again.")
        import traceback
        traceback.print_exc()
