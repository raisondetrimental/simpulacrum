"""
Data Cleanup Service
Detects and fixes data quality issues:
- Duplicate records
- Orphaned contacts
- Invalid references
- Data integrity issues
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from ..utils.json_store import read_json_file, write_json_file


class DataCleanup:
    """
    Data cleanup and integrity checking service
    """

    @staticmethod
    def _read_records(file_path: Path, key: str) -> List[Dict[str, Any]]:
        """Read records from file, handling both list and dict formats"""
        if not file_path.exists():
            return []

        data = read_json_file(file_path)

        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return data.get(key, [])
        else:
            return []

    @staticmethod
    def find_duplicates(json_dir: Path) -> Dict[str, Any]:
        """
        Find duplicate records across all entity types

        Duplicates are identified by:
        - Organizations: Same name + country
        - Contacts: Same name + email (if email exists)
        - Deals: Same deal_name + country

        Returns:
            Dict with duplicate groups
        """
        try:
            duplicates = {
                'organizations': [],
                'contacts': [],
                'deals': []
            }

            # Check organizations
            orgs_path = json_dir / 'organizations.json'
            orgs = DataCleanup._read_records(orgs_path, 'organizations')

            org_groups = {}
            for org in orgs:
                key = f"{org.get('name', '').lower()}_{org.get('country', '').lower()}"
                if key not in org_groups:
                    org_groups[key] = []
                org_groups[key].append(org)

            for key, group in org_groups.items():
                if len(group) > 1:
                    duplicates['organizations'].append({
                        'key': key,
                        'count': len(group),
                        'records': group
                    })

            # Check contacts
            contacts_path = json_dir / 'unified_contacts.json'
            contacts = DataCleanup._read_records(contacts_path, 'contacts')

            contact_groups = {}
            for contact in contacts:
                # Use name + email as key (email is more reliable than phone)
                email = contact.get('email', '').lower().strip()
                name = contact.get('name', '').lower().strip()
                if email:  # Only check if email exists
                    key = f"{name}_{email}"
                    if key not in contact_groups:
                        contact_groups[key] = []
                    contact_groups[key].append(contact)

            for key, group in contact_groups.items():
                if len(group) > 1:
                    duplicates['contacts'].append({
                        'key': key,
                        'count': len(group),
                        'records': group
                    })

            # Check deals
            deals_path = json_dir / 'deals.json'
            deals = DataCleanup._read_records(deals_path, 'deals')

            deal_groups = {}
            for deal in deals:
                key = f"{deal.get('deal_name', '').lower()}_{deal.get('country', '').lower()}"
                if key not in deal_groups:
                    deal_groups[key] = []
                deal_groups[key].append(deal)

            for key, group in deal_groups.items():
                if len(group) > 1:
                    duplicates['deals'].append({
                        'key': key,
                        'count': len(group),
                        'records': group
                    })

            total_duplicates = (
                len(duplicates['organizations']) +
                len(duplicates['contacts']) +
                len(duplicates['deals'])
            )

            return {
                'success': True,
                'duplicates': duplicates,
                'total_duplicate_groups': total_duplicates
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def find_orphaned_contacts(json_dir: Path) -> Dict[str, Any]:
        """
        Find contacts with non-existent organization IDs

        Returns:
            Dict with orphaned contacts
        """
        try:
            # Read organizations
            orgs_path = json_dir / 'organizations.json'
            orgs = DataCleanup._read_records(orgs_path, 'organizations')
            org_ids = {org.get('id') for org in orgs}

            # Read contacts
            contacts_path = json_dir / 'unified_contacts.json'
            contacts = DataCleanup._read_records(contacts_path, 'contacts')

            orphaned = []
            for contact in contacts:
                org_id = contact.get('organization_id')
                if org_id and org_id not in org_ids:
                    orphaned.append(contact)

            return {
                'success': True,
                'orphaned_contacts': orphaned,
                'total_orphaned': len(orphaned)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def find_invalid_references(json_dir: Path) -> Dict[str, Any]:
        """
        Find invalid references in deal participants

        Returns:
            Dict with invalid references
        """
        try:
            # Read deals
            deals_path = json_dir / 'deals.json'
            deals = DataCleanup._read_records(deals_path, 'deals')
            deal_ids = {deal.get('id') for deal in deals}

            # Read organizations
            orgs_path = json_dir / 'organizations.json'
            orgs = DataCleanup._read_records(orgs_path, 'organizations')
            org_ids = {org.get('id') for org in orgs}

            # Read deal participants
            participants_path = json_dir / 'deal_participants.json'
            participants = DataCleanup._read_records(participants_path, 'participants')

            invalid = []
            for participant in participants:
                issues = []

                # Check deal_id
                deal_id = participant.get('deal_id')
                if deal_id and deal_id not in deal_ids:
                    issues.append(f"Invalid deal_id: {deal_id}")

                # Check organization_id
                org_id = participant.get('organization_id')
                if org_id and org_id not in org_ids:
                    issues.append(f"Invalid organization_id: {org_id}")

                if issues:
                    invalid.append({
                        'participant': participant,
                        'issues': issues
                    })

            return {
                'success': True,
                'invalid_references': invalid,
                'total_invalid': len(invalid)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def find_data_integrity_issues(json_dir: Path) -> Dict[str, Any]:
        """
        Find data integrity issues (missing required fields, invalid dates, etc.)

        Returns:
            Dict with integrity issues
        """
        try:
            issues = {
                'organizations': [],
                'contacts': [],
                'deals': []
            }

            # Check organizations
            orgs_path = json_dir / 'organizations.json'
            orgs = DataCleanup._read_records(orgs_path, 'organizations')

            for org in orgs:
                org_issues = []

                # Required fields
                if not org.get('id'):
                    org_issues.append("Missing ID")
                if not org.get('name'):
                    org_issues.append("Missing name")
                if not org.get('organization_type'):
                    org_issues.append("Missing organization_type")

                # Validate dates
                for date_field in ['created_at', 'last_updated']:
                    date_val = org.get(date_field)
                    if date_val:
                        try:
                            datetime.fromisoformat(date_val)
                        except (ValueError, TypeError):
                            org_issues.append(f"Invalid {date_field}: {date_val}")

                if org_issues:
                    issues['organizations'].append({
                        'id': org.get('id', 'unknown'),
                        'name': org.get('name', 'unknown'),
                        'issues': org_issues
                    })

            # Check contacts
            contacts_path = json_dir / 'unified_contacts.json'
            contacts = DataCleanup._read_records(contacts_path, 'contacts')

            for contact in contacts:
                contact_issues = []

                # Required fields
                if not contact.get('id'):
                    contact_issues.append("Missing ID")
                if not contact.get('name'):
                    contact_issues.append("Missing name")
                if not contact.get('organization_id'):
                    contact_issues.append("Missing organization_id")
                if not contact.get('organization_type'):
                    contact_issues.append("Missing organization_type")

                # Validate email format (basic check)
                email = contact.get('email', '')
                if email and '@' not in email:
                    contact_issues.append(f"Invalid email format: {email}")

                # Validate dates
                for date_field in ['created_at', 'last_updated', 'last_contact_date', 'next_contact_reminder']:
                    date_val = contact.get(date_field)
                    if date_val:
                        try:
                            datetime.fromisoformat(date_val)
                        except (ValueError, TypeError):
                            contact_issues.append(f"Invalid {date_field}: {date_val}")

                if contact_issues:
                    issues['contacts'].append({
                        'id': contact.get('id', 'unknown'),
                        'name': contact.get('name', 'unknown'),
                        'issues': contact_issues
                    })

            # Check deals
            deals_path = json_dir / 'deals.json'
            deals = DataCleanup._read_records(deals_path, 'deals')

            for deal in deals:
                deal_issues = []

                # Required fields
                if not deal.get('id'):
                    deal_issues.append("Missing ID")
                if not deal.get('deal_name'):
                    deal_issues.append("Missing deal_name")
                if not deal.get('status'):
                    deal_issues.append("Missing status")

                # Validate numeric fields
                if deal.get('total_size') is not None:
                    try:
                        float(deal['total_size'])
                    except (ValueError, TypeError):
                        deal_issues.append(f"Invalid total_size: {deal['total_size']}")

                # Validate dates
                for date_field in ['created_at', 'updated_at', 'close_date']:
                    date_val = deal.get(date_field)
                    if date_val:
                        try:
                            datetime.fromisoformat(date_val)
                        except (ValueError, TypeError):
                            deal_issues.append(f"Invalid {date_field}: {date_val}")

                if deal_issues:
                    issues['deals'].append({
                        'id': deal.get('id', 'unknown'),
                        'name': deal.get('deal_name', 'unknown'),
                        'issues': deal_issues
                    })

            total_issues = (
                len(issues['organizations']) +
                len(issues['contacts']) +
                len(issues['deals'])
            )

            return {
                'success': True,
                'integrity_issues': issues,
                'total_issues': total_issues
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def scan_all_issues(json_dir: Path) -> Dict[str, Any]:
        """
        Comprehensive scan for all types of issues

        Returns:
            Dict with all detected issues
        """
        try:
            duplicates_result = DataCleanup.find_duplicates(json_dir)
            orphaned_result = DataCleanup.find_orphaned_contacts(json_dir)
            references_result = DataCleanup.find_invalid_references(json_dir)
            integrity_result = DataCleanup.find_data_integrity_issues(json_dir)

            return {
                'success': True,
                'scan_timestamp': datetime.now().isoformat(),
                'duplicates': duplicates_result.get('duplicates', {}),
                'total_duplicate_groups': duplicates_result.get('total_duplicate_groups', 0),
                'orphaned_contacts': orphaned_result.get('orphaned_contacts', []),
                'total_orphaned': orphaned_result.get('total_orphaned', 0),
                'invalid_references': references_result.get('invalid_references', []),
                'total_invalid_references': references_result.get('total_invalid', 0),
                'integrity_issues': integrity_result.get('integrity_issues', {}),
                'total_integrity_issues': integrity_result.get('total_issues', 0)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def delete_orphaned_contacts(json_dir: Path, contact_ids: List[str]) -> Dict[str, Any]:
        """
        Delete orphaned contacts

        Args:
            json_dir: Path to JSON directory
            contact_ids: List of contact IDs to delete

        Returns:
            Dict with deletion results
        """
        try:
            contacts_path = json_dir / 'unified_contacts.json'
            contacts = DataCleanup._read_records(contacts_path, 'contacts')

            # Filter out contacts to delete
            remaining = [c for c in contacts if c.get('id') not in contact_ids]
            deleted_count = len(contacts) - len(remaining)

            # Write updated contacts
            data = {
                'contacts': remaining,
                'total_count': len(remaining),
                'last_updated': datetime.now().isoformat()
            }
            write_json_file(contacts_path, data, create_backup=True)

            return {
                'success': True,
                'deleted_count': deleted_count,
                'remaining_count': len(remaining)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'deleted_count': 0
            }

    @staticmethod
    def delete_invalid_participants(json_dir: Path, participant_ids: List[str]) -> Dict[str, Any]:
        """
        Delete invalid deal participants

        Args:
            json_dir: Path to JSON directory
            participant_ids: List of participant IDs to delete

        Returns:
            Dict with deletion results
        """
        try:
            participants_path = json_dir / 'deal_participants.json'
            participants = DataCleanup._read_records(participants_path, 'participants')

            # Filter out participants to delete
            remaining = [p for p in participants if p.get('id') not in participant_ids]
            deleted_count = len(participants) - len(remaining)

            # Write updated participants
            data = {
                'participants': remaining,
                'total_count': len(remaining),
                'last_updated': datetime.now().isoformat()
            }
            write_json_file(participants_path, data, create_backup=True)

            return {
                'success': True,
                'deleted_count': deleted_count,
                'remaining_count': len(remaining)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'deleted_count': 0
            }
