"""
Deal model and validation logic
Represents a financial transaction with comprehensive deal information
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import time


# Deal status options
DEAL_STATUSES = ['pipeline', 'active', 'closed', 'cancelled']

# Deal types
DEAL_TYPES = [
    'project_finance',
    'corporate_loan',
    'bond',
    'mezzanine',
    'equity',
    'bridge_loan',
    'term_loan',
    'revolving_credit',
    'hybrid',
    'other'
]

# Sectors
DEAL_SECTORS = [
    'energy',
    'transport',
    'social',
    'telecom',
    'water',
    'digital',
    'real_estate',
    'other'
]

# Sub-sectors (energy example)
DEAL_SUB_SECTORS = {
    'energy': ['renewable_solar', 'renewable_wind', 'renewable_hydro', 'oil_gas', 'nuclear', 'thermal', 'other'],
    'transport': ['rail', 'road', 'aviation', 'ports', 'logistics', 'other'],
    'social': ['healthcare', 'education', 'housing', 'other'],
    'telecom': ['mobile', 'broadband', 'data_centers', 'towers', 'other'],
    'water': ['treatment', 'distribution', 'desalination', 'other'],
    'digital': ['fiber', 'cloud', 'software', 'other'],
    'real_estate': ['commercial', 'residential', 'industrial', 'other'],
    'other': ['other']
}

# Deal structures
DEAL_STRUCTURES = [
    'Senior Secured',
    'Senior Unsecured',
    'Subordinated',
    'Mezzanine',
    'Hybrid',
    'Convertible',
    'Bridge Loan',
    'Term Loan',
    'Revolving Credit',
    'Bond',
    'Other'
]

# Syndication types
SYNDICATION_TYPES = ['club', 'underwritten', 'best_efforts', 'bilateral', 'other']

# Regions
DEAL_REGIONS = [
    'US',
    'Europe Developed',
    'Asia Developed',
    'Emerging Markets',
    'Asia EM',
    'Africa EM',
    'LATAM EM',
    'EMEA EM',
    'Other'
]


class Deal:
    """
    Deal entity representing a financial transaction
    Handles validation and business logic for deal records
    """

    @staticmethod
    def generate_id() -> str:
        """Generate unique timestamp-based ID for new deal"""
        return f"deal_{int(time.time() * 1000)}"

    @staticmethod
    def validate_required_fields(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate that required fields are present and valid

        Args:
            data: Deal data dictionary

        Returns:
            (is_valid, error_message) tuple
        """
        required_fields = ['deal_name', 'currency', 'status']

        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Missing required field: {field}"

        # Validate status
        if data['status'] not in DEAL_STATUSES:
            return False, f"Invalid status. Must be one of: {', '.join(DEAL_STATUSES)}"

        # Validate deal type if provided
        if 'deal_type' in data and data['deal_type'] and data['deal_type'] not in DEAL_TYPES:
            return False, f"Invalid deal_type. Must be one of: {', '.join(DEAL_TYPES)}"

        # Validate structure if provided
        if 'structure' in data and data['structure'] and data['structure'] not in DEAL_STRUCTURES:
            return False, f"Invalid structure. Must be one of: {', '.join(DEAL_STRUCTURES)}"

        return True, None

    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create new deal record with generated ID and timestamps

        Args:
            data: Deal data dictionary

        Returns:
            Complete deal record
        """
        now = datetime.now().isoformat()

        deal = {
            "id": Deal.generate_id(),

            # Basic Information
            "deal_name": data.get('deal_name', ''),
            "deal_number": data.get('deal_number', ''),

            # Dates
            "deal_date": data.get('deal_date', ''),
            "signing_date": data.get('signing_date', ''),
            "closing_date": data.get('closing_date', ''),
            "first_drawdown_date": data.get('first_drawdown_date', ''),
            "maturity_date": data.get('maturity_date', ''),

            # Classification
            "status": data.get('status', 'pipeline'),
            "deal_type": data.get('deal_type', ''),
            "sector": data.get('sector', ''),
            "sub_sector": data.get('sub_sector', ''),
            "country": data.get('country', ''),
            "region": data.get('region', ''),

            # Financial Terms
            "total_size": data.get('total_size', 0),
            "currency": data.get('currency', 'USD'),
            "structure": data.get('structure', ''),
            "pricing": data.get('pricing', ''),
            "spread_bps": data.get('spread_bps', 0),
            "all_in_rate": data.get('all_in_rate', 0),
            "maturity": data.get('maturity', ''),

            # Fees
            "upfront_fee_bps": data.get('upfront_fee_bps', 0),
            "commitment_fee_bps": data.get('commitment_fee_bps', 0),
            "agency_fee": data.get('agency_fee', 0),

            # Covenants & Terms
            "covenants": data.get('covenants', {}),

            # Security & Guarantees
            "security_package": data.get('security_package', ''),
            "guarantees": data.get('guarantees', []),

            # Project Details
            "project_name": data.get('project_name', ''),
            "project_capacity": data.get('project_capacity', ''),
            "project_description": data.get('project_description', ''),

            # Documentation
            "description": data.get('description', ''),
            "notes": data.get('notes', ''),
            "key_risks": data.get('key_risks', ''),
            "mitigants": data.get('mitigants', ''),

            # Syndication
            "syndication_type": data.get('syndication_type', ''),
            "lead_arranger_id": data.get('lead_arranger_id', ''),

            # Metadata
            "created_at": now,
            "updated_at": now,
            "created_by": data.get('created_by', ''),
            "deal_team_members": data.get('deal_team_members', [])
        }

        return deal

    @staticmethod
    def update(existing_deal: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update existing deal with new data

        Args:
            existing_deal: Current deal record
            updates: Fields to update

        Returns:
            Updated deal record
        """
        # Update all provided fields
        for key, value in updates.items():
            if key not in ['id', 'created_at']:  # Don't allow updating these
                existing_deal[key] = value

        # Always update timestamp
        existing_deal['updated_at'] = datetime.now().isoformat()

        return existing_deal

    @staticmethod
    def calculate_maturity_years(deal: Dict[str, Any]) -> Optional[float]:
        """
        Calculate maturity in years from dates

        Args:
            deal: Deal record

        Returns:
            Years to maturity or None if dates missing
        """
        if not deal.get('closing_date') or not deal.get('maturity_date'):
            return None

        try:
            closing = datetime.fromisoformat(deal['closing_date'].replace('Z', '+00:00'))
            maturity = datetime.fromisoformat(deal['maturity_date'].replace('Z', '+00:00'))

            days_diff = (maturity - closing).days
            return round(days_diff / 365.25, 2)
        except (ValueError, AttributeError):
            return None

    @staticmethod
    def format_size(size: float, currency: str) -> str:
        """
        Format deal size for display

        Args:
            size: Deal size in base currency
            currency: Currency code

        Returns:
            Formatted string (e.g., "USD 250M")
        """
        if size >= 1_000_000_000:
            return f"{currency} {size / 1_000_000_000:.2f}B"
        elif size >= 1_000_000:
            return f"{currency} {size / 1_000_000:.2f}M"
        elif size >= 1_000:
            return f"{currency} {size / 1_000:.2f}K"
        else:
            return f"{currency} {size:,.0f}"
