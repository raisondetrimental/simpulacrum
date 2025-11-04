"""
Deal Participant model and validation logic
Represents the relationship between entities (capital partners, teams, corporates, counsel) and deals
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import time


# Entity types that can participate in deals
PARTICIPANT_ENTITY_TYPES = [
    'capital_partner',
    'team',
    'corporate',
    'legal_advisor',
    'agent'
]

# Roles by entity type
PARTICIPANT_ROLES = {
    'capital_partner': [
        'lender',
        'arranger',
        'lead_arranger',
        'agent',
        'bookrunner',
        'underwriter',
        'guarantor',
        'investor'
    ],
    'team': [
        'lender',
        'arranger',
        'investor'
    ],
    'corporate': [
        'sponsor',
        'borrower',
        'guarantor',
        'offtaker',
        'epc_contractor',
        'operator'
    ],
    'legal_advisor': [
        'lender_counsel',
        'sponsor_counsel',
        'agent_counsel',
        'general_counsel'
    ],
    'agent': [
        'placement_agent',
        'underwriter',
        'settlement_agent',
        'clearing_agent',
        'trustee',
        'paying_agent',
        'fiscal_agent',
        'administrative_agent',
        'collateral_agent'
    ]
}

# Seniority levels
PARTICIPANT_SENIORITY = [
    'senior',
    'mezzanine',
    'subordinated',
    'equity',
    'other'
]

# Participation status
PARTICIPANT_STATUS = [
    'committed',
    'funded',
    'active',
    'repaid',
    'sold',
    'cancelled'
]

# Ticket size categories
TICKET_SIZE_CATEGORIES = ['small', 'medium', 'large']


class DealParticipant:
    """
    Deal Participant entity representing the relationship between an entity and a deal
    Handles validation and business logic for participant records
    """

    @staticmethod
    def generate_id() -> str:
        """Generate unique timestamp-based ID for new participant"""
        return f"participant_{int(time.time() * 1000)}"

    @staticmethod
    def validate_required_fields(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate that required fields are present and valid

        Args:
            data: Participant data dictionary

        Returns:
            (is_valid, error_message) tuple
        """
        required_fields = ['deal_id', 'entity_type', 'entity_id', 'role']

        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Missing required field: {field}"

        # Validate entity_type
        if data['entity_type'] not in PARTICIPANT_ENTITY_TYPES:
            return False, f"Invalid entity_type. Must be one of: {', '.join(PARTICIPANT_ENTITY_TYPES)}"

        # Validate role for entity type
        entity_type = data['entity_type']
        role = data['role']

        valid_roles = PARTICIPANT_ROLES.get(entity_type, [])
        if role not in valid_roles:
            return False, f"Invalid role '{role}' for entity_type '{entity_type}'. Must be one of: {', '.join(valid_roles)}"

        # Validate seniority if provided
        if 'seniority' in data and data['seniority'] and data['seniority'] not in PARTICIPANT_SENIORITY:
            return False, f"Invalid seniority. Must be one of: {', '.join(PARTICIPANT_SENIORITY)}"

        # Validate status if provided
        if 'status' in data and data['status'] and data['status'] not in PARTICIPANT_STATUS:
            return False, f"Invalid status. Must be one of: {', '.join(PARTICIPANT_STATUS)}"

        return True, None

    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create new participant record with generated ID and timestamps

        Args:
            data: Participant data dictionary

        Returns:
            Complete participant record
        """
        now = datetime.now().isoformat()

        participant = {
            "id": DealParticipant.generate_id(),
            "deal_id": data.get('deal_id', ''),

            # Entity Reference
            "entity_type": data.get('entity_type', ''),
            "entity_id": data.get('entity_id', ''),

            # Role & Participation
            "role": data.get('role', ''),
            "role_detail": data.get('role_detail', ''),

            # Financial Commitment
            "commitment_amount": data.get('commitment_amount', 0),
            "funded_amount": data.get('funded_amount', 0),
            "participation_pct": data.get('participation_pct', 0),
            "hold_amount": data.get('hold_amount', 0),
            "sold_amount": data.get('sold_amount', 0),

            # Terms specific to this participant
            "seniority": data.get('seniority', ''),
            "ticket_size_category": data.get('ticket_size_category', ''),

            # Dates
            "commitment_date": data.get('commitment_date', ''),
            "funded_date": data.get('funded_date', ''),

            # Status
            "status": data.get('status', 'committed'),

            # Notes
            "notes": data.get('notes', ''),

            # Metadata
            "created_at": now,
            "updated_at": now
        }

        return participant

    @staticmethod
    def update(existing_participant: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update existing participant with new data

        Args:
            existing_participant: Current participant record
            updates: Fields to update

        Returns:
            Updated participant record
        """
        # Update all provided fields
        for key, value in updates.items():
            if key not in ['id', 'deal_id', 'created_at']:  # Don't allow updating these
                existing_participant[key] = value

        # Always update timestamp
        existing_participant['updated_at'] = datetime.now().isoformat()

        return existing_participant

    @staticmethod
    def calculate_participation_percentage(commitment: float, total_size: float) -> float:
        """
        Calculate participation percentage

        Args:
            commitment: Participant's commitment amount
            total_size: Total deal size

        Returns:
            Participation percentage (0-100)
        """
        if total_size == 0:
            return 0.0

        return round((commitment / total_size) * 100, 2)

    @staticmethod
    def validate_participants_for_deal(participants: List[Dict[str, Any]], total_size: float) -> tuple[bool, Optional[str]]:
        """
        Validate that participants' commitments don't exceed deal size

        Args:
            participants: List of participant records
            total_size: Total deal size

        Returns:
            (is_valid, error_message) tuple
        """
        total_commitments = sum(p.get('commitment_amount', 0) for p in participants)

        if total_commitments > total_size:
            return False, f"Total commitments ({total_commitments}) exceed deal size ({total_size})"

        return True, None

    @staticmethod
    def get_participants_by_role(participants: List[Dict[str, Any]], role: str) -> List[Dict[str, Any]]:
        """
        Filter participants by role

        Args:
            participants: List of all participants
            role: Role to filter by

        Returns:
            List of participants with specified role
        """
        return [p for p in participants if p.get('role') == role]

    @staticmethod
    def get_lenders(participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get all lender participants"""
        return [p for p in participants if p.get('role') in ['lender', 'arranger', 'lead_arranger']]

    @staticmethod
    def get_sponsors(participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get all sponsor participants"""
        return [p for p in participants if p.get('role') == 'sponsor']

    @staticmethod
    def get_counsel(participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get all counsel participants"""
        return [p for p in participants if p.get('entity_type') == 'legal_advisor']

    @staticmethod
    def get_agents(participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get all agent participants"""
        return [p for p in participants if p.get('entity_type') == 'agent']
