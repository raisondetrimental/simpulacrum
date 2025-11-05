"""
Sponsors module routes (Corporates and Sponsor Contacts)
"""
from flask import Blueprint, jsonify, request, current_app, Response
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime
from io import BytesIO
from openpyxl import Workbook
import time

from ..utils.json_store import (
    read_json_list, write_json_file, find_by_id, filter_by_field,
    remove_by_id, generate_timestamp_id
)
from ..utils.unified_dal import (
    get_all_organizations, get_organization_by_id,
    create_organization, update_organization, delete_organization,
    get_all_contacts, get_contact_by_id,
    create_contact, update_contact, delete_contact,
    delete_contacts_by_organization
)

sponsors_bp = Blueprint('sponsors', __name__, url_prefix='/api')


# ============================================================================
# CORPORATES CRUD
# ============================================================================

@sponsors_bp.route('/corporates', methods=['GET'])
def get_corporates():
    """Get all corporates"""
    try:
        corporates = get_all_organizations("sponsor")

        return jsonify({
            "success": True,
            "data": corporates,
            "count": len(corporates)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading corporates: {str(e)}"
        }), 500


@sponsors_bp.route('/corporates/<corporate_id>', methods=['GET'])
def get_corporate(corporate_id):
    """Get a single corporate by ID"""
    try:
        corporate = get_organization_by_id(corporate_id, "sponsor")

        if not corporate:
            return jsonify({
                "success": False,
                "message": f"Corporate {corporate_id} not found"
            }), 404

        return jsonify({
            "success": True,
            "data": corporate
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading corporate: {str(e)}"
        }), 500


@sponsors_bp.route('/corporates', methods=['POST'])
def create_corporate():
    """Create a new corporate"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        required_fields = ['name', 'country']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Generate new ID (timestamp-based)
        corporate_id = f"corp_{int(time.time() * 1000)}"

        # Create new corporate data
        now = datetime.now().isoformat()
        new_corporate_data = {
            "id": corporate_id,
            "name": data['name'],
            "country": data['country'],
            "headquarters_location": data.get('headquarters_location', ''),
            "investment_need_min": data.get('investment_need_min', 0),
            "investment_need_max": data.get('investment_need_max', 0),
            "currency": data.get('currency', 'USD'),
            "infrastructure_types": data.get('infrastructure_types', {}),
            "regions": data.get('regions', {}),
            "relationship": data.get('relationship', 'Developing'),
            "notes": data.get('notes', ''),
            "company_description": data.get('company_description', ''),
            "created_at": now,
            "last_updated": now
        }

        # Create using unified DAL
        new_corporate = create_organization(new_corporate_data, "sponsor")

        if new_corporate:
            return jsonify({
                "success": True,
                "data": new_corporate,
                "message": "Corporate created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save corporate"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating corporate: {str(e)}"
        }), 500


@sponsors_bp.route('/corporates/<corporate_id>', methods=['PUT'])
def update_corporate(corporate_id):
    """Update a corporate"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Get existing corporate
        existing_corporate = get_organization_by_id(corporate_id, "sponsor")

        if not existing_corporate:
            return jsonify({
                "success": False,
                "message": f"Corporate {corporate_id} not found"
            }), 404

        # Update fields
        update_data = {
            "id": corporate_id,
            "name": data.get('name', existing_corporate['name']),
            "country": data.get('country', existing_corporate['country']),
            "headquarters_location": data.get('headquarters_location', existing_corporate.get('headquarters_location', '')),
            "investment_need_min": data.get('investment_need_min', existing_corporate.get('investment_need_min', 0)),
            "investment_need_max": data.get('investment_need_max', existing_corporate.get('investment_need_max', 0)),
            "currency": data.get('currency', existing_corporate.get('currency', 'USD')),
            "infrastructure_types": data.get('infrastructure_types', existing_corporate.get('infrastructure_types', {})),
            "regions": data.get('regions', existing_corporate.get('regions', {})),
            "relationship": data.get('relationship', existing_corporate.get('relationship', 'Developing')),
            "notes": data.get('notes', existing_corporate.get('notes', '')),
            "company_description": data.get('company_description', existing_corporate.get('company_description', '')),
            "created_at": existing_corporate['created_at'],
            "last_updated": datetime.now().isoformat()
        }

        # Update using unified DAL
        updated_corporate = update_organization(corporate_id, update_data, "sponsor")

        if updated_corporate:
            return jsonify({
                "success": True,
                "data": updated_corporate,
                "message": "Corporate updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save corporate"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating corporate: {str(e)}"
        }), 500


@sponsors_bp.route('/corporates/<corporate_id>', methods=['DELETE'])
def delete_corporate(corporate_id):
    """Delete a corporate"""
    try:
        # Check if corporate exists
        corporate = get_organization_by_id(corporate_id, "sponsor")
        if not corporate:
            return jsonify({
                "success": False,
                "message": f"Corporate {corporate_id} not found"
            }), 404

        # CASCADE DELETE: Remove all contacts for this corporate
        delete_contacts_by_organization(corporate_id, "sponsor")

        # Delete the corporate using unified DAL
        if delete_organization(corporate_id, "sponsor"):
            return jsonify({
                "success": True,
                "message": "Corporate deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete corporate"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting corporate: {str(e)}"
        }), 500


@sponsors_bp.route('/corporates/<corporate_id>/star', methods=['PUT'])
def toggle_corporate_star(corporate_id):
    """Toggle starred status for a corporate"""
    try:
        corporate = get_organization_by_id(corporate_id, "sponsor")

        if not corporate:
            return jsonify({
                "success": False,
                "message": f"Corporate {corporate_id} not found"
            }), 404

        # Toggle starred status
        corporate['starred'] = not corporate.get('starred', False)
        corporate['last_updated'] = datetime.now().isoformat()

        # Update using unified DAL
        updated_corporate = update_organization(corporate_id, corporate, "sponsor")

        if updated_corporate:
            return jsonify({
                "success": True,
                "data": updated_corporate,
                "message": f"Corporate {'starred' if updated_corporate['starred'] else 'unstarred'} successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update corporate"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling star: {str(e)}"
        }), 500


# ============================================================================
# SPONSOR CONTACTS CRUD
# ============================================================================

@sponsors_bp.route('/sponsor-contacts', methods=['GET'])
def get_sponsor_contacts():
    """Get all sponsor contacts or filter by corporate_id"""
    try:
        # Get optional filter parameter
        corporate_id = request.args.get('corporate_id')

        # Get contacts from unified DAL
        contacts = get_all_contacts("sponsor", corporate_id)

        return jsonify({
            "success": True,
            "data": contacts,
            "count": len(contacts)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading sponsor contacts: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts/<contact_id>', methods=['GET'])
def get_sponsor_contact(contact_id):
    """Get a single sponsor contact by ID"""
    try:
        contact = get_contact_by_id(contact_id, "sponsor")

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
            "message": f"Error loading contact: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts', methods=['POST'])
def create_sponsor_contact():
    """Create a new sponsor contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        required_fields = ['corporate_id', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Generate new ID (timestamp-based)
        contact_id = f"scontact_{int(time.time() * 1000)}"

        # Create new contact data
        now = datetime.now().isoformat()
        new_contact_data = {
            "id": contact_id,
            "corporate_id": data['corporate_id'],
            "organization_id": data['corporate_id'],
            "name": data['name'],
            "role": data.get('role', ''),
            "email": data.get('email', ''),
            "phone": data.get('phone', ''),
            "linkedin": data.get('linkedin', ''),
            "relationship": data.get('relationship', 'Developing'),
            "disc_profile": data.get('disc_profile', ''),
            "meeting_history": [],
            "contact_notes": data.get('contact_notes', ''),
            "last_contact_date": None,
            "next_contact_reminder": None,
            "created_at": now,
            "last_updated": now
        }

        # Create using unified DAL
        new_contact = create_contact(new_contact_data, "sponsor")

        if new_contact:
            return jsonify({
                "success": True,
                "data": new_contact,
                "message": "Contact created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating contact: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts/<contact_id>', methods=['PUT'])
def update_sponsor_contact(contact_id):
    """Update a sponsor contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Get existing contact
        contact = get_contact_by_id(contact_id, "sponsor")

        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Update fields
        update_data = {
            "name": data.get('name', contact['name']),
            "role": data.get('role', contact['role']),
            "email": data.get('email', contact.get('email', '')),
            "phone": data.get('phone', contact.get('phone', '')),
            "linkedin": data.get('linkedin', contact.get('linkedin', '')),
            "relationship": data.get('relationship', contact.get('relationship', 'Developing')),
            "disc_profile": data.get('disc_profile', contact.get('disc_profile', '')),
            "contact_notes": data.get('contact_notes', contact.get('contact_notes', '')),
        }

        # Update using unified DAL
        updated_contact = update_contact(contact_id, update_data, "sponsor")

        if updated_contact:
            return jsonify({
                "success": True,
                "data": updated_contact,
                "message": "Contact updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating contact: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts/<contact_id>', methods=['DELETE'])
def delete_sponsor_contact(contact_id):
    """Delete a sponsor contact"""
    try:
        # Check if contact exists
        contact = get_contact_by_id(contact_id, "sponsor")
        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Delete using unified DAL
        if delete_contact(contact_id, "sponsor"):
            return jsonify({
                "success": True,
                "message": "Contact deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting contact: {str(e)}"
        }), 500


# ============================================================================
# SPONSOR MEETING NOTES & REMINDERS
# ============================================================================

@sponsors_bp.route('/sponsor-meetings', methods=['POST'])
@login_required
def save_sponsor_meeting_notes():
    """Save sponsor meeting notes - updates both contact and corporate"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        contact_id = data.get('contact_id')
        contact_updates = data.get('contact_updates', {})
        corporate_updates = data.get('corporate_updates', {})
        meeting_note = data.get('meeting_note')

        if not contact_id:
            return jsonify({
                "success": False,
                "message": "contact_id is required"
            }), 400

        # Get contact from unified DAL
        contact = get_contact_by_id(contact_id, "sponsor")
        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        corporate_id = contact['corporate_id']

        # Update contact fields
        for key, value in contact_updates.items():
            contact[key] = value

        # Add meeting to history
        if meeting_note:
            if 'meeting_history' not in contact:
                contact['meeting_history'] = []

            # Generate unique ID for meeting note using timestamp
            meeting_id = f"meeting_{int(datetime.now().timestamp() * 1000)}"

            meeting_entry = {
                "id": meeting_id,
                "date": datetime.now().isoformat(),
                "notes": meeting_note.get('notes', ''),
                "participants": meeting_note.get('participants', ''),
                "next_follow_up": meeting_note.get('next_follow_up'),
                "created_by": {
                    "user_id": current_user.id,
                    "username": current_user.username,
                    "full_name": current_user.full_name
                }
            }
            contact['meeting_history'].append(meeting_entry)
            contact['last_contact_date'] = meeting_entry['date']

            if meeting_note.get('next_follow_up'):
                contact['next_contact_reminder'] = meeting_note['next_follow_up']

        # Update contact using unified DAL
        updated_contact = update_contact(contact_id, contact, "sponsor")

        # Update corporate if needed
        if corporate_updates:
            corporate = get_organization_by_id(corporate_id, "sponsor")
            if corporate:
                for key, value in corporate_updates.items():
                    corporate[key] = value
                update_organization(corporate_id, corporate, "sponsor")

        return jsonify({
            "success": True,
            "data": updated_contact,
            "message": "Meeting notes saved successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving meeting notes: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-meetings/reminders', methods=['GET'])
def get_sponsor_meeting_reminders():
    """Get sponsor contacts with upcoming follow-ups"""
    try:
        from datetime import datetime, timedelta

        # Get all contacts from unified DAL
        contacts = get_all_contacts("sponsor")

        # Filter contacts with reminders
        today = datetime.now().date()
        reminders = []

        for contact in contacts:
            reminder_date_str = contact.get('next_contact_reminder')
            if reminder_date_str:
                try:
                    reminder_date = datetime.fromisoformat(reminder_date_str.replace('Z', '+00:00')).date()
                    days_until = (reminder_date - today).days

                    reminders.append({
                        "contact": contact,
                        "reminder_date": reminder_date_str,
                        "days_until": days_until,
                        "overdue": days_until < 0
                    })
                except (ValueError, AttributeError):
                    continue

        # Sort by date
        reminders.sort(key=lambda x: x['reminder_date'])

        return jsonify({
            "success": True,
            "data": reminders,
            "count": len(reminders)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting reminders: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts/<contact_id>/meetings/<meeting_id>', methods=['PUT'])
@login_required
def update_sponsor_meeting_note(contact_id, meeting_id):
    """Update a specific sponsor meeting note"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Get contact from unified DAL
        contact = get_contact_by_id(contact_id, "sponsor")
        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Find meeting note
        if 'meeting_history' not in contact:
            return jsonify({
                "success": False,
                "message": "No meeting history found"
            }), 404

        meeting_found = False
        for meeting in contact['meeting_history']:
            if meeting.get('id') == meeting_id:
                # Update meeting fields
                meeting['notes'] = data.get('notes', meeting.get('notes', ''))
                meeting['participants'] = data.get('participants', meeting.get('participants', ''))
                meeting['next_follow_up'] = data.get('next_follow_up', meeting.get('next_follow_up'))
                meeting['updated_at'] = datetime.now().isoformat()
                meeting['updated_by'] = {
                    'user_id': current_user.id,
                    'username': current_user.username,
                    'full_name': current_user.full_name
                }
                meeting_found = True
                break

        if not meeting_found:
            return jsonify({
                "success": False,
                "message": f"Meeting {meeting_id} not found"
            }), 404

        # Update contact using unified DAL
        updated_contact = update_contact(contact_id, contact, "sponsor")

        if updated_contact:
            return jsonify({
                "success": True,
                "data": updated_contact,
                "message": "Meeting note updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save meeting note"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating meeting note: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts/<contact_id>/meetings/<meeting_id>', methods=['DELETE'])
@login_required
def delete_sponsor_meeting_note(contact_id, meeting_id):
    """Delete a specific sponsor meeting note"""
    try:
        # Get contact from unified DAL
        contact = get_contact_by_id(contact_id, "sponsor")
        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Find and remove meeting note
        if 'meeting_history' not in contact:
            return jsonify({
                "success": False,
                "message": "No meeting history found"
            }), 404

        initial_count = len(contact['meeting_history'])
        contact['meeting_history'] = [m for m in contact['meeting_history'] if m.get('id') != meeting_id]

        if len(contact['meeting_history']) == initial_count:
            return jsonify({
                "success": False,
                "message": f"Meeting {meeting_id} not found"
            }), 404

        # Update contact using unified DAL
        updated_contact = update_contact(contact_id, contact, "sponsor")

        if updated_contact:
            return jsonify({
                "success": True,
                "message": "Meeting note deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete meeting note"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting meeting note: {str(e)}"
        }), 500


# ============================================================================
# DEAL RELATIONSHIPS (REVERSE LOOKUPS)
# ============================================================================

@sponsors_bp.route('/corporates/<corporate_id>/deals', methods=['GET'])
@login_required
def get_corporate_deals(corporate_id):
    """
    Get all deals where this corporate is a participant

    Returns deals with participation details (role, commitment, etc.)
    """
    try:
        # Check if corporate exists using unified DAL
        corporate = get_organization_by_id(corporate_id, "sponsor")

        if not corporate:
            return jsonify({
                "success": False,
                "message": f"Corporate {corporate_id} not found"
            }), 404

        # Load deal participants
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter participants where this corporate is involved
        corporate_participants = [
            p for p in all_participants
            if p.get('entity_type') == 'corporate' and p.get('entity_id') == corporate_id
        ]

        if not corporate_participants:
            return jsonify({
                "success": True,
                "data": [],
                "count": 0,
                "message": f"No deals found for corporate {corporate['name']}"
            })

        # Load deals
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        all_deals = read_json_list(deals_path)

        # Build result with deal + participation details
        deals_with_participation = []

        for participant in corporate_participants:
            deal_id = participant.get('deal_id')
            deal = find_by_id(all_deals, 'id', deal_id)

            if deal:
                # Add participation details to deal
                deal_copy = deal.copy()
                deal_copy['participation'] = {
                    'participant_id': participant.get('id'),
                    'role': participant.get('role'),
                    'role_detail': participant.get('role_detail', ''),
                    'commitment_amount': participant.get('commitment_amount', 0),
                    'funded_amount': participant.get('funded_amount', 0),
                    'participation_pct': participant.get('participation_pct', 0),
                    'seniority': participant.get('seniority', ''),
                    'status': participant.get('status', ''),
                    'commitment_date': participant.get('commitment_date', ''),
                    'notes': participant.get('notes', '')
                }
                deals_with_participation.append(deal_copy)

        # Sort by deal date descending
        deals_with_participation.sort(key=lambda x: x.get('deal_date', ''), reverse=True)

        return jsonify({
            "success": True,
            "data": deals_with_participation,
            "count": len(deals_with_participation),
            "corporate_name": corporate.get('name', '')
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading deals: {str(e)}"
        }), 500


# ============================================================================
# XLSX EXPORT
# ============================================================================

@sponsors_bp.route('/corporates/export/xlsx', methods=['GET'])
@login_required
def export_corporates_xlsx():
    """Export all corporates to XLSX format"""
    try:
        corporates_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CORPORATES']
        corporates = read_json_list(corporates_path)

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Corporates"

        # Define headers
        headers = [
            'ID', 'Name', 'Country', 'Headquarters', 'Investment Need Min',
            'Investment Need Max', 'Currency', 'Relationship', 'Notes',
            'Company Description', 'Created At', 'Last Updated'
        ]
        ws.append(headers)

        # Add data rows
        for corporate in corporates:
            row = [
                corporate.get('id', ''),
                corporate.get('name', ''),
                corporate.get('country', ''),
                corporate.get('headquarters_location', ''),
                corporate.get('investment_need_min', 0),
                corporate.get('investment_need_max', 0),
                corporate.get('currency', 'USD'),
                corporate.get('relationship', ''),
                corporate.get('notes', ''),
                corporate.get('company_description', ''),
                corporate.get('created_at', ''),
                corporate.get('last_updated', '')
            ]
            ws.append(row)

        # Save to BytesIO buffer
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Create response
        response = Response(
            output.getvalue(),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={
                'Content-Disposition': 'attachment; filename=corporates.xlsx'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error exporting corporates: {str(e)}"
        }), 500


@sponsors_bp.route('/sponsor-contacts/export/xlsx', methods=['GET'])
@login_required
def export_sponsor_contacts_xlsx():
    """Export all sponsor contacts to XLSX format (optionally filtered by corporate_id)"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_SPONSOR_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Filter by corporate_id if provided
        corporate_id = request.args.get('corporate_id')
        if corporate_id:
            contacts = filter_by_field(contacts, 'corporate_id', corporate_id)

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Sponsor Contacts"

        # Define headers
        headers = [
            'Contact ID', 'Corporate ID', 'Name', 'Role', 'Email', 'Phone',
            'LinkedIn', 'Relationship', 'DISC Profile', 'Contact Notes',
            'Last Contact Date', 'Next Contact Reminder', 'Created At', 'Last Updated'
        ]
        ws.append(headers)

        # Add data rows
        for contact in contacts:
            row = [
                contact.get('id', ''),
                contact.get('corporate_id', ''),
                contact.get('name', ''),
                contact.get('role', ''),
                contact.get('email', ''),
                contact.get('phone', ''),
                contact.get('linkedin', ''),
                contact.get('relationship', ''),
                contact.get('disc_profile', ''),
                contact.get('contact_notes', ''),
                contact.get('last_contact_date', ''),
                contact.get('next_contact_reminder', ''),
                contact.get('created_at', ''),
                contact.get('last_updated', '')
            ]
            ws.append(row)

        # Save to BytesIO buffer
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Create response
        filename = f"sponsor_contacts_{corporate_id}.xlsx" if corporate_id else "sponsor_contacts.xlsx"
        response = Response(
            output.getvalue(),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={
                'Content-Disposition': f'attachment; filename={filename}'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error exporting sponsor contacts: {str(e)}"
        }), 500
