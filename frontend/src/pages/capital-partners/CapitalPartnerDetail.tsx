/**
 * Capital Partner Detail/Edit Page
 * View and edit a specific capital partner
 * Shows investment preferences and contacts list
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CapitalPartner, Contact, ApiResponse, MeetingHistoryEntry } from '../../types/liquidity';
import CapitalPartnerForm from '../../components/features/capital-partners/CapitalPartnerForm';
import PreferencesGrid from '../../components/features/capital-partners/PreferencesGrid';
import MeetingDetailsModal from '../../components/ui/MeetingDetailsModal';
import { API_BASE_URL } from '../../config';
import { getCapitalPartnerDeals } from '../../services/dealsService';
import { Deal, formatDealSize, formatDealDate, DEAL_STATUS_COLORS, DEAL_STATUS_LABELS } from '../../types/deals';
import { updateMeetingNote, deleteMeetingNote, toggleCapitalPartnerStar } from '../../services/capitalPartnersService';

const CapitalPartnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<CapitalPartner | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<{ meeting: MeetingHistoryEntry; contact: Contact } | null>(null);

  useEffect(() => {
    if (id === 'new') {
      setIsEditing(true);
      setLoading(false);
    } else {
      fetchPartner();
      fetchContacts();
      fetchDeals();
    }
  }, [id]);

  const fetchPartner = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/capital-partners/${id}`);
      const result: ApiResponse<CapitalPartner> = await response.json();

      if (result.success && result.data) {
        setPartner(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load capital partner');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts-new?capital_partner_id=${id}`);
      const result: ApiResponse<Contact[]> = await response.json();

      if (result.success && result.data) {
        setContacts(result.data);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const fetchDeals = async () => {
    if (!id) return;
    try {
      const response = await getCapitalPartnerDeals(id);

      if (response.success && response.data) {
        setDeals(response.data);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };

  const handleSave = async (formData: Partial<CapitalPartner>) => {
    try {
      const url = id === 'new'
        ? `${API_BASE_URL}/api/capital-partners`
        : `${API_BASE_URL}/api/capital-partners/${id}`;

      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result: ApiResponse<CapitalPartner> = await response.json();

      if (result.success && result.data) {
        if (id === 'new') {
          navigate(`/liquidity/capital-partners/${result.data.id}`);
        } else {
          setPartner(result.data);
          setIsEditing(false);
        }
        setError(null);
      } else {
        setError(result.message || 'Failed to save capital partner');
      }
    } catch (err) {
      setError('Failed to connect to API');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/capital-partners/${id}`, {
        method: 'DELETE'
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        navigate('/liquidity/capital-partners');
      } else {
        setError(result.message || 'Failed to delete capital partner');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleStar = async () => {
    if (!id || id === 'new') return;

    try {
      const response = await toggleCapitalPartnerStar(id);

      if (response.success && response.data) {
        setPartner(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to toggle star');
      }
    } catch (err) {
      setError('Failed to toggle star');
    }
  };

  const handleUpdateMeeting = async (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => {
    if (!selectedMeeting) return;
    await updateMeetingNote(selectedMeeting.contact.id, meetingId, data);
    // Refresh contacts to get updated meeting history
    await fetchContacts();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!selectedMeeting) return;
    await deleteMeetingNote(selectedMeeting.contact.id, meetingId);
    // Refresh contacts
    await fetchContacts();
    setSelectedMeeting(null);
  };

  const handleMeetingClick = (meeting: MeetingHistoryEntry, contact: Contact) => {
    setSelectedMeeting({ meeting, contact });
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
          onClick={() => navigate('/liquidity/capital-partners')}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Back to List
        </button>
      </div>
    );
  }

  // New partner form
  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/liquidity/capital-partners')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add Capital Partner</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <CapitalPartnerForm
            onSave={handleSave}
            onCancel={() => navigate('/liquidity/capital-partners')}
          />
        </div>
      </div>
    );
  }

  // Existing partner view/edit
  if (!partner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Capital partner not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/liquidity/capital-partners')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
            <p className="text-gray-600 mt-1">
              {partner.type} • {partner.country}
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleToggleStar}
              className={`px-4 py-2 rounded-md transition-colors ${
                partner.starred
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={partner.starred ? 'Remove star' : 'Add star'}
            >
              {partner.starred ? '★' : '☆'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
          <CapitalPartnerForm
            initialData={partner}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Partner Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <p className="text-gray-900">{partner.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <p className="text-gray-900">{partner.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <p className="text-gray-900">{partner.country}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headquarters Location
                </label>
                <p className="text-gray-900">{partner.headquarters_location || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    partner.relationship === 'Strong'
                      ? 'bg-green-100 text-green-800'
                      : partner.relationship === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : partner.relationship === 'Developing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {partner.relationship}
                </span>
              </div>
            </div>

            {partner.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{partner.notes}</p>
              </div>
            )}
          </div>

          {/* Investment Range */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Investment Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum
                </label>
                <p className="text-gray-900">
                  ${(partner.investment_min / 1000000).toFixed(0)}M {partner.currency}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum
                </label>
                <p className="text-gray-900">
                  ${(partner.investment_max / 1000000).toFixed(0)}M {partner.currency}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <p className="text-gray-900">{partner.currency}</p>
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Investment Preferences</h2>
            <PreferencesGrid preferences={partner.preferences} readonly={true} />
          </div>

          {/* Contacts List */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Contacts ({contacts.length})</h2>
              <Link
                to={`/liquidity/contacts/new?capital_partner_id=${partner.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                + Add Contact
              </Link>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No contacts yet</p>
                <Link
                  to={`/liquidity/contacts/new?capital_partner_id=${partner.id}`}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add the first contact
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/liquidity/contacts/${contact.id}`}
                    className="block p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
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
                        <p className="text-sm text-gray-600 mt-1">{contact.role}</p>
                        {contact.team_name && (
                          <p className="text-xs text-gray-500 mt-1">Team: {contact.team_name}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {contact.email && <span>{contact.email}</span>}
                          {contact.phone && <span>{contact.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
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
              const allMeetings: Array<{ meeting: MeetingHistoryEntry; contact: Contact }> = [];
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
                      className="w-full text-left border border-gray-200 rounded-md p-4 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(item.meeting.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs md:text-sm text-blue-600 font-medium">
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
                      <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-24 overflow-hidden">
                        {item.meeting.notes}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-blue-600">Open full meeting details</p>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
            <p>Created: {new Date(partner.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(partner.last_updated).toLocaleString()}</p>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Delete Capital Partner?
            </h3>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <strong>{partner.name}</strong>?
            </p>
            <p className="text-red-600 font-semibold mb-4">
              Warning: This will also delete all {contacts.length} contact(s)!
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

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          module="liquidity"
          meeting={selectedMeeting.meeting}
          contactName={selectedMeeting.contact.name}
          contactRole={selectedMeeting.contact.role}
          contactId={selectedMeeting.contact.id}
          onUpdate={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
          context={[
            partner && { label: 'Capital Partner', value: partner.name },
            selectedMeeting.contact.team_name && { label: 'Team', value: selectedMeeting.contact.team_name },
            selectedMeeting.contact.email && { label: 'Email', value: selectedMeeting.contact.email },
            selectedMeeting.contact.phone && { label: 'Phone', value: selectedMeeting.contact.phone },
          ].filter(Boolean) as Array<{ label: string; value: string }>}
        />
      )}
    </div>
  );
};

export default CapitalPartnerDetail;
