/**
 * Meeting Notes - Standalone Entry Page
 * Step 1: Select or create Capital Partner
 * Step 2: Select or create Contact
 * Step 3: Edit contact info and add meeting notes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Contact,
  CapitalPartner,
  ApiResponse,
  RELATIONSHIP_LEVELS,
  ORGANIZATION_TYPES,
  DISC_PROFILES
} from '../../types/liquidity';
import { API_BASE_URL } from '../../config';

type Step = 'select-partner' | 'select-contact' | 'edit-details';

const MeetingNotesNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('select-partner');

  // Data lists
  const [allPartners, setAllPartners] = useState<CapitalPartner[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  // Selected/Created entities
  const [selectedPartner, setSelectedPartner] = useState<CapitalPartner | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Partner Form
  const [newPartner, setNewPartner] = useState({
    name: '',
    type: 'Asset Manager',
    country: '',
    headquarters_location: '',
    relationship: 'Developing' as const,
    notes: ''
  });

  // New Contact Form
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    relationship: 'Developing' as const,
    disc_profile: '',
    contact_notes: '',
    team_name: ''
  });

  // Meeting Note
  const [meetingNote, setMeetingNote] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    participants: '',
    next_follow_up: ''
  });

  // UI states
  const [showNewPartnerForm, setShowNewPartnerForm] = useState(false);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [searchPartner, setSearchPartner] = useState('');
  const [searchContact, setSearchContact] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-select partner if org query parameter is provided
  useEffect(() => {
    const orgId = searchParams.get('org');
    if (orgId && allPartners.length > 0 && !selectedPartner) {
      const partner = allPartners.find(p => p.id === orgId);
      if (partner) {
        setSelectedPartner(partner);
        setCurrentStep('select-contact');
      }
    }
  }, [searchParams, allPartners, selectedPartner]);

  // Auto-select contact and partner if contact query parameter is provided
  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && allContacts.length > 0 && allPartners.length > 0) {
      const contact = allContacts.find(c => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        const partner = allPartners.find(p => p.id === contact.capital_partner_id);
        if (partner) {
          setSelectedPartner(partner);
          // Pre-populate edit form
          setNewContact({
            name: contact.name,
            role: contact.role,
            email: contact.email || '',
            phone: contact.phone || '',
            linkedin: contact.linkedin || '',
            relationship: contact.relationship,
            disc_profile: contact.disc_profile || '',
            contact_notes: contact.contact_notes || '',
            team_name: contact.team_name || ''
          });
          setCurrentStep('edit-details');
        }
      }
    }
  }, [searchParams, allContacts, allPartners]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [partnersRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/capital-partners`),
        fetch(`${API_BASE_URL}/api/contacts-new`)
      ]);

      const partnersResult: ApiResponse<CapitalPartner[]> = await partnersRes.json();
      const contactsResult: ApiResponse<Contact[]> = await contactsRes.json();

      if (partnersResult.success) setAllPartners(partnersResult.data || []);
      if (contactsResult.success) setAllContacts(contactsResult.data || []);

      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async () => {
    if (!newPartner.name.trim()) {
      alert('Please enter partner name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/capital-partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // REQUIRED: Send session cookie for authentication
        body: JSON.stringify(newPartner)
      });

      const result: ApiResponse<CapitalPartner> = await response.json();

      if (result.success && result.data) {
        setSelectedPartner(result.data);
        setAllPartners([...allPartners, result.data]);
        setShowNewPartnerForm(false);
        setCurrentStep('select-contact');
        setNewPartner({
          name: '',
          type: 'Asset Manager',
          country: '',
          headquarters_location: '',
          relationship: 'Developing',
          notes: ''
        });
      } else {
        setError(result.message || 'Failed to create partner');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.name.trim()) {
      alert('Please enter contact name');
      return;
    }

    if (!selectedPartner) {
      alert('No partner selected');
      return;
    }

    setLoading(true);
    try {
      const contactPayload = {
        ...newContact,
        capital_partner_id: selectedPartner.id
      };

      const contactResponse = await fetch(`${API_BASE_URL}/api/contacts-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // REQUIRED: Send session cookie for authentication
        body: JSON.stringify(contactPayload)
      });

      const contactResult: ApiResponse<Contact> = await contactResponse.json();

      if (contactResult.success && contactResult.data) {
        setSelectedContact(contactResult.data);
        setAllContacts([...allContacts, contactResult.data]);
        setShowNewContactForm(false);
        setCurrentStep('edit-details');
      } else {
        setError(contactResult.message || 'Failed to create contact');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingContact = async (contact: Contact) => {
    setSelectedContact(contact);

    // Pre-populate edit form
    setNewContact({
      name: contact.name,
      role: contact.role,
      email: contact.email || '',
      phone: contact.phone || '',
      linkedin: contact.linkedin || '',
      relationship: contact.relationship,
      disc_profile: contact.disc_profile || '',
      contact_notes: contact.contact_notes || '',
      team_name: contact.team_name || ''
    });

    setCurrentStep('edit-details');
  };

  const handleSaveMeeting = async () => {
    if (!selectedContact) {
      alert('No contact selected');
      return;
    }

    if (!meetingNote.notes.trim()) {
      alert('Please enter meeting notes');
      return;
    }

    setSaving(true);
    try {
      // Add meeting note (this also updates contact)
      const meetingPayload = {
        contact_id: selectedContact.id,
        contact_updates: newContact,
        meeting_note: meetingNote
      };

      const meetingResponse = await fetch(`${API_BASE_URL}/api/meeting-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // REQUIRED: Send session cookie for authentication
        body: JSON.stringify(meetingPayload)
      });

      const meetingResult: ApiResponse<Contact> = await meetingResponse.json();

      if (meetingResult.success) {
        setSuccessMessage('Meeting saved successfully!');
        setTimeout(() => {
          navigate(`/liquidity/contacts/${selectedContact.id}`);
        }, 2000);
      } else {
        setError('Failed to save meeting');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('select-partner');
    setSelectedPartner(null);
    setSelectedContact(null);
    setShowNewPartnerForm(false);
    setShowNewContactForm(false);
    setMeetingNote({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      participants: '',
      next_follow_up: ''
    });
  };

  // Filter logic
  const filteredPartners = allPartners.filter(p =>
    p.name.toLowerCase().includes(searchPartner.toLowerCase()) ||
    p.country.toLowerCase().includes(searchPartner.toLowerCase())
  );

  const filteredContacts = allContacts
    .filter(c => c.capital_partner_id === selectedPartner?.id)
    .filter(c =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.role.toLowerCase().includes(searchContact.toLowerCase())
    );

  if (loading && allPartners.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Notes</h1>
          <p className="text-gray-600 mt-1">Select or create a partner and contact to start</p>
        </div>
        <button
          onClick={handleReset}
          className="text-gray-600 hover:text-gray-900"
        >
          Reset
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${currentStep === 'select-partner' ? 'text-blue-600 font-semibold' : selectedPartner ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-partner' ? 'bg-blue-600 text-white' : selectedPartner ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span>Select Partner</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${currentStep === 'select-contact' ? 'text-blue-600 font-semibold' : selectedContact ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-contact' ? 'bg-blue-600 text-white' : selectedContact ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span>Select Contact</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${currentStep === 'edit-details' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'edit-details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span>Meeting Details</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select or Create Partner */}
      {currentStep === 'select-partner' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Step 1: Select Capital Partner</h2>
            <button
              onClick={() => setShowNewPartnerForm(!showNewPartnerForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {showNewPartnerForm ? 'Cancel' : '+ New Partner'}
            </button>
          </div>

          {showNewPartnerForm ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Create New Capital Partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="BlackRock"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newPartner.type}
                    onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {ORGANIZATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={newPartner.country}
                    onChange={(e) => setNewPartner({ ...newPartner, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={newPartner.relationship}
                    onChange={(e) => setNewPartner({ ...newPartner, relationship: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {RELATIONSHIP_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreatePartner}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Partner & Continue'}
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={searchPartner}
                onChange={(e) => setSearchPartner(e.target.value)}
                placeholder="Search partners..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPartners.map(partner => (
                  <button
                    key={partner.id}
                    onClick={() => {
                      setSelectedPartner(partner);
                      setCurrentStep('select-contact');
                    }}
                    className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{partner.name}</div>
                    <div className="text-sm text-gray-600">{partner.type} • {partner.country}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2: Select or Create Contact */}
      {currentStep === 'select-contact' && selectedPartner && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Selected Partner: <span className="font-semibold text-gray-900">{selectedPartner.name}</span>
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Step 2: Select Contact</h2>
            <button
              onClick={() => setShowNewContactForm(!showNewContactForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {showNewContactForm ? 'Cancel' : '+ New Contact'}
            </button>
          </div>

          {showNewContactForm ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Create New Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Managing Director"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={newContact.team_name}
                    onChange={(e) => setNewContact({ ...newContact, team_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Infrastructure Team, Asia Desk..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateContact}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Contact & Continue'}
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Search contacts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No contacts for this partner. Create a new one above.</p>
                ) : (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectExistingContact(contact)}
                      className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.role} • {contact.email}</div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3: Edit Details & Add Meeting Notes */}
      {currentStep === 'edit-details' && selectedContact && selectedPartner && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Meeting with: <span className="font-semibold text-gray-900">{selectedContact.name}</span> at <span className="font-semibold text-gray-900">{selectedPartner.name}</span>
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newContact.team_name}
                  onChange={(e) => setNewContact({ ...newContact, team_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Infrastructure Team, Asia Desk..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={newContact.linkedin}
                  onChange={(e) => setNewContact({ ...newContact, linkedin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {RELATIONSHIP_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DISC Profile</label>
                <select
                  value={newContact.disc_profile}
                  onChange={(e) => setNewContact({ ...newContact, disc_profile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {DISC_PROFILES.map(profile => (
                    <option key={profile} value={profile}>{profile || 'Not Set'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Meeting History (Read-only) */}
          {selectedContact.meeting_history && selectedContact.meeting_history.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">
                Previous Meetings ({selectedContact.meeting_history.length})
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedContact.meeting_history
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((meeting, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(meeting.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {meeting.participants && (
                          <span className="text-xs text-gray-600">
                            Participants: {meeting.participants}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.notes}</p>
                      {meeting.next_follow_up && (
                        <p className="text-xs text-orange-600 mt-2">
                          Follow-up scheduled: {new Date(meeting.next_follow_up).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Today's Meeting Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {selectedContact.meeting_history && selectedContact.meeting_history.length > 0
                ? 'New Meeting Notes'
                : 'Meeting Notes'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={meetingNote.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setMeetingNote({ ...meetingNote, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={meetingNote.notes}
                  onChange={(e) => setMeetingNote({ ...meetingNote, notes: e.target.value })}
                  rows={25}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="What was discussed during the meeting..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <input
                  type="text"
                  value={meetingNote.participants}
                  onChange={(e) => setMeetingNote({ ...meetingNote, participants: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="John Smith, Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={meetingNote.next_follow_up}
                  onChange={(e) => setMeetingNote({ ...meetingNote, next_follow_up: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMeeting}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Meeting'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingNotesNew;