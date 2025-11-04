"""
Excel and legacy data routes
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path
from datetime import datetime

from ..utils.json_store import read_json_list, write_json_file

excel_bp = Blueprint('excel', __name__, url_prefix='/api')


# ============================================================================
# HEALTH CHECK
# ============================================================================

@excel_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify file paths and system status"""
    try:
        # Compute paths from config values
        excel_dir = Path(current_app.config['EXCEL_DIR'])
        excel_dashboard = current_app.config['EXCEL_DASHBOARD']
        excel_path = excel_dir / excel_dashboard

        web_dir = Path(current_app.config['WEB_DIR'])
        json_output_path = web_dir / 'dashboard.json'
        usa_historical_path = web_dir / 'usa_historical_yields.json'

        json_dir = Path(current_app.config['JSON_DIR'])

        status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "paths": {
                "excel_file": {
                    "path": str(excel_path),
                    "exists": excel_path.exists() if excel_path else False
                },
                "json_output": {
                    "path": str(json_output_path),
                    "exists": json_output_path.exists() if json_output_path else False
                },
                "usa_historical_json": {
                    "path": str(usa_historical_path),
                    "exists": usa_historical_path.exists() if usa_historical_path else False
                },
                "json_directory": {
                    "path": str(json_dir),
                    "exists": json_dir.exists() if json_dir else False
                }
            },
            "features": {
                "excel_com": False,  # Disabled for cloud compatibility
                "pdf_generation": False,  # Will be enabled when implemented
                "crm": True,
                "investment_matching": True
            }
        }

        return jsonify(status)

    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500


# ============================================================================
# HISTORICAL DATA
# ============================================================================

@excel_bp.route('/historical-yields/usa', methods=['GET'])
def get_usa_historical_yields():
    """Get USA historical yields data from pre-generated JSON"""
    try:
        web_dir = Path(current_app.config['WEB_DIR'])
        usa_historical_path = web_dir / 'usa_historical_yields.json'

        if not usa_historical_path.exists():
            return jsonify({
                "success": False,
                "message": f"USA historical yields data not found. Please run: python etl/extract_usa_historical.py"
            }), 404

        import json
        with open(usa_historical_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading USA historical yields: {str(e)}"
        }), 500


# ============================================================================
# LEGACY INSTITUTIONS ENDPOINTS
# ============================================================================

@excel_bp.route('/institutions', methods=['GET'])
def get_institutions():
    """Get institutions data from JSON file (legacy)"""
    try:
        institutions_path = Path(current_app.config['JSON_DIR']) / 'institutions.json'

        if not institutions_path.exists():
            return jsonify({
                "success": False,
                "message": "Institutions file not found"
            }), 404

        import json
        with open(institutions_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return jsonify({
            "success": True,
            "data": data,
            "count": len(data)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading institutions data: {str(e)}"
        }), 500


@excel_bp.route('/institutions/save', methods=['POST'])
def save_institutions():
    """Save institutions data to JSON file (legacy)"""
    try:
        import json
        import shutil

        # Get data from request
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate data is a list
        if not isinstance(data, list):
            return jsonify({
                "success": False,
                "message": "Data must be an array of institutions"
            }), 400

        # Validate each institution has required fields
        required_fields = ['Capital Partner', 'Type', 'Country', 'Relationship']
        for i, institution in enumerate(data):
            if not isinstance(institution, dict):
                return jsonify({
                    "success": False,
                    "message": f"Institution at index {i} is not an object"
                }), 400

            for field in required_fields:
                if field not in institution:
                    return jsonify({
                        "success": False,
                        "message": f"Institution at index {i} missing required field: {field}"
                    }), 400

        institutions_path = Path(current_app.config['JSON_DIR']) / 'institutions.json'
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']

        # Get list of deleted capital partners by comparing with existing data
        deleted_partners = []
        if institutions_path.exists():
            with open(institutions_path, 'r', encoding='utf-8') as f:
                old_data = json.load(f)
                old_partners = set(inst['Capital Partner'] for inst in old_data)
                new_partners = set(inst['Capital Partner'] for inst in data)
                deleted_partners = list(old_partners - new_partners)

        # Create backup of existing file
        if institutions_path.exists():
            backup_path = institutions_path.with_suffix('.json.bak')
            shutil.copy(str(institutions_path), str(backup_path))

        # Write new data to file
        with open(institutions_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Delete contacts associated with deleted capital partners
        if deleted_partners and contacts_path.exists():
            with open(contacts_path, 'r', encoding='utf-8') as f:
                contacts = json.load(f)

            # Filter out contacts from deleted partners
            filtered_contacts = [
                contact for contact in contacts
                if contact.get('Capital Partner') not in deleted_partners
            ]

            # Save updated contacts if any were deleted
            if len(filtered_contacts) < len(contacts):
                # Create backup
                backup_path = contacts_path.with_suffix('.json.bak')
                shutil.copy(str(contacts_path), str(backup_path))

                # Write filtered contacts
                with open(contacts_path, 'w', encoding='utf-8') as f:
                    json.dump(filtered_contacts, f, indent=2, ensure_ascii=False)

        return jsonify({
            "success": True,
            "message": "Institutions data saved successfully",
            "count": len(data),
            "deleted_partners": deleted_partners if deleted_partners else []
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving institutions data: {str(e)}"
        }), 500


# ============================================================================
# LEGACY CONTACTS ENDPOINTS (OLD STRUCTURE)
# ============================================================================

@excel_bp.route('/contacts', methods=['GET'])
def get_contacts():
    """Get contacts data from JSON file (legacy old structure)"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']

        if not contacts_path.exists():
            # Return empty array if file doesn't exist yet
            return jsonify({
                "success": True,
                "data": [],
                "count": 0
            })

        import json
        with open(contacts_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return jsonify({
            "success": True,
            "data": data,
            "count": len(data)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading contacts data: {str(e)}"
        }), 500


@excel_bp.route('/contacts/save', methods=['POST'])
def save_contacts():
    """Save contacts data to JSON file (legacy old structure)"""
    try:
        import json
        import shutil

        # Get data from request
        data = request.get_json()

        if data is None:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate data is a list
        if not isinstance(data, list):
            return jsonify({
                "success": False,
                "message": "Data must be an array of contacts"
            }), 400

        # Validate each contact has required fields
        required_fields = ['Capital Partner', 'Name', 'Role', 'Email', 'Relationship']
        for i, contact in enumerate(data):
            if not isinstance(contact, dict):
                return jsonify({
                    "success": False,
                    "message": f"Contact at index {i} is not an object"
                }), 400

            for field in required_fields:
                if field not in contact:
                    return jsonify({
                        "success": False,
                        "message": f"Contact at index {i} missing required field: {field}"
                    }), 400

            # Ensure optional fields exist (for backward compatibility)
            if 'DISC' not in contact:
                contact['DISC'] = ''
            if 'Notes' not in contact:
                contact['Notes'] = ''

        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']

        # Create backup of existing file
        if contacts_path.exists():
            backup_path = contacts_path.with_suffix('.json.bak')
            shutil.copy(str(contacts_path), str(backup_path))

        # Write new data to file
        with open(contacts_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return jsonify({
            "success": True,
            "message": "Contacts data saved successfully",
            "count": len(data)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving contacts data: {str(e)}"
        }), 500
