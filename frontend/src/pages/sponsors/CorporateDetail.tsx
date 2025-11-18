/**
 * Corporate Detail Page
 * View and edit corporate details with contacts list
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Corporate, SponsorContact, SponsorContactFormData, ApiResponse, MeetingHistoryEntry } from '../../types/sponsors';
import SponsorContactForm from '../../components/features/sponsors/SponsorContactForm';
import CorporateForm from '../../components/features/sponsors/CorporateForm';
import SponsorPreferencesGrid from '../../components/features/sponsors/SponsorPreferencesGrid';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { API_BASE_URL } from '../../config';
import { getCorporateDeals } from '../../services/dealsService';
import { Deal, formatDealSize, formatDealDate, DEAL_STATUS_COLORS, DEAL_STATUS_LABELS } from '../../types/deals';
import { updateSponsorMeetingNote, deleteSponsorMeetingNote, toggleCorporateStar } from '../../services/sponsorsService';

const CorporateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [corporate, setCorporate] = useState<Corporate | null>(null);
  const [contacts, setContacts] = useState<SponsorContact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [, setCreateContactStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<{ meeting: MeetingHistoryEntry; contact: SponsorContact } | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [corporateRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/corporates/${id}`),
        fetch(`${API_BASE_URL}/api/sponsor-contacts`)
      ]);

      const corporateResult: ApiResponse<Corporate> = await corporateRes.json();
      const contactsResult: ApiResponse<SponsorContact[]> = await contactsRes.json();

      if (corporateResult.success && corporateResult.data) {
        setCorporate(corporateResult.data);
      } else {
        setError('Corporate not found');
      }

      if (contactsResult.success) {
        const corporateContacts = contactsResult.data!.filter(c => c.corporate_id === id);
        setContacts(corporateContacts);
      }

      // Fetch deals
      await fetchDeals();
    } catch (err) {
      setError('Failed to load corporate details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    if (!id) return;
    try {
      const response = await getCorporateDeals(id);

      if (response.success && response.data) {
        setDeals(response.data);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };

  const handleSave = async (formData: Partial<Corporate>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/corporates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Corporate> = await response.json();

      if (result.success && result.data) {
        setCorporate(result.data);
        setIsEditing(false);
        setError(null);
      } else {
        setError(result.message || 'Failed to save corporate');
      }
    } catch (err) {
      setError('Failed to connect to API');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/corporates/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        navigate('/sponsors/corporates');
      } else {
        setError(result.message || 'Failed to delete corporate');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleStar = async () => {
    if (!id) return;

    try {
      const response = await toggleCorporateStar(id);

      if (response.success && response.data) {
        setCorporate({ ...response.data });
        setError(null);
      } else {
        setError(response.message || 'Failed to toggle star');
      }
    } catch (err) {
      setError('Failed to toggle star');
    }
  };

  const handleCreateContact = async (formData: SponsorContactFormData) => {
    setCreateContactStatus('saving');

    try {
      const response = await fetch(`${API_BASE_URL}/api/sponsor-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<SponsorContact> = await response.json();

      if (result.success && result.data) {
        setCreateContactStatus('success');
        setShowCreateContactModal(false);
        // Refresh contacts list
        await fetchData();
        setTimeout(() => setCreateContactStatus('idle'), 2000);
      } else {
        setCreateContactStatus('error');
        alert(result.message || 'Failed to create contact');
      }
    } catch (err) {
      setCreateContactStatus('error');
      alert('Failed to create contact');
    }
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!selectedMeeting) return;
    await updateSponsorMeetingNote(selectedMeeting.contact.id, meetingId, data);
    // Refresh contacts to get updated meeting history
    await fetchData();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!selectedMeeting) return;
    await deleteSponsorMeetingNote(selectedMeeting.contact.id, meetingId);
    // Refresh contacts
    await fetchData();
    setSelectedMeeting(null);
  };

  const handleMeetingClick = (meeting: MeetingHistoryEntry, contact: SponsorContact) => {
    setSelectedMeeting({ meeting, contact });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !corporate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error || 'Corporate not found'}</p>
        <Link to="/sponsors/corporates" className="mt-2 inline-block text-sm text-red-600 hover:text-red-800">
          ← Back to Corporates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{corporate.name}</h1>
            <p className="text-gray-600 mt-1">{contacts.length} contact(s)</p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleToggleStar}
              className={`px-4 py-2 rounded-md transition-colors ${
                corporate.starred
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={corporate.starred ? 'Remove star' : 'Add star'}
            >
              {corporate.starred ? '★' : '☆'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <CorporateForm
            initialData={corporate}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Corporate Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Corporate Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corporate Name
                </label>
                <p className="text-gray-900">{corporate.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <p className="text-gray-900">{corporate.country}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headquarters
                </label>
                <p className="text-gray-900">{corporate.headquarters_location}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Range
                </label>
                <p className="text-gray-900">
                  ${(corporate.investment_min / 1000000).toFixed(0)}M - $
                  {(corporate.investment_max / 1000000).toFixed(0)}M {corporate.currency}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <p className="text-gray-900">{corporate.currency}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    corporate.relationship === 'Strong'
                      ? 'bg-green-100 text-green-800'
                      : corporate.relationship === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : corporate.relationship === 'Developing'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {corporate.relationship}
                </span>
              </div>
            </div>

            {corporate.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{corporate.notes}</p>
              </div>
            )}
          </div>

          {/* Investment Preferences */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Investment Preferences</h2>
            <SponsorPreferencesGrid
              preferences={{
                ...corporate.infrastructure_types,
                ...corporate.regions
              }}
              readonly={true}
            />
          </div>

      {/* Contacts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Contacts ({contacts.length})</h2>
          <button
            onClick={() => setShowCreateContactModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            + Add Contact
          </button>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No contacts yet</p>
            <button
              onClick={() => setShowCreateContactModal(true)}
              className="mt-2 text-green-600 hover:text-green-800 text-sm"
            >
              Create first contact
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => (
              <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/sponsors/contacts/${contact.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-green-600"
                      >
                        {contact.name}
                      </Link>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.relationship === 'Strong'
                            ? 'bg-green-100 text-green-800'
                            : contact.relationship === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : contact.relationship === 'Developing'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contact.relationship}
                      </span>
                      {contact.disc_profile && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          DISC: {contact.disc_profile}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {contact.phone}
                        </span>
                      )}
                    </div>
                    {contact.next_contact_reminder && (
                      <p className="text-xs text-orange-600 mt-2">
                        Follow-up: {new Date(contact.next_contact_reminder).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/sponsors/meeting?contact=${contact.id}`}
                    className="ml-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Meeting Notes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

          {/* Related Deals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Related Deals ({deals.length})</h2>

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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
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
              const allMeetings: Array<{ meeting: MeetingHistoryEntry; contact: SponsorContact }> = [];
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
                      className="w-full text-left border border-gray-200 rounded-md p-4 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(item.meeting.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs md:text-sm text-orange-600 font-medium">
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
                      <p className="mt-3 text-xs font-semibold text-orange-600">Open full meeting details</p>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
            <p>Created: {new Date(corporate.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(corporate.last_updated).toLocaleString()}</p>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Delete Corporate?
            </h3>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <strong>{corporate.name}</strong>?
            </p>
            <p className="text-red-600 font-semibold mb-4">
              Warning: This will also delete all {contacts.length} contact(s) in this corporate!
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

      {/* Create Contact Modal */}
      {showCreateContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Contact</h2>
            </div>
            <div className="p-6">
              <SponsorContactForm
                corporateId={corporate.id}
                corporateName={corporate.name}
                onSave={handleCreateContact}
                onCancel={() => {
                  setShowCreateContactModal(false);
                  setCreateContactStatus('idle');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="sponsor"
          meeting={selectedMeeting.meeting}
          contactName={selectedMeeting.contact.name}
          contactRole={selectedMeeting.contact.role}
          contactId={selectedMeeting.contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            corporate && { label: 'Corporate', value: corporate.name },
            selectedMeeting.contact.email && { label: 'Email', value: selectedMeeting.contact.email },
            selectedMeeting.contact.phone && { label: 'Phone', value: selectedMeeting.contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}
    </div>
  );
};

export default CorporateDetail;
