"""
Countries Master API endpoints
Manage the master list of countries for investment preferences
Admin-only endpoints for CRUD operations on countries
Public endpoint for fetching active countries
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from pathlib import Path
import json
from datetime import datetime

from ..utils.json_store import read_json_file, write_json_file

# Admin endpoints
countries_master_bp = Blueprint('countries_master', __name__, url_prefix='/api/admin/countries-master')

# Public endpoint for fetching active countries (for use in forms)
countries_public_bp = Blueprint('countries_public', __name__, url_prefix='/api/countries-master')


def require_super_admin():
    """Check if current user is super admin"""
    if not current_user.is_super_admin:
        return jsonify({
            "success": False,
            "message": "Super admin access required"
        }), 403
    return None


@countries_master_bp.route('', methods=['GET'])
@login_required
def get_countries():
    """
    Get all countries from the master list
    Returns both active and inactive countries
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        countries_file = json_dir / 'countries_master.json'

        countries = read_json_file(countries_file)

        # Sort by display_order
        countries.sort(key=lambda x: x.get('display_order', 999))

        return jsonify({
            "success": True,
            "countries": countries
        }), 200

    except FileNotFoundError:
        return jsonify({
            "success": False,
            "message": "Countries master file not found"
        }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading countries: {str(e)}"
        }), 500


@countries_master_bp.route('', methods=['POST'])
@login_required
def create_country():
    """
    Add a new country to the master list
    Admin only endpoint
    """
    error = require_super_admin()
    if error:
        return error

    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('id'):
            return jsonify({
                "success": False,
                "message": "Country ID is required"
            }), 400

        if not data.get('name'):
            return jsonify({
                "success": False,
                "message": "Country name is required"
            }), 400

        json_dir = Path(current_app.config['JSON_DIR'])
        countries_file = json_dir / 'countries_master.json'

        countries = read_json_file(countries_file)

        # Check if ID already exists
        if any(c['id'] == data['id'] for c in countries):
            return jsonify({
                "success": False,
                "message": f"Country with ID '{data['id']}' already exists"
            }), 400

        # Get max display_order and add 1
        max_order = max([c.get('display_order', 0) for c in countries], default=0)

        # Create new country
        new_country = {
            "id": data['id'].lower().strip(),
            "name": data['name'].strip(),
            "active": data.get('active', True),
            "display_order": data.get('display_order', max_order + 1)
        }

        countries.append(new_country)

        # Save to file
        write_json_file(countries_file, countries)

        return jsonify({
            "success": True,
            "message": "Country added successfully",
            "country": new_country
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating country: {str(e)}"
        }), 500


@countries_master_bp.route('/<country_id>', methods=['PUT'])
@login_required
def update_country(country_id):
    """
    Update an existing country in the master list
    Admin only endpoint
    """
    error = require_super_admin()
    if error:
        return error

    try:
        data = request.get_json()

        json_dir = Path(current_app.config['JSON_DIR'])
        countries_file = json_dir / 'countries_master.json'

        countries = read_json_file(countries_file)

        # Find the country
        country_index = next((i for i, c in enumerate(countries) if c['id'] == country_id), None)

        if country_index is None:
            return jsonify({
                "success": False,
                "message": f"Country '{country_id}' not found"
            }), 404

        # Update fields
        if 'name' in data:
            countries[country_index]['name'] = data['name'].strip()
        if 'active' in data:
            countries[country_index]['active'] = data['active']
        if 'display_order' in data:
            countries[country_index]['display_order'] = data['display_order']

        # Save to file
        write_json_file(countries_file, countries)

        return jsonify({
            "success": True,
            "message": "Country updated successfully",
            "country": countries[country_index]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating country: {str(e)}"
        }), 500


@countries_master_bp.route('/<country_id>', methods=['DELETE'])
@login_required
def deactivate_country(country_id):
    """
    Deactivate a country (soft delete)
    Admin only endpoint
    Does not remove the country, just marks it as inactive
    """
    error = require_super_admin()
    if error:
        return error

    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        countries_file = json_dir / 'countries_master.json'

        countries = read_json_file(countries_file)

        # Find the country
        country_index = next((i for i, c in enumerate(countries) if c['id'] == country_id), None)

        if country_index is None:
            return jsonify({
                "success": False,
                "message": f"Country '{country_id}' not found"
            }), 404

        # Check if country is in use by any organizations
        orgs_file = json_dir / 'organizations.json'
        organizations = read_json_file(orgs_file)

        orgs_using_country = []
        for org in organizations:
            if country_id in org.get('countries', []):
                orgs_using_country.append(org.get('name', 'Unknown'))

        if orgs_using_country:
            return jsonify({
                "success": False,
                "message": f"Cannot deactivate country. It is currently used by {len(orgs_using_country)} organization(s)",
                "organizations": orgs_using_country[:10]  # Return first 10
            }), 400

        # Deactivate the country
        countries[country_index]['active'] = False

        # Save to file
        write_json_file(countries_file, countries)

        return jsonify({
            "success": True,
            "message": "Country deactivated successfully",
            "country": countries[country_index]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deactivating country: {str(e)}"
        }), 500


@countries_master_bp.route('/usage', methods=['GET'])
@login_required
def get_country_usage():
    """
    Get usage statistics for all countries
    Shows how many organizations use each country
    """
    error = require_super_admin()
    if error:
        return error

    try:
        json_dir = Path(current_app.config['JSON_DIR'])

        # Load countries
        countries_file = json_dir / 'countries_master.json'
        countries = read_json_file(countries_file)

        # Load organizations
        orgs_file = json_dir / 'organizations.json'
        organizations = read_json_file(orgs_file)

        # Count usage for each country
        usage_stats = {}
        for country in countries:
            country_id = country['id']
            usage_stats[country_id] = {
                "id": country_id,
                "name": country['name'],
                "active": country['active'],
                "count": 0,
                "organizations": []
            }

        # Count organizations using each country
        for org in organizations:
            org_countries = org.get('countries', [])
            for country_id in org_countries:
                if country_id in usage_stats:
                    usage_stats[country_id]["count"] += 1
                    usage_stats[country_id]["organizations"].append({
                        "id": org.get('id'),
                        "name": org.get('name'),
                        "type": org.get('organization_type')
                    })

        # Convert to list and sort by count
        usage_list = list(usage_stats.values())
        usage_list.sort(key=lambda x: x['count'], reverse=True)

        return jsonify({
            "success": True,
            "usage": usage_list
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting country usage: {str(e)}"
        }), 500


# ============================================================================
# Public Endpoints (accessible to all authenticated users)
# ============================================================================

@countries_public_bp.route('/active', methods=['GET'])
@login_required
def get_active_countries():
    """
    Get only active countries from the master list
    Public endpoint for use in CRM forms
    No admin privileges required
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        countries_file = json_dir / 'countries_master.json'

        countries = read_json_file(countries_file)

        # Filter only active countries
        active_countries = [c for c in countries if c.get('active', True)]

        # Sort by display_order
        active_countries.sort(key=lambda x: x.get('display_order', 999))

        return jsonify({
            "success": True,
            "countries": active_countries
        }), 200

    except FileNotFoundError:
        return jsonify({
            "success": False,
            "message": "Countries master file not found"
        }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading countries: {str(e)}"
        }), 500
