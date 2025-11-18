"""
Counsel module routes (Legal Advisors and Counsel Contacts)
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

counsel_bp = Blueprint('counsel', __name__, url_prefix='/api')


# ============================================================================
# LEGAL ADVISORS CRUD
# ============================================================================

@counsel_bp.route('/legal-advisors', methods=['GET'])
def get_legal_advisors():
    """Get all legal advisors"""
    try:
        advisors = get_all_organizations("counsel")

        return jsonify({
            "success": True,
            "data": advisors,
            "count": len(advisors)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting legal advisors: {str(e)}"
        }), 500


@counsel_bp.route('/legal-advisors/<advisor_id>', methods=['GET'])
def get_legal_advisor(advisor_id):
    """Get a specific legal advisor by ID"""
    try:
        advisor = get_organization_by_id(advisor_id, "counsel")

        if not advisor:
            return jsonify({
                "success": False,
                "message": "Legal advisor not found"
            }), 404

        return jsonify({
            "success": True,
            "data": advisor
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting legal advisor: {str(e)}"
        }), 500


@counsel_bp.route('/legal-advisors', methods=['POST'])
def create_legal_advisor():
    """Create a new legal advisor"""
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
        new_id = f"la_{int(time.time() * 1000)}"

        # Create new advisor with ID
        new_advisor_data = {
            "id": new_id,
            "name": data['name'],
            "country": data['country'],
            "headquarters_location": data.get('headquarters_location', ''),
            "counsel_preferences": data.get('counsel_preferences', {}),
            "relationship": data.get('relationship', 'Developing'),
            "notes": data.get('notes', ''),
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }

        # Create via unified DAL
        new_advisor = create_organization(new_advisor_data, "counsel")

        if new_advisor:
            return jsonify({
                "success": True,
                "data": new_advisor,
                "message": "Legal advisor created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save legal advisor"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating legal advisor: {str(e)}"
        }), 500


@counsel_bp.route('/legal-advisors/<advisor_id>', methods=['PUT'])
def update_legal_advisor(advisor_id):
    """Update a legal advisor"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Update via unified DAL
        updated_advisor = update_organization(advisor_id, data, "counsel")

        if not updated_advisor:
            return jsonify({
                "success": False,
                "message": "Legal advisor not found"
            }), 404

        return jsonify({
            "success": True,
            "data": updated_advisor,
            "message": "Legal advisor updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating legal advisor: {str(e)}"
        }), 500


@counsel_bp.route('/legal-advisors/<advisor_id>', methods=['DELETE'])
def delete_legal_advisor(advisor_id):
    """Delete a legal advisor and cascade delete all counsel contacts"""
    try:
        # Check if advisor exists
        advisor = get_organization_by_id(advisor_id, "counsel")
        if not advisor:
            return jsonify({
                "success": False,
                "message": "Legal advisor not found"
            }), 404

        # CASCADE DELETE: Remove all contacts for this advisor
        delete_contacts_by_organization(advisor_id, "counsel")

        # Remove the advisor
        if delete_organization(advisor_id, "counsel"):
            return jsonify({
                "success": True,
                "message": "Legal advisor and associated contacts deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete legal advisor"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting legal advisor: {str(e)}"
        }), 500


@counsel_bp.route('/legal-advisors/<advisor_id>/star', methods=['PUT'])
def toggle_legal_advisor_star(advisor_id):
    """Toggle starred status for a legal advisor"""
    try:
        # Get current advisor
        advisor = get_organization_by_id(advisor_id, "counsel")

        if not advisor:
            return jsonify({
                "success": False,
                "message": "Legal advisor not found"
            }), 404

        # Toggle starred status
        update_data = {
            "starred": not advisor.get('starred', False)
        }

        # Update via unified DAL
        updated_advisor = update_organization(advisor_id, update_data, "counsel")

        if updated_advisor:
            return jsonify({
                "success": True,
                "data": updated_advisor,
                "message": f"Legal advisor {'starred' if updated_advisor['starred'] else 'unstarred'} successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update legal advisor"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling star: {str(e)}"
        }), 500


# ============================================================================
# COUNSEL CONTACTS CRUD
# ============================================================================

@counsel_bp.route('/counsel-contacts', methods=['GET'])
def get_counsel_contacts():
    """Get all counsel contacts or filter by legal_advisor_id"""
    try:
        # Filter by legal_advisor_id if provided
        advisor_id = request.args.get('legal_advisor_id')
        contacts = get_all_contacts("counsel", advisor_id)

        return jsonify({
            "success": True,
            "data": contacts,
            "count": len(contacts)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting counsel contacts: {str(e)}"
        }), 500


@counsel_bp.route('/counsel-contacts/<contact_id>', methods=['GET'])
def get_counsel_contact(contact_id):
    """Get a specific counsel contact by ID"""
    try:
        contact = get_contact_by_id(contact_id, "counsel")

        if not contact:
            return jsonify({
                "success": False,
                "message": "Contact not found"
            }), 404

        return jsonify({
            "success": True,
            "data": contact
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting counsel contact: {str(e)}"
        }), 500


@counsel_bp.route('/counsel-contacts', methods=['POST'])
def create_counsel_contact():
    """Create a new counsel contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        required_fields = ['legal_advisor_id', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Generate new ID (timestamp-based)
        new_id = f"cc_{int(time.time() * 1000)}"

        # Create new contact
        new_contact_data = {
            "id": new_id,
            "legal_advisor_id": data['legal_advisor_id'],
            "name": data['name'],
            "role": data.get('role'),
            "email": data.get('email'),
            "phone": data.get('phone', ''),
            "linkedin": data.get('linkedin', ''),
            "relationship": data.get('relationship', 'Developing'),
            "disc_profile": data.get('disc_profile', ''),
            "meeting_history": [],
            "contact_notes": data.get('contact_notes', ''),
            "last_contact_date": None,
            "next_contact_reminder": None,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }

        # Create via unified DAL
        new_contact = create_contact(new_contact_data, "counsel")

        if new_contact:
            return jsonify({
                "success": True,
                "data": new_contact,
                "message": "Counsel contact created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save counsel contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating counsel contact: {str(e)}"
        }), 500


@counsel_bp.route('/counsel-contacts/<contact_id>', methods=['PUT'])
def update_counsel_contact(contact_id):
    """Update a counsel contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Update via unified DAL
        updated_contact = update_contact(contact_id, data, "counsel")

        if not updated_contact:
            return jsonify({
                "success": False,
                "message": "Contact not found"
            }), 404

        return jsonify({
            "success": True,
            "data": updated_contact,
            "message": "Counsel contact updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating counsel contact: {str(e)}"
        }), 500


@counsel_bp.route('/counsel-contacts/<contact_id>', methods=['DELETE'])
def delete_counsel_contact(contact_id):
    """Delete a counsel contact"""
    try:
        # Check if contact exists
        contact = get_contact_by_id(contact_id, "counsel")
        if not contact:
            return jsonify({
                "success": False,
                "message": "Contact not found"
            }), 404

        # Delete via unified DAL
        if delete_contact(contact_id, "counsel"):
            return jsonify({
                "success": True,
                "message": "Counsel contact deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete counsel contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting counsel contact: {str(e)}"
        }), 500


# ============================================================================
# COUNSEL MEETING NOTES & REMINDERS
# ============================================================================

@counsel_bp.route('/counsel-meetings', methods=['POST'])
@login_required
def save_counsel_meeting():
    """Save counsel meeting notes and update contact/advisor"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        contact_id = data.get('contact_id')
        contact_updates = data.get('contact_updates', {})
        advisor_updates = data.get('legal_advisor_updates', {})
        meeting_note = data.get('meeting_note')

        if not contact_id:
            return jsonify({
                "success": False,
                "message": "contact_id is required"
            }), 400

        # Get contact via unified DAL
        contact = get_contact_by_id(contact_id, "counsel")

        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Add meeting note to history
        if meeting_note:
            if 'meeting_history' not in contact:
                contact['meeting_history'] = []

            # Generate unique ID for meeting note using timestamp
            meeting_id = f"meeting_{int(datetime.now().timestamp() * 1000)}"

            # Handle user assignment
            from ..utils.user_helpers import validate_user_ids, get_user_details

            assigned_user_ids = meeting_note.get('assigned_user_ids', [])
            assigned_to = []

            if assigned_user_ids:
                # Validate user IDs
                is_valid, error_msg = validate_user_ids(assigned_user_ids)
                if not is_valid:
                    return jsonify({
                        "success": False,
                        "message": error_msg
                    }), 400

                # Get full user details
                assigned_to = get_user_details(assigned_user_ids)

            contact['meeting_history'].append({
                "id": meeting_id,
                "date": datetime.now().isoformat(),
                "notes": meeting_note.get('notes', ''),
                "participants": meeting_note.get('participants', ''),
                "next_follow_up": meeting_note.get('next_follow_up'),
                "assigned_to": assigned_to,
                "created_by": {
                    "user_id": current_user.id,
                    "username": current_user.username,
                    "full_name": current_user.full_name
                }
            })

            # Update reminder
            contact['last_contact_date'] = datetime.now().isoformat()
            if meeting_note.get('next_follow_up'):
                contact['next_contact_reminder'] = meeting_note['next_follow_up']

        # Apply contact updates
        for key, value in contact_updates.items():
            if key in contact:
                contact[key] = value

        # Update contact via unified DAL
        updated_contact = update_contact(contact_id, contact, "counsel")

        # Update legal advisor if needed
        if advisor_updates:
            advisor_id = contact.get('legal_advisor_id')
            update_organization(advisor_id, advisor_updates, "counsel")

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


@counsel_bp.route('/counsel-meetings/reminders', methods=['GET'])
def get_counsel_reminders():
    """Get counsel contacts with upcoming follow-ups"""
    try:
        from datetime import datetime

        contacts = get_all_contacts("counsel")

        # Filter contacts with reminders
        reminders = []
        today = datetime.now().date()

        for contact in contacts:
            if contact.get('next_contact_reminder'):
                try:
                    reminder_date = datetime.fromisoformat(contact['next_contact_reminder'].replace('Z', '+00:00')).date()
                    days_until = (reminder_date - today).days

                    reminders.append({
                        "contact": contact,
                        "reminder_date": contact['next_contact_reminder'],
                        "days_until": days_until,
                        "overdue": days_until < 0
                    })
                except (ValueError, AttributeError):
                    pass

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


@counsel_bp.route('/counsel-contacts/<contact_id>/meetings/<meeting_id>', methods=['PUT'])
@login_required
def update_counsel_meeting_note(contact_id, meeting_id):
    """Update a specific counsel meeting note"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Find contact via unified DAL
        contact = get_contact_by_id(contact_id, "counsel")
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

                # Handle user assignment update (reassignment)
                if 'assigned_user_ids' in data:
                    from ..utils.user_helpers import validate_user_ids, get_user_details

                    assigned_user_ids = data.get('assigned_user_ids', [])
                    assigned_to = []

                    if assigned_user_ids:
                        # Validate user IDs
                        is_valid, error_msg = validate_user_ids(assigned_user_ids)
                        if not is_valid:
                            return jsonify({
                                "success": False,
                                "message": error_msg
                            }), 400

                        # Get full user details
                        assigned_to = get_user_details(assigned_user_ids)

                    meeting['assigned_to'] = assigned_to

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

        # Update contact via unified DAL
        updated_contact = update_contact(contact_id, contact, "counsel")

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


@counsel_bp.route('/counsel-contacts/<contact_id>/meetings/<meeting_id>', methods=['DELETE'])
@login_required
def delete_counsel_meeting_note(contact_id, meeting_id):
    """Delete a specific counsel meeting note"""
    try:
        # Find contact via unified DAL
        contact = get_contact_by_id(contact_id, "counsel")
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

        # Update contact via unified DAL
        updated_contact = update_contact(contact_id, contact, "counsel")

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

@counsel_bp.route('/legal-advisors/<advisor_id>/deals', methods=['GET'])
@login_required
def get_legal_advisor_deals(advisor_id):
    """
    Get all deals where this legal advisor is a participant

    Returns deals with participation details (role, commitment, etc.)
    """
    try:
        # Check if legal advisor exists via unified DAL
        advisor = get_organization_by_id(advisor_id, "counsel")

        if not advisor:
            return jsonify({
                "success": False,
                "message": f"Legal advisor {advisor_id} not found"
            }), 404

        # Load deal participants
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter participants where this legal advisor is involved
        advisor_participants = [
            p for p in all_participants
            if p.get('entity_type') == 'legal_advisor' and p.get('entity_id') == advisor_id
        ]

        if not advisor_participants:
            return jsonify({
                "success": True,
                "data": [],
                "count": 0,
                "message": f"No deals found for legal advisor {advisor['name']}"
            })

        # Load deals
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        all_deals = read_json_list(deals_path)

        # Build result with deal + participation details
        deals_with_participation = []

        for participant in advisor_participants:
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
            "advisor_name": advisor.get('name', '')
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading deals: {str(e)}"
        }), 500


# ============================================================================
# XLSX EXPORT
# ============================================================================

@counsel_bp.route('/legal-advisors/export/xlsx', methods=['GET'])
@login_required
def export_legal_advisors_xlsx():
    """Export all legal advisors to XLSX format"""
    try:
        advisors = get_all_organizations("counsel")

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Legal Advisors"

        # Define headers
        headers = [
            'ID', 'Name', 'Country', 'Headquarters', 'Countries', 'Relationship',
            'Notes', 'Created At', 'Last Updated'
        ]
        ws.append(headers)

        # Add data rows
        for advisor in advisors:
            row = [
                advisor.get('id', ''),
                advisor.get('name', ''),
                advisor.get('country', ''),
                advisor.get('headquarters_location', ''),
                ', '.join(advisor.get('countries', [])) if isinstance(advisor.get('countries'), list) else '',
                advisor.get('relationship', ''),
                advisor.get('notes', ''),
                advisor.get('created_at', ''),
                advisor.get('last_updated', '')
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
                'Content-Disposition': 'attachment; filename=legal_advisors.xlsx'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error exporting legal advisors: {str(e)}"
        }), 500


@counsel_bp.route('/counsel-contacts/export/xlsx', methods=['GET'])
@login_required
def export_counsel_contacts_xlsx():
    """Export all counsel contacts to XLSX format (optionally filtered by legal_advisor_id)"""
    try:
        # Filter by legal_advisor_id if provided
        advisor_id = request.args.get('legal_advisor_id')
        contacts = get_all_contacts("counsel", advisor_id)

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Counsel Contacts"

        # Define headers
        headers = [
            'Contact ID', 'Legal Advisor ID', 'Name', 'Role', 'Email', 'Phone',
            'LinkedIn', 'Relationship', 'DISC Profile', 'Contact Notes',
            'Last Contact Date', 'Next Contact Reminder', 'Created At', 'Last Updated'
        ]
        ws.append(headers)

        # Add data rows
        for contact in contacts:
            row = [
                contact.get('id', ''),
                contact.get('legal_advisor_id', ''),
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
        filename = f"counsel_contacts_{advisor_id}.xlsx" if advisor_id else "counsel_contacts.xlsx"
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
            "message": f"Error exporting counsel contacts: {str(e)}"
        }), 500
