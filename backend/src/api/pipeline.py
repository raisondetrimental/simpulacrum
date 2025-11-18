"""
Pipeline Strategies API Blueprint
Manages deal origination pipeline with party orchestration and financing structures
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from pathlib import Path
import json
from ..utils.json_store import read_json_list, write_json_file

pipeline_bp = Blueprint('pipeline', __name__)

# Path to pipeline strategies JSON file
PIPELINE_FILE = Path(__file__).parent.parent.parent / 'data' / 'json' / 'pipeline_strategies.json'


def generate_pipeline_id():
    """Generate a unique pipeline ID based on timestamp"""
    return f"pipeline_{int(datetime.utcnow().timestamp() * 1000)}"


@pipeline_bp.route('/api/pipeline', methods=['GET'])
@login_required
def get_pipelines():
    """Get all pipeline strategies"""
    try:
        pipelines = read_json_list(PIPELINE_FILE)
        # Sort by last_updated descending
        pipelines.sort(key=lambda x: x.get('last_updated', ''), reverse=True)
        return jsonify(pipelines), 200
    except Exception as e:
        print(f"Error fetching pipelines: {e}")
        return jsonify({'error': 'Failed to fetch pipelines'}), 500


@pipeline_bp.route('/api/pipeline/<pipeline_id>', methods=['GET'])
@login_required
def get_pipeline(pipeline_id):
    """Get a specific pipeline strategy"""
    try:
        pipelines = read_json_list(PIPELINE_FILE)
        pipeline = next((p for p in pipelines if p['id'] == pipeline_id), None)

        if not pipeline:
            return jsonify({'error': 'Pipeline not found'}), 404

        return jsonify(pipeline), 200
    except Exception as e:
        print(f"Error fetching pipeline: {e}")
        return jsonify({'error': 'Failed to fetch pipeline'}), 500


@pipeline_bp.route('/api/pipeline', methods=['POST'])
@login_required
def create_pipeline():
    """Create a new pipeline strategy"""
    try:
        data = request.json

        # Validation
        if not data.get('name'):
            return jsonify({'error': 'Pipeline name is required'}), 400

        pipelines = read_json_list(PIPELINE_FILE)

        # Create new pipeline
        current_time = datetime.utcnow().isoformat() + 'Z'
        new_pipeline = {
            'id': generate_pipeline_id(),
            'name': data['name'],
            'lead_initial': data.get('lead_initial', current_user.full_name if hasattr(current_user, 'full_name') else current_user.username),
            'stage': data.get('stage', 'ideation'),
            'created_at': current_time,
            'last_updated': current_time,

            # Parties
            'sponsor': data.get('sponsor', {}),
            'lenders': data.get('lenders', []),
            'advisors': data.get('advisors', []),

            # Deal structure
            'deal_type': data.get('deal_type', ''),
            'financing_scenarios': data.get('financing_scenarios', []),

            # Intelligence
            'target_country': data.get('target_country', ''),
            'sector': data.get('sector', ''),
            'risk_score': data.get('risk_score'),
            'feasibility_flags': data.get('feasibility_flags', []),
            'deal_quality_rating': data.get('deal_quality_rating'),

            # Tracking
            'target_close_date': data.get('target_close_date', ''),
            'milestones': data.get('milestones', []),

            # Collaboration
            'activity_log': [{
                'timestamp': current_time,
                'user': current_user.full_name if hasattr(current_user, 'full_name') else current_user.username,
                'action': 'created',
                'details': 'Pipeline strategy created'
            }],
            'notes': data.get('notes', []),
            'documents': data.get('documents', []),

            # Outcomes
            'promoted_to_deal_id': None,
            'archived': False,
            'archive_reason': '',

            # Related deals (precedent transactions)
            'related_deals': data.get('related_deals', [])
        }

        pipelines.append(new_pipeline)
        write_json_file(PIPELINE_FILE, pipelines)

        return jsonify(new_pipeline), 201
    except Exception as e:
        print(f"Error creating pipeline: {e}")
        return jsonify({'error': 'Failed to create pipeline'}), 500


@pipeline_bp.route('/api/pipeline/<pipeline_id>', methods=['PUT'])
@login_required
def update_pipeline(pipeline_id):
    """Update an existing pipeline strategy"""
    try:
        data = request.json
        pipelines = read_json_list(PIPELINE_FILE)

        # Find pipeline
        pipeline_index = next((i for i, p in enumerate(pipelines) if p['id'] == pipeline_id), None)

        if pipeline_index is None:
            return jsonify({'error': 'Pipeline not found'}), 404

        # Update pipeline
        current_time = datetime.utcnow().isoformat() + 'Z'
        pipeline = pipelines[pipeline_index]

        # Track what changed for activity log
        changes = []
        if 'name' in data and data['name'] != pipeline.get('name'):
            changes.append(f"Name changed to '{data['name']}'")
        if 'stage' in data and data['stage'] != pipeline.get('stage'):
            changes.append(f"Stage changed to '{data['stage']}'")

        # Update fields
        updatable_fields = [
            'name', 'lead_initial', 'stage', 'sponsor', 'lenders', 'advisors',
            'deal_type', 'financing_scenarios', 'target_country', 'sector',
            'risk_score', 'feasibility_flags', 'deal_quality_rating',
            'target_close_date', 'milestones', 'notes', 'documents',
            'promoted_to_deal_id', 'archived', 'archive_reason', 'related_deals'
        ]

        for field in updatable_fields:
            if field in data:
                pipeline[field] = data[field]

        pipeline['last_updated'] = current_time

        # Add activity log entry
        if 'activity_log' not in pipeline:
            pipeline['activity_log'] = []

        activity_entry = {
            'timestamp': current_time,
            'user': current_user.full_name if hasattr(current_user, 'full_name') else current_user.username,
            'action': 'updated',
            'details': '; '.join(changes) if changes else 'Pipeline updated'
        }
        pipeline['activity_log'].append(activity_entry)

        pipelines[pipeline_index] = pipeline
        write_json_file(PIPELINE_FILE, pipelines)

        return jsonify(pipeline), 200
    except Exception as e:
        print(f"Error updating pipeline: {e}")
        return jsonify({'error': 'Failed to update pipeline'}), 500


@pipeline_bp.route('/api/pipeline/<pipeline_id>', methods=['DELETE'])
@login_required
def delete_pipeline(pipeline_id):
    """Delete a pipeline strategy"""
    try:
        pipelines = read_json_list(PIPELINE_FILE)

        # Find and remove pipeline
        pipeline_index = next((i for i, p in enumerate(pipelines) if p['id'] == pipeline_id), None)

        if pipeline_index is None:
            return jsonify({'error': 'Pipeline not found'}), 404

        pipelines.pop(pipeline_index)
        write_json_file(PIPELINE_FILE, pipelines)

        return jsonify({'message': 'Pipeline deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting pipeline: {e}")
        return jsonify({'error': 'Failed to delete pipeline'}), 500


@pipeline_bp.route('/api/pipeline/<pipeline_id>/stage', methods=['PATCH'])
@login_required
def update_pipeline_stage(pipeline_id):
    """Update pipeline stage (for Kanban board drag-and-drop)"""
    try:
        data = request.json
        new_stage = data.get('stage')

        if not new_stage:
            return jsonify({'error': 'Stage is required'}), 400

        pipelines = read_json_list(PIPELINE_FILE)
        pipeline_index = next((i for i, p in enumerate(pipelines) if p['id'] == pipeline_id), None)

        if pipeline_index is None:
            return jsonify({'error': 'Pipeline not found'}), 404

        pipeline = pipelines[pipeline_index]
        old_stage = pipeline.get('stage', 'ideation')

        pipeline['stage'] = new_stage
        pipeline['last_updated'] = datetime.utcnow().isoformat() + 'Z'

        # Add activity log entry
        if 'activity_log' not in pipeline:
            pipeline['activity_log'] = []

        activity_entry = {
            'timestamp': pipeline['last_updated'],
            'user': current_user.full_name if hasattr(current_user, 'full_name') else current_user.username,
            'action': 'stage_changed',
            'details': f"Moved from '{old_stage}' to '{new_stage}'"
        }
        pipeline['activity_log'].append(activity_entry)

        pipelines[pipeline_index] = pipeline
        write_json_file(PIPELINE_FILE, pipelines)

        return jsonify(pipeline), 200
    except Exception as e:
        print(f"Error updating pipeline stage: {e}")
        return jsonify({'error': 'Failed to update pipeline stage'}), 500


@pipeline_bp.route('/api/pipeline/<pipeline_id>/promote', methods=['POST'])
@login_required
def promote_to_deal(pipeline_id):
    """Promote a pipeline strategy to a deal in the deals database"""
    try:
        pipelines = read_json_list(PIPELINE_FILE)
        pipeline_index = next((i for i, p in enumerate(pipelines) if p['id'] == pipeline_id), None)

        if pipeline_index is None:
            return jsonify({'error': 'Pipeline not found'}), 404

        pipeline = pipelines[pipeline_index]

        # TODO: Create deal in deals.json using pipeline data
        # This will be implemented when we connect with the deals system
        # For now, just mark as promoted

        pipeline['promoted_to_deal_id'] = f"deal_{int(datetime.utcnow().timestamp() * 1000)}"
        pipeline['last_updated'] = datetime.utcnow().isoformat() + 'Z'

        # Add activity log entry
        if 'activity_log' not in pipeline:
            pipeline['activity_log'] = []

        activity_entry = {
            'timestamp': pipeline['last_updated'],
            'user': current_user.full_name if hasattr(current_user, 'full_name') else current_user.username,
            'action': 'promoted',
            'details': f"Promoted to deal {pipeline['promoted_to_deal_id']}"
        }
        pipeline['activity_log'].append(activity_entry)

        pipelines[pipeline_index] = pipeline
        write_json_file(PIPELINE_FILE, pipelines)

        return jsonify({
            'message': 'Pipeline promoted to deal',
            'deal_id': pipeline['promoted_to_deal_id'],
            'pipeline': pipeline
        }), 200
    except Exception as e:
        print(f"Error promoting pipeline: {e}")
        return jsonify({'error': 'Failed to promote pipeline'}), 500
