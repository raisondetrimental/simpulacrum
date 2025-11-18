/**
 * Sponsor Meeting Notes Wizard
 * Step 1: Select or create Corporate
 * Step 2: Select or create Contact
 * Step 3: Edit contact/corporate details and add meeting notes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  SponsorContact,
  Corporate,
  ApiResponse,
  RELATIONSHIP_LEVELS,
  DISC_PROFILES,
  SponsorPreferences
} from '../../types/sponsors';
import SponsorPreferencesGrid from '../../components/features/sponsors/SponsorPreferencesGrid';
import { API_BASE_URL } from '../../config';
import { UserMultiSelect } from '../../components/ui/UserMultiSelect';

type Step = 'select-corporate' | 'select-contact' | 'edit-details';

const SponsorMeetingNotes: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('select-corporate');

  // Data lists
  const [allCorporates, setAllCorporates] = useState<Corporate[]>([]);
  const [allContacts, setAllContacts] = useState<SponsorContact[]>([]);

  // Selected entities
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [selectedContact, setSelectedContact] = useState<SponsorContact | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Corporate Form (inline creation)
  const [newCorporate, setNewCorporate] = useState({
    name: '',
    country: '',
    headquarters_location: '',
    relationship: 'Developing' as const,
    notes: '',
    investment_min: 0,
    investment_max: 0,
    currency: 'USD',
    infrastructure_types: {
      transport_infra: 'N',
      energy_infra: 'N'
    },
    regions: {
      us_market: 'N',
      emerging_markets: 'N',
      asia_em: 'N',
      africa_em: 'N',
      emea_em: 'N'
    }
  });

  // New Contact Form (inline creation)
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    relationship: 'Developing' as const,
    disc_profile: '',
    contact_notes: ''
  });

  // Meeting Note
  const [meetingNote, setMeetingNote] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    participants: '',
    next_follow_up: '',
    assigned_user_ids: [] as string[]
  });

  // Step 3: Editable contact/corporate data
  const [newContactRelationship, setNewContactRelationship] = useState<'Strong' | 'Medium' | 'Developing' | 'Cold'>('Developing');
  const [newDiscProfile, setNewDiscProfile] = useState('');
  const [newCorporateRelationship, setNewCorporateRelationship] = useState<'Strong' | 'Medium' | 'Developing' | 'Cold'>('Developing');
  const [investmentMin, setInvestmentMin] = useState(0);
  const [investmentMax, setInvestmentMax] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [infrastructureTypes, setInfrastructureTypes] = useState({
    transport_infra: 'N',
    energy_infra: 'N'
  });
  const [regions, setRegions] = useState({
    us_market: 'N',
    emerging_markets: 'N',
    asia_em: 'N',
    africa_em: 'N',
    emea_em: 'N'
  });

  // UI states
  const [showNewCorporateForm, setShowNewCorporateForm] = useState(false);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [searchCorporate, setSearchCorporate] = useState('');
  const [searchContact, setSearchContact] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-select corporate if org query parameter is provided
  useEffect(() => {
    const orgId = searchParams.get('org');
    if (orgId && allCorporates.length > 0 && !selectedCorporate) {
      const corporate = allCorporates.find(corp => corp.id === orgId);
      if (corporate) {
        setSelectedCorporate(corporate);
        setCurrentStep('select-contact');
      }
    }
  }, [searchParams, allCorporates, selectedCorporate]);

  // Auto-select contact and corporate if contact query parameter is provided
  useEffect(() => {
    const contactId = searchParams.get('contact');
    const meetingId = searchParams.get('meeting');

    if (contactId && allContacts.length > 0 && allCorporates.length > 0) {
      const contact = allContacts.find(c => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        const corporate = allCorporates.find(corp => corp.id === contact.corporate_id);
        if (corporate) {
          setSelectedCorporate(corporate);

          // If meeting ID is provided, pre-fill the meeting form for editing
          if (meetingId && contact.meeting_history) {
            const existingMeeting = contact.meeting_history.find(m => m.id === meetingId);
            if (existingMeeting) {
              setEditingMeetingId(meetingId);
              setMeetingNote({
                date: existingMeeting.date.split('T')[0],
                notes: existingMeeting.notes || '',
                participants: existingMeeting.participants || '',
                next_follow_up: existingMeeting.next_follow_up || '',
                assigned_user_ids: existingMeeting.assigned_to?.map(u => u.user_id) || []
              });
            }
          }

          setCurrentStep('edit-details');
        }
      }
    }
  }, [searchParams, allContacts, allCorporates]);

  // Initialize Step 3 form values when contact and corporate are selected
  useEffect(() => {
    if (selectedContact && selectedCorporate) {
      setNewContactRelationship(selectedContact.relationship);
      setNewDiscProfile(selectedContact.disc_profile);
      setNewCorporateRelationship(selectedCorporate.relationship);
      setInvestmentMin(selectedCorporate.investment_min);
      setInvestmentMax(selectedCorporate.investment_max);
      setCurrency(selectedCorporate.currency);
      setInfrastructureTypes(selectedCorporate.infrastructure_types);
      setRegions(selectedCorporate.regions);
    }
  }, [selectedContact, selectedCorporate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [corporatesRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/corporates`),
        fetch(`${API_BASE_URL}/api/sponsor-contacts`)
      ]);

      const corporatesResult: ApiResponse<Corporate[]> = await corporatesRes.json();
      const contactsResult: ApiResponse<SponsorContact[]> = await contactsRes.json();

      if (corporatesResult.success) setAllCorporates(corporatesResult.data || []);
      if (contactsResult.success) setAllContacts(contactsResult.data || []);

      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCorporate = async () => {
    if (!newCorporate.name.trim() || !newCorporate.country.trim()) {
      alert('Please enter corporate name and country');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/corporates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCorporate)
      });

      const result: ApiResponse<Corporate> = await response.json();

      if (result.success && result.data) {
        setSelectedCorporate(result.data);
        setAllCorporates([...allCorporates, result.data]);
        setShowNewCorporateForm(false);
        setCurrentStep('select-contact');
        // Reset form
        setNewCorporate({
          name: '',
          country: '',
          headquarters_location: '',
          relationship: 'Developing',
          notes: '',
          investment_min: 0,
          investment_max: 0,
          currency: 'USD',
          infrastructure_types: {
            transport_infra: 'N',
            energy_infra: 'N'
          },
          regions: {
            us_market: 'N',
            emerging_markets: 'N',
            asia_em: 'N',
            africa_em: 'N',
            emea_em: 'N'
          }
        });
      } else {
        alert(result.message || 'Failed to create corporate');
      }
    } catch (err) {
      alert('Failed to create corporate');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.name.trim() || !newContact.role.trim() || !newContact.email.trim()) {
      alert('Please enter name, role, and email');
      return;
    }

    if (!selectedCorporate) {
      alert('No corporate selected');
      return;
    }

    setLoading(true);
    try {
      const contactData = {
        ...newContact,
        corporate_id: selectedCorporate.id
      };

      const response = await fetch(`${API_BASE_URL}/api/sponsor-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });

      const result: ApiResponse<SponsorContact> = await response.json();

      if (result.success && result.data) {
        setSelectedContact(result.data);
        setAllContacts([...allContacts, result.data]);
        setShowNewContactForm(false);
        setCurrentStep('edit-details');

        // Initialize Step 3 form values
        setNewContactRelationship(result.data.relationship);
        setNewDiscProfile(result.data.disc_profile);
        setNewCorporateRelationship(selectedCorporate.relationship);
        setInvestmentMin(selectedCorporate.investment_min);
        setInvestmentMax(selectedCorporate.investment_max);
        setCurrency(selectedCorporate.currency);
        setInfrastructureTypes(selectedCorporate.infrastructure_types);
        setRegions(selectedCorporate.regions);

        // Reset form
        setNewContact({
          name: '',
          role: '',
          email: '',
          phone: '',
          linkedin: '',
          relationship: 'Developing',
          disc_profile: '',
          contact_notes: ''
        });
      } else {
        alert(result.message || 'Failed to create contact');
      }
    } catch (err) {
      alert('Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingContact = (contact: SponsorContact) => {
    setSelectedContact(contact);
    setCurrentStep('edit-details');
  };

  const handleSaveMeeting = async () => {
    if (!meetingNote.notes.trim()) {
      alert('Please enter meeting notes');
      return;
    }

    if (!selectedContact) {
      alert('No contact selected');
      return;
    }

    setSaving(true);
    try {
      let result: ApiResponse<any>;

      if (editingMeetingId) {
        // Update existing meeting
        const updatePayload = {
          notes: meetingNote.notes,
          participants: meetingNote.participants,
          next_follow_up: meetingNote.next_follow_up || null,
          assigned_user_ids: meetingNote.assigned_user_ids
        };

        const meetingResponse = await fetch(
          `${API_BASE_URL}/api/sponsor-contacts/${selectedContact.id}/meetings/${editingMeetingId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatePayload)
          }
        );

        result = await meetingResponse.json();

        // Also update contact/corporate details if they were changed
        if (result.success) {
          const contactUpdateResponse = await fetch(
            `${API_BASE_URL}/api/sponsor-contacts/${selectedContact.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                relationship: newContactRelationship,
                disc_profile: newDiscProfile
              })
            }
          );
          await contactUpdateResponse.json();

          if (selectedCorporate) {
            const corporateUpdateResponse = await fetch(
              `${API_BASE_URL}/api/corporates/${selectedCorporate.id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  relationship: newCorporateRelationship,
                  investment_min: investmentMin,
                  investment_max: investmentMax,
                  currency: currency,
                  infrastructure_types: infrastructureTypes,
                  regions: regions
                })
              }
            );
            await corporateUpdateResponse.json();
          }
        }
      } else {
        // Create new meeting (original behavior)
        const payload = {
          contact_id: selectedContact.id,
          contact_updates: {
            relationship: newContactRelationship,
            disc_profile: newDiscProfile
          },
          corporate_updates: {
            relationship: newCorporateRelationship,
            investment_min: investmentMin,
            investment_max: investmentMax,
            currency: currency,
            infrastructure_types: infrastructureTypes,
            regions: regions
          },
          meeting_note: {
            notes: meetingNote.notes,
            participants: meetingNote.participants,
            next_follow_up: meetingNote.next_follow_up || null,
            assigned_user_ids: meetingNote.assigned_user_ids
          }
        };

        const response = await fetch(`${API_BASE_URL}/api/sponsor-meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        result = await response.json();
      }

      if (result.success) {
        setSuccessMessage(editingMeetingId ? 'Meeting updated successfully!' : 'Meeting saved successfully!');
        setTimeout(() => {
          navigate(`/sponsors/contacts/${selectedContact.id}`);
        }, 1500);
      } else {
        setError(result.message || 'Failed to save meeting');
      }
    } catch (err) {
      setError('Failed to save meeting');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedCorporate(null);
    setSelectedContact(null);
    setCurrentStep('select-corporate');
    setMeetingNote({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      participants: '',
      next_follow_up: '',
      assigned_user_ids: []
    });
  };

  const handlePreferencesChange = (preferences: Partial<SponsorPreferences>) => {
    setInfrastructureTypes({
      transport_infra: preferences.transport_infra || 'N',
      energy_infra: preferences.energy_infra || 'N'
    });
    setRegions({
      us_market: preferences.us_market || 'N',
      emerging_markets: preferences.emerging_markets || 'N',
      asia_em: preferences.asia_em || 'N',
      africa_em: preferences.africa_em || 'N',
      emea_em: preferences.emea_em || 'N'
    });
  };

  // Filter logic
  const filteredCorporates = allCorporates.filter(corp =>
    corp.name.toLowerCase().includes(searchCorporate.toLowerCase()) ||
    corp.country.toLowerCase().includes(searchCorporate.toLowerCase())
  );

  const filteredContacts = allContacts
    .filter(c => c.corporate_id === selectedCorporate?.id)
    .filter(c =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.role.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.email.toLowerCase().includes(searchContact.toLowerCase())
    );

  if (loading && allCorporates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Sponsor Meeting</h1>
          <p className="text-gray-600 mt-1">Select or create a corporate and contact to start</p>
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
          <div className={`flex items-center gap-2 ${currentStep === 'select-corporate' ? 'text-green-600 font-semibold' : selectedCorporate ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-corporate' ? 'bg-green-600 text-white' : selectedCorporate ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span>Select Corporate</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${currentStep === 'select-contact' ? 'text-green-600 font-semibold' : selectedContact ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-contact' ? 'bg-green-600 text-white' : selectedContact ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span>Select Contact</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${currentStep === 'edit-details' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'edit-details' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span>Meeting Details</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select or Create Corporate */}
      {currentStep === 'select-corporate' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Step 1: Select Corporate</h2>
            <button
              onClick={() => setShowNewCorporateForm(!showNewCorporateForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              {showNewCorporateForm ? 'Cancel' : '+ New Corporate'}
            </button>
          </div>

          {showNewCorporateForm ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Create New Corporate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corporate Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCorporate.name}
                    onChange={(e) => setNewCorporate({ ...newCorporate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ABC Infrastructure Fund"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCorporate.country}
                    onChange={(e) => setNewCorporate({ ...newCorporate, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters Location</label>
                  <input
                    type="text"
                    value={newCorporate.headquarters_location}
                    onChange={(e) => setNewCorporate({ ...newCorporate, headquarters_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={newCorporate.relationship}
                    onChange={(e) => setNewCorporate({ ...newCorporate, relationship: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {RELATIONSHIP_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateCorporate}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Corporate & Continue'}
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={searchCorporate}
                onChange={(e) => setSearchCorporate(e.target.value)}
                placeholder="Search corporates..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCorporates.map(corporate => {
                  const contactCount = allContacts.filter(c => c.corporate_id === corporate.id).length;
                  return (
                    <button
                      key={corporate.id}
                      onClick={() => {
                        setSelectedCorporate(corporate);
                        setCurrentStep('select-contact');
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-300 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{corporate.name}</div>
                      <div className="text-sm text-gray-600">{corporate.country} • {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2: Select or Create Contact */}
      {currentStep === 'select-contact' && selectedCorporate && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Selected Corporate: <span className="font-semibold text-gray-900">{selectedCorporate.name}</span>
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Step 2: Select Contact</h2>
            <button
              onClick={() => setShowNewContactForm(!showNewContactForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Managing Director"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="john.smith@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={newContact.linkedin}
                    onChange={(e) => setNewContact({ ...newContact, linkedin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://linkedin.com/in/..."
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
                  <p className="text-center text-gray-500 py-8">No contacts for this corporate. Create a new one above.</p>
                ) : (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectExistingContact(contact)}
                      className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{contact.name}</div>
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
                      </div>
                      <div className="text-sm text-gray-600">{contact.role}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3: Edit Details & Add Meeting Notes */}
      {currentStep === 'edit-details' && selectedContact && selectedCorporate && (
        <div className="space-y-6">
          {/* Context Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Meeting with: <span className="font-semibold text-gray-900">{selectedContact.name}</span> at <span className="font-semibold text-gray-900">{selectedCorporate.name}</span>
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={newContactRelationship}
                  onChange={(e) => setNewContactRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {RELATIONSHIP_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DISC Profile</label>
                <select
                  value={newDiscProfile}
                  onChange={(e) => setNewDiscProfile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {DISC_PROFILES.map(profile => (
                    <option key={profile} value={profile}>{profile || 'Not Set'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Corporate Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Corporate Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={newCorporateRelationship}
                  onChange={(e) => setNewCorporateRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {RELATIONSHIP_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Investment Parameters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Investment Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment ($M)</label>
                <input
                  type="number"
                  value={investmentMin}
                  onChange={(e) => setInvestmentMin(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Investment ($M)</label>
                <input
                  type="number"
                  value={investmentMax}
                  onChange={(e) => setInvestmentMax(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="USD"
                />
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Investment Preferences</h2>
            <SponsorPreferencesGrid
              preferences={{
                ...infrastructureTypes,
                ...regions
              }}
              onChange={handlePreferencesChange}
              readonly={false}
              collapsible={true}
            />
          </div>

          {/* Meeting History (Conditional) */}
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(meeting.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {meeting.created_by && (
                            <span className="text-xs text-gray-500">
                              by {meeting.created_by.full_name || meeting.created_by.username}
                            </span>
                          )}
                        </div>
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

          {/* Meeting Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Meeting Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={meetingNote.date}
                  onChange={(e) => setMeetingNote({ ...meetingNote, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What was discussed during the meeting..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <input
                  type="text"
                  value={meetingNote.participants}
                  onChange={(e) => setMeetingNote({ ...meetingNote, participants: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John Smith, Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={meetingNote.next_follow_up}
                  onChange={(e) => setMeetingNote({ ...meetingNote, next_follow_up: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <UserMultiSelect
                  selectedUserIds={meetingNote.assigned_user_ids}
                  onChange={(userIds) => setMeetingNote({ ...meetingNote, assigned_user_ids: userIds })}
                  label="Assign Follow-up To"
                  placeholder="Select users for follow-up..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Assign this meeting to specific users for tracking
                </p>
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

export default SponsorMeetingNotes;