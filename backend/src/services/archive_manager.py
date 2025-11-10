"""
Archive Manager Service
Handles archiving and restoration of records (deals, contacts, organizations)
Archives are moved to separate files (e.g., deals_archive.json)
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from ..utils.json_store import read_json_file, write_json_file


class ArchiveManager:
    """
    Manages archiving of records across different entity types

    Supported entity types:
    - deals
    - organizations
    - contacts
    """

    @staticmethod
    def _get_file_paths(entity_type: str, json_dir: Path) -> tuple[Path, Path]:
        """
        Get paths for main and archive files

        Returns:
            tuple: (main_file_path, archive_file_path)
        """
        file_mappings = {
            'deals': ('deals.json', 'deals_archive.json'),
            'organizations': ('organizations.json', 'organizations_archive.json'),
            'contacts': ('unified_contacts.json', 'contacts_archive.json')
        }

        if entity_type not in file_mappings:
            raise ValueError(f"Unsupported entity type: {entity_type}")

        main_file, archive_file = file_mappings[entity_type]
        return (json_dir / main_file, json_dir / archive_file)

    @staticmethod
    def _read_records(file_path: Path, entity_type: str) -> List[Dict[str, Any]]:
        """Read records from file, handling both list and dict formats"""
        if not file_path.exists():
            return []

        data = read_json_file(file_path)

        # Handle both list and dict formats
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            # Different entity types use different keys
            key_mappings = {
                'deals': 'deals',
                'organizations': 'organizations',
                'contacts': 'contacts'
            }
            key = key_mappings.get(entity_type, entity_type)
            return data.get(key, [])
        else:
            return []

    @staticmethod
    def _write_records(file_path: Path, records: List[Dict[str, Any]], entity_type: str) -> bool:
        """Write records to file in appropriate format"""
        # Wrap in object for consistency
        key_mappings = {
            'deals': 'deals',
            'organizations': 'organizations',
            'contacts': 'contacts'
        }
        key = key_mappings.get(entity_type, entity_type)

        data = {
            key: records,
            'total_count': len(records),
            'last_updated': datetime.now().isoformat()
        }

        return write_json_file(file_path, data, create_backup=True)

    @staticmethod
    def archive_records(
        entity_type: str,
        record_ids: List[str],
        json_dir: Path
    ) -> Dict[str, Any]:
        """
        Archive specific records by moving them from main file to archive file

        Args:
            entity_type: Type of entity ('deals', 'organizations', 'contacts')
            record_ids: List of record IDs to archive
            json_dir: Path to JSON directory

        Returns:
            Dict with success status, archived count, and any errors
        """
        try:
            # Get file paths
            main_path, archive_path = ArchiveManager._get_file_paths(entity_type, json_dir)

            # Read current records
            main_records = ArchiveManager._read_records(main_path, entity_type)
            archive_records = ArchiveManager._read_records(archive_path, entity_type)

            # Find records to archive
            to_archive = []
            remaining = []
            not_found = []

            for record in main_records:
                record_id = record.get('id')
                if record_id in record_ids:
                    # Add archive metadata
                    record['archived_at'] = datetime.now().isoformat()
                    record['archived'] = True
                    to_archive.append(record)
                else:
                    remaining.append(record)

            # Check for IDs that weren't found
            found_ids = [r.get('id') for r in to_archive]
            not_found = [rid for rid in record_ids if rid not in found_ids]

            # Add to archive
            archive_records.extend(to_archive)

            # Write both files
            if to_archive:
                ArchiveManager._write_records(main_path, remaining, entity_type)
                ArchiveManager._write_records(archive_path, archive_records, entity_type)

            return {
                'success': True,
                'archived_count': len(to_archive),
                'remaining_count': len(remaining),
                'archive_total': len(archive_records),
                'not_found': not_found,
                'archived_ids': found_ids
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'archived_count': 0
            }

    @staticmethod
    def restore_records(
        entity_type: str,
        record_ids: List[str],
        json_dir: Path
    ) -> Dict[str, Any]:
        """
        Restore archived records back to main file

        Args:
            entity_type: Type of entity ('deals', 'organizations', 'contacts')
            record_ids: List of record IDs to restore
            json_dir: Path to JSON directory

        Returns:
            Dict with success status, restored count, and any errors
        """
        try:
            # Get file paths
            main_path, archive_path = ArchiveManager._get_file_paths(entity_type, json_dir)

            # Read current records
            main_records = ArchiveManager._read_records(main_path, entity_type)
            archive_records = ArchiveManager._read_records(archive_path, entity_type)

            # Find records to restore
            to_restore = []
            remaining_archived = []
            not_found = []

            for record in archive_records:
                record_id = record.get('id')
                if record_id in record_ids:
                    # Remove archive metadata
                    record.pop('archived_at', None)
                    record.pop('archived', None)
                    record['restored_at'] = datetime.now().isoformat()
                    to_restore.append(record)
                else:
                    remaining_archived.append(record)

            # Check for IDs that weren't found
            found_ids = [r.get('id') for r in to_restore]
            not_found = [rid for rid in record_ids if rid not in found_ids]

            # Add back to main file
            main_records.extend(to_restore)

            # Write both files
            if to_restore:
                ArchiveManager._write_records(main_path, main_records, entity_type)
                ArchiveManager._write_records(archive_path, remaining_archived, entity_type)

            return {
                'success': True,
                'restored_count': len(to_restore),
                'main_total': len(main_records),
                'archive_total': len(remaining_archived),
                'not_found': not_found,
                'restored_ids': found_ids
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'restored_count': 0
            }

    @staticmethod
    def list_archived(
        entity_type: str,
        json_dir: Path,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        List archived records

        Args:
            entity_type: Type of entity ('deals', 'organizations', 'contacts')
            json_dir: Path to JSON directory
            limit: Maximum number of records to return
            offset: Number of records to skip

        Returns:
            Dict with archived records and pagination info
        """
        try:
            # Get archive file path
            _, archive_path = ArchiveManager._get_file_paths(entity_type, json_dir)

            # Read archived records
            archive_records = ArchiveManager._read_records(archive_path, entity_type)

            # Sort by archived_at descending (most recent first)
            archive_records.sort(
                key=lambda x: x.get('archived_at', ''),
                reverse=True
            )

            # Get total count
            total = len(archive_records)

            # Apply pagination
            if limit is not None:
                archive_records = archive_records[offset:offset + limit]
            else:
                archive_records = archive_records[offset:]

            return {
                'success': True,
                'records': archive_records,
                'total': total,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + len(archive_records)) < total if limit else False
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'records': [],
                'total': 0
            }

    @staticmethod
    def get_archive_stats(json_dir: Path) -> Dict[str, Any]:
        """
        Get statistics about archived records across all entity types

        Args:
            json_dir: Path to JSON directory

        Returns:
            Dict with archive statistics
        """
        try:
            stats = {}

            for entity_type in ['deals', 'organizations', 'contacts']:
                _, archive_path = ArchiveManager._get_file_paths(entity_type, json_dir)

                if archive_path.exists():
                    records = ArchiveManager._read_records(archive_path, entity_type)
                    stats[entity_type] = {
                        'total_archived': len(records),
                        'archive_file_size_kb': round(archive_path.stat().st_size / 1024, 2),
                        'oldest_archive': min([r.get('archived_at', '') for r in records]) if records else None,
                        'newest_archive': max([r.get('archived_at', '') for r in records]) if records else None
                    }
                else:
                    stats[entity_type] = {
                        'total_archived': 0,
                        'archive_file_size_kb': 0,
                        'oldest_archive': None,
                        'newest_archive': None
                    }

            return {
                'success': True,
                'stats': stats,
                'total_archives': sum(s['total_archived'] for s in stats.values())
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def auto_archive_old_records(
        entity_type: str,
        json_dir: Path,
        days_old: int = 365,
        status_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Automatically archive old records based on age criteria

        Args:
            entity_type: Type of entity ('deals', 'organizations', 'contacts')
            json_dir: Path to JSON directory
            days_old: Archive records older than this many days
            status_filter: Optional status filter (e.g., 'closed' for deals)

        Returns:
            Dict with auto-archive results
        """
        try:
            from datetime import timedelta

            # Get main file path
            main_path, _ = ArchiveManager._get_file_paths(entity_type, json_dir)

            # Read main records
            main_records = ArchiveManager._read_records(main_path, entity_type)

            # Calculate cutoff date
            cutoff_date = (datetime.now() - timedelta(days=days_old)).isoformat()

            # Find records to auto-archive
            to_archive_ids = []

            for record in main_records:
                # Check date (use created_at or updated_at)
                record_date = record.get('updated_at') or record.get('created_at', '')

                if record_date < cutoff_date:
                    # Apply status filter if provided
                    if status_filter:
                        if record.get('status') == status_filter:
                            to_archive_ids.append(record.get('id'))
                    else:
                        to_archive_ids.append(record.get('id'))

            # Archive the identified records
            if to_archive_ids:
                result = ArchiveManager.archive_records(entity_type, to_archive_ids, json_dir)
                result['auto_archived'] = True
                result['criteria'] = {
                    'days_old': days_old,
                    'status_filter': status_filter,
                    'cutoff_date': cutoff_date
                }
                return result
            else:
                return {
                    'success': True,
                    'archived_count': 0,
                    'auto_archived': True,
                    'message': 'No records matched the auto-archive criteria'
                }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'archived_count': 0
            }
