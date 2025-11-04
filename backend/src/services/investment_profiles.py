"""Utility functions to build normalized investment profiles across Capital Partners and Sponsors."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Tuple

from ..constants.shared import SHARED_PREFERENCE_KEYS

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "json"

CAPITAL_PARTNERS_PATH = DATA_DIR / "capital_partners.json"
CORPORATES_PATH = DATA_DIR / "corporates.json"

DEFAULT_FLAG_VALUE = "any"
TRUE_VALUES = {"y", "yes", "true", "1"}
FALSE_VALUES = {"n", "no", "false", "0"}


def _load_json(path: Path) -> Any:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _normalize_flag(value: Optional[str]) -> str:
    if value is None:
        return DEFAULT_FLAG_VALUE
    normalized = str(value).strip().lower()
    if normalized in TRUE_VALUES:
        return "Y"
    if normalized in FALSE_VALUES or normalized == "":
        return "N"
    return DEFAULT_FLAG_VALUE


@dataclass
class InvestmentProfile:
    profile_id: str
    category: str  # one of: capital_partner, sponsor
    entity_id: str
    name: str
    organization_name: str
    relationship: Optional[str]
    currency: Optional[str]
    ticket_min: Optional[float]
    ticket_max: Optional[float]
    preferences: Dict[str, str] = field(default_factory=dict)
    capital_partner_id: Optional[str] = None
    capital_partner_name: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "profile_id": self.profile_id,
            "category": self.category,
            "entity_id": self.entity_id,
            "name": self.name,
            "organization_name": self.organization_name,
            "relationship": self.relationship,
            "currency": self.currency,
            "ticket_min": self.ticket_min,
            "ticket_max": self.ticket_max,
            "preferences": self.preferences,
            "capital_partner_id": self.capital_partner_id,
            "capital_partner_name": self.capital_partner_name,
            "metadata": self.metadata,
        }


def _init_preferences() -> Dict[str, str]:
    return {key: DEFAULT_FLAG_VALUE for key in SHARED_PREFERENCE_KEYS}


def _safe_number(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        number = float(value)
        return number
    except (TypeError, ValueError):
        return None


def _build_capital_partner_profiles(partners: List[Mapping[str, Any]]) -> List[InvestmentProfile]:
    """Build investment profiles directly from capital partners (which now have preferences)."""
    profiles: List[InvestmentProfile] = []
    for partner in partners:
        partner_id = partner.get("id")
        if not partner_id:
            continue

        # Normalize preferences from partner
        preferences = _init_preferences()
        partner_prefs: Mapping[str, Any] = partner.get("preferences", {})
        for key in SHARED_PREFERENCE_KEYS:
            preferences[key] = _normalize_flag(partner_prefs.get(key))

        profile = InvestmentProfile(
            profile_id=f"capital_partner:{partner_id}",
            category="capital_partner",
            entity_id=partner_id,
            name=partner.get("name") or "Capital Partner",
            organization_name=partner.get("name") or "Capital Partner",
            relationship=partner.get("relationship"),
            currency=partner.get("currency"),
            ticket_min=_safe_number(partner.get("investment_min")),
            ticket_max=_safe_number(partner.get("investment_max")),
            preferences=preferences,
            capital_partner_id=partner_id,
            capital_partner_name=partner.get("name"),
            metadata={
                "type": partner.get("type"),
                "country": partner.get("country"),
                "headquarters_location": partner.get("headquarters_location"),
            },
        )
        profiles.append(profile)
    return profiles


def _build_sponsor_profiles(corporates: List[Mapping[str, Any]]) -> List[InvestmentProfile]:
    profiles: List[InvestmentProfile] = []
    for corp in corporates:
        corp_id = corp.get("id")
        if not corp_id:
            continue
        preferences = _init_preferences()
        infrastructure = corp.get("infrastructure_types", {})
        regions = corp.get("regions", {})
        for key in SHARED_PREFERENCE_KEYS:
            if key in infrastructure:
                preferences[key] = _normalize_flag(infrastructure.get(key))
            elif key in regions:
                preferences[key] = _normalize_flag(regions.get(key))

        profile = InvestmentProfile(
            profile_id=f"sponsor:{corp_id}",
            category="sponsor",
            entity_id=corp_id,
            name=corp.get("name") or "Sponsor",
            organization_name=corp.get("name") or "Sponsor",
            relationship=corp.get("relationship"),
            currency=corp.get("currency"),
            ticket_min=_safe_number(corp.get("investment_need_min")),
            ticket_max=_safe_number(corp.get("investment_need_max")),
            preferences=preferences,
            metadata={
                "country": corp.get("country"),
                "headquarters_location": corp.get("headquarters_location"),
            },
        )
        profiles.append(profile)
    return profiles


def build_investment_profiles(
    *,
    capital_partners_path: Path = CAPITAL_PARTNERS_PATH,
    corporates_path: Path = CORPORATES_PATH,
) -> Dict[str, Any]:
    """Return a normalized view of investment profiles across the CRM datasets."""
    capital_partners: List[Mapping[str, Any]] = _load_json(capital_partners_path) or []
    corporates: List[Mapping[str, Any]] = _load_json(corporates_path) or []

    partner_profiles = _build_capital_partner_profiles(capital_partners)
    sponsor_profiles = _build_sponsor_profiles(corporates)

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "preference_keys": list(SHARED_PREFERENCE_KEYS),
        "capital_partners": [profile.to_dict() for profile in partner_profiles],
        "sponsors": [profile.to_dict() for profile in sponsor_profiles],
    }


__all__ = ["build_investment_profiles", "SHARED_PREFERENCE_KEYS"]
