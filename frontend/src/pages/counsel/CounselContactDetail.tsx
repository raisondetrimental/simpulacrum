/**
 * Counsel Contact Detail Page
 * View and manage a single counsel contact
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CounselContact, LegalAdvisor, ApiResponse, MeetingHistoryEntry } from '../../types/counsel';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { API_BASE_URL } from '../../config';
import { updateCounselMeetingNote, deleteCounselMeetingNote } from '../../services/counselService';

const CounselContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<CounselContact | null>(null);
  const [advisor, setAdvisor] = useState<LegalAdvisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistoryEntry | null>(null);

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/counsel-contacts/${id}`);
      const result: ApiResponse<CounselContact> = await response.json();

      if (result.success && result.data) {
        setContact(result.data);
        // Fetch legal advisor info
        fetchAdvisor(result.data.legal_advisor_id);
        setError(null);
      } else {
        setError('Contact not found');
      }
    } catch (err) {
      setError('Failed to load contact');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisor = async (advisorId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-advisors/${advisorId}`);
      const result: ApiResponse<LegalAdvisor> = await response.json();

      if (result.success && result.data) {
        setAdvisor(result.data);
      }
    } catch (err) {
      console.error('Failed to load legal advisor');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/counsel-contacts/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        navigate('/counsel/legal-advisors');
      } else {
        alert('Failed to delete contact');
      }
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleMeetingClick = (meeting: MeetingHistoryEntry) => {
    setSelectedMeeting(meeting);
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!id) return;
    await updateCounselMeetingNote(id, meetingId, data);
    // Refresh contact data
    await fetchContact();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!id) return;
    await deleteCounselMeetingNote(id, meetingId);
    // Refresh contact data
    await fetchContact();
    setSelectedMeeting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <Link to="/counsel/legal-advisors" className="mt-2 text-sm text-red-600 hover:text-red-800">
          Back to Legal Advisors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
          <p className="text-gray-600 mt-1">{contact.role}</p>
          {advisor && (
            <Link to={`/counsel/legal-advisors/${advisor.id}`} className="text-sm text-purple-600 hover:text-purple-800">
              {advisor.name}
            </Link>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            to={`/counsel/meeting?contact=${contact.id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Start Meeting
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={`mailto:${contact.email}`} className="text-purple-600 hover:text-purple-800">
                {contact.email}
              </a>
            </dd>
          </div>
          {contact.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{contact.phone}</dd>
            </div>
          )}
          {contact.linkedin && (
            <div>
              <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                  View Profile
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Relationship</dt>
            <dd className="mt-1">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
            </dd>
          </div>
          {contact.disc_profile && (
            <div>
              <dt className="text-sm font-medium text-gray-500">DISC Profile</dt>
              <dd className="mt-1">
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  {contact.disc_profile}
                </span>
              </dd>
            </div>
          )}
        </dl>
        {contact.contact_notes && (
          <div className="mt-4">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{contact.contact_notes}</dd>
          </div>
        )}
      </div>

      {/* Meeting History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Meeting History ({contact.meeting_history?.length || 0})
        </h2>
        {contact.meeting_history && contact.meeting_history.length > 0 ? (
          <div className="space-y-4">
            {contact.meeting_history
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((meeting, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleMeetingClick(meeting)}
                  className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                  <p className="mt-3 text-xs font-semibold text-purple-600">Open full meeting details</p>
                </button>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No meeting history yet</p>
            <Link
              to={`/counsel/meeting?contact=${id}`}
              className="mt-2 inline-block text-purple-600 hover:text-purple-800 text-sm"
            >
              Record first meeting
            </Link>
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="counsel"
          meeting={selectedMeeting}
          contactName={contact.name}
          contactRole={contact.role}
          contactId={contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            advisor && { label: 'Legal Advisor', value: advisor.name },
            contact.email && { label: 'Email', value: contact.email },
            contact.phone && { label: 'Phone', value: contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}
    </div>
  );
};

export default CounselContactDetail;
