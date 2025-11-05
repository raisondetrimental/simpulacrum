"""
Investment Matching Service - Simplified Version
Simple filtering logic to find matching organizations
"""
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
from datetime import datetime


def _load_json(file_path: Path) -> List[Dict[str, Any]]:
    """
    Load JSON file and return list

    DEPRECATED: This function is kept for backward compatibility but is no longer used.
    The service now uses the unified DAL to access organization and contact data.
    """
    if not file_path.exists():
        return []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []


def _normalize_ticket_range(ticket_range: Optional[Dict[str, Any]]) -> tuple:
    """Normalize ticket range to (min, max) in absolute dollars"""
    if not ticket_range:
        return (None, None)

    unit = str(ticket_range.get("unit", "million")).lower()
    min_val = ticket_range.get("minInvestment", 0)
    max_val = ticket_range.get("maxInvestment", 0)

    # Convert to absolute dollars
    if unit in {"million", "millions", "mm"}:
        min_val = min_val * 1_000_000 if min_val else None
        max_val = max_val * 1_000_000 if max_val else None
    else:
        min_val = min_val if min_val else None
        max_val = max_val if max_val else None

    return (min_val, max_val)


def _matches_preferences(entity_prefs: Dict[str, str], filters: Dict[str, str]) -> bool:
    """
    Check if entity preferences match the filters.
    "any" values in entity pass all filters.
    """
    for key, filter_value in filters.items():
        entity_value = str(entity_prefs.get(key, "any")).upper()

        # "any" is a wildcard - always matches
        if entity_value == "ANY":
            continue

        # Filter requires Y, entity must have Y
        if filter_value.upper() == "Y" and entity_value != "Y":
            return False

        # Filter requires N, entity must have N (not Y)
        if filter_value.upper() == "N" and entity_value == "Y":
            return False

    return True


def _matches_ticket_range(entity_min: Optional[float], entity_max: Optional[float],
                          filter_min: Optional[float], filter_max: Optional[float]) -> bool:
    """Check if entity ticket range overlaps with filter range"""
    # If no filter constraints, pass
    if filter_min is None and filter_max is None:
        return True

    # If filter has constraints but entity has no range, reject
    if (filter_min or filter_max) and entity_min is None and entity_max is None:
        # Allow entities with no specified range if they're service providers (agents/counsel)
        return True

    # Check overlap
    if filter_min is not None:
        if entity_max is not None and entity_max < filter_min:
            return False

    if filter_max is not None:
        if entity_min is not None and entity_min > filter_max:
            return False

    return True


def find_matching_organizations(
    json_dir: Path,
    preference_filters: Dict[str, str],
    ticket_range: Optional[Dict[str, Any]]
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Find organizations matching the strategy filters.
    Returns dict with keys: capital_partners, sponsors, agents, counsel

    Note: Uses unified DAL to access organization data from organizations.json
    """
    # Import unified DAL functions
    from ..utils.unified_dal import get_all_organizations

    # Load all CRM data from unified database
    # The DAL returns data in legacy format, so existing logic continues to work
    capital_partners = get_all_organizations("capital_partner")
    corporates = get_all_organizations("sponsor")
    agents = get_all_organizations("agent")
    legal_advisors = get_all_organizations("counsel")

    # Normalize ticket range
    filter_min, filter_max = _normalize_ticket_range(ticket_range)

    # Filter capital partners
    matching_partners = []
    for partner in capital_partners:
        prefs = partner.get("preferences", {})
        if not _matches_preferences(prefs, preference_filters):
            continue

        entity_min = partner.get("investment_min")
        entity_max = partner.get("investment_max")
        if not _matches_ticket_range(entity_min, entity_max, filter_min, filter_max):
            continue

        matching_partners.append({
            "profile_id": partner.get("id"),
            "entity_id": partner.get("id"),
            "name": partner.get("name"),
            "organization_name": partner.get("name"),
            "category": "capital_partner",
            "relationship": partner.get("relationship"),
            "ticket_min": entity_min,
            "ticket_max": entity_max,
            "currency": partner.get("currency"),
            "preferences": prefs,
            "metadata": {
                "type": partner.get("type"),
                "country": partner.get("country"),
                "headquarters": partner.get("headquarters")
            }
        })

    # Filter sponsors (corporates)
    matching_sponsors = []
    for corp in corporates:
        # Sponsors have infrastructure_types and regions
        infra_types = corp.get("infrastructure_types", {})
        regions = corp.get("regions", {})

        # Combine both for preference matching
        combined_prefs = {**infra_types, **regions}

        if not _matches_preferences(combined_prefs, preference_filters):
            continue

        entity_min = corp.get("investment_need_min")
        entity_max = corp.get("investment_need_max")
        if not _matches_ticket_range(entity_min, entity_max, filter_min, filter_max):
            continue

        matching_sponsors.append({
            "profile_id": corp.get("id"),
            "entity_id": corp.get("id"),
            "name": corp.get("name"),
            "organization_name": corp.get("name"),
            "category": "sponsor",
            "relationship": corp.get("relationship"),
            "ticket_min": entity_min,
            "ticket_max": entity_max,
            "currency": corp.get("currency"),
            "preferences": combined_prefs,
            "metadata": {
                "country": corp.get("country"),
                "headquarters_location": corp.get("headquarters_location")
            }
        })

    # Filter agents
    matching_agents = []
    for agent in agents:
        agent_prefs = agent.get("agent_preferences", {})

        if not _matches_preferences(agent_prefs, preference_filters):
            continue

        # Agents don't have ticket sizes, so skip ticket range check
        matching_agents.append({
            "profile_id": agent.get("id"),
            "entity_id": agent.get("id"),
            "name": agent.get("name"),
            "organization_name": agent.get("name"),
            "category": "agent",
            "relationship": agent.get("relationship"),
            "ticket_min": None,
            "ticket_max": None,
            "currency": None,
            "preferences": agent_prefs,
            "metadata": {
                "agent_type": agent.get("agent_type"),
                "country": agent.get("country"),
                "headquarters_location": agent.get("headquarters_location")
            }
        })

    # Filter counsel
    matching_counsel = []
    for advisor in legal_advisors:
        counsel_prefs = advisor.get("counsel_preferences", {})

        if not _matches_preferences(counsel_prefs, preference_filters):
            continue

        # Counsel don't have ticket sizes
        matching_counsel.append({
            "profile_id": advisor.get("id"),
            "entity_id": advisor.get("id"),
            "name": advisor.get("name"),
            "organization_name": advisor.get("name"),
            "category": "counsel",
            "relationship": advisor.get("relationship"),
            "ticket_min": None,
            "ticket_max": None,
            "currency": None,
            "preferences": counsel_prefs,
            "metadata": {
                "country": advisor.get("country"),
                "headquarters_location": advisor.get("headquarters_location")
            }
        })

    return {
        "capital_partners": matching_partners,
        "sponsors": matching_sponsors,
        "agents": matching_agents,
        "counsel": matching_counsel
    }


def get_contacts_for_matches(
    json_dir: Path,
    matching_results: Dict[str, List[Dict[str, Any]]]
) -> Dict[str, Any]:
    """
    Aggregate contacts from all matching organizations.
    Returns dict with: all_contacts list and contact_stats object

    Note: Uses unified DAL to access contact data from unified contacts.json
    """
    # Import unified DAL functions
    from ..utils.unified_dal import get_all_contacts

    # Load all contact files from unified database
    # The DAL returns data in legacy format with parent ID fields preserved
    capital_contacts = get_all_contacts("capital_partner")
    sponsor_contacts = get_all_contacts("sponsor")
    agent_contacts = get_all_contacts("agent")
    counsel_contacts = get_all_contacts("counsel")

    all_contacts = []
    now = datetime.now()

    # Helper to check if reminder is overdue or upcoming
    def is_overdue(reminder_date_str):
        if not reminder_date_str:
            return False
        try:
            reminder_date = datetime.fromisoformat(reminder_date_str.replace('Z', '+00:00'))
            return reminder_date < now
        except:
            return False

    def is_upcoming(reminder_date_str):
        if not reminder_date_str:
            return False
        try:
            reminder_date = datetime.fromisoformat(reminder_date_str.replace('Z', '+00:00'))
            days_until = (reminder_date - now).days
            return 0 <= days_until <= 7
        except:
            return False

    # Process capital partner contacts
    capital_partner_ids = {cp["entity_id"] for cp in matching_results.get("capital_partners", [])}
    capital_partner_map = {cp["entity_id"]: cp for cp in matching_results.get("capital_partners", [])}

    for contact in capital_contacts:
        parent_id = contact.get("capital_partner_id")
        if parent_id in capital_partner_ids:
            parent = capital_partner_map[parent_id]
            all_contacts.append({
                "id": contact.get("id"),
                "name": contact.get("name"),
                "role": contact.get("role"),
                "email": contact.get("email"),
                "phone": contact.get("phone"),
                "team_name": contact.get("team_name"),
                "parent_org_id": parent_id,
                "parent_org_name": parent.get("name"),
                "parent_org_type": "capital_partner",
                "relationship": parent.get("relationship"),
                "last_contact_date": contact.get("last_contact_date"),
                "next_contact_reminder": contact.get("next_contact_reminder"),
                "meeting_history_count": len(contact.get("meeting_history", []))
            })

    # Process sponsor contacts
    sponsor_ids = {sp["entity_id"] for sp in matching_results.get("sponsors", [])}
    sponsor_map = {sp["entity_id"]: sp for sp in matching_results.get("sponsors", [])}

    for contact in sponsor_contacts:
        parent_id = contact.get("corporate_id")
        if parent_id in sponsor_ids:
            parent = sponsor_map[parent_id]
            all_contacts.append({
                "id": contact.get("id"),
                "name": contact.get("name"),
                "role": contact.get("role"),
                "email": contact.get("email"),
                "phone": contact.get("phone"),
                "team_name": contact.get("team_name", ""),
                "parent_org_id": parent_id,
                "parent_org_name": parent.get("name"),
                "parent_org_type": "sponsor",
                "relationship": parent.get("relationship"),
                "last_contact_date": contact.get("last_contact_date"),
                "next_contact_reminder": contact.get("next_contact_reminder"),
                "meeting_history_count": len(contact.get("meeting_history", []))
            })

    # Process agent contacts
    agent_ids = {ag["entity_id"] for ag in matching_results.get("agents", [])}
    agent_map = {ag["entity_id"]: ag for ag in matching_results.get("agents", [])}

    for contact in agent_contacts:
        parent_id = contact.get("agent_id")
        if parent_id in agent_ids:
            parent = agent_map[parent_id]
            all_contacts.append({
                "id": contact.get("id"),
                "name": contact.get("name"),
                "role": contact.get("role"),
                "email": contact.get("email"),
                "phone": contact.get("phone"),
                "team_name": contact.get("team_name", ""),
                "parent_org_id": parent_id,
                "parent_org_name": parent.get("name"),
                "parent_org_type": "agent",
                "relationship": parent.get("relationship"),
                "last_contact_date": contact.get("last_contact_date"),
                "next_contact_reminder": contact.get("next_contact_reminder"),
                "meeting_history_count": len(contact.get("meeting_history", []))
            })

    # Process counsel contacts
    counsel_ids = {co["entity_id"] for co in matching_results.get("counsel", [])}
    counsel_map = {co["entity_id"]: co for co in matching_results.get("counsel", [])}

    for contact in counsel_contacts:
        parent_id = contact.get("legal_advisor_id")
        if parent_id in counsel_ids:
            parent = counsel_map[parent_id]
            all_contacts.append({
                "id": contact.get("id"),
                "name": contact.get("name"),
                "role": contact.get("role"),
                "email": contact.get("email"),
                "phone": contact.get("phone"),
                "team_name": contact.get("team_name", ""),
                "parent_org_id": parent_id,
                "parent_org_name": parent.get("name"),
                "parent_org_type": "counsel",
                "relationship": parent.get("relationship"),
                "last_contact_date": contact.get("last_contact_date"),
                "next_contact_reminder": contact.get("next_contact_reminder"),
                "meeting_history_count": len(contact.get("meeting_history", []))
            })

    # Calculate statistics
    overdue_count = sum(1 for c in all_contacts if is_overdue(c.get("next_contact_reminder")))
    upcoming_count = sum(1 for c in all_contacts if is_upcoming(c.get("next_contact_reminder")))

    return {
        "all_contacts": all_contacts,
        "contact_stats": {
            "total_count": len(all_contacts),
            "overdue_reminders": overdue_count,
            "upcoming_reminders": upcoming_count
        }
    }


__all__ = ['find_matching_organizations', 'get_contacts_for_matches']
