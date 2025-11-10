"""
Database Explorer Service
Read-only exploration of JSON database files
"""

from pathlib import Path
from typing import Dict, List, Any, Optional
import json
import os


class DatabaseExplorer:
    """Service for exploring JSON database files (read-only)"""

    # File categories for organization
    FILE_CATEGORIES = {
        'crm': [
            'capital_partners.json',
            'contacts.json',
            'corporates.json',
            'sponsor_contacts.json',
            'legal_advisors.json',
            'counsel_contacts.json',
            'agents.json',
            'agent_contacts.json',
            'deals.json',
            'deal_participants.json'
        ],
        'market_data': [
            'fx_rates.json',
            'fx_rates_history.json',
            'country_fundamentals.json'
        ],
        'system': [
            'users.json',
            'feature_flags.json',
            'investment_strategies.json',
            'investment_profiles.json',
            'weekly_whiteboards.json',
            'general_posts.json',
            'audit_log.json'
        ]
    }

    @staticmethod
    def list_database_files(json_dir: Path) -> List[Dict[str, Any]]:
        """
        List all JSON files with metadata

        Returns:
            List of file info dictionaries
        """
        files = []

        # Get all JSON files
        for json_file in json_dir.glob('*.json'):
            if not json_file.is_file():
                continue

            # Skip backup files
            if json_file.name.endswith('.bak') or '.bak.' in json_file.name:
                continue

            # Get file stats
            stats = json_file.stat()
            size_kb = stats.st_size / 1024

            # Determine category
            category = DatabaseExplorer._get_file_category(json_file.name)

            # Try to count records
            record_count = DatabaseExplorer._count_records(json_file)

            file_info = {
                'filename': json_file.name,
                'path': str(json_file),
                'category': category,
                'size_kb': round(size_kb, 2),
                'record_count': record_count,
                'last_modified': stats.st_mtime,
                'type': 'database'
            }

            files.append(file_info)

        # Sort by category then filename
        files.sort(key=lambda x: (x['category'], x['filename']))

        return files

    @staticmethod
    def _get_file_category(filename: str) -> str:
        """Determine file category"""
        for category, filenames in DatabaseExplorer.FILE_CATEGORIES.items():
            if filename in filenames:
                return category
        return 'other'

    @staticmethod
    def _count_records(file_path: Path) -> Optional[int]:
        """Count records in a JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Different files have different structures
            if isinstance(data, list):
                return len(data)
            elif isinstance(data, dict):
                # Check for common array keys
                if 'users' in data:
                    return len(data.get('users', []))
                elif 'logs' in data:
                    return len(data.get('logs', []))
                elif 'entries' in data:
                    return len(data.get('entries', []))
                else:
                    # Count top-level keys as records
                    return len(data)

            return None
        except Exception:
            return None

    @staticmethod
    def read_database_file(
        json_dir: Path,
        filename: str,
        limit: int = 100,
        offset: int = 0,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Read records from a database file with pagination

        Args:
            json_dir: Path to JSON data directory
            filename: Name of file to read
            limit: Maximum records to return
            offset: Number of records to skip
            search: Optional search query to filter records

        Returns:
            Dict with records and metadata
        """
        file_path = json_dir / filename

        if not file_path.exists():
            return {
                "success": False,
                "error": f"File not found: {filename}"
            }

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract records based on file structure
            records = []
            if isinstance(data, list):
                records = data
            elif isinstance(data, dict):
                # Check for common array keys
                if 'users' in data:
                    records = data.get('users', [])
                elif 'logs' in data:
                    records = data.get('logs', [])
                elif 'entries' in data:
                    records = data.get('entries', [])
                else:
                    # Convert dict to list of records with keys
                    records = [{"_key": k, **v} if isinstance(v, dict) else {"_key": k, "value": v}
                              for k, v in data.items()]

            # Apply search filter if provided
            if search and search.strip():
                search_lower = search.lower()
                filtered_records = []
                for record in records:
                    record_str = json.dumps(record).lower()
                    if search_lower in record_str:
                        filtered_records.append(record)
                records = filtered_records

            total_count = len(records)

            # Apply pagination
            paginated_records = records[offset:offset + limit]

            return {
                "success": True,
                "records": paginated_records,
                "total_count": total_count,
                "offset": offset,
                "limit": limit,
                "has_more": (offset + limit) < total_count
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error reading file: {str(e)}"
            }

    @staticmethod
    def get_file_schema(json_dir: Path, filename: str) -> Dict[str, Any]:
        """
        Analyze file and return field names and types

        Args:
            json_dir: Path to JSON data directory
            filename: Name of file to analyze

        Returns:
            Dict with schema information
        """
        file_path = json_dir / filename

        if not file_path.exists():
            return {
                "success": False,
                "error": f"File not found: {filename}"
            }

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract sample records
            sample_records = []
            if isinstance(data, list):
                sample_records = data[:10]  # First 10 records
            elif isinstance(data, dict):
                if 'users' in data:
                    sample_records = data.get('users', [])[:10]
                elif 'logs' in data:
                    sample_records = data.get('logs', [])[:10]
                elif 'entries' in data:
                    sample_records = data.get('entries', [])[:10]

            # Analyze fields
            fields = {}
            for record in sample_records:
                if isinstance(record, dict):
                    for key, value in record.items():
                        if key not in fields:
                            fields[key] = {
                                'type': type(value).__name__,
                                'sample': value if not isinstance(value, (dict, list)) else None
                            }

            return {
                "success": True,
                "fields": fields,
                "sample_count": len(sample_records)
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error analyzing schema: {str(e)}"
            }

    @staticmethod
    def search_records(
        json_dir: Path,
        filename: str,
        query: str
    ) -> List[Dict[str, Any]]:
        """
        Search records by text query

        Args:
            json_dir: Path to JSON data directory
            filename: Name of file to search
            query: Search term

        Returns:
            List of matching records
        """
        result = DatabaseExplorer.read_database_file(
            json_dir,
            filename,
            limit=1000,  # Search up to 1000 records
            offset=0,
            search=query
        )

        if result.get('success'):
            return result.get('records', [])
        else:
            return []

    @staticmethod
    def get_grouped_files(json_dir: Path) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get files grouped by category

        Args:
            json_dir: Path to JSON data directory

        Returns:
            Dictionary mapping categories to file lists
        """
        all_files = DatabaseExplorer.list_database_files(json_dir)
        grouped = {
            'crm': [],
            'market_data': [],
            'system': [],
            'other': []
        }

        for file_info in all_files:
            category = file_info['category']
            grouped[category].append(file_info)

        return grouped
