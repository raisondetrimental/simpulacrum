"""
Bulk Operations Service
Handles bulk updates, exports, and imports for entities
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import csv
import io
import json

from ..utils.json_store import read_json_file, write_json_file


class BulkOperations:
    """
    Bulk operations service for mass data manipulation
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
    def _write_records(file_path: Path, records: List[Dict[str, Any]], key: str) -> bool:
        """Write records to file"""
        data = {
            key: records,
            'total_count': len(records),
            'last_updated': datetime.now().isoformat()
        }
        return write_json_file(file_path, data, create_backup=True)

    @staticmethod
    def _get_file_config(entity_type: str) -> tuple[str, str]:
        """Get file name and key for entity type"""
        configs = {
            'organizations': ('organizations.json', 'organizations'),
            'contacts': ('unified_contacts.json', 'contacts'),
            'deals': ('deals.json', 'deals')
        }
        if entity_type not in configs:
            raise ValueError(f"Unsupported entity type: {entity_type}")
        return configs[entity_type]

    @staticmethod
    def bulk_update(
        entity_type: str,
        json_dir: Path,
        filters: Dict[str, Any],
        updates: Dict[str, Any],
        dry_run: bool = True
    ) -> Dict[str, Any]:
        """
        Bulk update records matching filters

        Args:
            entity_type: Type of entity ('organizations', 'contacts', 'deals')
            json_dir: Path to JSON directory
            filters: Criteria to match records (e.g., {'country': 'USA'})
            updates: Fields to update (e.g., {'status': 'active'})
            dry_run: If True, preview changes without saving

        Returns:
            Dict with affected records and update results
        """
        try:
            filename, key = BulkOperations._get_file_config(entity_type)
            file_path = json_dir / filename

            # Read records
            records = BulkOperations._read_records(file_path, key)

            # Find matching records
            matched = []
            for record in records:
                match = True
                for filter_key, filter_value in filters.items():
                    if record.get(filter_key) != filter_value:
                        match = False
                        break
                if match:
                    matched.append(record)

            # Preview or apply updates
            updated_records = []
            if not dry_run and matched:
                for record in records:
                    if record in matched:
                        # Apply updates
                        for update_key, update_value in updates.items():
                            record[update_key] = update_value
                        record['last_updated'] = datetime.now().isoformat()
                        updated_records.append(record)

                # Write updated records
                BulkOperations._write_records(file_path, records, key)

            return {
                'success': True,
                'dry_run': dry_run,
                'matched_count': len(matched),
                'matched_ids': [r.get('id') for r in matched],
                'preview': matched[:10] if dry_run else [],  # Preview first 10
                'updated_count': len(updated_records) if not dry_run else 0,
                'filters_applied': filters,
                'updates_applied': updates
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'matched_count': 0
            }

    @staticmethod
    def bulk_export(
        entity_type: str,
        json_dir: Path,
        filters: Optional[Dict[str, Any]] = None,
        format: str = 'csv'
    ) -> Dict[str, Any]:
        """
        Export records to CSV or JSON

        Args:
            entity_type: Type of entity
            json_dir: Path to JSON directory
            filters: Optional filters to apply
            format: 'csv' or 'json'

        Returns:
            Dict with export data or file content
        """
        try:
            filename, key = BulkOperations._get_file_config(entity_type)
            file_path = json_dir / filename

            # Read records
            records = BulkOperations._read_records(file_path, key)

            # Apply filters if provided
            if filters:
                filtered = []
                for record in records:
                    match = True
                    for filter_key, filter_value in filters.items():
                        if record.get(filter_key) != filter_value:
                            match = False
                            break
                    if match:
                        filtered.append(record)
                records = filtered

            if format == 'csv':
                # Generate CSV
                if not records:
                    return {
                        'success': False,
                        'error': 'No records to export'
                    }

                output = io.StringIO()
                # Get all unique keys from all records
                all_keys = set()
                for record in records:
                    all_keys.update(record.keys())

                fieldnames = sorted(list(all_keys))
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()

                for record in records:
                    # Handle nested objects by converting to JSON strings
                    row = {}
                    for key in fieldnames:
                        value = record.get(key, '')
                        if isinstance(value, (dict, list)):
                            row[key] = json.dumps(value)
                        else:
                            row[key] = value
                    writer.writerow(row)

                csv_content = output.getvalue()
                output.close()

                return {
                    'success': True,
                    'format': 'csv',
                    'content': csv_content,
                    'record_count': len(records)
                }

            elif format == 'json':
                return {
                    'success': True,
                    'format': 'json',
                    'content': json.dumps(records, indent=2),
                    'record_count': len(records)
                }

            else:
                return {
                    'success': False,
                    'error': f'Unsupported format: {format}'
                }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def bulk_import_validate(
        entity_type: str,
        records: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Validate imported records without saving

        Args:
            entity_type: Type of entity
            records: List of records to validate

        Returns:
            Dict with validation results
        """
        try:
            errors = []
            warnings = []
            valid_count = 0

            required_fields = {
                'organizations': ['id', 'name', 'organization_type'],
                'contacts': ['id', 'name', 'organization_id', 'organization_type'],
                'deals': ['id', 'deal_name', 'status']
            }

            required = required_fields.get(entity_type, [])

            for i, record in enumerate(records):
                record_errors = []

                # Check required fields
                for field in required:
                    if field not in record or not record[field]:
                        record_errors.append(f"Missing required field: {field}")

                # Validate ID format
                if 'id' in record:
                    record_id = record['id']
                    if entity_type == 'organizations':
                        # Check ID format (cp_###, corp_###, etc.)
                        if not isinstance(record_id, str):
                            record_errors.append(f"Invalid ID format: {record_id}")
                    elif entity_type == 'deals':
                        # Check timestamp ID format
                        if not isinstance(record_id, str) or not record_id.startswith('deal_'):
                            record_errors.append(f"Invalid deal ID format: {record_id}")

                # Validate email if present
                if 'email' in record and record['email']:
                    if '@' not in str(record['email']):
                        record_errors.append(f"Invalid email: {record['email']}")

                if record_errors:
                    errors.append({
                        'row': i + 1,
                        'record_id': record.get('id', 'unknown'),
                        'errors': record_errors
                    })
                else:
                    valid_count += 1

            return {
                'success': True,
                'total_records': len(records),
                'valid_count': valid_count,
                'error_count': len(errors),
                'errors': errors[:50],  # Return first 50 errors
                'warnings': warnings
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def bulk_import_commit(
        entity_type: str,
        json_dir: Path,
        records: List[Dict[str, Any]],
        mode: str = 'append'
    ) -> Dict[str, Any]:
        """
        Import and save records

        Args:
            entity_type: Type of entity
            json_dir: Path to JSON directory
            records: List of records to import
            mode: 'append' (add new), 'replace' (replace all), or 'update' (update existing by ID)

        Returns:
            Dict with import results
        """
        try:
            filename, key = BulkOperations._get_file_config(entity_type)
            file_path = json_dir / filename

            # Read existing records
            existing = BulkOperations._read_records(file_path, key)

            imported_count = 0
            updated_count = 0
            skipped_count = 0

            if mode == 'replace':
                # Replace all records
                final_records = records
                imported_count = len(records)

            elif mode == 'append':
                # Add new records, skip duplicates
                existing_ids = {r.get('id') for r in existing}
                new_records = []

                for record in records:
                    record_id = record.get('id')
                    if record_id in existing_ids:
                        skipped_count += 1
                    else:
                        new_records.append(record)
                        imported_count += 1

                final_records = existing + new_records

            elif mode == 'update':
                # Update existing by ID, add new
                existing_by_id = {r.get('id'): r for r in existing}

                for record in records:
                    record_id = record.get('id')
                    if record_id in existing_by_id:
                        # Update existing
                        existing_by_id[record_id].update(record)
                        existing_by_id[record_id]['last_updated'] = datetime.now().isoformat()
                        updated_count += 1
                    else:
                        # Add new
                        existing.append(record)
                        imported_count += 1

                final_records = list(existing_by_id.values()) if mode == 'update' else existing

            else:
                return {
                    'success': False,
                    'error': f'Invalid import mode: {mode}'
                }

            # Write to file
            BulkOperations._write_records(file_path, final_records, key)

            return {
                'success': True,
                'imported_count': imported_count,
                'updated_count': updated_count,
                'skipped_count': skipped_count,
                'total_count': len(final_records),
                'mode': mode
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'imported_count': 0
            }
