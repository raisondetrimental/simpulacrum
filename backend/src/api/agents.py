"""
Agents module routes (Transaction Agents and Agent Contacts)
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from pathlib import Path
from datetime import datetime
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

agents_bp = Blueprint('agents', __name__, url_prefix='/api')


# ============================================================================
# AGENTS CRUD
# ============================================================================

@agents_bp.route('/agents', methods=['GET'])
def get_agents():
    """Get all agents"""
    try:
        agents = get_all_organizations("agent")

        return jsonify({
            "success": True,
            "data": agents,
            "count": len(agents)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting agents: {str(e)}"
        }), 500


@agents_bp.route('/agents/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get a specific agent by ID"""
    try:
        agent = get_organization_by_id(agent_id, "agent")

        if not agent:
            return jsonify({
                "success": False,
                "message": "Agent not found"
            }), 404

        return jsonify({
            "success": True,
            "data": agent
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting agent: {str(e)}"
        }), 500


@agents_bp.route('/agents', methods=['POST'])
def create_agent():
    """Create a new agent"""
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
        new_id = f"agent_{int(time.time() * 1000)}"

        # Create new agent data
        new_agent_data = {
            "id": new_id,
            "name": data['name'],
            "agent_type": data.get('agent_type', ''),
            "country": data['country'],
            "headquarters_location": data.get('headquarters_location', ''),
            "agent_preferences": data.get('agent_preferences', {}),
            "relationship": data.get('relationship', 'Developing'),
            "notes": data.get('notes', ''),
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }

        # Create via unified DAL
        new_agent = create_organization(new_agent_data, "agent")

        if new_agent:
            return jsonify({
                "success": True,
                "data": new_agent,
                "message": "Agent created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save agent"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating agent: {str(e)}"
        }), 500


@agents_bp.route('/agents/<agent_id>', methods=['PUT'])
def update_agent(agent_id):
    """Update an agent"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Update via unified DAL
        updated_agent = update_organization(agent_id, data, "agent")

        if not updated_agent:
            return jsonify({
                "success": False,
                "message": "Agent not found"
            }), 404

        return jsonify({
            "success": True,
            "data": updated_agent,
            "message": "Agent updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating agent: {str(e)}"
        }), 500


@agents_bp.route('/agents/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an agent and cascade delete all agent contacts"""
    try:
        # Check if agent exists
        agent = get_organization_by_id(agent_id, "agent")
        if not agent:
            return jsonify({
                "success": False,
                "message": "Agent not found"
            }), 404

        # CASCADE DELETE: Remove all contacts for this agent
        delete_contacts_by_organization(agent_id, "agent")

        # Remove the agent
        if delete_organization(agent_id, "agent"):
            return jsonify({
                "success": True,
                "message": "Agent and associated contacts deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete agent"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting agent: {str(e)}"
        }), 500


@agents_bp.route('/agents/<agent_id>/star', methods=['PUT'])
def toggle_agent_star(agent_id):
    """Toggle starred status for an agent"""
    try:
        # Get current agent
        agent = get_organization_by_id(agent_id, "agent")

        if not agent:
            return jsonify({
                "success": False,
                "message": "Agent not found"
            }), 404

        # Toggle starred status
        update_data = {
            "starred": not agent.get('starred', False)
        }

        # Update via unified DAL
        updated_agent = update_organization(agent_id, update_data, "agent")

        if updated_agent:
            return jsonify({
                "success": True,
                "data": updated_agent,
                "message": f"Agent {'starred' if updated_agent['starred'] else 'unstarred'} successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update agent"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error toggling star: {str(e)}"
        }), 500


# ============================================================================
# AGENT CONTACTS CRUD
# ============================================================================

@agents_bp.route('/agent-contacts', methods=['GET'])
def get_agent_contacts():
    """Get all agent contacts or filter by agent_id"""
    try:
        # Filter by agent_id if provided
        agent_id = request.args.get('agent_id')
        contacts = get_all_contacts("agent", agent_id)

        return jsonify({
            "success": True,
            "data": contacts,
            "count": len(contacts)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting agent contacts: {str(e)}"
        }), 500


@agents_bp.route('/agent-contacts/<contact_id>', methods=['GET'])
def get_agent_contact(contact_id):
    """Get a specific agent contact by ID"""
    try:
        contact = get_contact_by_id(contact_id, "agent")

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
            "message": f"Error getting agent contact: {str(e)}"
        }), 500


@agents_bp.route('/agent-contacts', methods=['POST'])
def create_agent_contact():
    """Create a new agent contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Validate required fields
        required_fields = ['agent_id', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Generate new ID (timestamp-based)
        new_id = f"acontact_{int(time.time() * 1000)}"

        # Create new contact
        new_contact_data = {
            "id": new_id,
            "agent_id": data['agent_id'],
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
        new_contact = create_contact(new_contact_data, "agent")

        if new_contact:
            return jsonify({
                "success": True,
                "data": new_contact,
                "message": "Agent contact created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save agent contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating agent contact: {str(e)}"
        }), 500


@agents_bp.route('/agent-contacts/<contact_id>', methods=['PUT'])
def update_agent_contact(contact_id):
    """Update an agent contact"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Update via unified DAL
        updated_contact = update_contact(contact_id, data, "agent")

        if not updated_contact:
            return jsonify({
                "success": False,
                "message": "Contact not found"
            }), 404

        return jsonify({
            "success": True,
            "data": updated_contact,
            "message": "Agent contact updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating agent contact: {str(e)}"
        }), 500


@agents_bp.route('/agent-contacts/<contact_id>', methods=['DELETE'])
def delete_agent_contact(contact_id):
    """Delete an agent contact"""
    try:
        # Check if contact exists
        contact = get_contact_by_id(contact_id, "agent")
        if not contact:
            return jsonify({
                "success": False,
                "message": "Contact not found"
            }), 404

        # Delete via unified DAL
        if delete_contact(contact_id, "agent"):
            return jsonify({
                "success": True,
                "message": "Agent contact deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete agent contact"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting agent contact: {str(e)}"
        }), 500


# ============================================================================
# AGENT MEETING NOTES & REMINDERS
# ============================================================================

@agents_bp.route('/agent-meetings', methods=['POST'])
@login_required
def save_agent_meeting():
    """Save agent meeting notes and update contact/agent"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        contact_id = data.get('contact_id')
        contact_updates = data.get('contact_updates', {})
        agent_updates = data.get('agent_updates', {})
        meeting_note = data.get('meeting_note')

        if not contact_id:
            return jsonify({
                "success": False,
                "message": "contact_id is required"
            }), 400

        # Get contact via unified DAL
        contact = get_contact_by_id(contact_id, "agent")

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

            contact['meeting_history'].append({
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
        updated_contact = update_contact(contact_id, contact, "agent")

        # Update agent if needed
        if agent_updates:
            agent_id = contact.get('agent_id')
            update_organization(agent_id, agent_updates, "agent")

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


@agents_bp.route('/agent-meetings/reminders', methods=['GET'])
def get_agent_reminders():
    """Get agent contacts with upcoming follow-ups"""
    try:
        from datetime import datetime

        contacts = get_all_contacts("agent")

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


@agents_bp.route('/agent-contacts/<contact_id>/meetings/<meeting_id>', methods=['PUT'])
@login_required
def update_agent_meeting_note(contact_id, meeting_id):
    """Update a specific agent meeting note"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Find contact via unified DAL
        contact = get_contact_by_id(contact_id, "agent")
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

        # Update contact via unified DAL
        updated_contact = update_contact(contact_id, contact, "agent")

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


@agents_bp.route('/agent-contacts/<contact_id>/meetings/<meeting_id>', methods=['DELETE'])
@login_required
def delete_agent_meeting_note(contact_id, meeting_id):
    """Delete a specific agent meeting note"""
    try:
        # Find contact via unified DAL
        contact = get_contact_by_id(contact_id, "agent")
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
        updated_contact = update_contact(contact_id, contact, "agent")

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

@agents_bp.route('/agents/<agent_id>/deals', methods=['GET'])
@login_required
def get_agent_deals(agent_id):
    """
    Get all deals where this agent is a participant

    Returns deals with participation details (role, commitment, etc.)
    """
    try:
        # Check if agent exists via unified DAL
        agent = get_organization_by_id(agent_id, "agent")

        if not agent:
            return jsonify({
                "success": False,
                "message": f"Agent {agent_id} not found"
            }), 404

        # Load deal participants
        participants_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEAL_PARTICIPANTS']
        all_participants = read_json_list(participants_path)

        # Filter participants where this agent is involved
        agent_participants = [
            p for p in all_participants
            if p.get('entity_type') == 'agent' and p.get('entity_id') == agent_id
        ]

        if not agent_participants:
            return jsonify({
                "success": True,
                "data": [],
                "count": 0,
                "message": f"No deals found for agent {agent['name']}"
            })

        # Load deals
        deals_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_DEALS']
        all_deals = read_json_list(deals_path)

        # Build result with deal + participation details
        deals_with_participation = []

        for participant in agent_participants:
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
            "agent_name": agent.get('name', '')
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading deals: {str(e)}"
        }), 500
