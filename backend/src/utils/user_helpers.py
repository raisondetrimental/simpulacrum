"""
User Helper Utilities

Provides utility functions for user operations including validation,
fetching user details, and formatting user data for assignments.
"""

from pathlib import Path
from typing import List, Dict, Optional
from .json_store import read_json_file


def get_users_file_path() -> Path:
    """Get the path to users.json file"""
    from ..config import Config
    return Path(Config.JSON_DIR) / "users.json"


def get_all_users() -> List[Dict]:
    """
    Get all users from users.json

    Returns:
        List of user dictionaries
    """
    users_path = get_users_file_path()
    data = read_json_file(users_path)
    return data.get("users", [])


def get_active_users() -> List[Dict]:
    """
    Get all active users

    Returns:
        List of active user dictionaries with minimal fields
        [{"id": "user_001", "username": "...", "full_name": "..."}]
    """
    all_users = get_all_users()
    active_users = [
        {
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"]
        }
        for user in all_users
        if user.get("is_active", False)
    ]
    return active_users


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """
    Get a single user by ID

    Args:
        user_id: The user ID to lookup

    Returns:
        User dictionary or None if not found
    """
    all_users = get_all_users()
    for user in all_users:
        if user["id"] == user_id:
            return user
    return None


def get_user_details(user_ids: List[str]) -> List[Dict]:
    """
    Get full user details for a list of user IDs

    Args:
        user_ids: List of user IDs to fetch

    Returns:
        List of user detail dictionaries with id, username, full_name
        [{"user_id": "user_001", "username": "...", "full_name": "..."}]
    """
    if not user_ids:
        return []

    all_users = get_all_users()
    user_dict = {user["id"]: user for user in all_users}

    user_details = []
    for user_id in user_ids:
        if user_id in user_dict:
            user = user_dict[user_id]
            user_details.append({
                "user_id": user["id"],
                "username": user["username"],
                "full_name": user["full_name"]
            })

    return user_details


def validate_user_ids(user_ids: List[str]) -> tuple[bool, Optional[str]]:
    """
    Validate that all user IDs exist in the system

    Args:
        user_ids: List of user IDs to validate

    Returns:
        Tuple of (is_valid, error_message)
        - (True, None) if all IDs are valid
        - (False, "error message") if any ID is invalid
    """
    if not user_ids:
        # Empty list is valid (unassigned meeting)
        return True, None

    if not isinstance(user_ids, list):
        return False, "user_ids must be a list"

    all_users = get_all_users()
    valid_user_ids = {user["id"] for user in all_users}

    invalid_ids = [user_id for user_id in user_ids if user_id not in valid_user_ids]

    if invalid_ids:
        return False, f"Invalid user IDs: {', '.join(invalid_ids)}"

    return True, None


def format_user_summary(users: List[Dict]) -> str:
    """
    Format a list of users into a readable summary string

    Args:
        users: List of user dictionaries with 'full_name' field

    Returns:
        Comma-separated string of full names, e.g. "Cameron Thomas, Naveen Anandakumar"
    """
    if not users:
        return "Unassigned"

    names = [user.get("full_name", "Unknown") for user in users]
    return ", ".join(names)


def get_user_summary(user_id: str) -> Dict:
    """
    Get a summary of a user for display purposes

    Args:
        user_id: The user ID

    Returns:
        Dictionary with user_id, username, full_name, or empty dict if not found
    """
    user = get_user_by_id(user_id)
    if not user:
        return {}

    return {
        "user_id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"]
    }
