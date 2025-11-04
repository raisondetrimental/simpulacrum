/**
 * Agent Meeting Notes Wizard
 * Step 1: Select or create Agent
 * Step 2: Select or create Contact
 * Step 3: Edit contact/agent details and add meeting notes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AgentContact,
  Agent,
  ApiResponse,
  RELATIONSHIP_LEVELS,
  DISC_PROFILES,
  AgentPreferences
} from '../../types/agents';
import AgentPreferencesGrid from '../../components/features/agents/AgentPreferencesGrid';
import { API_BASE_URL } from '../../config';

type Step = 'select-agent' | 'select-contact' | 'edit-details';

const AgentMeetingNotes: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('select-agent');

  // Data lists
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [allContacts, setAllContacts] = useState<AgentContact[]>([]);

  // Selected entities
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedContact, setSelectedContact] = useState<AgentContact | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Agent Form (inline creation)
  const [newAgent, setNewAgent] = useState({
    name: '',
    agent_type: 'Other',
    country: '',
    headquarters_location: '',
    relationship: 'Developing' as const,
    notes: '',
    agent_preferences: {
      transport_infra: 'N',
      energy_infra: 'N',
      us_market: 'N',
      emerging_markets: 'N',
      asia_em: 'N',
      africa_em: 'N',
      emea_em: 'N',
      vietnam: 'N',
      mongolia: 'N',
      turkey: 'N'
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
    next_follow_up: ''
  });

  // Step 3: Editable contact/agent data
  const [newContactRelationship, setNewContactRelationship] = useState<'Strong' | 'Medium' | 'Developing' | 'Cold'>('Developing');
  const [newDiscProfile, setNewDiscProfile] = useState('');
  const [newAgentRelationship, setNewAgentRelationship] = useState<'Strong' | 'Medium' | 'Developing' | 'Cold'>('Developing');
  const [agentPreferences, setAgentPreferences] = useState<AgentPreferences>({
    transport_infra: 'N',
    energy_infra: 'N',
    us_market: 'N',
    emerging_markets: 'N',
    asia_em: 'N',
    africa_em: 'N',
    emea_em: 'N',
    vietnam: 'N',
    mongolia: 'N',
    turkey: 'N'
  });

  // UI states
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [searchAgent, setSearchAgent] = useState('');
  const [searchContact, setSearchContact] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-select contact and agent if contact query parameter is provided
  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && allContacts.length > 0 && allAgents.length > 0) {
      const contact = allContacts.find(c => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        const agent = allAgents.find(agt => agt.id === contact.agent_id);
        if (agent) {
          setSelectedAgent(agent);
          setCurrentStep('edit-details');
        }
      }
    }
  }, [searchParams, allContacts, allAgents]);

  // Initialize Step 3 form values when contact and agent are selected
  useEffect(() => {
    if (selectedContact && selectedAgent) {
      setNewContactRelationship(selectedContact.relationship);
      setNewDiscProfile(selectedContact.disc_profile || '');
      setNewAgentRelationship(selectedAgent.relationship);
      setAgentPreferences(selectedAgent.agent_preferences);
    }
  }, [selectedContact, selectedAgent]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [agentsRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/agents`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/agent-contacts`, { credentials: 'include' })
      ]);

      const agentsResult: ApiResponse<Agent[]> = await agentsRes.json();
      const contactsResult: ApiResponse<AgentContact[]> = await contactsRes.json();

      if (agentsResult.success) setAllAgents(agentsResult.data || []);
      if (contactsResult.success) setAllContacts(contactsResult.data || []);

      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name.trim() || !newAgent.country.trim()) {
      alert('Please enter agent name and country');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAgent)
      });

      const result: ApiResponse<Agent> = await response.json();

      if (result.success && result.data) {
        setSelectedAgent(result.data);
        setAllAgents([...allAgents, result.data]);
        setShowNewAgentForm(false);
        setCurrentStep('select-contact');
        // Reset form
        setNewAgent({
          name: '',
          agent_type: 'Other',
          country: '',
          headquarters_location: '',
          relationship: 'Developing',
          notes: '',
          agent_preferences: {
            transport_infra: 'N',
            energy_infra: 'N',
            us_market: 'N',
            emerging_markets: 'N',
            asia_em: 'N',
            africa_em: 'N',
            emea_em: 'N',
            vietnam: 'N',
            mongolia: 'N',
            turkey: 'N'
          }
        });
      } else {
        alert(result.message || 'Failed to create agent');
      }
    } catch (err) {
      alert('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.name.trim() || !newContact.role.trim() || !newContact.email.trim()) {
      alert('Please enter name, role, and email');
      return;
    }

    if (!selectedAgent) {
      alert('No agent selected');
      return;
    }

    setLoading(true);
    try {
      const contactData = {
        ...newContact,
        agent_id: selectedAgent.id
      };

      const response = await fetch(`${API_BASE_URL}/api/agent-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contactData)
      });

      const result: ApiResponse<AgentContact> = await response.json();

      if (result.success && result.data) {
        setSelectedContact(result.data);
        setAllContacts([...allContacts, result.data]);
        setShowNewContactForm(false);
        setCurrentStep('edit-details');

        // Initialize Step 3 form values
        setNewContactRelationship(result.data.relationship);
        setNewDiscProfile(result.data.disc_profile || '');
        setNewAgentRelationship(selectedAgent.relationship);
        setAgentPreferences(selectedAgent.agent_preferences);

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

  const handleSelectExistingContact = (contact: AgentContact) => {
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
      const payload = {
        contact_id: selectedContact.id,
        contact_updates: {
          relationship: newContactRelationship,
          disc_profile: newDiscProfile
        },
        agent_updates: {
          relationship: newAgentRelationship,
          agent_preferences: agentPreferences
        },
        meeting_note: {
          notes: meetingNote.notes,
          participants: meetingNote.participants,
          next_follow_up: meetingNote.next_follow_up || null
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/agent-meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Meeting saved successfully!');
        setTimeout(() => {
          navigate(`/agents/contacts/${selectedContact.id}`);
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
    setSelectedAgent(null);
    setSelectedContact(null);
    setCurrentStep('select-agent');
    setMeetingNote({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      participants: '',
      next_follow_up: ''
    });
  };

  const handlePreferencesChange = (preferences: Partial<AgentPreferences>) => {
    setAgentPreferences({
      ...agentPreferences,
      ...preferences
    });
  };

  // Filter logic
  const filteredAgents = allAgents.filter(agt =>
    agt.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
    agt.country.toLowerCase().includes(searchAgent.toLowerCase())
  );

  const filteredContacts = allContacts
    .filter(c => c.agent_id === selectedAgent?.id)
    .filter(c =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.role.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.email.toLowerCase().includes(searchContact.toLowerCase())
    );

  if (loading && allAgents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Agent Meeting</h1>
          <p className="text-gray-600 mt-1">Select or create an agent and contact to start</p>
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
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <p className="text-orange-800">{successMessage}</p>
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
          <div className={`flex items-center gap-2 ${currentStep === 'select-agent' ? 'text-orange-600 font-semibold' : selectedAgent ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-agent' ? 'bg-orange-600 text-white' : selectedAgent ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span>Select Agent</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${currentStep === 'select-contact' ? 'text-orange-600 font-semibold' : selectedContact ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-contact' ? 'bg-orange-600 text-white' : selectedContact ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span>Select Contact</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${currentStep === 'edit-details' ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'edit-details' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span>Meeting Details</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select or Create Agent */}
      {currentStep === 'select-agent' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Step 1: Select Agent</h2>
            <button
              onClick={() => setShowNewAgentForm(!showNewAgentForm)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              {showNewAgentForm ? 'Cancel' : '+ New Agent'}
            </button>
          </div>

          {showNewAgentForm ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Create New Agent</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
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
                    value={newAgent.country}
                    onChange={(e) => setNewAgent({ ...newAgent, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters Location</label>
                  <input
                    type="text"
                    value={newAgent.headquarters_location}
                    onChange={(e) => setNewAgent({ ...newAgent, headquarters_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={newAgent.relationship}
                    onChange={(e) => setNewAgent({ ...newAgent, relationship: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {RELATIONSHIP_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateAgent}
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Agent & Continue'}
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Search agents..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAgents.map(agent => {
                  const contactCount = allContacts.filter(c => c.agent_id === agent.id).length;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setCurrentStep('select-contact');
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-600">{agent.country} • {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2: Select or Create Contact */}
      {currentStep === 'select-contact' && selectedAgent && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Selected Agent: <span className="font-semibold text-gray-900">{selectedAgent.name}</span>
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Step 2: Select Contact</h2>
            <button
              onClick={() => setShowNewContactForm(!showNewContactForm)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
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
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
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
                  <p className="text-center text-gray-500 py-8">No contacts for this agent. Create a new one above.</p>
                ) : (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectExistingContact(contact)}
                      className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{contact.name}</div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
      {currentStep === 'edit-details' && selectedContact && selectedAgent && (
        <div className="space-y-6">
          {/* Context Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Meeting with: <span className="font-semibold text-gray-900">{selectedContact.name}</span> at <span className="font-semibold text-gray-900">{selectedAgent.name}</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {DISC_PROFILES.map(profile => (
                    <option key={profile} value={profile}>{profile || 'Not Set'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Agent Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={newAgentRelationship}
                  onChange={(e) => setNewAgentRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {RELATIONSHIP_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Investment Preferences</h2>
            <AgentPreferencesGrid
              preferences={agentPreferences}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What was discussed during the meeting..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <input
                  type="text"
                  value={meetingNote.participants}
                  onChange={(e) => setMeetingNote({ ...meetingNote, participants: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="John Smith, Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={meetingNote.next_follow_up}
                  onChange={(e) => setMeetingNote({ ...meetingNote, next_follow_up: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Meeting'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentMeetingNotes;
