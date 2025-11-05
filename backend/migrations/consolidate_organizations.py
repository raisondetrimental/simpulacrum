"""
Database Consolidation Migration Script

This script consolidates four separate organization databases and four separate
contact databases into unified schemas:
- organizations.json (replaces: capital_partners.json, corporates.json, legal_advisors.json, agents.json)
- contacts.json (replaces: contacts.json, sponsor_contacts.json, counsel_contacts.json, agent_contacts.json)

Key features:
1. Preserves all existing IDs (no migration)
2. Adds organization_type field for discrimination
3. Normalizes all preferences to Capital Partners' 23-field master schema
4. Creates automatic backups of all original files
5. Maintains all existing relationships and foreign keys
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Define paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data" / "json"

# Source files
CAPITAL_PARTNERS_FILE = DATA_DIR / "capital_partners.json"
CORPORATES_FILE = DATA_DIR / "corporates.json"
LEGAL_ADVISORS_FILE = DATA_DIR / "legal_advisors.json"
AGENTS_FILE = DATA_DIR / "agents.json"

CONTACTS_FILE = DATA_DIR / "contacts.json"
SPONSOR_CONTACTS_FILE = DATA_DIR / "sponsor_contacts.json"
COUNSEL_CONTACTS_FILE = DATA_DIR / "counsel_contacts.json"
AGENT_CONTACTS_FILE = DATA_DIR / "agent_contacts.json"

# Target files
ORGANIZATIONS_FILE = DATA_DIR / "organizations.json"
UNIFIED_CONTACTS_FILE = DATA_DIR / "unified_contacts.json"

# Master 23-field preference schema (from Capital Partners)
MASTER_PREFERENCE_FIELDS = [
    "investment_grade",
    "high_yield",
    "infra_debt",
    "senior_secured",
    "subordinated",
    "bonds",
    "loan_agreement",
    "quasi_sovereign_only",
    "public_bond_high_yield",
    "us_market",
    "emerging_markets",
    "asia_em",
    "africa_em",
    "emea_em",
    "vietnam",
    "mongolia",
    "turkey",
    "coal",
    "energy_infra",
    "transport_infra",
    "more_expensive_than_usual",
    "require_bank_guarantee",
]


def create_backup(file_path: Path) -> None:
    """Create a timestamped backup of a file."""
    if not file_path.exists():
        print(f"[!] File does not exist: {file_path}")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = file_path.parent / f"{file_path.stem}_backup_{timestamp}{file_path.suffix}"
    shutil.copy2(file_path, backup_path)
    print(f"[OK] Created backup: {backup_path.name}")


def normalize_preferences(
    preferences: Dict[str, str],
    organization_type: str
) -> Dict[str, str]:
    """
    Normalize preferences to the master 23-field schema.

    For fields not applicable to the organization type, set to "any".
    """
    normalized = {}

    for field in MASTER_PREFERENCE_FIELDS:
        # Check if field exists in source preferences
        if field in preferences:
            normalized[field] = preferences[field]
        else:
            # Set non-applicable fields to "any"
            normalized[field] = "any"

    return normalized


def transform_capital_partner(cp: Dict[str, Any]) -> Dict[str, Any]:
    """Transform capital partner to unified organization schema."""
    org = {
        "id": cp["id"],
        "organization_type": "capital_partner",
        "name": cp["name"],
        "country": cp.get("country", ""),
        "headquarters_location": cp.get("headquarters_location", ""),
        "relationship": cp.get("relationship", ""),
        "notes": cp.get("notes", ""),
        "created_at": cp.get("created_at", datetime.now().isoformat()),
        "last_updated": cp.get("last_updated", cp.get("created_at", datetime.now().isoformat())),
        "starred": cp.get("starred", False),

        # Type-specific fields
        "type": cp.get("type"),  # Organization type (Pension Fund, etc.)
        "agent_type": None,
        "company_description": cp.get("company_description", ""),

        # Normalized preferences (already in master format)
        "preferences": normalize_preferences(cp.get("preferences", {}), "capital_partner"),

        # Investment ranges (capital provider)
        "investment_min": cp.get("investment_min", 0),
        "investment_max": cp.get("investment_max", 0),
        "investment_need_min": None,
        "investment_need_max": None,
        "currency": cp.get("currency", "USD"),
    }

    return org


def transform_corporate(corp: Dict[str, Any]) -> Dict[str, Any]:
    """Transform corporate (sponsor) to unified organization schema."""
    # Flatten infrastructure_types and regions into single preferences dict
    preferences = {}
    if "infrastructure_types" in corp:
        preferences.update(corp["infrastructure_types"])
    if "regions" in corp:
        preferences.update(corp["regions"])

    org = {
        "id": corp["id"],
        "organization_type": "sponsor",
        "name": corp["name"],
        "country": corp.get("country", ""),
        "headquarters_location": corp.get("headquarters_location", ""),
        "relationship": corp.get("relationship", ""),
        "notes": corp.get("notes", ""),
        "created_at": corp.get("created_at", datetime.now().isoformat()),
        "last_updated": corp.get("last_updated", corp.get("created_at", datetime.now().isoformat())),
        "starred": corp.get("starred", False),

        # Type-specific fields
        "type": None,
        "agent_type": None,
        "company_description": corp.get("company_description", ""),

        # Normalized preferences
        "preferences": normalize_preferences(preferences, "sponsor"),

        # Investment ranges (capital seeker)
        "investment_min": None,
        "investment_max": None,
        "investment_need_min": corp.get("investment_need_min", 0),
        "investment_need_max": corp.get("investment_need_max", 0),
        "currency": corp.get("currency", "USD"),
    }

    return org


def transform_legal_advisor(advisor: Dict[str, Any]) -> Dict[str, Any]:
    """Transform legal advisor to unified organization schema."""
    org = {
        "id": advisor["id"],
        "organization_type": "counsel",
        "name": advisor["name"],
        "country": advisor.get("country", ""),
        "headquarters_location": advisor.get("headquarters_location", ""),
        "relationship": advisor.get("relationship", ""),
        "notes": advisor.get("notes", ""),
        "created_at": advisor.get("created_at", datetime.now().isoformat()),
        "last_updated": advisor.get("last_updated", advisor.get("created_at", datetime.now().isoformat())),
        "starred": advisor.get("starred", False),

        # Type-specific fields
        "type": None,
        "agent_type": None,
        "company_description": None,

        # Normalized preferences
        "preferences": normalize_preferences(
            advisor.get("counsel_preferences", {}),
            "counsel"
        ),

        # Investment ranges (not applicable for counsel)
        "investment_min": None,
        "investment_max": None,
        "investment_need_min": None,
        "investment_need_max": None,
        "currency": None,
    }

    return org


def transform_agent(agent: Dict[str, Any]) -> Dict[str, Any]:
    """Transform agent to unified organization schema."""
    org = {
        "id": agent["id"],
        "organization_type": "agent",
        "name": agent["name"],
        "country": agent.get("country", ""),
        "headquarters_location": agent.get("headquarters_location", ""),
        "relationship": agent.get("relationship", ""),
        "notes": agent.get("notes", ""),
        "created_at": agent.get("created_at", datetime.now().isoformat()),
        "last_updated": agent.get("last_updated", agent.get("created_at", datetime.now().isoformat())),
        "starred": agent.get("starred", False),

        # Type-specific fields
        "type": None,
        "agent_type": agent.get("agent_type"),  # Underwriter, Clearing Agent, etc.
        "company_description": None,

        # Normalized preferences
        "preferences": normalize_preferences(
            agent.get("agent_preferences", {}),
            "agent"
        ),

        # Investment ranges (not applicable for agents)
        "investment_min": None,
        "investment_max": None,
        "investment_need_min": None,
        "investment_need_max": None,
        "currency": None,
    }

    return org


def transform_contact(
    contact: Dict[str, Any],
    organization_type: str,
    parent_id_field: str
) -> Dict[str, Any]:
    """Transform contact to unified contact schema."""
    unified_contact = {
        "id": contact["id"],
        "organization_id": contact.get(parent_id_field, ""),
        "organization_type": organization_type,
        "name": contact.get("name", ""),
        "role": contact.get("role", ""),
        "email": contact.get("email", ""),
        "phone": contact.get("phone", ""),
        "team_name": contact.get("team_name", ""),
        "meeting_history": contact.get("meeting_history", []),
        "last_contact_date": contact.get("last_contact_date"),
        "next_contact_reminder": contact.get("next_contact_reminder"),
        "created_at": contact.get("created_at", datetime.now().isoformat()),
        "last_updated": contact.get("last_updated", contact.get("updated_at", contact.get("created_at", datetime.now().isoformat()))),
    }

    # Preserve original parent ID fields for backward compatibility during transition
    if parent_id_field in contact:
        unified_contact[parent_id_field] = contact[parent_id_field]

    return unified_contact


def consolidate_organizations() -> List[Dict[str, Any]]:
    """Consolidate all four organization databases into unified list."""
    organizations = []

    # Load and transform capital partners
    print("\n[*] Processing capital partners...")
    with open(CAPITAL_PARTNERS_FILE, 'r', encoding='utf-8') as f:
        capital_partners = json.load(f)
    for cp in capital_partners:
        organizations.append(transform_capital_partner(cp))
    print(f"   [OK] Processed {len(capital_partners)} capital partners")

    # Load and transform corporates
    print("\n[*] Processing corporates...")
    with open(CORPORATES_FILE, 'r', encoding='utf-8') as f:
        corporates = json.load(f)
    for corp in corporates:
        organizations.append(transform_corporate(corp))
    print(f"   [OK] Processed {len(corporates)} corporates")

    # Load and transform legal advisors
    print("\n[*] Processing legal advisors...")
    with open(LEGAL_ADVISORS_FILE, 'r', encoding='utf-8') as f:
        legal_advisors = json.load(f)
    for advisor in legal_advisors:
        organizations.append(transform_legal_advisor(advisor))
    print(f"   [OK] Processed {len(legal_advisors)} legal advisors")

    # Load and transform agents
    print("\n[*] Processing agents...")
    with open(AGENTS_FILE, 'r', encoding='utf-8') as f:
        agents = json.load(f)
    for agent in agents:
        organizations.append(transform_agent(agent))
    print(f"   [OK] Processed {len(agents)} agents")

    print(f"\n[OK] Total organizations consolidated: {len(organizations)}")
    return organizations


def consolidate_contacts() -> List[Dict[str, Any]]:
    """Consolidate all four contact databases into unified list."""
    contacts = []

    # Load and transform capital partner contacts
    print("\n[*] Processing capital partner contacts...")
    with open(CONTACTS_FILE, 'r', encoding='utf-8') as f:
        cp_contacts = json.load(f)
    for contact in cp_contacts:
        contacts.append(transform_contact(contact, "capital_partner", "capital_partner_id"))
    print(f"   [OK] Processed {len(cp_contacts)} capital partner contacts")

    # Load and transform sponsor contacts
    print("\n[*] Processing sponsor contacts...")
    with open(SPONSOR_CONTACTS_FILE, 'r', encoding='utf-8') as f:
        sponsor_contacts = json.load(f)
    for contact in sponsor_contacts:
        contacts.append(transform_contact(contact, "sponsor", "corporate_id"))
    print(f"   [OK] Processed {len(sponsor_contacts)} sponsor contacts")

    # Load and transform counsel contacts
    print("\n[*] Processing counsel contacts...")
    with open(COUNSEL_CONTACTS_FILE, 'r', encoding='utf-8') as f:
        counsel_contacts = json.load(f)
    for contact in counsel_contacts:
        contacts.append(transform_contact(contact, "counsel", "legal_advisor_id"))
    print(f"   [OK] Processed {len(counsel_contacts)} counsel contacts")

    # Load and transform agent contacts
    print("\n[*] Processing agent contacts...")
    with open(AGENT_CONTACTS_FILE, 'r', encoding='utf-8') as f:
        agent_contacts = json.load(f)
    for contact in agent_contacts:
        contacts.append(transform_contact(contact, "agent", "agent_id"))
    print(f"   [OK] Processed {len(agent_contacts)} agent contacts")

    print(f"\n[OK] Total contacts consolidated: {len(contacts)}")
    return contacts


def main():
    """Main migration function."""
    print("="*70)
    print("DATABASE CONSOLIDATION MIGRATION")
    print("="*70)
    print("\nThis script will consolidate:")
    print("  - 4 organization databases -> organizations.json")
    print("  - 4 contact databases -> unified_contacts.json")
    print("\n" + "="*70)

    # Create backups of all source files
    print("\n[*] CREATING BACKUPS...")
    print("-"*70)
    create_backup(CAPITAL_PARTNERS_FILE)
    create_backup(CORPORATES_FILE)
    create_backup(LEGAL_ADVISORS_FILE)
    create_backup(AGENTS_FILE)
    create_backup(CONTACTS_FILE)
    create_backup(SPONSOR_CONTACTS_FILE)
    create_backup(COUNSEL_CONTACTS_FILE)
    create_backup(AGENT_CONTACTS_FILE)

    # Consolidate organizations
    print("\n" + "="*70)
    print("CONSOLIDATING ORGANIZATIONS...")
    print("-"*70)
    organizations = consolidate_organizations()

    # Write unified organizations file
    print("\n[*] Writing organizations.json...")
    with open(ORGANIZATIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(organizations, f, indent=2, ensure_ascii=False)
    print(f"   [OK] Wrote {len(organizations)} organizations to {ORGANIZATIONS_FILE}")

    # Consolidate contacts
    print("\n" + "="*70)
    print("CONSOLIDATING CONTACTS...")
    print("-"*70)
    contacts = consolidate_contacts()

    # Write unified contacts file
    print("\n[*] Writing unified_contacts.json...")
    with open(UNIFIED_CONTACTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(contacts, f, indent=2, ensure_ascii=False)
    print(f"   [OK] Wrote {len(contacts)} contacts to {UNIFIED_CONTACTS_FILE}")

    # Summary
    print("\n" + "="*70)
    print("MIGRATION COMPLETE! [OK]")
    print("="*70)
    print("\nSummary:")
    print(f"  - Organizations consolidated: {len(organizations)}")
    print(f"  - Contacts consolidated: {len(contacts)}")
    print(f"\nNew files created:")
    print(f"  - {ORGANIZATIONS_FILE}")
    print(f"  - {UNIFIED_CONTACTS_FILE}")
    print(f"\nBackups created in: {DATA_DIR}")
    print("\n[!] NEXT STEPS:")
    print("  1. Review the new unified files")
    print("  2. Update API blueprints to use new files")
    print("  3. Update services to use new schema")
    print("  4. Test all CRM operations")
    print("  5. Once verified, can delete old files")
    print("\n" + "="*70)


if __name__ == "__main__":
    main()
