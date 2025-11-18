"""
API routes for serving generated data files (dashboard.json, usa_historical_yields.json)
"""
from flask import Blueprint, jsonify, current_app, send_file
from flask_login import login_required
from pathlib import Path
import subprocess
import sys

data_bp = Blueprint('data', __name__, url_prefix='/api')


@data_bp.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """
    Serve dashboard.json from storage directory
    """
    try:
        dashboard_json_path = Path(current_app.config['STORAGE_DIR']) / 'dashboard.json'

        if not dashboard_json_path.exists():
            return jsonify({
                'error': 'Dashboard data not found',
                'message': 'Please run ETL to generate dashboard.json'
            }), 404

        return send_file(dashboard_json_path, mimetype='application/json')

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@data_bp.route('/usa-historical-yields', methods=['GET'])
def get_usa_historical_yields():
    """
    Serve usa_historical_yields.json from storage directory
    """
    try:
        usa_json_path = Path(current_app.config['STORAGE_DIR']) / 'usa_historical_yields.json'

        if not usa_json_path.exists():
            return jsonify({
                'error': 'USA historical yields data not found',
                'message': 'Please run ETL to generate usa_historical_yields.json'
            }), 404

        return send_file(usa_json_path, mimetype='application/json')

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@data_bp.route('/historical-yields/usa', methods=['GET'])
def get_historical_yields_usa():
    """
    Serve usa_historical_yields.json from storage directory
    Alias endpoint for backward compatibility
    """
    return get_usa_historical_yields()


@data_bp.route('/health/data', methods=['GET'])
def health_check_data():
    """
    Health check for data files
    """
    storage_dir = Path(current_app.config['STORAGE_DIR'])
    dashboard_json = storage_dir / 'dashboard.json'
    usa_json = storage_dir / 'usa_historical_yields.json'

    return jsonify({
        'storage_dir': str(storage_dir),
        'storage_exists': storage_dir.exists(),
        'dashboard_json': {
            'path': str(dashboard_json),
            'exists': dashboard_json.exists()
        },
        'usa_historical_yields': {
            'path': str(usa_json),
            'exists': usa_json.exists()
        }
    })


@data_bp.route('/refresh/us-yields', methods=['POST'])
@login_required
def refresh_us_yields():
    """
    Trigger refresh of US Treasury yields from FRED API
    Runs the fetch script and returns updated data
    """
    try:
        # Get project root
        project_root = Path(current_app.config.get('BASE_DIR', Path.cwd())).parent
        script_path = project_root / 'scripts' / 'fetch_us_yields_fred.py'

        if not script_path.exists():
            return jsonify({
                'success': False,
                'message': f'Script not found at {script_path}'
            }), 404

        # Run the fetch script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(project_root)
        )

        if result.returncode != 0:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch data from FRED',
                'error': result.stderr
            }), 500

        # Load the updated data
        json_path = project_root / 'backend' / 'data' / 'json' / 'Markets' / 'US_Yields.json'

        if not json_path.exists():
            return jsonify({
                'success': False,
                'message': 'Data file not found after refresh'
            }), 500

        # Return the updated file
        return send_file(json_path, mimetype='application/json')

    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'message': 'Request timed out while fetching data from FRED'
        }), 408
    except Exception as e:
        current_app.logger.error(f"Error refreshing US yields: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error refreshing data: {str(e)}'
        }), 500


@data_bp.route('/turkey-yield-curve', methods=['GET'])
def get_turkey_yield_curve():
    """
    Serve Turkey sovereign yield curve data from Markets directory
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        yield_curve_path = json_dir / 'Markets' / 'Turkey_Yield_Curve.json'

        if not yield_curve_path.exists():
            return jsonify({
                'success': False,
                'error': 'Turkey yield curve data not found',
                'message': 'Please run fetch_turkey_yield_curve.py to generate data'
            }), 404

        return send_file(yield_curve_path, mimetype='application/json')

    except Exception as e:
        current_app.logger.error(f"Error loading Turkey yield curve: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@data_bp.route('/refresh/turkey-yield-curve', methods=['POST'])
@login_required
def refresh_turkey_yield_curve():
    """
    Trigger refresh of Turkey yield curve data
    Runs the fetch script and returns updated data
    """
    try:
        # Get project root
        project_root = Path(current_app.config.get('BASE_DIR', Path.cwd())).parent
        script_path = project_root / 'backend' / 'scripts' / 'fetch_turkey_yield_curve.py'

        if not script_path.exists():
            return jsonify({
                'success': False,
                'message': f'Script not found at {script_path}'
            }), 404

        # Run the fetch script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(project_root / 'backend')
        )

        if result.returncode != 0:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch Turkey yield curve data',
                'error': result.stderr
            }), 500

        # Load the updated data
        json_path = project_root / 'backend' / 'data' / 'json' / 'Markets' / 'Turkey_Yield_Curve.json'

        if not json_path.exists():
            return jsonify({
                'success': False,
                'message': 'Data file not found after refresh'
            }), 500

        # Return the updated file
        return send_file(json_path, mimetype='application/json')

    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'message': 'Request timed out while fetching Turkey yield curve data'
        }), 408
    except Exception as e:
        current_app.logger.error(f"Error refreshing Turkey yield curve: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error refreshing data: {str(e)}'
        }), 500


@data_bp.route('/vietnam-yield-curve', methods=['GET'])
def get_vietnam_yield_curve():
    """
    Serve Vietnam sovereign yield curve data from Markets directory
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        yield_curve_path = json_dir / 'Markets' / 'Vietnam_Yield_Curve.json'

        if not yield_curve_path.exists():
            return jsonify({
                'success': False,
                'error': 'Vietnam yield curve data not found',
                'message': 'Please run fetch_vietnam_yield_curve.py to generate data'
            }), 404

        return send_file(yield_curve_path, mimetype='application/json')

    except Exception as e:
        current_app.logger.error(f"Error loading Vietnam yield curve: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@data_bp.route('/refresh/vietnam-yield-curve', methods=['POST'])
@login_required
def refresh_vietnam_yield_curve():
    """
    Trigger refresh of Vietnam yield curve data
    Runs the fetch script and returns updated data
    """
    try:
        # Get project root
        project_root = Path(current_app.config.get('BASE_DIR', Path.cwd())).parent
        script_path = project_root / 'backend' / 'scripts' / 'fetch_vietnam_yield_curve.py'

        if not script_path.exists():
            return jsonify({
                'success': False,
                'message': f'Script not found at {script_path}'
            }), 404

        # Run the fetch script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(project_root / 'backend')
        )

        if result.returncode != 0:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch Vietnam yield curve data',
                'error': result.stderr
            }), 500

        # Load the updated data
        json_path = project_root / 'backend' / 'data' / 'json' / 'Markets' / 'Vietnam_Yield_Curve.json'

        if not json_path.exists():
            return jsonify({
                'success': False,
                'message': 'Data file not found after refresh'
            }), 500

        # Return the updated file
        return send_file(json_path, mimetype='application/json')

    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'message': 'Request timed out while fetching Vietnam yield curve data'
        }), 408
    except Exception as e:
        current_app.logger.error(f"Error refreshing Vietnam yield curve: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error refreshing data: {str(e)}'
        }), 500


@data_bp.route('/uk-yield-curve', methods=['GET'])
def get_uk_yield_curve():
    """
    Serve UK sovereign yield curve data from Markets directory
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])
        yield_curve_path = json_dir / 'Markets' / 'UK_Yield_Curve.json'

        if not yield_curve_path.exists():
            return jsonify({
                'success': False,
                'error': 'UK yield curve data not found',
                'message': 'Please run fetch_uk_yield_curve.py to generate data'
            }), 404

        return send_file(yield_curve_path, mimetype='application/json')

    except Exception as e:
        current_app.logger.error(f"Error loading UK yield curve: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@data_bp.route('/refresh/uk-yield-curve', methods=['POST'])
@login_required
def refresh_uk_yield_curve():
    """
    Trigger refresh of UK yield curve data
    Runs the fetch script and returns updated data
    """
    try:
        # Get project root
        project_root = Path(current_app.config.get('BASE_DIR', Path.cwd())).parent
        script_path = project_root / 'backend' / 'scripts' / 'fetch_uk_yield_curve.py'

        if not script_path.exists():
            return jsonify({
                'success': False,
                'message': f'Script not found at {script_path}'
            }), 404

        # Run the fetch script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(project_root / 'backend')
        )

        if result.returncode != 0:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch UK yield curve data',
                'error': result.stderr
            }), 500

        # Load the updated data
        json_path = project_root / 'backend' / 'data' / 'json' / 'Markets' / 'UK_Yield_Curve.json'

        if not json_path.exists():
            return jsonify({
                'success': False,
                'message': 'Data file not found after refresh'
            }), 500

        # Return the updated file
        return send_file(json_path, mimetype='application/json')

    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'message': 'Request timed out while fetching UK yield curve data'
        }), 408
    except Exception as e:
        current_app.logger.error(f"Error refreshing UK yield curve: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error refreshing data: {str(e)}'
        }), 500
