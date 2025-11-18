"""
User management routes
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime

from ..models.user import hash_password, load_users
from ..utils.json_store import read_json_file, write_json_file, find_by_id, generate_sequential_id

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('', methods=['GET'])
@login_required
def get_users():
    """Get all users (admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    try:
        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users = load_users(users_path)

        # Remove password hashes from response
        safe_users = []
        for user in users:
            safe_user = {
                'id': user['id'],
                'username': user['username'],
                'full_name': user.get('full_name', user['username']),
                'email': user.get('email'),
                'is_active': user.get('is_active', True),
                'created_at': user.get('created_at')
            }
            safe_users.append(safe_user)

        return jsonify({
            "success": True,
            "data": safe_users,
            "count": len(safe_users)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching users: {str(e)}"
        }), 500


@users_bp.route('/active', methods=['GET'])
def get_active_users():
    """Get all active users (public endpoint - no authentication required)"""
    try:
        from ..utils.user_helpers import get_active_users

        users = get_active_users()

        return jsonify({
            "success": True,
            "data": users,
            "count": len(users)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching active users: {str(e)}"
        }), 500


@users_bp.route('/<user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Get a specific user (admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    try:
        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users = load_users(users_path)

        user = find_by_id(users, 'id', user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": f"User {user_id} not found"
            }), 404

        # Remove password hash
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'full_name': user.get('full_name', user['username']),
            'email': user.get('email'),
            'is_active': user.get('is_active', True),
            'created_at': user.get('created_at')
        }

        return jsonify({
            "success": True,
            "data": safe_user
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching user: {str(e)}"
        }), 500


@users_bp.route('', methods=['POST'])
@login_required
def create_user():
    """Create a new user (admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('username'):
            return jsonify({
                "success": False,
                "message": "Username is required"
            }), 400

        if not data.get('password'):
            return jsonify({
                "success": False,
                "message": "Password is required"
            }), 400

        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        # Check if username already exists
        for user in users:
            if user['username'] == data['username']:
                return jsonify({
                    "success": False,
                    "message": "Username already exists"
                }), 400

        # Generate new user ID
        new_id = generate_sequential_id(users, 'id', 'user')

        # Create new user (always with role "user", not admin)
        new_user = {
            'id': new_id,
            'username': data['username'],
            'full_name': data.get('full_name', data['username']),
            'email': data.get('email'),
            'role': 'user',
            'password_hash': hash_password(data['password']),
            'is_active': data.get('is_active', True),
            'created_at': datetime.now().isoformat()
        }

        users.append(new_user)
        users_data['users'] = users
        write_json_file(users_path, users_data)

        # Return user without password hash
        safe_user = {
            'id': new_user['id'],
            'username': new_user['username'],
            'full_name': new_user['full_name'],
            'email': new_user.get('email'),
            'is_active': new_user['is_active'],
            'created_at': new_user['created_at']
        }

        return jsonify({
            "success": True,
            "data": safe_user,
            "message": "User created successfully"
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating user: {str(e)}"
        }), 500


@users_bp.route('/<user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    """Update a user's details (admin only, not password)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    try:
        data = request.get_json()

        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        user = find_by_id(users, 'id', user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": f"User {user_id} not found"
            }), 404

        # Update allowed fields
        if 'full_name' in data:
            user['full_name'] = data['full_name']
        if 'email' in data:
            user['email'] = data['email']
        if 'is_active' in data:
            user['is_active'] = data['is_active']

        # Don't allow username changes or password changes here
        # Password changes should go through separate endpoint

        users_data['users'] = users
        write_json_file(users_path, users_data)

        # Return user without password hash
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'full_name': user.get('full_name', user['username']),
            'email': user.get('email'),
            'is_active': user.get('is_active', True),
            'created_at': user.get('created_at')
        }

        return jsonify({
            "success": True,
            "data": safe_user,
            "message": "User updated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating user: {str(e)}"
        }), 500


@users_bp.route('/<user_id>/password', methods=['PUT'])
@login_required
def change_password(user_id):
    """Change a user's password (admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    try:
        data = request.get_json()

        if not data.get('password'):
            return jsonify({
                "success": False,
                "message": "Password is required"
            }), 400

        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        user = find_by_id(users, 'id', user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": f"User {user_id} not found"
            }), 404

        # Update password
        user['password_hash'] = hash_password(data['password'])

        users_data['users'] = users
        write_json_file(users_path, users_data)

        return jsonify({
            "success": True,
            "message": "Password changed successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error changing password: {str(e)}"
        }), 500


@users_bp.route('/<user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    """Delete (deactivate) a user (admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    try:
        # Don't allow users to delete themselves
        if current_user.id == user_id:
            return jsonify({
                "success": False,
                "message": "Cannot delete your own account"
            }), 400

        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        user = find_by_id(users, 'id', user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": f"User {user_id} not found"
            }), 404

        # Soft delete - just mark as inactive
        user['is_active'] = False

        users_data['users'] = users
        write_json_file(users_path, users_data)

        return jsonify({
            "success": True,
            "message": "User deactivated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting user: {str(e)}"
        }), 500


@users_bp.route('/dashboard-stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    """Get dashboard stats for current user - assigned meetings count and upcoming follow-ups"""
    try:
        from ..utils.unified_dal import get_all_contacts

        user_id = current_user.id

        # Get all contacts from all 4 CRM modules
        contacts = get_all_contacts()

        assigned_meetings_count = 0
        upcoming_followups = []
        today = datetime.now()

        # Iterate through all contacts and their meeting history
        for contact in contacts:
            if not contact.get('meeting_history'):
                continue

            for meeting in contact['meeting_history']:
                assigned_to = meeting.get('assigned_to', [])

                # Check if current user is assigned to this meeting
                is_assigned = any(assignee.get('user_id') == user_id for assignee in assigned_to)

                if is_assigned:
                    assigned_meetings_count += 1

                    # Check if there's an upcoming follow-up
                    next_follow_up = meeting.get('next_follow_up')
                    if next_follow_up:
                        try:
                            follow_up_date = datetime.fromisoformat(next_follow_up.replace('Z', '+00:00'))

                            # Only include future follow-ups
                            if follow_up_date >= today:
                                upcoming_followups.append({
                                    'contact_id': contact['id'],
                                    'contact_name': contact['name'],
                                    'meeting_date': meeting['date'],
                                    'follow_up_date': next_follow_up,
                                    'notes_preview': meeting.get('notes', '')[:100] + ('...' if len(meeting.get('notes', '')) > 100 else ''),
                                    'organization_type': contact.get('organization_type', 'unknown')
                                })
                        except (ValueError, AttributeError):
                            pass  # Skip invalid dates

        # Sort upcoming follow-ups by date
        upcoming_followups.sort(key=lambda x: x['follow_up_date'])

        return jsonify({
            "success": True,
            "data": {
                "assigned_meetings_count": assigned_meetings_count,
                "upcoming_followups_count": len(upcoming_followups),
                "upcoming_followups": upcoming_followups[:10]  # Return first 10
            }
        })
    except Exception as e:
        current_app.logger.error(f"Error getting dashboard stats: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error getting dashboard stats: {str(e)}"
        }), 500
