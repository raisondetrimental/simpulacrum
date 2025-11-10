"""
Playbook Management API - Super Admin Only
Manages all six sheets from The Playbook:
- External Contacts
- Calendar
- Deal Flow
- People/Team
- Workstreams
- Filing Instructions
"""
from flask import Blueprint, jsonify, request, Response, current_app
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime
from io import StringIO
import csv
import json

from ..utils.json_store import (
    read_json_list, write_json_file, find_by_id,
    remove_by_id, generate_sequential_id
)

playbook_bp = Blueprint('playbook', __name__, url_prefix='/api/playbook')


def get_playbook_path(filename):
    """Helper to get full path for playbook JSON files"""
    return Path(current_app.config['JSON_DIR']) / filename


def require_admin():
    """Helper to require admin role"""
    if not current_user.is_authenticated:
        return jsonify({
            "success": False,
            "message": "Authentication required"
        }), 401

    if not current_user.is_admin():
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    return None


# ============================================================================
# EXTERNAL CONTACTS CRUD
# ============================================================================

@playbook_bp.route('/contacts', methods=['GET'])
@login_required
def get_playbook_contacts():
    """Get all playbook external contacts (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        contacts = read_json_list(get_playbook_path('playbook_contacts.json'))

        return jsonify({
            "success": True,
            "data": contacts,
            "count": len(contacts)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading playbook contacts: {str(e)}"
        }), 500


@playbook_bp.route('/contacts/<contact_id>', methods=['GET'])
@login_required
def get_playbook_contact(contact_id):
    """Get specific playbook contact (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        contacts = read_json_list(get_playbook_path('playbook_contacts.json'))
        contact = find_by_id(contacts, 'id', contact_id)

        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        return jsonify({
            "success": True,
            "data": contact
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading contact: {str(e)}"
        }), 500


@playbook_bp.route('/contacts', methods=['POST'])
@login_required
def create_playbook_contact():
    """Create new playbook contact (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        if 'name' not in data:
            return jsonify({
                "success": False,
                "message": "Missing required field: name"
            }), 400

        # Get existing contacts
        contacts = read_json_list(get_playbook_path('playbook_contacts.json'))

        # Generate new ID
        new_id = generate_sequential_id(contacts, 'id', 'playbook_contact_')

        # Create new contact
        new_contact = {
            "id": new_id,
            "name": data.get('name', ''),
            "email": data.get('email', ''),
            "role": data.get('role', ''),
            "contact_level": data.get('contact_level', 3),
            "region": data.get('region', ''),
            "last_contact": data.get('last_contact'),
            "should_contact": data.get('should_contact'),
            "notes": data.get('notes', '')
        }

        contacts.append(new_contact)
        write_json_file(get_playbook_path('playbook_contacts.json'), contacts)

        return jsonify({
            "success": True,
            "data": new_contact,
            "message": "Contact created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating contact: {str(e)}"
        }), 500


@playbook_bp.route('/contacts/<contact_id>', methods=['PUT'])
@login_required
def update_playbook_contact(contact_id):
    """Update playbook contact (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        contacts = read_json_list(get_playbook_path('playbook_contacts.json'))
        contact = find_by_id(contacts, 'id', contact_id)

        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Update fields
        contact['name'] = data.get('name', contact['name'])
        contact['email'] = data.get('email', contact['email'])
        contact['role'] = data.get('role', contact['role'])
        contact['contact_level'] = data.get('contact_level', contact['contact_level'])
        contact['region'] = data.get('region', contact['region'])
        contact['last_contact'] = data.get('last_contact', contact.get('last_contact'))
        contact['should_contact'] = data.get('should_contact', contact.get('should_contact'))
        contact['notes'] = data.get('notes', contact['notes'])

        write_json_file(get_playbook_path('playbook_contacts.json'), contacts)

        return jsonify({
            "success": True,
            "data": contact,
            "message": "Contact updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating contact: {str(e)}"
        }), 500


@playbook_bp.route('/contacts/<contact_id>', methods=['DELETE'])
@login_required
def delete_playbook_contact(contact_id):
    """Delete playbook contact (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        contacts = read_json_list(get_playbook_path('playbook_contacts.json'))

        updated_contacts = remove_by_id(contacts, 'id', contact_id)

        if len(updated_contacts) == len(contacts):
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        write_json_file(get_playbook_path('playbook_contacts.json'), updated_contacts)

        return jsonify({
            "success": True,
            "message": "Contact deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting contact: {str(e)}"
        }), 500


@playbook_bp.route('/contacts/export/csv', methods=['GET'])
@login_required
def export_playbook_contacts_csv():
    """Export playbook contacts to CSV (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        contacts = read_json_list(get_playbook_path('playbook_contacts.json'))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'id', 'name', 'email', 'role', 'contact_level',
            'region', 'last_contact', 'should_contact', 'notes'
        ])

        writer.writeheader()
        writer.writerows(contacts)

        csv_data = output.getvalue()
        output.close()

        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=playbook_contacts.csv'}
        )

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error exporting contacts: {str(e)}"
        }), 500


# ============================================================================
# CALENDAR CRUD
# ============================================================================

@playbook_bp.route('/calendar', methods=['GET'])
@login_required
def get_playbook_calendar():
    """Get all playbook calendar entries (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        entries = read_json_list(get_playbook_path('playbook_calendar.json'))

        # Optional date filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if start_date or end_date:
            filtered_entries = []
            for entry in entries:
                entry_date = entry.get('date')
                if entry_date:
                    if start_date and entry_date < start_date:
                        continue
                    if end_date and entry_date > end_date:
                        continue
                    filtered_entries.append(entry)
            entries = filtered_entries

        return jsonify({
            "success": True,
            "data": entries,
            "count": len(entries)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading calendar: {str(e)}"
        }), 500


@playbook_bp.route('/calendar', methods=['POST'])
@login_required
def create_playbook_calendar_entry():
    """Create new calendar entry (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        entries = read_json_list(get_playbook_path('playbook_calendar.json'))
        new_id = generate_sequential_id(entries, 'id', 'playbook_cal_')

        new_entry = {
            "id": new_id,
            "date": data.get('date'),
            "tasks": data.get('tasks', ''),
            "internal_ents": data.get('internal_ents', ''),
            "external_ents": data.get('external_ents', ''),
            "where": data.get('where', ''),
            "other_notes": data.get('other_notes', ''),
            "other_external": data.get('other_external', '')
        }

        entries.append(new_entry)
        write_json_file(get_playbook_path('playbook_calendar.json'), entries)

        return jsonify({
            "success": True,
            "data": new_entry,
            "message": "Calendar entry created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating calendar entry: {str(e)}"
        }), 500


@playbook_bp.route('/calendar/<entry_id>', methods=['PUT'])
@login_required
def update_playbook_calendar_entry(entry_id):
    """Update calendar entry (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        entries = read_json_list(get_playbook_path('playbook_calendar.json'))
        entry = find_by_id(entries, 'id', entry_id)

        if not entry:
            return jsonify({
                "success": False,
                "message": f"Calendar entry {entry_id} not found"
            }), 404

        # Update fields
        entry['date'] = data.get('date', entry.get('date'))
        entry['tasks'] = data.get('tasks', entry.get('tasks'))
        entry['internal_ents'] = data.get('internal_ents', entry.get('internal_ents'))
        entry['external_ents'] = data.get('external_ents', entry.get('external_ents'))
        entry['where'] = data.get('where', entry.get('where'))
        entry['other_notes'] = data.get('other_notes', entry.get('other_notes'))
        entry['other_external'] = data.get('other_external', entry.get('other_external'))

        write_json_file(get_playbook_path('playbook_calendar.json'), entries)

        return jsonify({
            "success": True,
            "data": entry,
            "message": "Calendar entry updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating calendar entry: {str(e)}"
        }), 500


@playbook_bp.route('/calendar/<entry_id>', methods=['DELETE'])
@login_required
def delete_playbook_calendar_entry(entry_id):
    """Delete calendar entry (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        entries = read_json_list(get_playbook_path('playbook_calendar.json'))
        updated_entries = remove_by_id(entries, 'id', entry_id)

        if len(updated_entries) == len(entries):
            return jsonify({
                "success": False,
                "message": f"Calendar entry {entry_id} not found"
            }), 404

        write_json_file(get_playbook_path('playbook_calendar.json'), updated_entries)

        return jsonify({
            "success": True,
            "message": "Calendar entry deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting calendar entry: {str(e)}"
        }), 500


# ============================================================================
# DEAL FLOW CRUD
# ============================================================================

@playbook_bp.route('/deals', methods=['GET'])
@login_required
def get_playbook_deals():
    """Get all playbook deals (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        deals = read_json_list(get_playbook_path('playbook_deals.json'))

        return jsonify({
            "success": True,
            "data": deals,
            "count": len(deals)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading playbook deals: {str(e)}"
        }), 500


@playbook_bp.route('/deals', methods=['POST'])
@login_required
def create_playbook_deal():
    """Create new playbook deal (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        deals = read_json_list(get_playbook_path('playbook_deals.json'))
        new_id = generate_sequential_id(deals, 'id', 'playbook_deal_')

        new_deal = {
            "id": new_id,
            "mu_id": data.get('mu_id', ''),
            "deal_acronym": data.get('deal_acronym', ''),
            "deal": data.get('deal', ''),
            "fx": data.get('fx', ''),
            "total_facility": data.get('total_facility'),
            "sponsor": data.get('sponsor', ''),
            "financial_close": data.get('financial_close'),
            "lead": data.get('lead', ''),
            "type": data.get('type', ''),
            "security": data.get('security', ''),
            "benchmark": data.get('benchmark', ''),
            "benchmark_value": data.get('benchmark_value'),
            "spread": data.get('spread'),
            "rate": data.get('rate')
        }

        deals.append(new_deal)
        write_json_file(get_playbook_path('playbook_deals.json'), deals)

        return jsonify({
            "success": True,
            "data": new_deal,
            "message": "Deal created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating deal: {str(e)}"
        }), 500


@playbook_bp.route('/deals/<deal_id>', methods=['PUT'])
@login_required
def update_playbook_deal(deal_id):
    """Update playbook deal (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        deals = read_json_list(get_playbook_path('playbook_deals.json'))
        deal = find_by_id(deals, 'id', deal_id)

        if not deal:
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        # Update fields
        deal['mu_id'] = data.get('mu_id', deal.get('mu_id'))
        deal['deal_acronym'] = data.get('deal_acronym', deal.get('deal_acronym'))
        deal['deal'] = data.get('deal', deal.get('deal'))
        deal['fx'] = data.get('fx', deal.get('fx'))
        deal['total_facility'] = data.get('total_facility', deal.get('total_facility'))
        deal['sponsor'] = data.get('sponsor', deal.get('sponsor'))
        deal['financial_close'] = data.get('financial_close', deal.get('financial_close'))
        deal['lead'] = data.get('lead', deal.get('lead'))
        deal['type'] = data.get('type', deal.get('type'))
        deal['security'] = data.get('security', deal.get('security'))
        deal['benchmark'] = data.get('benchmark', deal.get('benchmark'))
        deal['benchmark_value'] = data.get('benchmark_value', deal.get('benchmark_value'))
        deal['spread'] = data.get('spread', deal.get('spread'))
        deal['rate'] = data.get('rate', deal.get('rate'))

        write_json_file(get_playbook_path('playbook_deals.json'), deals)

        return jsonify({
            "success": True,
            "data": deal,
            "message": "Deal updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating deal: {str(e)}"
        }), 500


@playbook_bp.route('/deals/<deal_id>', methods=['DELETE'])
@login_required
def delete_playbook_deal(deal_id):
    """Delete playbook deal (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        deals = read_json_list(get_playbook_path('playbook_deals.json'))
        updated_deals = remove_by_id(deals, 'id', deal_id)

        if len(updated_deals) == len(deals):
            return jsonify({
                "success": False,
                "message": f"Deal {deal_id} not found"
            }), 404

        write_json_file(get_playbook_path('playbook_deals.json'), updated_deals)

        return jsonify({
            "success": True,
            "message": "Deal deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting deal: {str(e)}"
        }), 500


# ============================================================================
# PEOPLE/TEAM CRUD
# ============================================================================

@playbook_bp.route('/people', methods=['GET'])
@login_required
def get_playbook_people():
    """Get all playbook team members (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        people = read_json_list(get_playbook_path('playbook_people.json'))

        return jsonify({
            "success": True,
            "data": people,
            "count": len(people)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading team members: {str(e)}"
        }), 500


@playbook_bp.route('/people', methods=['POST'])
@login_required
def create_playbook_person():
    """Create new team member (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        people = read_json_list(get_playbook_path('playbook_people.json'))
        new_id = generate_sequential_id(people, 'id', 'playbook_person_')

        new_person = {
            "id": new_id,
            "team_member": data.get('team_member', ''),
            "location": data.get('location', ''),
            "role": data.get('role', ''),
            "tasks": data.get('tasks', ''),
            "disc_profile": data.get('disc_profile', ''),
            "facts_interests": data.get('facts_interests', '')
        }

        people.append(new_person)
        write_json_file(get_playbook_path('playbook_people.json'), people)

        return jsonify({
            "success": True,
            "data": new_person,
            "message": "Team member created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating team member: {str(e)}"
        }), 500


@playbook_bp.route('/people/<person_id>', methods=['PUT'])
@login_required
def update_playbook_person(person_id):
    """Update team member (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        people = read_json_list(get_playbook_path('playbook_people.json'))
        person = find_by_id(people, 'id', person_id)

        if not person:
            return jsonify({
                "success": False,
                "message": f"Team member {person_id} not found"
            }), 404

        # Update fields
        person['team_member'] = data.get('team_member', person.get('team_member'))
        person['location'] = data.get('location', person.get('location'))
        person['role'] = data.get('role', person.get('role'))
        person['tasks'] = data.get('tasks', person.get('tasks'))
        person['disc_profile'] = data.get('disc_profile', person.get('disc_profile'))
        person['facts_interests'] = data.get('facts_interests', person.get('facts_interests'))

        write_json_file(get_playbook_path('playbook_people.json'), people)

        return jsonify({
            "success": True,
            "data": person,
            "message": "Team member updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating team member: {str(e)}"
        }), 500


@playbook_bp.route('/people/<person_id>', methods=['DELETE'])
@login_required
def delete_playbook_person(person_id):
    """Delete team member (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        people = read_json_list(get_playbook_path('playbook_people.json'))
        updated_people = remove_by_id(people, 'id', person_id)

        if len(updated_people) == len(people):
            return jsonify({
                "success": False,
                "message": f"Team member {person_id} not found"
            }), 404

        write_json_file(get_playbook_path('playbook_people.json'), updated_people)

        return jsonify({
            "success": True,
            "message": "Team member deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting team member: {str(e)}"
        }), 500


# ============================================================================
# WORKSTREAMS CRUD
# ============================================================================

@playbook_bp.route('/workstreams', methods=['GET'])
@login_required
def get_playbook_workstreams():
    """Get all playbook workstreams (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        workstreams = read_json_list(get_playbook_path('playbook_workstreams.json'))

        return jsonify({
            "success": True,
            "data": workstreams,
            "count": len(workstreams)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading workstreams: {str(e)}"
        }), 500


@playbook_bp.route('/workstreams', methods=['POST'])
@login_required
def create_playbook_workstream():
    """Create new workstream (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        workstreams = read_json_list(get_playbook_path('playbook_workstreams.json'))
        new_id = generate_sequential_id(workstreams, 'id', 'playbook_workstream_')

        new_workstream = {
            "id": new_id,
            "mission_goal": data.get('mission_goal', ''),
            "process": data.get('process', ''),
            "category": data.get('category', ''),
            "deliverable": data.get('deliverable', ''),
            "done": data.get('done', False),
            "key": data.get('key', ''),
            "description": data.get('description', ''),
            "completed": False,
            "subtasks": data.get('subtasks', [])
        }

        workstreams.append(new_workstream)
        write_json_file(get_playbook_path('playbook_workstreams.json'), workstreams)

        return jsonify({
            "success": True,
            "data": new_workstream,
            "message": "Workstream created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating workstream: {str(e)}"
        }), 500


@playbook_bp.route('/workstreams/<workstream_id>', methods=['PUT'])
@login_required
def update_playbook_workstream(workstream_id):
    """Update workstream (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        workstreams = read_json_list(get_playbook_path('playbook_workstreams.json'))
        workstream = find_by_id(workstreams, 'id', workstream_id)

        if not workstream:
            return jsonify({
                "success": False,
                "message": f"Workstream {workstream_id} not found"
            }), 404

        # Update fields
        workstream['mission_goal'] = data.get('mission_goal', workstream.get('mission_goal', ''))
        workstream['process'] = data.get('process', workstream.get('process', ''))
        workstream['category'] = data.get('category', workstream.get('category', ''))
        workstream['deliverable'] = data.get('deliverable', workstream.get('deliverable', ''))
        workstream['done'] = data.get('done', workstream.get('done', False))
        workstream['key'] = data.get('key', workstream.get('key', ''))
        workstream['description'] = data.get('description', workstream.get('description', ''))
        workstream['completed'] = data.get('completed', workstream.get('completed', False))
        workstream['subtasks'] = data.get('subtasks', workstream.get('subtasks', []))

        write_json_file(get_playbook_path('playbook_workstreams.json'), workstreams)

        return jsonify({
            "success": True,
            "data": workstream,
            "message": "Workstream updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating workstream: {str(e)}"
        }), 500


@playbook_bp.route('/workstreams/<workstream_id>', methods=['DELETE'])
@login_required
def delete_playbook_workstream(workstream_id):
    """Delete workstream (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        workstreams = read_json_list(get_playbook_path('playbook_workstreams.json'))
        updated_workstreams = remove_by_id(workstreams, 'id', workstream_id)

        if len(updated_workstreams) == len(workstreams):
            return jsonify({
                "success": False,
                "message": f"Workstream {workstream_id} not found"
            }), 404

        write_json_file(get_playbook_path('playbook_workstreams.json'), updated_workstreams)

        return jsonify({
            "success": True,
            "message": "Workstream deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting workstream: {str(e)}"
        }), 500


@playbook_bp.route('/workstreams/<workstream_id>/toggle', methods=['POST'])
@login_required
def toggle_workstream_completion(workstream_id):
    """Toggle completion status for workstream or subtask (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()
        subtask_id = data.get('subtask_id') if data else None

        workstreams = read_json_list(get_playbook_path('playbook_workstreams.json'))
        workstream = find_by_id(workstreams, 'id', workstream_id)

        if not workstream:
            return jsonify({
                "success": False,
                "message": f"Workstream {workstream_id} not found"
            }), 404

        # Toggle subtask completion if subtask_id provided
        if subtask_id:
            subtask_found = False
            for subtask in workstream.get('subtasks', []):
                if subtask.get('id') == subtask_id:
                    subtask['completed'] = not subtask.get('completed', False)
                    subtask_found = True
                    break

            if not subtask_found:
                return jsonify({
                    "success": False,
                    "message": f"Subtask {subtask_id} not found"
                }), 404
        else:
            # Toggle parent workstream completion
            workstream['completed'] = not workstream.get('completed', False)

        write_json_file(get_playbook_path('playbook_workstreams.json'), workstreams)

        return jsonify({
            "success": True,
            "data": workstream,
            "message": "Completion status toggled successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling completion: {str(e)}"
        }), 500


@playbook_bp.route('/workstreams/<workstream_id>/subtasks', methods=['POST'])
@login_required
def create_subtask(workstream_id):
    """Create new subtask for a workstream (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        workstreams = read_json_list(get_playbook_path('playbook_workstreams.json'))
        workstream = find_by_id(workstreams, 'id', workstream_id)

        if not workstream:
            return jsonify({
                "success": False,
                "message": f"Workstream {workstream_id} not found"
            }), 404

        # Initialize subtasks array if it doesn't exist
        if 'subtasks' not in workstream:
            workstream['subtasks'] = []

        # Generate subtask ID
        existing_subtask_count = len(workstream['subtasks'])
        new_subtask_id = f"{workstream_id}_sub_{existing_subtask_count + 1}"

        # Create new subtask
        new_subtask = {
            "id": new_subtask_id,
            "process": data.get('process', ''),
            "category": data.get('category', ''),
            "deliverable": data.get('deliverable', ''),
            "done": False,
            "completed": False
        }

        workstream['subtasks'].append(new_subtask)
        write_json_file(get_playbook_path('playbook_workstreams.json'), workstreams)

        return jsonify({
            "success": True,
            "data": workstream,
            "message": "Subtask created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating subtask: {str(e)}"
        }), 500


# ============================================================================
# FILING INSTRUCTIONS
# ============================================================================

@playbook_bp.route('/filing', methods=['GET'])
@login_required
def get_playbook_filing():
    """Get filing instructions (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        # Read filing data (single object, not a list)
        filing_path = get_playbook_path('playbook_filing.json')

        if not filing_path.exists():
            return jsonify({
                "success": True,
                "data": {"content": ""}
            })

        with open(filing_path, 'r', encoding='utf-8') as f:
            filing = json.load(f)

        return jsonify({
            "success": True,
            "data": filing
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading filing instructions: {str(e)}"
        }), 500


@playbook_bp.route('/filing', methods=['PUT'])
@login_required
def update_playbook_filing():
    """Update filing instructions (Admin only)"""
    admin_check = require_admin()
    if admin_check:
        return admin_check

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        filing = {
            "content": data.get('content', '')
        }

        # Write directly (not using write_json_file since it's a single object)
        filing_path = get_playbook_path('playbook_filing.json')

        # Create backup if exists
        if filing_path.exists():
            backup_path = filing_path.with_suffix('.json.bak')
            filing_path.rename(backup_path)

        with open(filing_path, 'w', encoding='utf-8') as f:
            json.dump(filing, f, indent=2, ensure_ascii=False)

        return jsonify({
            "success": True,
            "data": filing,
            "message": "Filing instructions updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating filing instructions: {str(e)}"
        }), 500
