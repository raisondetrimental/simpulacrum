/**
 * Agent Contact Detail Page
 * View and edit agent contact details with meeting history
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AgentContact, Agent, MeetingHistoryEntry, ApiResponse, RELATIONSHIP_LEVELS, DISC_PROFILES } from '../../types/agents';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { API_BASE_URL } from '../../config';
import { updateAgentMeetingNote, deleteAgentMeetingNote } from '../../services/agentsService';

const AgentContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contact, setContact] = useState<AgentContact | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistoryEntry | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    relationship: 'Developing' as 'Strong' | 'Medium' | 'Developing' | 'Cold',
    disc_profile: '',
    contact_notes: ''
  });

  const handleMeetingClick = (meeting: MeetingHistoryEntry) => {
    setSelectedMeeting(meeting);
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!id) return;
    await updateAgentMeetingNote(id, meetingId, data);
    // Refresh contact data
    await fetchData();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!id) return;
    await deleteAgentMeetingNote(id, meetingId);
    // Refresh contact data
    await fetchData();
    setSelectedMeeting(null);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const contactRes = await fetch(`${API_BASE_URL}/api/agent-contacts/${id}`, { credentials: 'include' });
      const contactResult: ApiResponse<AgentContact> = await contactRes.json();

      if (contactResult.success && contactResult.data) {
        setContact(contactResult.data);
        setFormData({
          name: contactResult.data.name,
          role: contactResult.data.role,
          email: contactResult.data.email,
          phone: contactResult.data.phone,
          linkedin: contactResult.data.linkedin,
          relationship: contactResult.data.relationship,
          disc_profile: contactResult.data.disc_profile,
          contact_notes: contactResult.data.contact_notes
        });

        // Fetch agent details
        const agentRes = await fetch(`${API_BASE_URL}/api/agents/${contactResult.data.agent_id}`, { credentials: 'include' });
        const agentResult: ApiResponse<Agent> = await agentRes.json();
        if (agentResult.success && agentResult.data) {
          setAgent(agentResult.data);
        }
      } else {
        setError('Contact not found');
      }
    } catch (err) {
      setError('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');

    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AgentContact> = await response.json();

      if (result.success && result.data) {
        setContact(result.data);
        setIsEditing(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-contacts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        navigate('/agents');
      } else {
        alert('Failed to delete contact');
      }
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error || 'Contact not found'}</p>
        <Link to="/agents" className="mt-2 inline-block text-sm text-red-600 hover:text-red-800">
          ← Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {agent && (
            <Link to={`/agents/${agent.id}`} className="text-sm text-orange-600 hover:text-orange-800 mb-2 inline-block">
              ← Back to {agent.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
          <p className="text-gray-600 mt-1">{contact.role}</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <Link
                to={`/agents/meeting?contact=${id}`}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Start Meeting
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Edit Contact
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: contact.name,
                    role: contact.role,
                    email: contact.email,
                    phone: contact.phone,
                    linkedin: contact.linkedin,
                    relationship: contact.relationship,
                    disc_profile: contact.disc_profile,
                    contact_notes: contact.contact_notes
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Agent Link */}
      {agent && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-800 font-medium">Agent</p>
              <Link
                to={`/agents/${agent.id}`}
                className="text-lg font-bold text-orange-900 hover:text-orange-700"
              >
                {agent.name}
              </Link>
              <p className="text-sm text-orange-700 mt-1">{agent.country}</p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                agent.relationship === 'Strong'
                  ? 'bg-orange-100 text-orange-800'
                  : agent.relationship === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : agent.relationship === 'Developing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {agent.relationship}
            </span>
          </div>
        </div>
      )}

      {/* Contact Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-900">{contact.name}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-900">{contact.role}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-900">{contact.email || 'Not provided'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-900">{contact.phone || 'Not provided'}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            {isEditing ? (
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              contact.linkedin ? (
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {contact.linkedin}
                </a>
              ) : (
                <p className="text-gray-500">Not provided</p>
              )
            )}
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            {isEditing ? (
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {RELATIONSHIP_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  contact.relationship === 'Strong'
                    ? 'bg-orange-100 text-orange-800'
                    : contact.relationship === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : contact.relationship === 'Developing'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {contact.relationship}
              </span>
            )}
          </div>

          {/* DISC Profile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DISC Profile</label>
            {isEditing ? (
              <select
                value={formData.disc_profile}
                onChange={(e) => setFormData({ ...formData, disc_profile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {DISC_PROFILES.map(profile => (
                  <option key={profile} value={profile}>{profile || 'None'}</option>
                ))}
              </select>
            ) : (
              contact.disc_profile ? (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded">
                  {contact.disc_profile}
                </span>
              ) : (
                <p className="text-gray-500">Not set</p>
              )
            )}
          </div>

          {/* Last Contact Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
            <p className="text-gray-900">
              {contact.last_contact_date ? new Date(contact.last_contact_date).toLocaleDateString() : 'Never'}
            </p>
          </div>

          {/* Next Contact Reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
            <p className={`font-medium ${contact.next_contact_reminder ? 'text-orange-600' : 'text-gray-500'}`}>
              {contact.next_contact_reminder ? new Date(contact.next_contact_reminder).toLocaleDateString() : 'Not scheduled'}
            </p>
          </div>
        </div>

        {/* Contact Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          {isEditing ? (
            <textarea
              value={formData.contact_notes}
              onChange={(e) => setFormData({ ...formData, contact_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{contact.contact_notes || 'No notes'}</p>
          )}
        </div>
      </div>

      {/* Meeting History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Meeting History ({contact.meeting_history.length})</h2>
          <Link
            to={`/agents/meeting?contact=${id}`}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
          >
            + Add Meeting Note
          </Link>
        </div>

        {contact.meeting_history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No meetings recorded</p>
            <Link
              to={`/agents/meeting?contact=${id}`}
              className="mt-2 inline-block text-orange-600 hover:text-orange-800 text-sm"
            >
              Record first meeting
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contact.meeting_history
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((meeting, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleMeetingClick(meeting)}
                  className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(meeting.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {meeting.participants && (
                        <p className="text-xs text-gray-600">Participants: {meeting.participants}</p>
                      )}
                    </div>
                    {meeting.next_follow_up && (
                      <span className="text-xs text-orange-600 font-medium">
                        Follow-up: {new Date(meeting.next_follow_up).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap max-h-24 overflow-hidden">{meeting.notes}</p>
                  <p className="mt-3 text-xs font-semibold text-orange-600">Open full meeting details</p>
                </button>
              ))}

          </div>
        )}
      </div>

      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="agent"
          meeting={selectedMeeting}
          contactName={contact.name}
          contactRole={contact.role}
          contactId={contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            agent && { label: 'Agent', value: agent.name },
            contact.email && { label: 'Email', value: contact.email },
            contact.phone && { label: 'Phone', value: contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500">
        <p>Created: {new Date(contact.created_at).toLocaleString()}</p>
        <p>Last Updated: {new Date(contact.last_updated).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AgentContactDetail;
