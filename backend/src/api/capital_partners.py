"""
Capital Partners, Teams, and Contacts routes (Liquidity Module)
"""
from flask import Blueprint, jsonify, request, current_app, Response
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime
from io import BytesIO
from openpyxl import Workbook

from ..utils.json_store import (
    read_json_list, write_json_file, find_by_id, filter_by_field,
    remove_by_id, generate_sequential_id
)

capital_partners_bp = Blueprint('capital_partners', __name__, url_prefix='/api')


# ============================================================================
# CAPITAL PARTNERS CRUD
# ============================================================================

@capital_partners_bp.route('/capital-partners', methods=['GET'])
def get_capital_partners():
    """Get all capital partners"""
    try:
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)

        return jsonify({
            "success": True,
            "data": partners,
            "count": len(partners)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading capital partners: {str(e)}"
        }), 500


@capital_partners_bp.route('/capital-partners/<partner_id>', methods=['GET'])
def get_capital_partner(partner_id):
    """Get a specific capital partner by ID"""
    try:
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)
        partner = find_by_id(partners, 'id', partner_id)

        if not partner:
            return jsonify({
                "success": False,
                "message": f"Capital partner {partner_id} not found"
            }), 404

        return jsonify({
            "success": True,
            "data": partner
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading capital partner: {str(e)}"
        }), 500


@capital_partners_bp.route('/capital-partners', methods=['POST'])
def create_capital_partner():
    """Create a new capital partner"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        required_fields = ['name', 'type', 'country']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Load existing partners
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)

        # Generate new ID
        new_id = generate_sequential_id(partners, 'id', 'cp_')

        # Default preferences (all "any")
        default_preferences = {
            key: 'any' for key in [
                'investment_grade', 'high_yield', 'infra_debt', 'senior_secured',
                'subordinated', 'bonds', 'loan_agreement', 'quasi_sovereign_only',
                'public_bond_high_yield', 'us_market', 'emerging_markets', 'asia_em',
                'africa_em', 'emea_em', 'vietnam', 'mongolia', 'turkey', 'coal',
                'energy_infra', 'transport_infra', 'more_expensive_than_usual',
                'require_bank_guarantee'
            ]
        }

        # Create new partner
        new_partner = {
            "id": new_id,
            "name": data['name'],
            "type": data['type'],
            "country": data['country'],
            "headquarters_location": data.get('headquarters_location', ''),
            "relationship": data.get('relationship', ''),
            "notes": data.get('notes', ''),
            "company_description": data.get('company_description', ''),
            "preferences": data.get('preferences', default_preferences),
            "investment_min": data.get('investment_min', 0),
            "investment_max": data.get('investment_max', 0),
            "currency": data.get('currency', 'USD'),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        partners.append(new_partner)

        # Save to file
        if write_json_file(partners_path, partners):
            return jsonify({
                "success": True,
                "data": new_partner,
                "message": "Capital partner created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save capital partner"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating capital partner: {str(e)}"
        }), 500


@capital_partners_bp.route('/capital-partners/<partner_id>', methods=['PUT'])
def update_capital_partner(partner_id):
    """Update an existing capital partner"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Load existing partners
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)
        partner = find_by_id(partners, 'id', partner_id)

        if not partner:
            return jsonify({
                "success": False,
                "message": f"Capital partner {partner_id} not found"
            }), 404

        # Update fields
        partner['name'] = data.get('name', partner['name'])
        partner['type'] = data.get('type', partner['type'])
        partner['country'] = data.get('country', partner['country'])
        partner['headquarters_location'] = data.get('headquarters_location', partner.get('headquarters_location', ''))
        partner['relationship'] = data.get('relationship', partner.get('relationship', ''))
        partner['notes'] = data.get('notes', partner.get('notes', ''))
        partner['company_description'] = data.get('company_description', partner.get('company_description', ''))
        partner['preferences'] = data.get('preferences', partner.get('preferences', {}))
        partner['investment_min'] = data.get('investment_min', partner.get('investment_min', 0))
        partner['investment_max'] = data.get('investment_max', partner.get('investment_max', 0))
        partner['currency'] = data.get('currency', partner.get('currency', 'USD'))
        partner['updated_at'] = datetime.now().isoformat()

        # Save to file
        if write_json_file(partners_path, partners):
            return jsonify({
                "success": True,
                "data": partner,
                "message": "Capital partner updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save capital partner"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating capital partner: {str(e)}"
        }), 500


@capital_partners_bp.route('/capital-partners/<partner_id>', methods=['DELETE'])
def delete_capital_partner(partner_id):
    """Delete a capital partner (cascades to contacts)"""
    try:
        # Load all data
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']

        partners = read_json_list(partners_path)
        contacts = read_json_list(contacts_path)

        # Find partner
        partner = find_by_id(partners, 'id', partner_id)
        if not partner:
            return jsonify({
                "success": False,
                "message": f"Capital partner {partner_id} not found"
            }), 404

        # CASCADE DELETE: Remove all contacts for this partner
        contacts = [c for c in contacts if c.get('capital_partner_id') != partner_id]

        # Remove the partner
        partners = remove_by_id(partners, 'id', partner_id)

        # Save all changes
        write_json_file(partners_path, partners)
        write_json_file(contacts_path, contacts)

        return jsonify({
            "success": True,
            "message": "Capital partner and associated contacts deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting capital partner: {str(e)}"
        }), 500


@capital_partners_bp.route('/capital-partners/<partner_id>/star', methods=['PUT'])
def toggle_capital_partner_star(partner_id):
    """Toggle starred status for a capital partner"""
    try:
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)
        partner = find_by_id(partners, 'id', partner_id)

        if not partner:
            return jsonify({
                "success": False,
                "message": f"Capital partner {partner_id} not found"
            }), 404

        # Toggle starred status
        partner['starred'] = not partner.get('starred', False)
        partner['updated_at'] = datetime.now().isoformat()

        # Save to file
        if write_json_file(partners_path, partners):
            return jsonify({
                "success": True,
                "data": partner,
                "message": f"Capital partner {'starred' if partner['starred'] else 'unstarred'} successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update capital partner"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling star: {str(e)}"
        }), 500


# ============================================================================
# CONTACTS CRUD
# ============================================================================

@capital_partners_bp.route('/contacts-new', methods=['GET'])
def get_contacts_new():
    """Get all contacts or contacts for a specific capital partner"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Filter by capital_partner_id if provided
        capital_partner_id = request.args.get('capital_partner_id')
        if capital_partner_id:
            contacts = filter_by_field(contacts, 'capital_partner_id', capital_partner_id)

        return jsonify({
            "success": True,
            "data": contacts,
            "count": len(contacts)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading contacts: {str(e)}"
        }), 500


@capital_partners_bp.route('/contacts-new/<contact_id>', methods=['GET'])
def get_contact_new(contact_id):
    """Get a specific contact by ID"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)
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


@capital_partners_bp.route('/contacts-new', methods=['POST'])
def create_contact_new():
    """Create a new contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        required_fields = ['capital_partner_id', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Load existing contacts
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Generate new ID
        new_id = generate_sequential_id(contacts, 'id', 'contact_')

        # Create new contact
        new_contact = {
            "id": new_id,
            "capital_partner_id": data['capital_partner_id'],
            "team_name": data.get('team_name', ''),
            "name": data['name'],
            "role": data.get('role', ''),
            "email": data.get('email', ''),
            "phone": data.get('phone', ''),
            "linkedin": data.get('linkedin', ''),
            "relationship": data.get('relationship', ''),
            "disc_profile": data.get('disc_profile', ''),
            "contact_notes": data.get('contact_notes', ''),
            "meeting_history": data.get('meeting_history', []),
            "last_contact_date": data.get('last_contact_date'),
            "next_contact_reminder": data.get('next_contact_reminder'),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        contacts.append(new_contact)

        # Save to file
        if write_json_file(contacts_path, contacts):
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


@capital_partners_bp.route('/contacts-new/<contact_id>', methods=['PUT'])
def update_contact_new(contact_id):
    """Update an existing contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Load existing contacts
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)
        contact = find_by_id(contacts, 'id', contact_id)

        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Update fields
        contact['name'] = data.get('name', contact['name'])
        contact['team_name'] = data.get('team_name', contact.get('team_name', ''))
        contact['role'] = data.get('role', contact.get('role', ''))
        contact['email'] = data.get('email', contact.get('email', ''))
        contact['phone'] = data.get('phone', contact.get('phone', ''))
        contact['linkedin'] = data.get('linkedin', contact.get('linkedin', ''))
        contact['relationship'] = data.get('relationship', contact.get('relationship', ''))
        contact['disc_profile'] = data.get('disc_profile', contact.get('disc_profile', ''))
        contact['contact_notes'] = data.get('contact_notes', contact.get('contact_notes', ''))
        contact['meeting_history'] = data.get('meeting_history', contact.get('meeting_history', []))
        contact['last_contact_date'] = data.get('last_contact_date', contact.get('last_contact_date'))
        contact['next_contact_reminder'] = data.get('next_contact_reminder', contact.get('next_contact_reminder'))
        contact['updated_at'] = datetime.now().isoformat()

        # Save to file
        if write_json_file(contacts_path, contacts):
            return jsonify({
                "success": True,
                "data": contact,
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


@capital_partners_bp.route('/contacts-new/<contact_id>', methods=['DELETE'])
def delete_contact_new(contact_id):
    """Delete a contact"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Find contact
        contact = find_by_id(contacts, 'id', contact_id)
        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Remove the contact
        contacts = remove_by_id(contacts, 'id', contact_id)

        # Save changes
        if write_json_file(contacts_path, contacts):
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
# MEETING NOTES & REMINDERS
# ============================================================================

@capital_partners_bp.route('/meeting-notes', methods=['POST'])
@login_required
def save_meeting_notes():
    """Save meeting notes (atomic update for contact + partner)"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        contact_id = data.get('contact_id')
        contact_updates = data.get('contact_updates', {})
        partner_updates = data.get('partner_updates', {})
        meeting_note = data.get('meeting_note', {})

        if not contact_id:
            return jsonify({
                "success": False,
                "message": "contact_id is required"
            }), 400

        # Load contacts and partners
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']

        contacts = read_json_list(contacts_path)
        partners = read_json_list(partners_path)

        # Find contact
        contact = find_by_id(contacts, 'id', contact_id)
        if not contact:
            return jsonify({
                "success": False,
                "message": f"Contact {contact_id} not found"
            }), 404

        # Update contact fields
        for key, value in contact_updates.items():
            contact[key] = value

        # Add meeting note to history with current date
        if meeting_note and meeting_note.get('notes'):
            if 'meeting_history' not in contact:
                contact['meeting_history'] = []

            # Generate unique ID for meeting note using timestamp
            meeting_id = f"meeting_{int(datetime.now().timestamp() * 1000)}"

            # Add date to meeting note
            meeting_note_with_date = {
                'id': meeting_id,
                'date': datetime.now().isoformat(),
                'notes': meeting_note.get('notes', ''),
                'participants': meeting_note.get('participants', ''),
                'next_follow_up': meeting_note.get('next_follow_up', None),
                'created_by': {
                    'user_id': current_user.id,
                    'username': current_user.username,
                    'full_name': current_user.full_name
                }
            }
            contact['meeting_history'].append(meeting_note_with_date)

            # Update last_contact_date to today
            contact['last_contact_date'] = datetime.now().isoformat()

            # Update next_contact_reminder if provided
            if meeting_note.get('next_follow_up'):
                contact['next_contact_reminder'] = meeting_note['next_follow_up']

        contact['last_updated'] = datetime.now().isoformat()

        # Update partner if partner_updates provided
        if partner_updates and contact.get('capital_partner_id'):
            partner = find_by_id(partners, 'id', contact['capital_partner_id'])
            if partner:
                for key, value in partner_updates.items():
                    partner[key] = value
                partner['last_updated'] = datetime.now().isoformat()

        # Save both files
        write_json_file(contacts_path, contacts)
        if partner_updates:
            write_json_file(partners_path, partners)

        return jsonify({
            "success": True,
            "data": contact,
            "message": "Meeting notes saved successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving meeting notes: {str(e)}"
        }), 500


@capital_partners_bp.route('/meeting-notes/reminders', methods=['GET'])
def get_meeting_reminders():
    """Get contacts with upcoming follow-ups"""
    try:
        from datetime import datetime, timedelta

        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Filter contacts with next_contact_reminder
        reminders = []
        today = datetime.now().date()

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


@capital_partners_bp.route('/contacts-new/<contact_id>/meetings/<meeting_id>', methods=['PUT'])
@login_required
def update_meeting_note(contact_id, meeting_id):
    """Update a specific meeting note"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Find contact
        contact = find_by_id(contacts, 'id', contact_id)
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

        contact['last_updated'] = datetime.now().isoformat()

        # Save to file
        if write_json_file(contacts_path, contacts):
            return jsonify({
                "success": True,
                "data": contact,
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


@capital_partners_bp.route('/contacts-new/<contact_id>/meetings/<meeting_id>', methods=['DELETE'])
@login_required
def delete_meeting_note(contact_id, meeting_id):
    """Delete a specific meeting note"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Find contact
        contact = find_by_id(contacts, 'id', contact_id)
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

        contact['last_updated'] = datetime.now().isoformat()

        # Save to file
        if write_json_file(contacts_path, contacts):
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
# DEAL RELATIONSHIPS
# ============================================================================

@capital_partners_bp.route('/capital-partners/<partner_id>/deals', methods=['GET'])
@login_required
def get_capital_partner_deals(partner_id):
    """Get all deals where this capital partner is a participant"""
    try:
        # Check capital partner exists
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)
        partner = find_by_id(partners, 'id', partner_id)

        if not partner:
            return jsonify({
                "success": False,
                "message": f"Capital partner {partner_id} not found"
            }), 404

        # Load participants and deals
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']

        participants = read_json_list(participants_path)
        deals = read_json_list(deals_path)

        # Find all participant records for this capital partner
        partner_participations = [
            p for p in participants
            if p.get('entity_type') == 'capital_partner' and p.get('entity_id') == partner_id
        ]

        # Get deal IDs
        deal_ids = [p['deal_id'] for p in partner_participations]

        # Get full deal records
        partner_deals = []
        for deal in deals:
            if deal['id'] in deal_ids:
                # Find participation info
                participation = next(
                    (p for p in partner_participations if p['deal_id'] == deal['id']),
                    None
                )

                # Add participation details to deal
                deal_with_participation = {
                    **deal,
                    'participation': participation
                }
                partner_deals.append(deal_with_participation)

        # Sort by deal_date descending
        partner_deals.sort(key=lambda x: x.get('deal_date', ''), reverse=True)

        return jsonify({
            "success": True,
            "data": partner_deals,
            "count": len(partner_deals),
            "partner_name": partner.get('name', '')
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading deals: {str(e)}"
        }), 500


# ============================================================================
# XLSX EXPORT
# ============================================================================

@capital_partners_bp.route('/capital-partners/export/xlsx', methods=['GET'])
@login_required
def export_capital_partners_xlsx():
    """Export all capital partners to XLSX format"""
    try:
        partners_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CAPITAL_PARTNERS']
        partners = read_json_list(partners_path)

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Capital Partners"

        # Define headers
        headers = [
            'ID', 'Name', 'Type', 'Country', 'Headquarters', 'Relationship',
            'Investment Min', 'Investment Max', 'Currency', 'Notes',
            'Company Description', 'Created At', 'Updated At'
        ]
        ws.append(headers)

        # Add data rows
        for partner in partners:
            row = [
                partner.get('id', ''),
                partner.get('name', ''),
                partner.get('type', ''),
                partner.get('country', ''),
                partner.get('headquarters_location', ''),
                partner.get('relationship', ''),
                partner.get('investment_min', 0),
                partner.get('investment_max', 0),
                partner.get('currency', 'USD'),
                partner.get('notes', ''),
                partner.get('company_description', ''),
                partner.get('created_at', ''),
                partner.get('updated_at', '')
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
                'Content-Disposition': 'attachment; filename=capital_partners.xlsx'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error exporting capital partners: {str(e)}"
        }), 500


@capital_partners_bp.route('/contacts-new/export/xlsx', methods=['GET'])
@login_required
def export_contacts_xlsx():
    """Export all contacts to XLSX format (optionally filtered by capital_partner_id)"""
    try:
        contacts_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_CONTACTS']
        contacts = read_json_list(contacts_path)

        # Filter by capital_partner_id if provided
        capital_partner_id = request.args.get('capital_partner_id')
        if capital_partner_id:
            contacts = filter_by_field(contacts, 'capital_partner_id', capital_partner_id)

        # Create workbook and worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Contacts"

        # Define headers
        headers = [
            'Contact ID', 'Capital Partner ID', 'Team Name', 'Name', 'Role',
            'Email', 'Phone', 'LinkedIn', 'Relationship', 'DISC Profile',
            'Contact Notes', 'Last Contact Date', 'Next Contact Reminder',
            'Created At', 'Updated At'
        ]
        ws.append(headers)

        # Add data rows
        for contact in contacts:
            row = [
                contact.get('id', ''),
                contact.get('capital_partner_id', ''),
                contact.get('team_name', ''),
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
                contact.get('updated_at', '')
            ]
            ws.append(row)

        # Save to BytesIO buffer
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Create response
        filename = f"contacts_{capital_partner_id}.xlsx" if capital_partner_id else "contacts.xlsx"
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
            "message": f"Error exporting contacts: {str(e)}"
        }), 500

