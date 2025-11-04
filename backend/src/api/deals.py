"""
Deals routes - Main deal management CRUD endpoints
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path

from ..utils.json_store import read_json_list, write_json_file, find_by_id, remove_by_id
from ..models.deal import Deal

deals_bp = Blueprint('deals', __name__, url_prefix='/api')


@deals_bp.route('/deals', methods=['GET'])
@login_required
def get_deals():
    """
    Get all deals with optional filtering
    Query params: status, deal_type, sector, country, currency
    """
    try:
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)

        # Apply filters if provided
        status = request.args.get('status')
        if status:
            deals = [d for d in deals if d.get('status') == status]

        deal_type = request.args.get('deal_type')
        if deal_type:
            deals = [d for d in deals if d.get('deal_type') == deal_type]

        sector = request.args.get('sector')
        if sector:
            deals = [d for d in deals if d.get('sector') == sector]

        country = request.args.get('country')
        if country:
            deals = [d for d in deals if d.get('country') == country]

        currency = request.args.get('currency')
        if currency:
            deals = [d for d in deals if d.get('currency') == currency]

        # Sort by deal_date descending (most recent first)
        deals.sort(key=lambda x: x.get('deal_date', ''), reverse=True)

        return jsonify({
            "success": True,
            "data": deals,
            "count": len(deals)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading deals: {str(e)}"
        }), 500


@deals_bp.route('/deals/<deal_id>', methods=['GET'])
@login_required
def get_deal(deal_id):
    """Get a specific deal by ID with participant information"""
    try:
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)
        deal = find_by_id(deals, 'id', deal_id)

        if not deal:
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        # Also load participants for this deal
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)
        deal_participants = [p for p in all_participants if p.get('deal_id') == deal_id]

        # Add participants to deal response
        deal['participants'] = deal_participants
        deal['participants_count'] = len(deal_participants)

        return jsonify({
            "success": True,
            "data": deal
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading deal: {str(e)}"
        }), 500


@deals_bp.route('/deals', methods=['POST'])
@login_required
def create_deal():
    """Create a new deal"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields using model
        is_valid, error_message = Deal.validate_required_fields(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": error_message
            }), 400

        # Create deal using model
        new_deal = Deal.create(data)

        # Load existing deals
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)

        # Append new deal
        deals.append(new_deal)

        # Save to file
        if write_json_file(deals_path, deals):
            return jsonify({
                "success": True,
                "data": new_deal,
                "message": "Deal created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save deal"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating deal: {str(e)}"
        }), 500


@deals_bp.route('/deals/<deal_id>', methods=['PUT'])
@login_required
def update_deal(deal_id):
    """Update an existing deal"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Load existing deals
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)
        deal = find_by_id(deals, 'id', deal_id)

        if not deal:
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        # Update using model
        updated_deal = Deal.update(deal, data)

        # Save to file
        if write_json_file(deals_path, deals):
            return jsonify({
                "success": True,
                "data": updated_deal,
                "message": "Deal updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save deal"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating deal: {str(e)}"
        }), 500


@deals_bp.route('/deals/<deal_id>', methods=['DELETE'])
@login_required
def delete_deal(deal_id):
    """Delete a deal (cascades to participants)"""
    try:
        # Load deals
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)

        # Find deal
        deal = find_by_id(deals, 'id', deal_id)
        if not deal:
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        # CASCADE DELETE: Remove all participants for this deal
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        participants = read_json_list(participants_path)
        participants = [p for p in participants if p.get('deal_id') != deal_id]

        # Remove the deal
        deals = remove_by_id(deals, 'id', deal_id)

        # Save both files
        write_json_file(deals_path, deals)
        write_json_file(participants_path, participants)

        return jsonify({
            "success": True,
            "message": "Deal and associated participants deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting deal: {str(e)}"
        }), 500


@deals_bp.route('/deals/statistics', methods=['GET'])
@login_required
def get_deal_statistics():
    """Get deal statistics and analytics"""
    try:
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)

        # Calculate statistics
        total_count = len(deals)

        # By status
        by_status = {}
        for deal in deals:
            status = deal.get('status', 'unknown')
            by_status[status] = by_status.get(status, 0) + 1

        # By deal type
        by_type = {}
        for deal in deals:
            deal_type = deal.get('deal_type', 'unknown')
            by_type[deal_type] = by_type.get(deal_type, 0) + 1

        # By sector
        by_sector = {}
        for deal in deals:
            sector = deal.get('sector', 'unknown')
            by_sector[sector] = by_sector.get(sector, 0) + 1

        # By currency
        by_currency = {}
        for deal in deals:
            currency = deal.get('currency', 'unknown')
            by_currency[currency] = by_currency.get(currency, 0) + 1

        # Total volume by currency
        volume_by_currency = {}
        for deal in deals:
            currency = deal.get('currency', 'USD')
            size = deal.get('total_size', 0)
            volume_by_currency[currency] = volume_by_currency.get(currency, 0) + size

        # By country
        by_country = {}
        for deal in deals:
            country = deal.get('country', 'unknown')
            by_country[country] = by_country.get(country, 0) + 1

        return jsonify({
            "success": True,
            "data": {
                "total_deals": total_count,
                "by_status": by_status,
                "by_type": by_type,
                "by_sector": by_sector,
                "by_currency": by_currency,
                "volume_by_currency": volume_by_currency,
                "by_country": by_country
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error calculating statistics: {str(e)}"
        }), 500


@deals_bp.route('/deals/search', methods=['POST'])
@login_required
def search_deals():
    """
    Advanced deal search with POST body
    Supports text search and complex filters
    """
    try:
        data = request.get_json() or {}

        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)

        # Text search in deal_name, project_name, description
        query = data.get('query', '').lower()
        if query:
            deals = [
                d for d in deals
                if query in d.get('deal_name', '').lower()
                or query in d.get('project_name', '').lower()
                or query in d.get('description', '').lower()
            ]

        # Filter by status
        status = data.get('status')
        if status:
            deals = [d for d in deals if d.get('status') == status]

        # Filter by deal type
        deal_type = data.get('deal_type')
        if deal_type:
            deals = [d for d in deals if d.get('deal_type') == deal_type]

        # Filter by sector
        sector = data.get('sector')
        if sector:
            deals = [d for d in deals if d.get('sector') == sector]

        # Filter by size range
        min_size = data.get('min_size')
        if min_size:
            deals = [d for d in deals if d.get('total_size', 0) >= min_size]

        max_size = data.get('max_size')
        if max_size:
            deals = [d for d in deals if d.get('total_size', 0) <= max_size]

        # Filter by date range
        date_from = data.get('date_from')
        if date_from:
            deals = [d for d in deals if d.get('deal_date', '') >= date_from]

        date_to = data.get('date_to')
        if date_to:
            deals = [d for d in deals if d.get('deal_date', '') <= date_to]

        # Sort by deal_date descending
        deals.sort(key=lambda x: x.get('deal_date', ''), reverse=True)

        return jsonify({
            "success": True,
            "data": deals,
            "count": len(deals)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error searching deals: {str(e)}"
        }), 500
