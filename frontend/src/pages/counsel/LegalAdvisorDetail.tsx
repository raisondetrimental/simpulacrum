/**
 * Legal Advisor Detail Page
 * Full details and management for a single legal advisor
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LegalAdvisor, CounselContact, ApiResponse, LegalAdvisorFormData, MeetingHistoryEntry } from '../../types/counsel';
import LegalAdvisorForm from '../../components/features/counsel/LegalAdvisorForm';
import CounselPreferencesGrid from '../../components/features/counsel/CounselPreferencesGrid';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { API_BASE_URL } from '../../config';
import { getLegalAdvisorDeals } from '../../services/dealsService';
import { Deal, formatDealSize, formatDealDate, DEAL_STATUS_COLORS, DEAL_STATUS_LABELS } from '../../types/deals';
import { updateCounselMeetingNote, deleteCounselMeetingNote, toggleLegalAdvisorStar } from '../../services/counselService';

const LegalAdvisorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState<LegalAdvisor | null>(null);
  const [contacts, setContacts] = useState<CounselContact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<{ meeting: MeetingHistoryEntry; contact: CounselContact } | null>(null);

  useEffect(() => {
    if (id) {
      fetchAdvisor();
      fetchContacts();
      fetchDeals();
    }
  }, [id]);

  const fetchAdvisor = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-advisors/${id}`);
      const result: ApiResponse<LegalAdvisor> = await response.json();

      if (result.success && result.data) {
        setAdvisor(result.data);
        setError(null);
      } else {
        setError('Legal advisor not found');
      }
    } catch (err) {
      setError('Failed to load legal advisor');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/counsel-contacts?legal_advisor_id=${id}`);
      const result: ApiResponse<CounselContact[]> = await response.json();

      if (result.success && result.data) {
        setContacts(result.data);
      }
    } catch (err) {
      console.error('Failed to load contacts');
    }
  };

  const fetchDeals = async () => {
    if (!id) return;
    try {
      const response = await getLegalAdvisorDeals(id);

      if (response.success && response.data) {
        setDeals(response.data);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };

  const handleUpdate = async (formData: LegalAdvisorFormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-advisors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<LegalAdvisor> = await response.json();

      if (result.success) {
        setAdvisor(result.data!);
        setIsEditing(false);
      } else {
        alert('Failed to update legal advisor');
      }
    } catch (err) {
      alert('Failed to update legal advisor');
    }
  };

  const handleToggleStar = async () => {
    if (!id) return;

    try {
      const response = await toggleLegalAdvisorStar(id);

      if (response.success && response.data) {
        setAdvisor(response.data);
      } else {
        alert(response.message || 'Failed to toggle star');
      }
    } catch (err) {
      alert('Failed to toggle star');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this legal advisor? This will also delete all associated contacts.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-advisors/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        navigate('/counsel/legal-advisors');
      } else {
        alert('Failed to delete legal advisor');
      }
    } catch (err) {
      alert('Failed to delete legal advisor');
    }
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!selectedMeeting) return;
    await updateCounselMeetingNote(selectedMeeting.contact.id, meetingId, data);
    // Refresh contacts to get updated meeting history
    await fetchContacts();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!selectedMeeting) return;
    await deleteCounselMeetingNote(selectedMeeting.contact.id, meetingId);
    // Refresh contacts
    await fetchContacts();
    setSelectedMeeting(null);
  };

  const handleMeetingClick = (meeting: MeetingHistoryEntry, contact: CounselContact) => {
    setSelectedMeeting({ meeting, contact });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !advisor) {
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
          <h1 className="text-3xl font-bold text-gray-900">{advisor.name}</h1>
          <p className="text-gray-600 mt-1">{advisor.country} • {contacts.length} contact(s)</p>
        </div>
        <div className="flex gap-3">
          {!isEditing && (
            <>
              <button
                onClick={handleToggleStar}
                className={`px-4 py-2 rounded-md transition-colors ${
                  advisor.starred
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={advisor.starred ? 'Remove star' : 'Add star'}
              >
                {advisor.starred ? '★' : '☆'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Legal Advisor</h2>
          <LegalAdvisorForm
            initialData={advisor}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900">{advisor.country}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Headquarters</dt>
                <dd className="mt-1 text-sm text-gray-900">{advisor.headquarters_location || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      advisor.relationship === 'Strong'
                        ? 'bg-green-100 text-green-800'
                        : advisor.relationship === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : advisor.relationship === 'Developing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {advisor.relationship}
                  </span>
                </dd>
              </div>
            </dl>
            {advisor.notes && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{advisor.notes}</dd>
              </div>
            )}
          </div>

          {/* Counsel Preferences */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Counsel Preferences</h2>
            <CounselPreferencesGrid
              preferences={advisor.counsel_preferences}
              readonly={true}
              collapsible={true}
            />
          </div>

          {/* Contacts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Contacts ({contacts.length})</h2>
            </div>
            {contacts.length === 0 ? (
              <p className="text-gray-600">No contacts yet</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/counsel/contacts/${contact.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
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
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Related Deals */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Deals ({deals.length})</h2>

            {deals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No deals yet</p>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="block p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{deal.deal_name}</h3>
                          <span className={`px-2 py-1 text-xs rounded border font-medium ${DEAL_STATUS_COLORS[deal.status]}`}>
                            {DEAL_STATUS_LABELS[deal.status]}
                          </span>
                        </div>

                        {deal.project_name && deal.project_name !== deal.deal_name && (
                          <p className="text-sm text-gray-600 italic mb-1">
                            Project: {deal.project_name}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {deal.country && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {deal.country}
                            </span>
                          )}
                          {deal.sector && (
                            <span>• {deal.sector.replace(/_/g, ' ')}</span>
                          )}
                          {deal.closing_date && (
                            <span>• Closed: {formatDealDate(deal.closing_date)}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-gray-900">
                          {formatDealSize(deal.total_size, deal.currency)}
                        </div>
                        {deal.participants_count !== undefined && deal.participants_count > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {deal.participants_count} participant{deal.participants_count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Meeting History Across All Contacts */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Meeting History - All Contacts
              {(() => {
                const totalMeetings = contacts.reduce((sum, contact) =>
                  sum + (contact.meeting_history?.length || 0), 0
                );
                return ` (${totalMeetings})`;
              })()}
            </h2>

            {(() => {
              // Collect all meetings from all contacts
              const allMeetings: Array<{ meeting: MeetingHistoryEntry; contact: CounselContact }> = [];
              contacts.forEach(contact => {
                if (contact.meeting_history && contact.meeting_history.length > 0) {
                  contact.meeting_history.forEach(meeting => {
                    allMeetings.push({ meeting, contact });
                  });
                }
              });

              // Sort by date (most recent first)
              allMeetings.sort((a, b) =>
                new Date(b.meeting.date).getTime() - new Date(a.meeting.date).getTime()
              );

              if (allMeetings.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <p>No meetings recorded yet</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {allMeetings.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleMeetingClick(item.meeting, item.contact)}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(item.meeting.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs md:text-sm text-purple-600 font-medium">
                            with {item.contact.name} ({item.contact.role})
                          </span>
                        </div>
                        {item.meeting.next_follow_up && (
                          <span className="text-xs text-orange-600">
                            Follow-up: {new Date(item.meeting.next_follow_up).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.meeting.participants && (
                        <p className="text-xs text-gray-600 mb-1">
                          Participants: {item.meeting.participants}
                        </p>
                      )}
                      {item.meeting.assigned_to && item.meeting.assigned_to.length > 0 && (
                        <p className="text-xs text-blue-600 mb-1">
                          Assigned: {item.meeting.assigned_to.map(u => u.full_name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-24 overflow-hidden">
                        {item.meeting.notes}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-purple-600">Open full meeting details</p>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="counsel"
          meeting={selectedMeeting.meeting}
          contactName={selectedMeeting.contact.name}
          contactRole={selectedMeeting.contact.role}
          contactId={selectedMeeting.contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            advisor && { label: 'Legal Advisor', value: advisor.name },
            selectedMeeting.contact.email && { label: 'Email', value: selectedMeeting.contact.email },
            selectedMeeting.contact.phone && { label: 'Phone', value: selectedMeeting.contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}
    </div>
  );
};

export default LegalAdvisorDetail;
