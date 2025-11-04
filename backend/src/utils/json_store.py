"""
JSON file storage utilities for Meridian Dashboard
Handles reading, writing, and backing up JSON data files
"""
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List


def read_json_file(file_path: Path) -> Dict[str, Any]:
    """
    Read JSON data from file

    Args:
        file_path: Path to JSON file

    Returns:
        Dictionary containing JSON data, or empty dict if file doesn't exist
    """
    if not file_path.exists():
        return {}

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"Warning: Invalid JSON in {file_path}, returning empty dict")
        return {}
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return {}


def write_json_file(file_path: Path, data: Any, create_backup: bool = True) -> bool:
    """
    Write JSON data to file with optional backup

    Args:
        file_path: Path to JSON file
        data: Data to write (will be JSON serialized)
        create_backup: Whether to create .bak file before overwriting

    Returns:
        True if successful, False otherwise
    """
    try:
        # Create backup if file exists
        if create_backup and file_path.exists():
            backup_path = file_path.with_suffix(file_path.suffix + '.bak')
            shutil.copy2(file_path, backup_path)

        # Ensure directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Write JSON with pretty formatting
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return True
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")
        return False


def read_json_list(file_path: Path) -> List[Dict[str, Any]]:
    """
    Read JSON array from file

    Args:
        file_path: Path to JSON file containing an array

    Returns:
        List of dictionaries, or empty list if file doesn't exist or contains invalid data
    """
    data = read_json_file(file_path)
    if isinstance(data, list):
        return data
    return []


def find_by_id(data: List[Dict[str, Any]], id_field: str, id_value: str) -> Dict[str, Any]:
    """
    Find item in list by ID field

    Args:
        data: List of dictionaries
        id_field: Name of ID field (e.g., 'capital_partner_id')
        id_value: Value to search for

    Returns:
        Matching dictionary or empty dict if not found
    """
    for item in data:
        if item.get(id_field) == id_value:
            return item
    return {}


def filter_by_field(data: List[Dict[str, Any]], field: str, value: Any) -> List[Dict[str, Any]]:
    """
    Filter list by field value

    Args:
        data: List of dictionaries
        field: Field name to filter by
        value: Value to match

    Returns:
        List of matching dictionaries
    """
    return [item for item in data if item.get(field) == value]


def remove_by_id(data: List[Dict[str, Any]], id_field: str, id_value: str) -> List[Dict[str, Any]]:
    """
    Remove item from list by ID

    Args:
        data: List of dictionaries
        id_field: Name of ID field
        id_value: Value to remove

    Returns:
        New list with item removed
    """
    return [item for item in data if item.get(id_field) != id_value]


def generate_sequential_id(data: List[Dict[str, Any]], id_field: str, prefix: str) -> str:
    """
    Generate sequential ID (e.g., cp_001, cp_002)

    Args:
        data: Existing list of items
        id_field: Name of ID field
        prefix: ID prefix (e.g., 'cp_', 'team_')

    Returns:
        New sequential ID
    """
    if not data:
        return f"{prefix}001"

    # Extract numeric parts and find max
    max_num = 0
    for item in data:
        item_id = item.get(id_field, '')
        if item_id.startswith(prefix):
            try:
                num = int(item_id[len(prefix):])
                max_num = max(max_num, num)
            except ValueError:
                continue

    return f"{prefix}{str(max_num + 1).zfill(3)}"


def generate_timestamp_id(prefix: str) -> str:
    """
    Generate timestamp-based ID

    Args:
        prefix: ID prefix (e.g., 'corp_', 'deal_')

    Returns:
        New timestamp ID
    """
    timestamp = int(datetime.now().timestamp() * 1000)
    return f"{prefix}{timestamp}"


def create_timestamped_backup(file_path: Path, backup_dir: Path = None) -> bool:
    """
    Create timestamped backup of JSON file

    Args:
        file_path: Path to file to backup
        backup_dir: Directory for backups (default: data/json/backups/)

    Returns:
        True if successful, False otherwise
    """
    if not file_path.exists():
        return False

    try:
        if backup_dir is None:
            backup_dir = file_path.parent / 'backups'

        backup_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
        backup_path = backup_dir / backup_name

        shutil.copy2(file_path, backup_path)
        return True
    except Exception as e:
        print(f"Error creating timestamped backup: {e}")
        return False
