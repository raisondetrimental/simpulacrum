"""
Investment Strategies API - Simplified Version
Simple endpoints for creating strategies and finding matching organizations
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path

from ..utils.json_store import read_json_list, write_json_file
from ..services.investment_matching import find_matching_organizations, get_contacts_for_matches

investment_bp = Blueprint('investment', __name__, url_prefix='/api')


@investment_bp.route('/investment-strategies', methods=['GET'])
@login_required
def get_investment_strategies():
    """Get saved investment strategies"""
    try:
        strategies_path = Path(current_app.config['JSON_DIR']) / 'investment_strategies.json'
        strategies = read_json_list(strategies_path)

        return jsonify({
            "success": True,
            "data": strategies,
            "count": len(strategies)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading investment strategies: {str(e)}"
        }), 500


@investment_bp.route('/investment-strategies/save', methods=['POST'])
@login_required
def save_investment_strategies():
    """Save investment strategies"""
    try:
        data = request.get_json()

        if data is None:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        if not isinstance(data, list):
            return jsonify({
                "success": False,
                "message": "Data must be an array of strategies"
            }), 400

        # Save to file
        strategies_path = Path(current_app.config['JSON_DIR']) / 'investment_strategies.json'

        if write_json_file(strategies_path, data):
            return jsonify({
                "success": True,
                "message": "Investment strategies saved successfully",
                "count": len(data)
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save investment strategies"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving investment strategies: {str(e)}"
        }), 500


@investment_bp.route('/investment-matches', methods=['POST'])
@login_required
def get_investment_matches():
    """Get organizations matching the strategy filters"""
    try:
        payload = request.get_json(silent=True) or {}
        preference_filters = payload.get("preferenceFilters", {})
        ticket_range = payload.get("ticketRange", {})
        country_filters = payload.get("countryFilters", None)

        # Load CRM data files
        json_dir = Path(current_app.config['JSON_DIR'])

        # Find matching organizations across all CRM modules
        results = find_matching_organizations(
            json_dir=json_dir,
            preference_filters=preference_filters,
            ticket_range=ticket_range,
            country_filters=country_filters
        )

        # Get contacts for all matching organizations
        contact_data = get_contacts_for_matches(
            json_dir=json_dir,
            matching_results=results
        )

        return jsonify({
            "success": True,
            "counts": {
                "capital_partners": len(results["capital_partners"]),
                "sponsors": len(results["sponsors"]),
                "agents": len(results["agents"]),
                "counsel": len(results["counsel"]),
            },
            "results": results,
            "all_contacts": contact_data["all_contacts"],
            "contact_stats": contact_data["contact_stats"]
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": f"Investment match query failed: {exc}"
        }), 500


__all__ = ['investment_bp']
