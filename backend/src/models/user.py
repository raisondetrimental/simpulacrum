"""
User model for authentication
"""
from flask_login import UserMixin
import bcrypt
from pathlib import Path
from ..utils.json_store import read_json_list


class User(UserMixin):
    """User model for Flask-Login"""

    def __init__(self, user_id: str, username: str, full_name: str = None, role: str = 'user'):
        self.id = user_id
        self.username = username
        self.full_name = full_name or username
        self.role = role

    def __repr__(self):
        return f'<User {self.username}>'

    def is_admin(self):
        """Check if user has admin role"""
        return self.role == 'admin'


def load_users(users_json_path: Path) -> list:
    """
    Load users from JSON file

    Args:
        users_json_path: Path to users.json

    Returns:
        List of user dictionaries
    """
    from ..utils.json_store import read_json_file
    data = read_json_file(users_json_path)
    return data.get('users', [])


def get_user_by_username(username: str, users_json_path: Path):
    """
    Get user by username

    Args:
        username: Username to search for
        users_json_path: Path to users.json

    Returns:
        User dictionary or None
    """
    users = load_users(users_json_path)
    for user in users:
        if user.get('username') == username:
            return user
    return None


def get_user_by_id(user_id: str, users_json_path: Path):
    """
    Get user by ID

    Args:
        user_id: User ID to search for
        users_json_path: Path to users.json

    Returns:
        User object or None
    """
    users = load_users(users_json_path)
    for user in users:
        if user.get('id') == user_id:
            return User(user['id'], user['username'], user.get('full_name'), user.get('role', 'user'))
    return None


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify password against hash

    Args:
        password: Plain text password
        password_hash: Bcrypt password hash

    Returns:
        True if password matches, False otherwise
    """
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def hash_password(password: str) -> str:
    """
    Hash password with bcrypt

    Args:
        password: Plain text password

    Returns:
        Bcrypt hash string
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
