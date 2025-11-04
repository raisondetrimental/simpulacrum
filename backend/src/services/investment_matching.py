"""Filtering and matching utilities for unified investment profile queries."""
from __future__ import annotations

from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

from .investment_profiles import SHARED_PREFERENCE_KEYS

DEFAULT_FLAG_VALUE = "any"
MILLION = 1_000_000.0


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _normalize_ticket_range(ticket_range: Optional[Mapping[str, Any]]) -> Tuple[Optional[float], Optional[float]]:
    if not ticket_range:
        return (None, None)

    unit = str(ticket_range.get("unit") or ticket_range.get("units") or "million").lower()
    raw_min = ticket_range.get("min")
    raw_max = ticket_range.get("max")
    if raw_min is None:
        raw_min = ticket_range.get("minInvestment")
    if raw_max is None:
        raw_max = ticket_range.get("maxInvestment")

    min_value = _to_float(raw_min)
    max_value = _to_float(raw_max)

    if unit in {"million", "millions", "mm"}:
        if min_value is not None:
            min_value *= MILLION
        if max_value is not None:
            max_value *= MILLION

    return (min_value, max_value)


def _range_satisfies_filter(
    profile_min: Optional[float], profile_max: Optional[float],
    filter_min: Optional[float], filter_max: Optional[float]
) -> bool:
    if filter_min is not None:
        if profile_max is not None and profile_max < filter_min:
            return False
    if filter_max is not None:
        if profile_min is not None and profile_min > filter_max:
            return False
    return True


def _normalize_preference_filters(preference_filters: Optional[Mapping[str, Any]]) -> Dict[str, str]:
    normalized: Dict[str, str] = {}
    if not preference_filters:
        return normalized
    for key, value in preference_filters.items():
        if key not in SHARED_PREFERENCE_KEYS:
            continue
        str_value = str(value).strip().upper()
        if str_value in {"", DEFAULT_FLAG_VALUE.upper()}:
            continue
        if str_value not in {"Y", "N"}:
            continue
        normalized[key] = str_value
    return normalized


def filter_profiles(
    profiles: Sequence[Mapping[str, Any]],
    *,
    preference_filters: Optional[Mapping[str, Any]] = None,
    ticket_range: Optional[Mapping[str, Any]] = None,
) -> List[Mapping[str, Any]]:
    """Filter a list of normalized profiles by shared preferences and ticket range."""
    pref_filters = _normalize_preference_filters(preference_filters)
    ticket_min, ticket_max = _normalize_ticket_range(ticket_range)

    filtered: List[Mapping[str, Any]] = []
    for profile in profiles:
        prefs = profile.get("preferences", {})
        matches = True
        for key, expected in pref_filters.items():
            value = str(prefs.get(key, DEFAULT_FLAG_VALUE)).upper()
            if expected == "Y" and value != "Y":
                matches = False
                break
            if expected == "N" and value == "Y":
                matches = False
                break
        if not matches:
            continue

        if ticket_min is not None or ticket_max is not None:
            if not _range_satisfies_filter(
                _to_float(profile.get("ticket_min")),
                _to_float(profile.get("ticket_max")),
                ticket_min,
                ticket_max,
            ):
                continue

        filtered.append(profile)
    return filtered


def _extract_positive_preferences(preferences: Mapping[str, Any]) -> set[str]:
    return {key for key, value in preferences.items() if str(value).upper() == "Y"}


def _ticket_overlap_range(
    a_min: Optional[float], a_max: Optional[float], b_min: Optional[float], b_max: Optional[float]
) -> Optional[Tuple[Optional[float], Optional[float]]]:
    lower_candidates = [v for v in (a_min, b_min) if v is not None]
    upper_candidates = [v for v in (a_max, b_max) if v is not None]

    lower = max(lower_candidates) if lower_candidates else None
    upper = min(upper_candidates) if upper_candidates else None

    if lower is not None and upper is not None and lower > upper:
        return None
    return (lower, upper)


def _build_match_entry(
    profile: Mapping[str, Any], overlap_preferences: Iterable[str], overlap_range: Optional[Tuple[Optional[float], Optional[float]]]
) -> Optional[Dict[str, Any]]:
    overlap_list = sorted(overlap_preferences)
    if not overlap_list:
        return None
    # If no ticket overlap, still create entry if there are preference overlaps
    # This handles cases where ticket ranges aren't set (0.0, 0.0)
    if overlap_range is None:
        min_val, max_val = None, None
    else:
        min_val, max_val = overlap_range
    return {
        "profile_id": profile.get("profile_id"),
        "entity_id": profile.get("entity_id"),
        "name": profile.get("name"),
        "organization_name": profile.get("organization_name"),
        "capital_partner_id": profile.get("capital_partner_id"),
        "capital_partner_name": profile.get("capital_partner_name"),
        "overlap_preferences": overlap_list,
        "overlap_size": len(overlap_list),
        "ticket_overlap": {
            "min": min_val,
            "max": max_val,
        },
        "ticket_min": profile.get("ticket_min"),
        "ticket_max": profile.get("ticket_max"),
        "relationship": profile.get("relationship"),
    }


def compute_pairings(
    sponsors: Sequence[Mapping[str, Any]],
    capital_partners: Sequence[Mapping[str, Any]],
    capital_partner_teams: Sequence[Mapping[str, Any]],
) -> Dict[str, Any]:
    """Compute sponsor ↔ partner/team overlaps for display."""
    sponsor_matches: List[Dict[str, Any]] = []
    for sponsor in sponsors:
        sponsor_true = _extract_positive_preferences(sponsor.get("preferences", {}))
        sponsor_ticket_min = _to_float(sponsor.get("ticket_min"))
        sponsor_ticket_max = _to_float(sponsor.get("ticket_max"))

        partner_entries: List[Dict[str, Any]] = []
        for partner in capital_partners:
            overlap = sponsor_true & _extract_positive_preferences(partner.get("preferences", {}))
            ticket_overlap = _ticket_overlap_range(
                sponsor_ticket_min, sponsor_ticket_max,
                _to_float(partner.get("ticket_min")), _to_float(partner.get("ticket_max")),
            )
            entry = _build_match_entry(partner, overlap, ticket_overlap)
            if entry:
                partner_entries.append(entry)

        team_entries: List[Dict[str, Any]] = []
        for team in capital_partner_teams:
            overlap = sponsor_true & _extract_positive_preferences(team.get("preferences", {}))
            ticket_overlap = _ticket_overlap_range(
                sponsor_ticket_min, sponsor_ticket_max,
                _to_float(team.get("ticket_min")), _to_float(team.get("ticket_max")),
            )
            entry = _build_match_entry(team, overlap, ticket_overlap)
            if entry:
                team_entries.append(entry)

        if partner_entries or team_entries:
            sponsor_matches.append(
                {
                    "sponsor_profile": sponsor,
                    "capital_partners": partner_entries,
                    "capital_partner_teams": team_entries,
                }
            )

    return {"by_sponsor": sponsor_matches}


__all__ = [
    "filter_profiles",
    "compute_pairings",
]
