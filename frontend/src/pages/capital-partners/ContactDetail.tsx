/**
 * Contact Detail Page
 * View and edit individual contact with meeting history
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Contact, CapitalPartner, MeetingHistoryEntry, ApiResponse } from '../../types/liquidity';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { API_BASE_URL } from '../../config';
import { updateMeetingNote, deleteMeetingNote } from '../../services/capitalPartnersService';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [partner, setPartner] = useState<CapitalPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistoryEntry | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts-new/${id}`);
      const result: ApiResponse<Contact> = await response.json();

      if (result.success && result.data) {
        setContact(result.data);
        await fetchPartner(result.data.capital_partner_id);
        setError(null);
      } else {
        setError(result.message || 'Failed to load contact');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingClick = (meeting: MeetingHistoryEntry) => {
    setSelectedMeeting(meeting);
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!id) return;
    await updateMeetingNote(id, meetingId, data);
    // Refresh contact data
    await fetchContact();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!id) return;
    await deleteMeetingNote(id, meetingId);
    // Refresh contact data
    await fetchContact();
    setSelectedMeeting(null);
  };

  const fetchPartner = async (partnerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/capital-partners/${partnerId}`);
      const result: ApiResponse<CapitalPartner> = await response.json();

      if (result.success && result.data) {
        setPartner(result.data);
      }
    } catch (err) {
      console.error('Failed to load partner:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts-new/${id}`, {
        method: 'DELETE'
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        navigate('/liquidity/contacts');
      } else {
        setError(result.message || 'Failed to delete contact');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => navigate('/liquidity/contacts')}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/liquidity/capital-partners" className="hover:text-blue-600">
          Capital Partners
        </Link>
        <span>›</span>
        {partner && (
          <>
            <Link
              to={`/liquidity/capital-partners/${partner.id}`}
              className="hover:text-blue-600"
            >
              {partner.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{contact.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
          <p className="text-gray-600 mt-1">{contact.role}</p>
        </div>

        <div className="flex gap-2">
          {partner && (
            <Link
              to={`/liquidity/capital-partners/${partner.id}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Capital Partner View
            </Link>
          )}
          <Link
            to={`/liquidity/meeting?contact=${contact.id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Start Meeting
          </Link>
          <Link
            to={`/liquidity/contacts/${contact.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-gray-900">{contact.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <p className="text-gray-900">{contact.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <p className="text-gray-900">{contact.team_name || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{contact.email || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-gray-900">{contact.phone || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            {contact.linkedin ? (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View Profile
              </a>
            ) : (
              <p className="text-gray-900">N/A</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                contact.relationship === 'Strong'
                  ? 'bg-green-100 text-green-800'
                  : contact.relationship === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : contact.relationship === 'Developing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {contact.relationship}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DISC Profile
            </label>
            <p className="text-gray-900">{contact.disc_profile || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Contact
            </label>
            <p className="text-gray-900">
              {contact.last_contact_date
                ? new Date(contact.last_contact_date).toLocaleDateString()
                : 'Never'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Follow-up
            </label>
            <p className={contact.next_contact_reminder ? 'text-orange-600 font-medium' : 'text-gray-900'}>
              {contact.next_contact_reminder
                ? new Date(contact.next_contact_reminder).toLocaleDateString()
                : 'Not scheduled'}
            </p>
          </div>
        </div>

        {contact.contact_notes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">{contact.contact_notes}</p>
          </div>
        )}
      </div>

      {/* Meeting History */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          Meeting History ({contact.meeting_history?.length || 0})
        </h2>

        {!contact.meeting_history || contact.meeting_history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No meetings recorded yet</p>
            <Link
              to={`/liquidity/meeting?contact=${contact.id}`}
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm"
            >
              Record your first meeting
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
                  className="w-full text-left border border-gray-200 rounded-md p-4 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                      {meeting.participants && (
                        <span className="text-xs md:text-sm text-gray-600">
                          Participants: {meeting.participants}
                        </span>
                      )}
                    </div>
                    {meeting.next_follow_up && (
                      <span className="text-xs text-orange-600">
                        Follow-up: {new Date(meeting.next_follow_up).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-24 overflow-hidden">
                    {meeting.notes}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-blue-600">Open full meeting details</p>
                </button>
              ))}

          </div>
        )}
      </div>

      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="liquidity"
          meeting={selectedMeeting}
          contactName={contact.name}
          contactRole={contact.role}
          contactId={contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            partner && { label: 'Capital Partner', value: partner.name },
            contact.team_name && { label: 'Team', value: contact.team_name },
            contact.email && { label: 'Email', value: contact.email },
            contact.phone && { label: 'Phone', value: contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}

      {/* Metadata */}
      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
        <p>Created: {new Date(contact.created_at).toLocaleString()}</p>
        <p>Last Updated: {new Date(contact.last_updated).toLocaleString()}</p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Delete Contact?
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>{contact.name}</strong>?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the contact and all meeting history.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetail;
