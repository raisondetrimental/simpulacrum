"""
Excel and legacy data routes
"""
import json
import subprocess
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
# MARKETS OVERVIEW AGGREGATION
# ============================================================================

@excel_bp.route('/markets/overview', methods=['GET'])
def get_markets_overview():
    """Get aggregated markets data for overview page"""
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        markets_dir = json_dir / 'Markets'

        # Initialize response object
        overview = {
            "timestamp": datetime.now().isoformat(),
            "us_yields": None,
            "corporate_bonds": None,
            "corporate_yields": None,
            "corporate_spreads": None,
            "policy_rates": None,
            "fx_rates": None,
            "countries": []
        }

        # Load US Yields
        us_yields_path = markets_dir / 'US_Yields.json'
        if us_yields_path.exists():
            with open(us_yields_path, 'r', encoding='utf-8') as f:
                overview['us_yields'] = json.load(f)

        # Load Corporate Bonds (AAA to High Yield)
        corporate_bonds_path = markets_dir / 'Corporate_Bonds.json'
        if corporate_bonds_path.exists():
            with open(corporate_bonds_path, 'r', encoding='utf-8') as f:
                overview['corporate_bonds'] = json.load(f)

        # Load Corporate Yields (Effective Yields)
        corporate_yields_path = markets_dir / 'Corporate_Yields.json'
        if corporate_yields_path.exists():
            with open(corporate_yields_path, 'r', encoding='utf-8') as f:
                overview['corporate_yields'] = json.load(f)

        # Load Corporate Spreads (OAS)
        corporate_spreads_path = markets_dir / 'Corporate_Spreads.json'
        if corporate_spreads_path.exists():
            with open(corporate_spreads_path, 'r', encoding='utf-8') as f:
                overview['corporate_spreads'] = json.load(f)

        # Load Policy Rates
        policy_rates_path = markets_dir / 'Policy_Rates.json'
        if policy_rates_path.exists():
            with open(policy_rates_path, 'r', encoding='utf-8') as f:
                overview['policy_rates'] = json.load(f)

        # Load FX Rates (Yahoo)
        fx_rates_path = markets_dir / 'FX_Rates_Yahoo.json'
        if fx_rates_path.exists():
            with open(fx_rates_path, 'r', encoding='utf-8') as f:
                fx_data = json.load(f)

            # Merge with ExchangeRate API history for MNT/AMD
            exchangerate_history_path = json_dir / 'fx_rates_history.json'
            if exchangerate_history_path.exists():
                with open(exchangerate_history_path, 'r', encoding='utf-8') as f:
                    exchangerate_history = json.load(f)
                fx_data = merge_fx_data_sources(fx_data, exchangerate_history)

            overview['fx_rates'] = fx_data

        # Load Country Fundamentals (basic info)
        country_fundamentals_path = json_dir / 'country_fundamentals.json'
        if country_fundamentals_path.exists():
            with open(country_fundamentals_path, 'r', encoding='utf-8') as f:
                countries_data = json.load(f)
                # Only include the 5 focus countries
                focus_countries = ['armenia', 'mongolia', 'turkiye', 'uzbekistan', 'vietnam']
                overview['countries'] = [
                    c for c in countries_data.values()
                    if c.get('slug') in focus_countries
                ]

        return jsonify(overview)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading markets overview: {str(e)}"
        }), 500


# ============================================================================
# HISTORICAL DATA
# ============================================================================

@excel_bp.route('/historical-yields/usa', methods=['GET'])
def get_usa_historical_yields():
    """Get USA historical yields data from FRED JSON (90 days) - returns raw FRED format"""
    try:
        import json

        json_dir = Path(current_app.config['JSON_DIR'])
        fred_yields_path = json_dir / 'Markets' / 'US_Yields.json'

        if not fred_yields_path.exists():
            return jsonify({
                "success": False,
                "message": f"USA historical yields data not found. Please run: python scripts/fetch_us_yields_fred.py"
            }), 404

        with open(fred_yields_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Return the raw FRED data structure
        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading USA historical yields: {str(e)}"
        }), 500


@excel_bp.route('/historical-yields/usa/refresh', methods=['POST'])
@login_required
def refresh_usa_historical_yields():
    """Trigger FRED API fetch to refresh USA yields data"""
    try:
        import subprocess
        import os

        # Get project root directory (BASE_DIR is backend/, so go up one level)
        base_dir = Path(current_app.config['BASE_DIR']).parent
        script_path = base_dir / 'scripts' / 'fetch_us_yields_fred.py'

        if not script_path.exists():
            return jsonify({
                "success": False,
                "message": f"FRED fetch script not found at {script_path}"
            }), 404

        # Get FRED API key from environment
        api_key = os.getenv('FRED_API_KEY')
        if not api_key:
            return jsonify({
                "success": False,
                "message": "FRED_API_KEY environment variable not set"
            }), 500

        # Run the script with environment variable
        env = os.environ.copy()
        env['FRED_API_KEY'] = api_key

        result = subprocess.run(
            ['python', str(script_path)],
            env=env,
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({
                "success": False,
                "message": f"Script failed: {result.stderr}"
            }), 500

        return jsonify({
            "success": True,
            "message": "USA yields data refreshed successfully",
            "output": result.stdout
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "message": "Script timeout after 60 seconds"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error refreshing USA yields: {str(e)}"
        }), 500


@excel_bp.route('/corporate-bonds/yields', methods=['GET'])
def get_corporate_bonds_yields():
    """Get corporate bonds yields data from FRED JSON (90 days) - returns raw FRED format"""
    try:
        import json

        json_dir = Path(current_app.config['JSON_DIR'])
        fred_bonds_path = json_dir / 'Markets' / 'Corporate_Bonds.json'

        if not fred_bonds_path.exists():
            return jsonify({
                "success": False,
                "message": f"Corporate bonds yields data not found. Please run: python scripts/fetch_corporate_bonds_fred.py"
            }), 404

        with open(fred_bonds_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Return the raw FRED data structure
        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading corporate bonds yields: {str(e)}"
        }), 500


@excel_bp.route('/corporate-bonds/yields/refresh', methods=['POST'])
@login_required
def refresh_corporate_bonds_yields():
    """Trigger FRED API fetch to refresh corporate bonds yields data"""
    try:
        import subprocess
        import os

        # Get project root directory (BASE_DIR is backend/, so go up one level)
        base_dir = Path(current_app.config['BASE_DIR']).parent
        script_path = base_dir / 'scripts' / 'fetch_corporate_bonds_fred.py'

        if not script_path.exists():
            return jsonify({
                "success": False,
                "message": f"FRED fetch script not found at {script_path}"
            }), 404

        # Get FRED API key from environment
        api_key = os.getenv('FRED_API_KEY')
        if not api_key:
            return jsonify({
                "success": False,
                "message": "FRED_API_KEY environment variable not set"
            }), 500

        # Run the script with environment variable
        env = os.environ.copy()
        env['FRED_API_KEY'] = api_key

        result = subprocess.run(
            ['python', str(script_path)],
            env=env,
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({
                "success": False,
                "message": f"Script failed: {result.stderr}"
            }), 500

        return jsonify({
            "success": True,
            "message": "Corporate bonds yields data refreshed successfully",
            "output": result.stdout
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "message": "Script timeout after 60 seconds"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error refreshing corporate bonds yields: {str(e)}"
        }), 500


@excel_bp.route('/corporate-spreads', methods=['GET'])
def get_corporate_spreads():
    """Get corporate bond spreads data from FRED JSON (OAS) - returns raw FRED format"""
    try:
        import json

        json_dir = Path(current_app.config['JSON_DIR'])
        fred_spreads_path = json_dir / 'Markets' / 'Corporate_Spreads.json'

        if not fred_spreads_path.exists():
            return jsonify({
                "success": False,
                "message": f"Corporate spreads data not found. Please run: python scripts/fetch_corporate_spreads_fred.py"
            }), 404

        with open(fred_spreads_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Return the raw FRED data structure
        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading corporate spreads: {str(e)}"
        }), 500


@excel_bp.route('/corporate-spreads/refresh', methods=['POST'])
@login_required
def refresh_corporate_spreads():
    """Trigger FRED API fetch to refresh corporate spreads data"""
    try:
        import subprocess
        import os

        # Get project root directory (BASE_DIR is backend/, so go up one level)
        base_dir = Path(current_app.config['BASE_DIR']).parent
        script_path = base_dir / 'scripts' / 'fetch_corporate_spreads_fred.py'

        if not script_path.exists():
            return jsonify({
                "success": False,
                "message": f"FRED fetch script not found at {script_path}"
            }), 404

        # Get FRED API key from environment
        api_key = os.getenv('FRED_API_KEY')
        if not api_key:
            return jsonify({
                "success": False,
                "message": "FRED_API_KEY environment variable not set"
            }), 500

        # Run the script with environment variable
        env = os.environ.copy()
        env['FRED_API_KEY'] = api_key

        result = subprocess.run(
            ['python', str(script_path)],
            env=env,
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({
                "success": False,
                "message": f"Script failed: {result.stderr}"
            }), 500

        return jsonify({
            "success": True,
            "message": "Corporate spreads data refreshed successfully",
            "output": result.stdout
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "message": "Script timeout after 60 seconds"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error refreshing corporate spreads: {str(e)}"
        }), 500


@excel_bp.route('/corporate-yields', methods=['GET'])
def get_corporate_yields():
    """Get corporate bond yields data from FRED JSON (Effective Yields) - returns raw FRED format"""
    try:
        import json

        json_dir = Path(current_app.config['JSON_DIR'])
        fred_yields_path = json_dir / 'Markets' / 'Corporate_Yields.json'

        if not fred_yields_path.exists():
            return jsonify({
                "success": False,
                "message": f"Corporate yields data not found. Please run: python scripts/fetch_corporate_yields_fred.py"
            }), 404

        with open(fred_yields_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Return the raw FRED data structure
        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading corporate yields: {str(e)}"
        }), 500


@excel_bp.route('/corporate-yields/refresh', methods=['POST'])
@login_required
def refresh_corporate_yields():
    """Trigger FRED API fetch to refresh corporate yields data"""
    try:
        import subprocess
        import os

        # Get project root directory (BASE_DIR is backend/, so go up one level)
        base_dir = Path(current_app.config['BASE_DIR']).parent
        script_path = base_dir / 'scripts' / 'fetch_corporate_yields_fred.py'

        if not script_path.exists():
            return jsonify({
                "success": False,
                "message": f"FRED fetch script not found at {script_path}"
            }), 404

        # Get FRED API key from environment
        api_key = os.getenv('FRED_API_KEY')
        if not api_key:
            return jsonify({
                "success": False,
                "message": "FRED_API_KEY environment variable not set"
            }), 500

        # Run the script with environment variable
        env = os.environ.copy()
        env['FRED_API_KEY'] = api_key

        result = subprocess.run(
            ['python', str(script_path)],
            env=env,
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({
                "success": False,
                "message": f"Script failed: {result.stderr}"
            }), 500

        return jsonify({
            "success": True,
            "message": "Corporate yields data refreshed successfully",
            "output": result.stdout
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "message": "Script timeout after 60 seconds"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error refreshing corporate yields: {str(e)}"
        }), 500


@excel_bp.route('/policy-rates', methods=['GET'])
def get_policy_rates():
    """Get policy rates data from BIS SDMX JSON - returns raw BIS format"""
    try:
        import json

        json_dir = Path(current_app.config['JSON_DIR'])
        bis_rates_path = json_dir / 'Markets' / 'Policy_Rates.json'

        if not bis_rates_path.exists():
            return jsonify({
                "success": False,
                "message": f"Policy rates data not found. Please run: python scripts/fetch_policy_rates_bis.py"
            }), 404

        with open(bis_rates_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Return the raw BIS data structure
        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading policy rates: {str(e)}"
        }), 500


@excel_bp.route('/policy-rates/refresh', methods=['POST'])
@login_required
def refresh_policy_rates():
    """Trigger BIS SDMX API fetch to refresh policy rates data"""
    try:
        import subprocess

        # Get project root directory (BASE_DIR is backend/, so go up one level)
        base_dir = Path(current_app.config['BASE_DIR']).parent
        script_path = base_dir / 'scripts' / 'fetch_policy_rates_bis.py'

        if not script_path.exists():
            return jsonify({
                "success": False,
                "message": f"BIS fetch script not found at {script_path}"
            }), 404

        # Run the script (no API key needed for BIS)
        result = subprocess.run(
            ['python', str(script_path)],
            capture_output=True,
            text=True,
            timeout=120
        )

        if result.returncode != 0:
            return jsonify({
                "success": False,
                "message": f"Script failed: {result.stderr}"
            }), 500

        return jsonify({
            "success": True,
            "message": "Policy rates data refreshed successfully",
            "output": result.stdout
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "message": "Script timeout after 120 seconds"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error refreshing policy rates: {str(e)}"
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


# ============================================================================
# FX Rates (Yahoo Finance via yfinance)
# ============================================================================

def merge_fx_data_sources(yahoo_data, exchangerate_history):
    """
    Merge Yahoo Finance data with ExchangeRate API historical snapshots.
    Fills MNT and AMD values from ExchangeRate history into Yahoo data structure.

    Args:
        yahoo_data: Dict with 'meta' and 'data' array (Yahoo format)
        exchangerate_history: List of snapshots with 'timestamp' and 'rates'

    Returns:
        Modified yahoo_data with MNT and AMD filled from ExchangeRate snapshots
    """
    from datetime import datetime

    # Create a dictionary mapping date strings to ExchangeRate snapshots for quick lookup
    exchangerate_by_date = {}
    for snapshot in exchangerate_history:
        # Parse timestamp (ISO format with timezone)
        timestamp_str = snapshot['timestamp']
        # Extract just the date part (YYYY-MM-DD)
        date_str = timestamp_str.split('T')[0]

        # Keep the snapshot closest to this date (if multiple snapshots per day, keep last)
        exchangerate_by_date[date_str] = snapshot['rates']

    # Iterate through Yahoo data array and fill MNT and AMD
    for row in yahoo_data['data']:
        date_str = row['date']

        # Try exact date match first
        if date_str in exchangerate_by_date:
            rates = exchangerate_by_date[date_str]
            if 'MNT' in rates:
                row['MNT'] = round(rates['MNT'], 6)
            if 'AMD' in rates:
                row['AMD'] = round(rates['AMD'], 6)
        else:
            # No exact match - try to find closest earlier date within 7 days
            target_date = datetime.strptime(date_str, '%Y-%m-%d')
            closest_snapshot = None
            min_days_diff = 8  # Look back max 7 days

            for snap_date_str, snap_rates in exchangerate_by_date.items():
                snap_date = datetime.strptime(snap_date_str, '%Y-%m-%d')
                days_diff = (target_date - snap_date).days

                # Only consider earlier dates within 7 days
                if 0 <= days_diff < min_days_diff:
                    min_days_diff = days_diff
                    closest_snapshot = snap_rates

            # Use closest snapshot if found
            if closest_snapshot:
                if 'MNT' in closest_snapshot and row.get('MNT') is None:
                    row['MNT'] = round(closest_snapshot['MNT'], 6)
                if 'AMD' in closest_snapshot and row.get('AMD') is None:
                    row['AMD'] = round(closest_snapshot['AMD'], 6)

    return yahoo_data


@excel_bp.route('/fx-rates-yahoo', methods=['GET'])
def get_fx_rates_yahoo():
    """Get FX rates from Yahoo Finance (yfinance) merged with ExchangeRate API for MNT/AMD"""
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        yahoo_fx_path = json_dir / 'Markets' / 'FX_Rates_Yahoo.json'
        exchangerate_history_path = json_dir / 'fx_rates_history.json'

        if not yahoo_fx_path.exists():
            return jsonify({
                "success": False,
                "message": "No FX rates data available. Please refresh to fetch data."
            }), 404

        # Load Yahoo Finance data
        with open(yahoo_fx_path, 'r', encoding='utf-8') as f:
            yahoo_data = json.load(f)

        # Load ExchangeRate API historical data if available
        if exchangerate_history_path.exists():
            with open(exchangerate_history_path, 'r', encoding='utf-8') as f:
                exchangerate_history = json.load(f)

            # Merge the data sources
            yahoo_data = merge_fx_data_sources(yahoo_data, exchangerate_history)

        return jsonify(yahoo_data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading FX rates: {str(e)}"
        }), 500


@excel_bp.route('/fx-rates-yahoo/refresh', methods=['POST'])
@login_required
def refresh_fx_rates_yahoo():
    """Refresh FX rates from both Yahoo Finance and ExchangeRate API"""
    try:
        # Get project root directory (BASE_DIR is backend/, so go up one level)
        base_dir = Path(current_app.config['BASE_DIR']).parent
        script_path = base_dir / 'scripts' / 'fetch_fx_rates_yfinance.py'

        if not script_path.exists():
            return jsonify({
                "success": False,
                "message": f"yfinance fetch script not found at {script_path}"
            }), 404

        # Run the Yahoo Finance script (will also call ExchangeRate API internally)
        result = subprocess.run(
            ['python', str(script_path)],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return jsonify({
                "success": False,
                "message": f"Script failed: {result.stderr}"
            }), 500

        return jsonify({
            "success": True,
            "message": "FX rates data refreshed successfully from Yahoo Finance and ExchangeRate API",
            "output": result.stdout
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "message": "Script timeout after 60 seconds"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error refreshing FX rates: {str(e)}"
        }), 500


# ============================================================================
# COMPREHENSIVE MARKETS REFRESH
# ============================================================================

@excel_bp.route('/markets/refresh-all', methods=['POST'])
@login_required
def refresh_all_markets_data():
    """
    Refresh ALL market data sources in sequence
    Returns progress updates for each data source
    """
    try:
        import os
        import sys

        base_dir = Path(current_app.config['BASE_DIR']).parent
        results = []

        # Define all data sources to refresh
        data_sources = [
            {
                'name': 'US Treasury Yields',
                'script': base_dir / 'scripts' / 'fetch_us_yields_fred.py',
                'timeout': 60,
                'requires_api_key': True,
                'api_key_env': 'FRED_API_KEY'
            },
            {
                'name': 'Corporate Bonds',
                'script': base_dir / 'scripts' / 'fetch_corporate_bonds_fred.py',
                'timeout': 60,
                'requires_api_key': True,
                'api_key_env': 'FRED_API_KEY'
            },
            {
                'name': 'Corporate Spreads',
                'script': base_dir / 'scripts' / 'fetch_corporate_spreads_fred.py',
                'timeout': 60,
                'requires_api_key': True,
                'api_key_env': 'FRED_API_KEY'
            },
            {
                'name': 'Corporate Yields',
                'script': base_dir / 'scripts' / 'fetch_corporate_yields_fred.py',
                'timeout': 60,
                'requires_api_key': True,
                'api_key_env': 'FRED_API_KEY'
            },
            {
                'name': 'Policy Rates',
                'script': base_dir / 'scripts' / 'fetch_policy_rates_bis.py',
                'timeout': 120,
                'requires_api_key': False
            },
            {
                'name': 'FX Rates',
                'script': base_dir / 'scripts' / 'fetch_fx_rates_yfinance.py',
                'timeout': 60,
                'requires_api_key': False
            },
            {
                'name': 'Turkey Yield Curve',
                'script': base_dir / 'backend' / 'scripts' / 'fetch_turkey_yield_curve.py',
                'timeout': 60,
                'requires_api_key': False
            },
            {
                'name': 'Vietnam Yield Curve',
                'script': base_dir / 'backend' / 'scripts' / 'fetch_vietnam_yield_curve.py',
                'timeout': 60,
                'requires_api_key': False
            },
            {
                'name': 'UK Yield Curve',
                'script': base_dir / 'backend' / 'scripts' / 'fetch_uk_yield_curve.py',
                'timeout': 60,
                'requires_api_key': False
            }
        ]

        # Process each data source
        for source in data_sources:
            result = {
                'name': source['name'],
                'status': 'pending',
                'message': '',
                'timestamp': None
            }

            try:
                # Check if script exists
                if not source['script'].exists():
                    result['status'] = 'error'
                    result['message'] = f"Script not found: {source['script']}"
                    results.append(result)
                    continue

                # Prepare environment
                env = os.environ.copy()
                if source.get('requires_api_key'):
                    api_key = os.getenv(source['api_key_env'])
                    if not api_key:
                        result['status'] = 'error'
                        result['message'] = f"{source['api_key_env']} not set"
                        results.append(result)
                        continue
                    env[source['api_key_env']] = api_key

                # Run the script
                script_result = subprocess.run(
                    [sys.executable, str(source['script'])],
                    env=env,
                    capture_output=True,
                    text=True,
                    timeout=source['timeout'],
                    cwd=str(base_dir if 'backend' not in str(source['script']) else base_dir / 'backend')
                )

                if script_result.returncode == 0:
                    result['status'] = 'success'
                    result['message'] = 'Data refreshed successfully'
                    result['timestamp'] = datetime.now().isoformat()
                else:
                    result['status'] = 'error'
                    result['message'] = f"Script failed: {script_result.stderr[:200]}"

            except subprocess.TimeoutExpired:
                result['status'] = 'error'
                result['message'] = f"Timeout after {source['timeout']} seconds"
            except Exception as e:
                result['status'] = 'error'
                result['message'] = str(e)[:200]

            results.append(result)

        # Calculate summary
        success_count = sum(1 for r in results if r['status'] == 'success')
        error_count = sum(1 for r in results if r['status'] == 'error')

        return jsonify({
            'success': True,
            'completed_at': datetime.now().isoformat(),
            'summary': {
                'total': len(results),
                'successful': success_count,
                'failed': error_count
            },
            'results': results
        })

    except Exception as e:
        current_app.logger.error(f"Error in refresh_all_markets_data: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Fatal error: {str(e)}"
        }), 500