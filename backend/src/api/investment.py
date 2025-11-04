"""
Investment strategies and matching routes
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path
from datetime import datetime

from ..utils.json_store import read_json_list, write_json_file

investment_bp = Blueprint('investment', __name__, url_prefix='/api')


# ============================================================================
# INVESTMENT STRATEGIES
# ============================================================================

@investment_bp.route('/investment-strategies', methods=['GET'])
@investment_bp.route('/filters', methods=['GET'])  # Legacy route for backward compatibility
def get_investment_strategies():
    """Get saved investment strategies from JSON file"""
    try:
        strategies_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_INVESTMENT_STRATEGIES']
        strategies = read_json_list(strategies_path)

        return jsonify({
            "success": True,
            "data": strategies,
            "count": len(strategies)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading investment strategies data: {str(e)}"
        }), 500


@investment_bp.route('/investment-strategies/save', methods=['POST'])
@investment_bp.route('/filters/save', methods=['POST'])  # Legacy route for backward compatibility
def save_investment_strategies():
    """Save investment strategies data to JSON file"""
    try:
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
                "message": "Data must be an array of investment strategies"
            }), 400

        # Validate each strategy has required fields
        required_fields = ['id', 'name', 'preferenceFilters', 'sizeFilter', 'createdAt']
        for i, strategy_item in enumerate(data):
            if not isinstance(strategy_item, dict):
                return jsonify({
                    "success": False,
                    "message": f"Strategy at index {i} is not an object"
                }), 400

            for field in required_fields:
                if field not in strategy_item:
                    return jsonify({
                        "success": False,
                        "message": f"Strategy at index {i} missing required field: {field}"
                    }), 400

        # Save to file
        strategies_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_INVESTMENT_STRATEGIES']

        if write_json_file(strategies_path, data):
            return jsonify({
                "success": True,
                "message": "Investment strategies data saved successfully",
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
            "message": f"Error saving investment strategies data: {str(e)}"
        }), 500


# ============================================================================
# INVESTMENT PROFILES & MATCHING
# ============================================================================

@investment_bp.route('/investment-profiles', methods=['GET'])
def get_investment_profiles():
    """Return normalized investment profiles used for unified filtering."""
    try:
        # Import from services
        from ..services.investment_profiles import build_investment_profiles, SHARED_PREFERENCE_KEYS

        data = build_investment_profiles()
        return jsonify({
            "success": True,
            "generated_at": data.get("generated_at"),
            "preference_keys": data.get("preference_keys", list(SHARED_PREFERENCE_KEYS)),
            "data": data,
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": f"Failed to load investment profiles: {exc}"
        }), 500


@investment_bp.route('/investment-matches', methods=['POST'])
def get_investment_matches():
    """Filter capital partner/team and sponsor profiles using shared parameters."""
    try:
        # Import from services
        from ..services.investment_profiles import build_investment_profiles, SHARED_PREFERENCE_KEYS
        from ..services.investment_matching import filter_profiles as filter_investment_profiles, compute_pairings

        payload = request.get_json(silent=True) or {}
        preference_filters = payload.get("preferenceFilters") or payload.get("preferences") or {}
        ticket_range = payload.get("ticketRange") or payload.get("ticket") or {}
        include_categories = payload.get("includeCategories") or payload.get("categories")

        data = build_investment_profiles()
        capital_partners = data.get("capital_partners", [])
        capital_partner_teams = data.get("capital_partner_teams", [])
        sponsors = data.get("sponsors", [])

        if include_categories:
            include_set = {str(item) for item in include_categories}
        else:
            include_set = {"capital_partners", "capital_partner_teams", "sponsors"}

        filtered_capital_partners = filter_investment_profiles(
            capital_partners,
            preference_filters=preference_filters,
            ticket_range=ticket_range,
        ) if "capital_partners" in include_set else []

        filtered_capital_partner_teams = filter_investment_profiles(
            capital_partner_teams,
            preference_filters=preference_filters,
            ticket_range=ticket_range,
        ) if "capital_partner_teams" in include_set else []

        filtered_sponsors = filter_investment_profiles(
            sponsors,
            preference_filters=preference_filters,
            ticket_range=ticket_range,
        ) if "sponsors" in include_set else []

        pairings = compute_pairings(
            filtered_sponsors,
            filtered_capital_partners,
            filtered_capital_partner_teams,
        )

        return jsonify({
            "success": True,
            "generated_at": data.get("generated_at"),
            "preference_keys": data.get("preference_keys", list(SHARED_PREFERENCE_KEYS)),
            "filters_applied": {
                "preferenceFilters": preference_filters,
                "ticketRange": ticket_range,
                "includeCategories": sorted(include_set),
            },
            "counts": {
                "capital_partners": len(filtered_capital_partners),
                "capital_partner_teams": len(filtered_capital_partner_teams),
                "sponsors": len(filtered_sponsors),
            },
            "results": {
                "capital_partners": filtered_capital_partners,
                "capital_partner_teams": filtered_capital_partner_teams,
                "sponsors": filtered_sponsors,
            },
            "pairings": pairings,
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": f"Investment match query failed: {exc}"
        }), 500
