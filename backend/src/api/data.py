"""
API routes for serving generated data files (dashboard.json, usa_historical_yields.json)
"""
from flask import Blueprint, jsonify, current_app, send_file
from pathlib import Path

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
