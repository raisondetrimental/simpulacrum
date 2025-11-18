"""
Unified Data Access Layer (DAL) for Organizations and Contacts

This module provides a centralized interface for accessing the unified
organizations.json and contacts.json databases, while maintaining backward
compatibility with existing API blueprints.

Key features:
- Filter organizations by type (capital_partner, sponsor, counsel, agent)
- Transform unified schema to type-specific formats
- Transform type-specific formats back to unified schema
- Handle all CRUD operations with automatic backups
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import current_app

from .json_store import read_json_list, write_json_file, find_by_id


# ============================================================================
# ORGANIZATION TYPE MAPPINGS
# ============================================================================

ORGANIZATION_TYPES = {
    "capital_partner": {
        "prefix": "cp_",
        "legacy_file": "capital_partners.json",
        "contact_file": "contacts.json",
        "parent_id_field": "capital_partner_id",
    },
    "sponsor": {
        "prefix": "corp_",
        "legacy_file": "corporates.json",
        "contact_file": "sponsor_contacts.json",
        "parent_id_field": "corporate_id",
    },
    "counsel": {
        "prefix": "la_",
        "legacy_file": "legal_advisors.json",
        "contact_file": "counsel_contacts.json",
        "parent_id_field": "legal_advisor_id",
    },
    "agent": {
        "prefix": "agent_",
        "legacy_file": "agents.json",
        "contact_file": "agent_contacts.json",
        "parent_id_field": "agent_id",
    },
}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_organizations_path() -> Path:
    """Get path to unified organizations.json file."""
    return Path(current_app.config['JSON_DIR']) / "organizations.json"


def get_contacts_path() -> Path:
    """Get path to unified contacts.json file."""
    # Check if unified contacts file exists, otherwise use legacy contacts.json
    unified_path = Path(current_app.config['JSON_DIR']) / "unified_contacts.json"
    if unified_path.exists():
        return unified_path
    # Fallback to looking for contacts.json (for backward compatibility during migration)
    return Path(current_app.config['JSON_DIR']) / "contacts.json"


def transform_to_legacy_format(org: Dict[str, Any], org_type: str) -> Dict[str, Any]:
    """
    Transform unified organization schema to legacy type-specific format.

    This maintains backward compatibility with existing API contracts.
    """
    if org_type == "capital_partner":
        return {
            "id": org["id"],
            "name": org["name"],
            "type": org.get("type"),
            "country": org["country"],
            "headquarters_location": org["headquarters_location"],
            "relationship": org["relationship"],
            "notes": org.get("notes", ""),
            "company_description": org.get("company_description", ""),
            "preferences": org.get("preferences", {}),
            "investment_min": org.get("investment_min", 0),
            "investment_max": org.get("investment_max", 0),
            "currency": org.get("currency", "USD"),
            "starred": org.get("starred", False),
            "countries": org.get("countries", []),
            "created_at": org["created_at"],
            "last_updated": org["last_updated"],
            "updated_at": org.get("last_updated"),
        }

    elif org_type == "sponsor":
        # Split preferences back into infrastructure_types and regions
        prefs = org.get("preferences", {})
        return {
            "id": org["id"],
            "name": org["name"],
            "country": org["country"],
            "headquarters_location": org["headquarters_location"],
            "investment_need_min": org.get("investment_need_min", 0),
            "investment_need_max": org.get("investment_need_max", 0),
            "currency": org.get("currency", "USD"),
            "infrastructure_types": {
                "energy_infra": prefs.get("energy_infra", "N"),
                "transport_infra": prefs.get("transport_infra", "N"),
            },
            "regions": {
                "us_market": prefs.get("us_market", "N"),
                "emerging_markets": prefs.get("emerging_markets", "N"),
                "asia_em": prefs.get("asia_em", "N"),
                "africa_em": prefs.get("africa_em", "N"),
                "emea_em": prefs.get("emea_em", "N"),
                "vietnam": prefs.get("vietnam", "N"),
                "mongolia": prefs.get("mongolia", "N"),
                "turkey": prefs.get("turkey", "N"),
            },
            "relationship": org["relationship"],
            "notes": org.get("notes", ""),
            "company_description": org.get("company_description", ""),
            "starred": org.get("starred", False),
            "countries": org.get("countries", []),
            "created_at": org["created_at"],
            "last_updated": org["last_updated"],
        }

    elif org_type == "counsel":
        return {
            "id": org["id"],
            "name": org["name"],
            "country": org["country"],
            "headquarters_location": org["headquarters_location"],
            "counsel_preferences": org.get("preferences", {}),
            "relationship": org["relationship"],
            "notes": org.get("notes", ""),
            "starred": org.get("starred", False),
            "countries": org.get("countries", []),
            "created_at": org["created_at"],
            "last_updated": org["last_updated"],
        }

    elif org_type == "agent":
        return {
            "id": org["id"],
            "name": org["name"],
            "agent_type": org.get("agent_type"),
            "country": org["country"],
            "headquarters_location": org["headquarters_location"],
            "agent_preferences": org.get("preferences", {}),
            "relationship": org["relationship"],
            "notes": org.get("notes", ""),
            "starred": org.get("starred", False),
            "countries": org.get("countries", []),
            "created_at": org["created_at"],
            "last_updated": org["last_updated"],
        }

    return org


def transform_from_legacy_format(data: Dict[str, Any], org_type: str) -> Dict[str, Any]:
    """
    Transform legacy type-specific format to unified organization schema.

    This is used when creating or updating organizations through the API.
    """
    unified = {
        "organization_type": org_type,
        "name": data["name"],
        "country": data["country"],
        "headquarters_location": data.get("headquarters_location", ""),
        "relationship": data.get("relationship", ""),
        "notes": data.get("notes", ""),
        "starred": data.get("starred", False),
        "created_at": data.get("created_at", datetime.now().isoformat()),
        "last_updated": data.get("last_updated", datetime.now().isoformat()),
    }

    if org_type == "capital_partner":
        unified.update({
            "type": data.get("type"),
            "agent_type": None,
            "company_description": data.get("company_description", ""),
            "preferences": data.get("preferences", {}),
            "investment_min": data.get("investment_min", 0),
            "investment_max": data.get("investment_max", 0),
            "investment_need_min": None,
            "investment_need_max": None,
            "currency": data.get("currency", "USD"),
        })

    elif org_type == "sponsor":
        # Merge infrastructure_types and regions into single preferences object
        preferences = {}
        if "infrastructure_types" in data:
            preferences.update(data["infrastructure_types"])
        if "regions" in data:
            preferences.update(data["regions"])

        unified.update({
            "type": None,
            "agent_type": None,
            "company_description": data.get("company_description", ""),
            "preferences": preferences,
            "investment_min": None,
            "investment_max": None,
            "investment_need_min": data.get("investment_need_min", 0),
            "investment_need_max": data.get("investment_need_max", 0),
            "currency": data.get("currency", "USD"),
        })

    elif org_type == "counsel":
        unified.update({
            "type": None,
            "agent_type": None,
            "company_description": None,
            "preferences": data.get("counsel_preferences", {}),
            "investment_min": None,
            "investment_max": None,
            "investment_need_min": None,
            "investment_need_max": None,
            "currency": None,
        })

    elif org_type == "agent":
        unified.update({
            "type": None,
            "agent_type": data.get("agent_type"),
            "company_description": None,
            "preferences": data.get("agent_preferences", {}),
            "investment_min": None,
            "investment_max": None,
            "investment_need_min": None,
            "investment_need_max": None,
            "currency": None,
        })

    return unified


# ============================================================================
# ORGANIZATION CRUD OPERATIONS
# ============================================================================

def get_all_organizations(org_type: str) -> List[Dict[str, Any]]:
    """
    Get all organizations of a specific type.

    Args:
        org_type: Organization type (capital_partner, sponsor, counsel, agent)

    Returns:
        List of organizations in legacy format
    """
    orgs_path = get_organizations_path()
    all_orgs = read_json_list(orgs_path)

    # Filter by type
    filtered = [org for org in all_orgs if org.get("organization_type") == org_type]

    # Transform to legacy format
    return [transform_to_legacy_format(org, org_type) for org in filtered]


def get_organization_by_id(org_id: str, org_type: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific organization by ID and type.

    Args:
        org_id: Organization ID
        org_type: Organization type

    Returns:
        Organization in legacy format, or None if not found
    """
    orgs_path = get_organizations_path()
    all_orgs = read_json_list(orgs_path)

    org = find_by_id(all_orgs, 'id', org_id)

    if not org or org.get("organization_type") != org_type:
        return None

    return transform_to_legacy_format(org, org_type)


def create_organization(data: Dict[str, Any], org_type: str) -> Optional[Dict[str, Any]]:
    """
    Create a new organization.

    Args:
        data: Organization data in legacy format
        org_type: Organization type

    Returns:
        Created organization in legacy format, or None on failure
    """
    orgs_path = get_organizations_path()
    all_orgs = read_json_list(orgs_path)

    # Transform to unified format
    unified = transform_from_legacy_format(data, org_type)
    unified["id"] = data["id"]  # Use provided ID

    # Add to list
    all_orgs.append(unified)

    # Save
    if write_json_file(orgs_path, all_orgs):
        return transform_to_legacy_format(unified, org_type)

    return None


def update_organization(org_id: str, data: Dict[str, Any], org_type: str) -> Optional[Dict[str, Any]]:
    """
    Update an existing organization.

    Args:
        org_id: Organization ID
        data: Updated data in legacy format
        org_type: Organization type

    Returns:
        Updated organization in legacy format, or None on failure
    """
    orgs_path = get_organizations_path()
    all_orgs = read_json_list(orgs_path)

    # Find organization
    org = find_by_id(all_orgs, 'id', org_id)

    if not org or org.get("organization_type") != org_type:
        return None

    # Transform update data to unified format
    unified_update = transform_from_legacy_format(data, org_type)

    # Update fields
    for key, value in unified_update.items():
        org[key] = value

    org["last_updated"] = datetime.now().isoformat()

    # Save
    if write_json_file(orgs_path, all_orgs):
        return transform_to_legacy_format(org, org_type)

    return None


def delete_organization(org_id: str, org_type: str) -> bool:
    """
    Delete an organization.

    Args:
        org_id: Organization ID
        org_type: Organization type

    Returns:
        True if successful, False otherwise
    """
    orgs_path = get_organizations_path()
    all_orgs = read_json_list(orgs_path)

    # Find and remove organization
    org = find_by_id(all_orgs, 'id', org_id)

    if not org or org.get("organization_type") != org_type:
        return False

    all_orgs.remove(org)

    return write_json_file(orgs_path, all_orgs)


# ============================================================================
# CONTACT CRUD OPERATIONS
# ============================================================================

def get_all_contacts(org_type: str, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get all contacts for a specific organization type.

    Args:
        org_type: Organization type
        org_id: Optional organization ID to filter by

    Returns:
        List of contacts in legacy format
    """
    contacts_path = get_contacts_path()
    all_contacts = read_json_list(contacts_path)

    # Filter by organization type
    filtered = [c for c in all_contacts if c.get("organization_type") == org_type]

    # Filter by organization ID if provided
    if org_id:
        parent_id_field = ORGANIZATION_TYPES[org_type]["parent_id_field"]
        filtered = [c for c in filtered if c.get(parent_id_field) == org_id or c.get("organization_id") == org_id]

    return filtered


def get_contact_by_id(contact_id: str, org_type: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific contact by ID and organization type.

    Args:
        contact_id: Contact ID
        org_type: Organization type

    Returns:
        Contact data, or None if not found
    """
    contacts_path = get_contacts_path()
    all_contacts = read_json_list(contacts_path)

    contact = find_by_id(all_contacts, 'id', contact_id)

    if not contact or contact.get("organization_type") != org_type:
        return None

    return contact


def create_contact(data: Dict[str, Any], org_type: str) -> Optional[Dict[str, Any]]:
    """
    Create a new contact.

    Args:
        data: Contact data
        org_type: Organization type

    Returns:
        Created contact, or None on failure
    """
    contacts_path = get_contacts_path()
    all_contacts = read_json_list(contacts_path)

    # Ensure organization_type is set
    data["organization_type"] = org_type

    # Ensure organization_id is set from legacy parent ID field if present
    parent_id_field = ORGANIZATION_TYPES[org_type]["parent_id_field"]
    if parent_id_field in data and "organization_id" not in data:
        data["organization_id"] = data[parent_id_field]

    # Add to list
    all_contacts.append(data)

    # Save
    if write_json_file(contacts_path, all_contacts):
        return data

    return None


def update_contact(contact_id: str, data: Dict[str, Any], org_type: str) -> Optional[Dict[str, Any]]:
    """
    Update an existing contact.

    Args:
        contact_id: Contact ID
        data: Updated contact data
        org_type: Organization type

    Returns:
        Updated contact, or None on failure
    """
    contacts_path = get_contacts_path()
    all_contacts = read_json_list(contacts_path)

    # Find contact
    contact = find_by_id(all_contacts, 'id', contact_id)

    if not contact or contact.get("organization_type") != org_type:
        return None

    # Update fields
    for key, value in data.items():
        contact[key] = value

    contact["last_updated"] = datetime.now().isoformat()

    # Save
    if write_json_file(contacts_path, all_contacts):
        return contact

    return None


def delete_contact(contact_id: str, org_type: str) -> bool:
    """
    Delete a contact.

    Args:
        contact_id: Contact ID
        org_type: Organization type

    Returns:
        True if successful, False otherwise
    """
    contacts_path = get_contacts_path()
    all_contacts = read_json_list(contacts_path)

    # Find and remove contact
    contact = find_by_id(all_contacts, 'id', contact_id)

    if not contact or contact.get("organization_type") != org_type:
        return False

    all_contacts.remove(contact)

    return write_json_file(contacts_path, all_contacts)


def delete_contacts_by_organization(org_id: str, org_type: str) -> bool:
    """
    Delete all contacts associated with an organization (cascade delete).

    Args:
        org_id: Organization ID
        org_type: Organization type

    Returns:
        True if successful, False otherwise
    """
    contacts_path = get_contacts_path()
    all_contacts = read_json_list(contacts_path)

    # Filter out contacts for this organization
    parent_id_field = ORGANIZATION_TYPES[org_type]["parent_id_field"]
    remaining = [
        c for c in all_contacts
        if not (c.get("organization_type") == org_type and
                (c.get(parent_id_field) == org_id or c.get("organization_id") == org_id))
    ]

    return write_json_file(contacts_path, remaining)
