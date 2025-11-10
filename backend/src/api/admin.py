"""
System administration API endpoints
Provides statistics, system information, and management tools for super admins
"""
from flask import Blueprint, jsonify, current_app, send_file
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime, timedelta
import os
import json

from ..utils.json_store import read_json_file

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def require_super_admin():
    """Check if current user is super admin"""
    if not current_user.is_super_admin:
        return jsonify({
            "success": False,
            "message": "Super admin access required"
        }), 403
    return None


@admin_bp.route('/stats', methods=['GET'])
@login_required
def get_system_stats():
    """Get comprehensive system statistics"""
    error = require_super_admin()
    if error:
        return error

    try:
        json_dir = Path(current_app.config['JSON_DIR'])

        # User statistics
        users_path = json_dir / current_app.config['JSON_USERS']
        users_data = read_json_file(users_path)
        users = users_data.get('users', [])

        user_stats = {
            'total': len(users),
            'active': len([u for u in users if u.get('is_active', True)]),
            'admin': len([u for u in users if u.get('role') == 'admin']),
            'super_admin': len([u for u in users if u.get('is_super_admin', False)])
        }

        # CRM statistics (organizations)
        orgs_path = json_dir / 'organizations.json'
        orgs_data = read_json_file(orgs_path)

        # Handle both list and dict formats
        if isinstance(orgs_data, list):
            orgs = orgs_data
        elif isinstance(orgs_data, dict):
            orgs = orgs_data.get('organizations', [])
        else:
            orgs = []

        # Count organizations by type
        org_types = {}
        for org in orgs:
            org_type = org.get('organization_type', org.get('type', 'unknown'))
            org_types[org_type] = org_types.get(org_type, 0) + 1

        # Contacts statistics
        contacts_path = json_dir / 'unified_contacts.json'
        contacts_data = read_json_file(contacts_path)

        # Handle both list and dict formats
        if isinstance(contacts_data, list):
            contacts = contacts_data
        elif isinstance(contacts_data, dict):
            contacts = contacts_data.get('contacts', [])
        else:
            contacts = []

        # Count upcoming reminders
        today = datetime.now().date()
        next_week = today + timedelta(days=7)
        reminders_due = 0
        overdue_reminders = 0

        for contact in contacts:
            reminder_date = contact.get('next_contact_reminder')
            # Skip if no reminder date or empty string
            if not reminder_date or not isinstance(reminder_date, str):
                continue

            try:
                reminder = datetime.fromisoformat(reminder_date).date()
                if reminder < today:
                    overdue_reminders += 1
                elif reminder <= next_week:
                    reminders_due += 1
            except (ValueError, TypeError, AttributeError):
                # Skip invalid dates
                continue

        crm_stats = {
            'organizations': len(orgs),
            'by_type': org_types,
            'contacts': len(contacts),
            'reminders_due': reminders_due,
            'overdue_reminders': overdue_reminders
        }

        # Deals statistics
        deals_path = json_dir / current_app.config['JSON_DEALS']
        deals_data = read_json_file(deals_path)

        # Handle both list and dict formats
        if isinstance(deals_data, list):
            deals = deals_data
        elif isinstance(deals_data, dict):
            deals = deals_data.get('deals', [])
        else:
            deals = []

        deals_by_status = {}
        total_value = 0

        for deal in deals:
            status = deal.get('status', 'unknown')
            deals_by_status[status] = deals_by_status.get(status, 0) + 1

            # Sum deal values if available
            try:
                value = deal.get('deal_value', 0)
                if value:
                    total_value += float(value)
            except:
                pass

        deals_stats = {
            'total': len(deals),
            'by_status': deals_by_status,
            'total_value': total_value
        }

        # Database statistics
        def get_directory_size(path):
            """Calculate total size of directory recursively"""
            total = 0
            try:
                for entry in os.scandir(path):
                    if entry.is_file():
                        total += entry.stat().st_size
                    elif entry.is_dir():
                        total += get_directory_size(entry.path)
            except:
                pass
            return total

        json_size = get_directory_size(json_dir)
        storage_dir = Path(current_app.config['STORAGE_DIR'])
        storage_size = get_directory_size(storage_dir) if storage_dir.exists() else 0

        # Count JSON files
        json_files = list(json_dir.glob('*.json'))
        backup_files = list(json_dir.glob('*.json.bak'))

        # Get last backup timestamp (most recent .bak file)
        last_backup = None
        if backup_files:
            most_recent = max(backup_files, key=lambda f: f.stat().st_mtime)
            last_backup = datetime.fromtimestamp(most_recent.stat().st_mtime).isoformat()

        database_stats = {
            'size_mb': round((json_size + storage_size) / (1024 * 1024), 2),
            'json_size_mb': round(json_size / (1024 * 1024), 2),
            'storage_size_mb': round(storage_size / (1024 * 1024), 2),
            'file_count': len(json_files),
            'backup_count': len(backup_files),
            'last_backup': last_backup
        }

        # Whiteboard statistics
        weekly_posts_path = json_dir / 'weekly_whiteboards.json'
        general_posts_path = json_dir / 'general_posts.json'

        weekly_posts_data = read_json_file(weekly_posts_path)
        general_posts_data = read_json_file(general_posts_path)

        # Handle both list and dict formats
        if isinstance(weekly_posts_data, list):
            weekly_posts = weekly_posts_data
        elif isinstance(weekly_posts_data, dict):
            weekly_posts = weekly_posts_data.get('posts', [])
        else:
            weekly_posts = []

        if isinstance(general_posts_data, list):
            general_posts = general_posts_data
        elif isinstance(general_posts_data, dict):
            general_posts = general_posts_data.get('posts', [])
        else:
            general_posts = []

        whiteboard_stats = {
            'total_posts': len(weekly_posts) + len(general_posts),
            'weekly_posts': len(weekly_posts),
            'general_posts': len(general_posts)
        }

        return jsonify({
            "success": True,
            "data": {
                "users": user_stats,
                "crm": crm_stats,
                "deals": deals_stats,
                "database": database_stats,
                "whiteboard": whiteboard_stats,
                "timestamp": datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching system statistics: {str(e)}"
        }), 500


@admin_bp.route('/database/files', methods=['GET'])
@login_required
def get_database_files():
    """List all database files with metadata"""
    error = require_super_admin()
    if error:
        return error

    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        storage_dir = Path(current_app.config['STORAGE_DIR'])

        files_info = []

        # JSON database files
        for file_path in json_dir.glob('*.json'):
            stat = file_path.stat()
            files_info.append({
                'filename': file_path.name,
                'path': str(file_path.relative_to(json_dir.parent)),
                'size': stat.st_size,
                'size_kb': round(stat.st_size / 1024, 2),
                'last_modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'type': 'database'
            })

        # Storage files (generated data)
        if storage_dir.exists():
            for file_path in storage_dir.glob('*.json'):
                stat = file_path.stat()
                files_info.append({
                    'filename': file_path.name,
                    'path': str(file_path.relative_to(storage_dir.parent)),
                    'size': stat.st_size,
                    'size_kb': round(stat.st_size / 1024, 2),
                    'last_modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'type': 'generated'
                })

        # Sort by size descending
        files_info.sort(key=lambda x: x['size'], reverse=True)

        return jsonify({
            "success": True,
            "data": files_info,
            "count": len(files_info)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error listing database files: {str(e)}"
        }), 500


@admin_bp.route('/database/size', methods=['GET'])
@login_required
def get_database_size():
    """Get total database size breakdown"""
    error = require_super_admin()
    if error:
        return error

    try:
        def get_directory_size(path):
            total = 0
            try:
                for entry in os.scandir(path):
                    if entry.is_file():
                        total += entry.stat().st_size
                    elif entry.is_dir():
                        total += get_directory_size(entry.path)
            except:
                pass
            return total

        json_dir = Path(current_app.config['JSON_DIR'])
        storage_dir = Path(current_app.config['STORAGE_DIR'])

        json_size = get_directory_size(json_dir)
        storage_size = get_directory_size(storage_dir) if storage_dir.exists() else 0

        return jsonify({
            "success": True,
            "data": {
                "total_mb": round((json_size + storage_size) / (1024 * 1024), 2),
                "by_type": {
                    "json_database_mb": round(json_size / (1024 * 1024), 2),
                    "generated_storage_mb": round(storage_size / (1024 * 1024), 2)
                }
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error calculating database size: {str(e)}"
        }), 500


@admin_bp.route('/logs', methods=['GET'])
@login_required
def list_logs():
    """List available log files"""
    error = require_super_admin()
    if error:
        return error

    try:
        storage_dir = Path(current_app.config['STORAGE_DIR'])
        logs_dir = storage_dir / 'logs'

        if not logs_dir.exists():
            return jsonify({
                "success": True,
                "data": [],
                "message": "No logs directory found"
            })

        logs_info = []

        # List all log files
        for file_path in logs_dir.glob('*'):
            if file_path.is_file():
                stat = file_path.stat()
                logs_info.append({
                    'filename': file_path.name,
                    'size': stat.st_size,
                    'size_kb': round(stat.st_size / 1024, 2),
                    'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'type': file_path.suffix[1:] if file_path.suffix else 'unknown'
                })

        # Sort by modified time descending
        logs_info.sort(key=lambda x: x['modified'], reverse=True)

        return jsonify({
            "success": True,
            "data": logs_info,
            "count": len(logs_info)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error listing logs: {str(e)}"
        }), 500


@admin_bp.route('/logs/<filename>', methods=['GET'])
@login_required
def download_log(filename):
    """Download a specific log file"""
    error = require_super_admin()
    if error:
        return error

    try:
        # Security: prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({
                "success": False,
                "message": "Invalid filename"
            }), 400

        storage_dir = Path(current_app.config['STORAGE_DIR'])
        logs_dir = storage_dir / 'logs'
        log_path = logs_dir / filename

        if not log_path.exists() or not log_path.is_file():
            return jsonify({
                "success": False,
                "message": "Log file not found"
            }), 404

        return send_file(log_path, as_attachment=True, download_name=filename)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error downloading log: {str(e)}"
        }), 500


@admin_bp.route('/system/health', methods=['GET'])
@login_required
def system_health():
    """Get system health status"""
    error = require_super_admin()
    if error:
        return error

    try:
        # Check database accessibility
        json_dir = Path(current_app.config['JSON_DIR'])
        database_ok = json_dir.exists() and json_dir.is_dir()

        # Check storage accessibility
        storage_dir = Path(current_app.config['STORAGE_DIR'])
        storage_ok = storage_dir.exists() and storage_dir.is_dir()

        # Check if critical files exist
        users_file = json_dir / current_app.config['JSON_USERS']
        users_ok = users_file.exists()

        # Overall status
        all_ok = database_ok and storage_ok and users_ok

        return jsonify({
            "success": True,
            "data": {
                "status": "online" if all_ok else "degraded",
                "services": {
                    "database": "ok" if database_ok else "error",
                    "storage": "ok" if storage_ok else "error",
                    "users": "ok" if users_ok else "error"
                },
                "timestamp": datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "data": {
                "status": "error",
                "message": str(e)
            }
        }), 500


@admin_bp.route('/database/backup', methods=['POST'])
@login_required
def trigger_backup():
    """Manually trigger database backup"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.json_store import create_timestamped_backup

        json_dir = Path(current_app.config['JSON_DIR'])
        backup_dir = json_dir / 'backups'
        backup_dir.mkdir(exist_ok=True)

        # Backup all JSON files
        backed_up = []
        failed = []

        for file_path in json_dir.glob('*.json'):
            success = create_timestamped_backup(file_path, backup_dir)
            if success:
                backed_up.append(file_path.name)
            else:
                failed.append(file_path.name)

        return jsonify({
            "success": True,
            "data": {
                "backed_up": backed_up,
                "failed": failed,
                "backup_path": str(backup_dir),
                "timestamp": datetime.now().isoformat()
            },
            "message": f"Backed up {len(backed_up)} files"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating backup: {str(e)}"
        }), 500


@admin_bp.route('/audit-log', methods=['GET'])
@login_required
def get_audit_log():
    """Get audit log entries with optional filters"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.audit_logger import AuditLogger
        from flask import request

        # Get query parameters
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        user_id = request.args.get('user_id')
        action = request.args.get('action')
        entity_type = request.args.get('entity_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Get filtered logs
        result = AuditLogger.get_logs(
            limit=limit,
            offset=offset,
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            start_date=start_date,
            end_date=end_date
        )

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": {
                    "entries": result['entries'],
                    "pagination": {
                        "total": result['total'],
                        "limit": result['limit'],
                        "offset": result['offset'],
                        "has_more": result['has_more']
                    }
                }
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to retrieve audit log')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error retrieving audit log: {str(e)}"
        }), 500


@admin_bp.route('/audit-log/stats', methods=['GET'])
@login_required
def get_audit_stats():
    """Get audit log statistics"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.audit_logger import AuditLogger

        stats = AuditLogger.get_stats()

        if stats.get('success'):
            return jsonify({
                "success": True,
                "data": {
                    'total_entries': stats['total_entries'],
                    'by_action': stats['by_action'],
                    'by_user': stats['by_user'],
                    'by_entity_type': stats['by_entity_type'],
                    'successful_operations': stats['successful_operations'],
                    'failed_operations': stats['failed_operations'],
                    'success_rate': stats['success_rate']
                }
            })
        else:
            return jsonify({
                "success": False,
                "message": stats.get('error', 'Failed to get audit stats')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting audit statistics: {str(e)}"
        }), 500


@admin_bp.route('/config/security', methods=['GET'])
@login_required
def get_security_config():
    """Get current security configuration (read-only)"""
    error = require_super_admin()
    if error:
        return error

    try:
        import bcrypt

        # Get CORS configuration
        cors_origins = current_app.config.get('CORS_ORIGINS', [])

        # Get session configuration
        session_config = {
            'permanent_session_lifetime': str(current_app.config.get('PERMANENT_SESSION_LIFETIME', 'Default')),
            'session_cookie_secure': current_app.config.get('SESSION_COOKIE_SECURE', False),
            'session_cookie_httponly': current_app.config.get('SESSION_COOKIE_HTTPONLY', True),
            'session_cookie_samesite': current_app.config.get('SESSION_COOKIE_SAMESITE', 'Lax')
        }

        # Get authentication settings
        auth_config = {
            'bcrypt_log_rounds': 12,  # Default bcrypt rounds
            'login_required_endpoints': True,
            'remember_me_enabled': current_app.config.get('REMEMBER_COOKIE_DURATION', False) is not False
        }

        # Get environment info
        env_config = {
            'flask_env': current_app.config.get('ENV', 'production'),
            'debug_mode': current_app.config.get('DEBUG', False),
            'testing_mode': current_app.config.get('TESTING', False)
        }

        return jsonify({
            "success": True,
            "data": {
                "cors": {
                    "enabled": True,
                    "allowed_origins": cors_origins,
                    "supports_credentials": True
                },
                "session": session_config,
                "authentication": auth_config,
                "environment": env_config,
                "timestamp": datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting security configuration: {str(e)}"
        }), 500


@admin_bp.route('/config/api-keys', methods=['GET'])
@login_required
def get_api_keys():
    """Get list of configured API keys (masked for security)"""
    error = require_super_admin()
    if error:
        return error

    try:
        # Get API keys from config
        exchangerate_key = current_app.config.get('EXCHANGERATE_API_KEY', '')

        def mask_key(key: str) -> str:
            """Mask API key for display"""
            if not key or len(key) < 8:
                return '***'
            return f"{key[:3]}...{key[-3:]}"

        api_keys = {
            'exchangerate_api': {
                'name': 'ExchangeRate API',
                'key_name': 'EXCHANGERATE_API_KEY',
                'masked_value': mask_key(exchangerate_key),
                'configured': bool(exchangerate_key),
                'description': 'API key for fetching foreign exchange rates',
                'endpoint': 'https://v6.exchangerate-api.com/v6/'
            }
        }

        return jsonify({
            "success": True,
            "data": {
                "api_keys": api_keys,
                "total_keys": len(api_keys),
                "timestamp": datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting API keys: {str(e)}"
        }), 500


@admin_bp.route('/config/api-keys/<key_name>', methods=['PUT'])
@login_required
def update_api_key(key_name: str):
    """Update a specific API key"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..utils.audit_logger import log_admin_action
        import os
        from pathlib import Path

        # Get new key value from request
        data = request.get_json()
        new_key = data.get('api_key', '').strip()

        if not new_key:
            return jsonify({
                "success": False,
                "message": "API key value is required"
            }), 400

        # Validate key name
        allowed_keys = ['EXCHANGERATE_API_KEY']
        if key_name not in allowed_keys:
            return jsonify({
                "success": False,
                "message": f"Invalid key name. Allowed keys: {', '.join(allowed_keys)}"
            }), 400

        # Get path to .env file (project root)
        project_root = Path(current_app.config['BASE_DIR'])
        env_file = project_root / '.env'

        # Read current .env content
        env_lines = []
        key_found = False

        if env_file.exists():
            with open(env_file, 'r') as f:
                env_lines = f.readlines()

            # Update existing key or add if not found
            for i, line in enumerate(env_lines):
                if line.startswith(f"{key_name}="):
                    env_lines[i] = f"{key_name}={new_key}\n"
                    key_found = True
                    break

        if not key_found:
            env_lines.append(f"{key_name}={new_key}\n")

        # Write updated .env file
        with open(env_file, 'w') as f:
            f.writelines(env_lines)

        # Update runtime config
        current_app.config[key_name] = new_key
        os.environ[key_name] = new_key

        # Log the action
        log_admin_action(
            action='api_key_update',
            entity_type='config',
            metadata={'key_name': key_name}
        )

        return jsonify({
            "success": True,
            "message": f"API key {key_name} updated successfully",
            "data": {
                "key_name": key_name,
                "updated_at": datetime.now().isoformat()
            }
        })

    except Exception as e:
        # Log failure
        log_admin_action(
            action='api_key_update',
            entity_type='config',
            metadata={'key_name': key_name},
            success=False,
            error_message=str(e)
        )

        return jsonify({
            "success": False,
            "message": f"Error updating API key: {str(e)}"
        }), 500


@admin_bp.route('/config/api-keys/test', methods=['POST'])
@login_required
def test_api_key():
    """Test API key validity"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        import requests

        data = request.get_json()
        key_name = data.get('key_name', '')
        test_key = data.get('api_key', '')

        if not test_key:
            # Use configured key
            test_key = current_app.config.get(key_name, '')

        if not test_key:
            return jsonify({
                "success": False,
                "message": "No API key provided or configured"
            }), 400

        # Test ExchangeRate API key
        if key_name == 'EXCHANGERATE_API_KEY':
            test_url = f"https://v6.exchangerate-api.com/v6/{test_key}/latest/USD"
            response = requests.get(test_url, timeout=10)

            if response.status_code == 200:
                result = response.json()
                if result.get('result') == 'success':
                    return jsonify({
                        "success": True,
                        "message": "API key is valid and working",
                        "data": {
                            "status": "valid",
                            "tested_at": datetime.now().isoformat()
                        }
                    })
                else:
                    return jsonify({
                        "success": False,
                        "message": f"API returned error: {result.get('error-type', 'Unknown error')}"
                    }), 400
            else:
                return jsonify({
                    "success": False,
                    "message": f"API test failed with status code: {response.status_code}"
                }), 400
        else:
            return jsonify({
                "success": False,
                "message": f"Testing not implemented for {key_name}"
            }), 400

    except requests.Timeout:
        return jsonify({
            "success": False,
            "message": "API test timed out"
        }), 408
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error testing API key: {str(e)}"
        }), 500


@admin_bp.route('/archive/stats', methods=['GET'])
@login_required
def get_archive_stats():
    """Get archive statistics across all entity types"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..services.archive_manager import ArchiveManager

        json_dir = Path(current_app.config['JSON_DIR'])
        result = ArchiveManager.get_archive_stats(json_dir)

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": {
                    'stats': result['stats'],
                    'total_archives': result['total_archives']
                }
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to get archive stats')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting archive statistics: {str(e)}"
        }), 500


@admin_bp.route('/archive/<entity_type>', methods=['POST'])
@login_required
def archive_records(entity_type: str):
    """Archive selected records"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.archive_manager import ArchiveManager
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        record_ids = data.get('record_ids', [])

        if not record_ids:
            return jsonify({
                "success": False,
                "message": "No record IDs provided"
            }), 400

        if entity_type not in ['deals', 'organizations', 'contacts']:
            return jsonify({
                "success": False,
                "message": f"Invalid entity type: {entity_type}"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = ArchiveManager.archive_records(entity_type, record_ids, json_dir)

        if result.get('success'):
            # Log the action
            log_admin_action(
                action='archive',
                entity_type=entity_type,
                affected_ids=result.get('archived_ids', []),
                metadata={'archived_count': result['archived_count']}
            )

            return jsonify({
                "success": True,
                "message": f"Archived {result['archived_count']} {entity_type}",
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to archive records')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error archiving records: {str(e)}"
        }), 500


@admin_bp.route('/archive/<entity_type>/list', methods=['GET'])
@login_required
def list_archived_records(entity_type: str):
    """List archived records for a specific entity type"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.archive_manager import ArchiveManager

        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)

        if entity_type not in ['deals', 'organizations', 'contacts']:
            return jsonify({
                "success": False,
                "message": f"Invalid entity type: {entity_type}"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = ArchiveManager.list_archived(entity_type, json_dir, limit, offset)

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": {
                    'records': result['records'],
                    'pagination': {
                        'total': result['total'],
                        'limit': result.get('limit'),
                        'offset': result['offset'],
                        'has_more': result.get('has_more', False)
                    }
                }
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to list archived records')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error listing archived records: {str(e)}"
        }), 500


@admin_bp.route('/archive/<entity_type>/restore', methods=['POST'])
@login_required
def restore_archived_records(entity_type: str):
    """Restore archived records back to main file"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.archive_manager import ArchiveManager
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        record_ids = data.get('record_ids', [])

        if not record_ids:
            return jsonify({
                "success": False,
                "message": "No record IDs provided"
            }), 400

        if entity_type not in ['deals', 'organizations', 'contacts']:
            return jsonify({
                "success": False,
                "message": f"Invalid entity type: {entity_type}"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = ArchiveManager.restore_records(entity_type, record_ids, json_dir)

        if result.get('success'):
            # Log the action
            log_admin_action(
                action='restore',
                entity_type=entity_type,
                affected_ids=result.get('restored_ids', []),
                metadata={'restored_count': result['restored_count']}
            )

            return jsonify({
                "success": True,
                "message": f"Restored {result['restored_count']} {entity_type}",
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to restore records')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error restoring records: {str(e)}"
        }), 500


@admin_bp.route('/archive/<entity_type>/auto-archive', methods=['POST'])
@login_required
def auto_archive_records(entity_type: str):
    """Automatically archive old records based on criteria"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.archive_manager import ArchiveManager
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        days_old = data.get('days_old', 365)
        status_filter = data.get('status_filter')

        if entity_type not in ['deals', 'organizations', 'contacts']:
            return jsonify({
                "success": False,
                "message": f"Invalid entity type: {entity_type}"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = ArchiveManager.auto_archive_old_records(
            entity_type, json_dir, days_old, status_filter
        )

        if result.get('success'):
            # Log the action
            if result.get('archived_count', 0) > 0:
                log_admin_action(
                    action='auto_archive',
                    entity_type=entity_type,
                    affected_ids=result.get('archived_ids', []),
                    metadata=result.get('criteria', {})
                )

            return jsonify({
                "success": True,
                "message": result.get('message', f"Auto-archived {result.get('archived_count', 0)} {entity_type}"),
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to auto-archive records')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error auto-archiving records: {str(e)}"
        }), 500


@admin_bp.route('/cleanup/scan', methods=['GET'])
@login_required
def scan_data_issues():
    """Scan for all data quality issues"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..services.data_cleanup import DataCleanup

        json_dir = Path(current_app.config['JSON_DIR'])
        result = DataCleanup.scan_all_issues(json_dir)

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to scan for issues')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error scanning for issues: {str(e)}"
        }), 500


@admin_bp.route('/cleanup/fix', methods=['POST'])
@login_required
def fix_data_issues():
    """Fix detected data issues"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.data_cleanup import DataCleanup
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        fix_type = data.get('fix_type')  # 'orphaned_contacts', 'invalid_references'
        record_ids = data.get('record_ids', [])

        if not fix_type or not record_ids:
            return jsonify({
                "success": False,
                "message": "fix_type and record_ids are required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])

        if fix_type == 'orphaned_contacts':
            result = DataCleanup.delete_orphaned_contacts(json_dir, record_ids)
        elif fix_type == 'invalid_references':
            result = DataCleanup.delete_invalid_participants(json_dir, record_ids)
        else:
            return jsonify({
                "success": False,
                "message": f"Unknown fix_type: {fix_type}"
            }), 400

        if result.get('success'):
            # Log the action
            log_admin_action(
                action='data_cleanup',
                entity_type=fix_type,
                affected_ids=record_ids,
                metadata={'deleted_count': result.get('deleted_count', 0)}
            )

            return jsonify({
                "success": True,
                "message": f"Fixed {result.get('deleted_count', 0)} issues",
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to fix issues')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fixing issues: {str(e)}"
        }), 500


@admin_bp.route('/bulk/update', methods=['POST'])
@login_required
def bulk_update_records():
    """Bulk update records"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.bulk_operations import BulkOperations
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        entity_type = data.get('entity_type')
        filters = data.get('filters', {})
        updates = data.get('updates', {})
        dry_run = data.get('dry_run', True)

        if not entity_type or not updates:
            return jsonify({
                "success": False,
                "message": "entity_type and updates are required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = BulkOperations.bulk_update(entity_type, json_dir, filters, updates, dry_run)

        if result.get('success'):
            # Log if not dry run
            if not dry_run:
                log_admin_action(
                    action='bulk_update',
                    entity_type=entity_type,
                    affected_ids=result.get('matched_ids', []),
                    metadata={'filters': filters, 'updates': updates, 'updated_count': result['updated_count']}
                )

            return jsonify({
                "success": True,
                "message": f"{'Preview: ' if dry_run else ''}Updated {result.get('matched_count', 0)} {entity_type}",
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to bulk update')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error bulk updating: {str(e)}"
        }), 500


@admin_bp.route('/bulk/export', methods=['POST'])
@login_required
def bulk_export_records():
    """Export records to CSV or JSON"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request, make_response
        from ..services.bulk_operations import BulkOperations

        data = request.get_json()
        entity_type = data.get('entity_type')
        filters = data.get('filters')
        format_type = data.get('format', 'csv')

        if not entity_type:
            return jsonify({
                "success": False,
                "message": "entity_type is required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = BulkOperations.bulk_export(entity_type, json_dir, filters, format_type)

        if result.get('success'):
            # Return file for download
            content = result['content']

            if format_type == 'csv':
                response = make_response(content)
                response.headers['Content-Type'] = 'text/csv'
                response.headers['Content-Disposition'] = f'attachment; filename={entity_type}_export.csv'
            else:  # json
                response = make_response(content)
                response.headers['Content-Type'] = 'application/json'
                response.headers['Content-Disposition'] = f'attachment; filename={entity_type}_export.json'

            return response
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to export')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error exporting: {str(e)}"
        }), 500


@admin_bp.route('/bulk/import/validate', methods=['POST'])
@login_required
def bulk_import_validate():
    """Validate imported records"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.bulk_operations import BulkOperations

        data = request.get_json()
        entity_type = data.get('entity_type')
        records = data.get('records', [])

        if not entity_type or not records:
            return jsonify({
                "success": False,
                "message": "entity_type and records are required"
            }), 400

        result = BulkOperations.bulk_import_validate(entity_type, records)

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Validation failed')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error validating import: {str(e)}"
        }), 500


@admin_bp.route('/bulk/import/commit', methods=['POST'])
@login_required
def bulk_import_commit():
    """Import and save records"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.bulk_operations import BulkOperations
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        entity_type = data.get('entity_type')
        records = data.get('records', [])
        mode = data.get('mode', 'append')

        if not entity_type or not records:
            return jsonify({
                "success": False,
                "message": "entity_type and records are required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = BulkOperations.bulk_import_commit(entity_type, json_dir, records, mode)

        if result.get('success'):
            # Log the import
            log_admin_action(
                action='bulk_import',
                entity_type=entity_type,
                metadata={
                    'imported_count': result['imported_count'],
                    'updated_count': result['updated_count'],
                    'mode': mode
                }
            )

            return jsonify({
                "success": True,
                "message": f"Imported {result['imported_count']} {entity_type}",
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Import failed')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error importing: {str(e)}"
        }), 500


# =============================================================================
# FEATURE FLAGS ENDPOINTS
# =============================================================================

@admin_bp.route('/feature-flags', methods=['GET'])
@login_required
def get_feature_flags():
    """Get all feature flags and their current status"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..services.feature_flags import FeatureFlags

        json_dir = Path(current_app.config['JSON_DIR'])
        flags = FeatureFlags.get_all_flags(json_dir)

        return jsonify({
            "success": True,
            "data": {
                "flags": flags,
                "categories": {
                    "integration": FeatureFlags.get_flags_by_category(json_dir, "integration"),
                    "data_management": FeatureFlags.get_flags_by_category(json_dir, "data_management"),
                    "ui": FeatureFlags.get_flags_by_category(json_dir, "ui")
                }
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading feature flags: {str(e)}"
        }), 500


@admin_bp.route('/feature-flags/<flag_name>', methods=['PUT'])
@login_required
def toggle_feature_flag(flag_name: str):
    """Toggle a specific feature flag"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.feature_flags import FeatureFlags
        from ..utils.audit_logger import log_admin_action

        data = request.get_json()
        enabled = data.get('enabled')

        if enabled is None:
            return jsonify({
                "success": False,
                "message": "enabled field is required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        result = FeatureFlags.toggle_flag(
            json_dir,
            flag_name,
            enabled,
            modified_by=current_user.username
        )

        if result.get('success'):
            # Log the change
            log_admin_action(
                action='toggle_feature_flag',
                entity_type='feature_flags',
                affected_ids=[flag_name],
                old_values={'enabled': result['data']['old_value']},
                new_values={'enabled': result['data']['new_value']},
                metadata={'flag_name': flag_name}
            )

            return jsonify({
                "success": True,
                "message": result['message'],
                "data": result['data']
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('message', 'Failed to toggle flag')
            }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling feature flag: {str(e)}"
        }), 500


@admin_bp.route('/feature-flags/<flag_name>/metadata', methods=['GET'])
@login_required
def get_feature_flag_metadata(flag_name: str):
    """Get metadata for a specific feature flag"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..services.feature_flags import FeatureFlags

        json_dir = Path(current_app.config['JSON_DIR'])
        metadata = FeatureFlags.get_flag_metadata(json_dir, flag_name)

        if metadata:
            return jsonify({
                "success": True,
                "data": metadata
            })
        else:
            return jsonify({
                "success": False,
                "message": f"Feature flag '{flag_name}' not found"
            }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading flag metadata: {str(e)}"
        }), 500


@admin_bp.route('/feature-flags/reset', methods=['POST'])
@login_required
def reset_feature_flags():
    """Reset all feature flags to their default values"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..services.feature_flags import FeatureFlags
        from ..utils.audit_logger import log_admin_action

        json_dir = Path(current_app.config['JSON_DIR'])
        result = FeatureFlags.reset_to_defaults(json_dir)

        if result.get('success'):
            # Log the reset
            log_admin_action(
                action='reset_feature_flags',
                entity_type='feature_flags',
                metadata={'reset_by': current_user.username}
            )

            return jsonify({
                "success": True,
                "message": result['message']
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('message', 'Failed to reset flags')
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error resetting feature flags: {str(e)}"
        }), 500


# =============================================================================
# API PLAYGROUND ENDPOINTS
# =============================================================================

@admin_bp.route('/api-playground/endpoints', methods=['GET'])
@login_required
def get_api_endpoints():
    """List all available API endpoints"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.endpoint_discovery import EndpointDiscovery

        # Check if grouped view requested
        grouped = request.args.get('grouped', 'false').lower() == 'true'

        if grouped:
            endpoints = EndpointDiscovery.get_grouped_endpoints()
        else:
            endpoints = EndpointDiscovery.get_all_endpoints()

        return jsonify({
            "success": True,
            "data": {
                "endpoints": endpoints,
                "total_count": sum(len(eps) for eps in endpoints.values()) if grouped else len(endpoints)
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error discovering endpoints: {str(e)}"
        }), 500


@admin_bp.route('/api-playground/endpoints/search', methods=['GET'])
@login_required
def search_api_endpoints():
    """Search for API endpoints"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.endpoint_discovery import EndpointDiscovery

        query = request.args.get('q', '')
        if not query:
            return jsonify({
                "success": False,
                "message": "Query parameter 'q' is required"
            }), 400

        results = EndpointDiscovery.search_endpoints(query)

        return jsonify({
            "success": True,
            "data": {
                "results": results,
                "count": len(results),
                "query": query
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error searching endpoints: {str(e)}"
        }), 500


@admin_bp.route('/api-playground/execute', methods=['POST'])
@login_required
def execute_api_request():
    """Execute an API request and return the response"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        import time
        import requests

        data = request.get_json()
        target_path = data.get('path')
        target_method = data.get('method', 'GET')
        headers = data.get('headers', {})
        query_params = data.get('query_params', {})
        body = data.get('body')

        if not target_path:
            return jsonify({
                "success": False,
                "message": "path is required"
            }), 400

        # Build full URL (use localhost since we're testing internal APIs)
        base_url = request.host_url.rstrip('/')
        full_url = f"{base_url}{target_path}"

        # Add query parameters
        if query_params:
            from urllib.parse import urlencode
            full_url += '?' + urlencode(query_params)

        # Prepare request
        start_time = time.time()

        # Get session cookie to preserve authentication
        session_cookie = request.cookies.get('session')
        if session_cookie:
            headers['Cookie'] = f"session={session_cookie}"

        # Execute request
        try:
            response = requests.request(
                method=target_method,
                url=full_url,
                headers=headers,
                json=body if body else None,
                timeout=30
            )

            execution_time = (time.time() - start_time) * 1000  # Convert to ms

            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text

            return jsonify({
                "success": True,
                "data": {
                    "status_code": response.status_code,
                    "status_text": response.reason,
                    "headers": dict(response.headers),
                    "body": response_data,
                    "execution_time_ms": round(execution_time, 2)
                }
            })

        except requests.exceptions.RequestException as req_err:
            execution_time = (time.time() - start_time) * 1000

            return jsonify({
                "success": False,
                "message": f"Request failed: {str(req_err)}",
                "data": {
                    "execution_time_ms": round(execution_time, 2)
                }
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error executing request: {str(e)}"
        }), 500


# =============================================================================
# DATABASE EXPLORER ENDPOINTS (READ-ONLY)
# =============================================================================

@admin_bp.route('/database-explorer/files', methods=['GET'])
@login_required
def list_database_explorer_files():
    """List all JSON database files with metadata"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.database_explorer import DatabaseExplorer

        json_dir = Path(current_app.config['JSON_DIR'])

        # Check if grouped view requested
        grouped = request.args.get('grouped', 'false').lower() == 'true'

        if grouped:
            files = DatabaseExplorer.get_grouped_files(json_dir)
        else:
            files = DatabaseExplorer.list_database_files(json_dir)

        return jsonify({
            "success": True,
            "data": {
                "files": files
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error listing database files: {str(e)}"
        }), 500


@admin_bp.route('/database-explorer/files/<filename>', methods=['GET'])
@login_required
def read_database_explorer_file(filename: str):
    """Read records from a specific database file"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..services.database_explorer import DatabaseExplorer

        # Get pagination params
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        search = request.args.get('search', None)

        # Validate limits
        if limit > 500:
            limit = 500
        if offset < 0:
            offset = 0

        json_dir = Path(current_app.config['JSON_DIR'])
        result = DatabaseExplorer.read_database_file(json_dir, filename, limit, offset, search)

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to read file')
            }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading database file: {str(e)}"
        }), 500


@admin_bp.route('/database-explorer/files/<filename>/schema', methods=['GET'])
@login_required
def get_database_file_schema(filename: str):
    """Get schema information for a database file"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..services.database_explorer import DatabaseExplorer

        json_dir = Path(current_app.config['JSON_DIR'])
        result = DatabaseExplorer.get_file_schema(json_dir, filename)

        if result.get('success'):
            return jsonify({
                "success": True,
                "data": result
            })
        else:
            return jsonify({
                "success": False,
                "message": result.get('error', 'Failed to analyze schema')
            }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error analyzing schema: {str(e)}"
        }), 500


# =============================================================================
# MY NOTES ENDPOINTS (Super Admin Personal Notes)
# =============================================================================

@admin_bp.route('/notes', methods=['GET'])
@login_required
def get_notes():
    """Get all personal notes for super admin"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.json_store import read_json_list

        json_dir = Path(current_app.config['JSON_DIR'])
        notes_path = json_dir / 'super_admin_notes.json'

        notes = read_json_list(notes_path)

        # Sort by starred first, then by updated_at descending
        notes.sort(key=lambda x: (not x.get('starred', False), x.get('updated_at', '')), reverse=True)

        return jsonify({
            "success": True,
            "data": notes,
            "count": len(notes)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading notes: {str(e)}"
        }), 500


@admin_bp.route('/notes/<note_id>', methods=['GET'])
@login_required
def get_note(note_id):
    """Get specific note by ID"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.json_store import read_json_list, find_by_id

        json_dir = Path(current_app.config['JSON_DIR'])
        notes_path = json_dir / 'super_admin_notes.json'

        notes = read_json_list(notes_path)
        note = find_by_id(notes, 'id', note_id)

        if not note:
            return jsonify({
                "success": False,
                "message": f"Note {note_id} not found"
            }), 404

        return jsonify({
            "success": True,
            "data": note
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading note: {str(e)}"
        }), 500


@admin_bp.route('/notes', methods=['POST'])
@login_required
def create_note():
    """Create new note"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..utils.json_store import read_json_list, write_json_file, generate_sequential_id

        data = request.get_json()

        if not data or not data.get('title'):
            return jsonify({
                "success": False,
                "message": "Title is required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        notes_path = json_dir / 'super_admin_notes.json'

        notes = read_json_list(notes_path)

        # Generate new ID
        new_id = generate_sequential_id(notes, 'id', 'note_')

        # Create new note
        now = datetime.now().isoformat()
        new_note = {
            "id": new_id,
            "title": data.get('title', ''),
            "content": data.get('content', ''),
            "starred": False,
            "created_at": now,
            "updated_at": now
        }

        notes.append(new_note)
        write_json_file(notes_path, notes)

        return jsonify({
            "success": True,
            "data": new_note,
            "message": "Note created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating note: {str(e)}"
        }), 500


@admin_bp.route('/notes/<note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    """Update note"""
    error = require_super_admin()
    if error:
        return error

    try:
        from flask import request
        from ..utils.json_store import read_json_list, write_json_file, find_by_id

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        notes_path = json_dir / 'super_admin_notes.json'

        notes = read_json_list(notes_path)
        note = find_by_id(notes, 'id', note_id)

        if not note:
            return jsonify({
                "success": False,
                "message": f"Note {note_id} not found"
            }), 404

        # Update fields
        note['title'] = data.get('title', note['title'])
        note['content'] = data.get('content', note['content'])
        note['updated_at'] = datetime.now().isoformat()

        write_json_file(notes_path, notes)

        return jsonify({
            "success": True,
            "data": note,
            "message": "Note updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating note: {str(e)}"
        }), 500


@admin_bp.route('/notes/<note_id>/star', methods=['PATCH'])
@login_required
def toggle_note_star(note_id):
    """Toggle note starred status"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.json_store import read_json_list, write_json_file, find_by_id

        json_dir = Path(current_app.config['JSON_DIR'])
        notes_path = json_dir / 'super_admin_notes.json'

        notes = read_json_list(notes_path)
        note = find_by_id(notes, 'id', note_id)

        if not note:
            return jsonify({
                "success": False,
                "message": f"Note {note_id} not found"
            }), 404

        # Toggle starred status
        note['starred'] = not note.get('starred', False)
        note['updated_at'] = datetime.now().isoformat()

        write_json_file(notes_path, notes)

        return jsonify({
            "success": True,
            "data": note,
            "message": f"Note {'starred' if note['starred'] else 'unstarred'} successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling star: {str(e)}"
        }), 500


@admin_bp.route('/notes/<note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    """Delete note"""
    error = require_super_admin()
    if error:
        return error

    try:
        from ..utils.json_store import read_json_list, write_json_file, remove_by_id

        json_dir = Path(current_app.config['JSON_DIR'])
        notes_path = json_dir / 'super_admin_notes.json'

        notes = read_json_list(notes_path)
        updated_notes = remove_by_id(notes, 'id', note_id)

        if len(updated_notes) == len(notes):
            return jsonify({
                "success": False,
                "message": f"Note {note_id} not found"
            }), 404

        write_json_file(notes_path, updated_notes)

        return jsonify({
            "success": True,
            "message": "Note deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting note: {str(e)}"
        }), 500
