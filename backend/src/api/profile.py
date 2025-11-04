"""
User profile routes - for users to manage their own account
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from pathlib import Path

from ..models.user import hash_password, verify_password, load_users
from ..utils.json_store import read_json_file, write_json_file, find_by_id

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')


@profile_bp.route('', methods=['GET'])
@login_required
def get_profile():
    """Get current user's profile"""
    try:
        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users = load_users(users_path)

        user = find_by_id(users, 'id', current_user.id)
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Return user without password hash
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'full_name': user.get('full_name', user['username']),
            'email': user.get('email'),
            'role': user.get('role', 'user'),
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
            "message": f"Error fetching profile: {str(e)}"
        }), 500


@profile_bp.route('', methods=['PUT'])
@login_required
def update_profile():
    """Update current user's profile (full_name, email only)"""
    try:
        data = request.get_json()

        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        user = find_by_id(users, 'id', current_user.id)
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Update allowed fields
        if 'full_name' in data:
            user['full_name'] = data['full_name']
        if 'email' in data:
            user['email'] = data['email']

        # Users cannot change their own username or role

        users_data['users'] = users
        write_json_file(users_path, users_data)

        # Return updated user without password hash
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'full_name': user.get('full_name', user['username']),
            'email': user.get('email'),
            'role': user.get('role', 'user'),
            'is_active': user.get('is_active', True),
            'created_at': user.get('created_at')
        }

        return jsonify({
            "success": True,
            "data": safe_user,
            "message": "Profile updated successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating profile: {str(e)}"
        }), 500


@profile_bp.route('/password', methods=['PUT'])
@login_required
def change_own_password():
    """Change current user's password (requires current password)"""
    try:
        data = request.get_json()

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password:
            return jsonify({
                "success": False,
                "message": "Current password is required"
            }), 400

        if not new_password:
            return jsonify({
                "success": False,
                "message": "New password is required"
            }), 400

        users_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        user = find_by_id(users, 'id', current_user.id)
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Verify current password
        if not verify_password(current_password, user['password_hash']):
            return jsonify({
                "success": False,
                "message": "Current password is incorrect"
            }), 401

        # Update password
        user['password_hash'] = hash_password(new_password)

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
