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
        data = request.get_json(force=True)
        if not data:
            current_app.logger.error("[LOGIN] No JSON data in request")
            return jsonify({
                "success": False,
                "message": "No JSON data provided"
            }), 400

        username = data.get('username')
        password = data.get('password')

        current_app.logger.info(f"[LOGIN] Attempt for username: {username}")
        current_app.logger.info(f"[LOGIN] Password length: {len(password) if password else 0}")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password required"
            }), 400

        # Find user
        users_json_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_USERS']
        current_app.logger.info(f"[LOGIN] Looking for user in: {users_json_path}")
        user_data = get_user_by_username(username, users_json_path)
        if not user_data:
            current_app.logger.warning(f"[LOGIN] User not found: {username}")
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            })

        current_app.logger.info(f"[LOGIN] User found: {user_data.get('id')}")
        current_app.logger.info(f"[LOGIN] Password hash from DB: {user_data['password_hash'][:20]}...")

        # Verify password
        verification_result = verify_password(password, user_data['password_hash'])
        current_app.logger.info(f"[LOGIN] Password verification result: {verification_result}")

        if verification_result:
            # Create user object and login
            user = User(
                user_data['id'],
                user_data['username'],
                user_data.get('full_name'),
                user_data.get('role', 'user'),
                user_data.get('is_super_admin', False)
            )

            # Login user with permanent session for remember me
            from flask import session
            session.permanent = True
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
            })

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
