"""
Deal Participants routes - Manage participants (entities) in deals
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path

from ..utils.json_store import read_json_list, write_json_file, find_by_id, remove_by_id
from ..models.deal_participant import DealParticipant

deal_participants_bp = Blueprint('deal_participants', __name__, url_prefix='/api')


@deal_participants_bp.route('/deals/<deal_id>/participants', methods=['GET'])
@login_required
def get_deal_participants(deal_id):
    """Get all participants for a specific deal"""
    try:
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter to this deal only
        deal_participants = [p for p in all_participants if p.get('deal_id') == deal_id]

        # Also check if deal exists
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)
        deal = find_by_id(deals, 'id', deal_id)

        if not deal:
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        return jsonify({
            "success": True,
            "data": deal_participants,
            "count": len(deal_participants),
            "deal_name": deal.get('deal_name', '')
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading participants: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants', methods=['POST'])
@login_required
def add_participant_to_deal(deal_id):
    """Add a participant to a deal"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Check deal exists
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        deals = read_json_list(deals_path)
        deal = find_by_id(deals, 'id', deal_id)

        if not deal:
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        # Set deal_id from URL
        data['deal_id'] = deal_id

        # Validate required fields using model
        is_valid, error_message = DealParticipant.validate_required_fields(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": error_message
            }), 400

        # Auto-calculate participation percentage if not provided
        if not data.get('participation_pct') and data.get('commitment_amount'):
            data['participation_pct'] = DealParticipant.calculate_participation_percentage(
                data['commitment_amount'],
                deal.get('total_size', 0)
            )

        # Create participant using model
        new_participant = DealParticipant.create(data)

        # Load existing participants
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        participants = read_json_list(participants_path)

        # Append new participant
        participants.append(new_participant)

        # Save to file
        if write_json_file(participants_path, participants):
            return jsonify({
                "success": True,
                "data": new_participant,
                "message": "Participant added to deal successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save participant"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error adding participant: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants/<participant_id>', methods=['PUT'])
@login_required
def update_participant(deal_id, participant_id):
    """Update a participant in a deal"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Load participants
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        participants = read_json_list(participants_path)
        participant = find_by_id(participants, 'id', participant_id)

        if not participant:
            return jsonify({
                "success": False,
                "message": f"Participant {participant_id} not found"
            }), 404

        # Verify participant belongs to this deal
        if participant.get('deal_id') != deal_id:
            return jsonify({
                "success": False,
                "message": "Participant does not belong to this deal"
            }), 400

        # Update using model
        updated_participant = DealParticipant.update(participant, data)

        # Recalculate participation percentage if commitment changed
        if 'commitment_amount' in data:
            deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
            deals = read_json_list(deals_path)
            deal = find_by_id(deals, 'id', deal_id)

            if deal:
                updated_participant['participation_pct'] = DealParticipant.calculate_participation_percentage(
                    updated_participant['commitment_amount'],
                    deal.get('total_size', 0)
                )

        # Save to file
        if write_json_file(participants_path, participants):
            return jsonify({
                "success": True,
                "data": updated_participant,
                "message": "Participant updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save participant"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating participant: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants/<participant_id>', methods=['DELETE'])
@login_required
def remove_participant_from_deal(deal_id, participant_id):
    """Remove a participant from a deal"""
    try:
        # Load participants
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        participants = read_json_list(participants_path)

        # Find participant
        participant = find_by_id(participants, 'id', participant_id)
        if not participant:
            return jsonify({
                "success": False,
                "message": f"Participant {participant_id} not found"
            }), 404

        # Verify participant belongs to this deal
        if participant.get('deal_id') != deal_id:
            return jsonify({
                "success": False,
                "message": "Participant does not belong to this deal"
            }), 400

        # Remove the participant
        participants = remove_by_id(participants, 'id', participant_id)

        # Save changes
        if write_json_file(participants_path, participants):
            return jsonify({
                "success": True,
                "message": "Participant removed from deal successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to remove participant"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error removing participant: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants/lenders', methods=['GET'])
@login_required
def get_deal_lenders(deal_id):
    """Get all lender participants for a deal"""
    try:
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter to this deal only
        deal_participants = [p for p in all_participants if p.get('deal_id') == deal_id]

        # Get lenders using model helper
        lenders = DealParticipant.get_lenders(deal_participants)

        return jsonify({
            "success": True,
            "data": lenders,
            "count": len(lenders)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading lenders: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants/sponsors', methods=['GET'])
@login_required
def get_deal_sponsors(deal_id):
    """Get all sponsor participants for a deal"""
    try:
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter to this deal only
        deal_participants = [p for p in all_participants if p.get('deal_id') == deal_id]

        # Get sponsors using model helper
        sponsors = DealParticipant.get_sponsors(deal_participants)

        return jsonify({
            "success": True,
            "data": sponsors,
            "count": len(sponsors)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading sponsors: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants/counsel', methods=['GET'])
@login_required
def get_deal_counsel(deal_id):
    """Get all counsel participants for a deal"""
    try:
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter to this deal only
        deal_participants = [p for p in all_participants if p.get('deal_id') == deal_id]

        # Get counsel using model helper
        counsel = DealParticipant.get_counsel(deal_participants)

        return jsonify({
            "success": True,
            "data": counsel,
            "count": len(counsel)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading counsel: {str(e)}"
        }), 500


@deal_participants_bp.route('/deals/<deal_id>/participants/agents', methods=['GET'])
@login_required
def get_deal_agents(deal_id):
    """Get all agent participants for a deal"""
    try:
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter to this deal only
        deal_participants = [p for p in all_participants if p.get('deal_id') == deal_id]

        # Get agents using model helper
        agents = DealParticipant.get_agents(deal_participants)

        return jsonify({
            "success": True,
            "data": agents,
            "count": len(agents)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading agents: {str(e)}"
        }), 500
