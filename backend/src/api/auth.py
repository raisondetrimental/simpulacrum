"""
Authentication routes
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from pathlib import Path

from ..models.user import User, get_user_by_username, verify_password

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Login endpoint"""
    # Handle GET requests (from Flask-Login redirects)
    if request.method == 'GET':
        return jsonify({
            "success": False,
            "message": "Authentication required. Please log in.",
            "authenticated": False
        }), 401

    # Handle POST requests (actual login)
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password required"
            }), 400

        # Find user
        users_json_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        user_data = get_user_by_username(username, users_json_path)
        if not user_data:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

        # Verify password
        if verify_password(password, user_data['password_hash']):
            # Create user object and login
            user = User(
                user_data['id'],
                user_data['username'],
                user_data.get('full_name'),
                user_data.get('role', 'user'),
                user_data.get('is_super_admin', False)
            )
            login_user(user, remember=True)

            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user_data['id'],
                    "username": user_data['username'],
                    "full_name": user_data.get('full_name', user_data['username']),
                    "role": user_data.get('role', 'user'),
                    "is_super_admin": user_data.get('is_super_admin', False)
                }
            })
        else:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Login error: {str(e)}"
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout endpoint"""
    logout_user()
    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    })


@auth_bp.route('/status', methods=['GET'])
def auth_status():
    """Check authentication status"""
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "full_name": current_user.full_name,
                "role": current_user.role,
                "is_super_admin": current_user.is_super_admin
            }
        })
    else:
        return jsonify({
            "authenticated": False
        })
