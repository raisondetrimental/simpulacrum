/**
 * Agents List Page (Hierarchical View)
 * Shows Agents > Contacts
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Agent, AgentContact, ApiResponse, AgentFormData, AgentContactFormData } from '../../types/agents';
import AgentForm from '../../components/features/agents/AgentForm';
import AgentContactForm from '../../components/features/agents/AgentContactForm';
import DownloadDropdown from '../../components/ui/DownloadDropdown';
import { API_BASE_URL } from '../../config';
import { downloadAgentsCSV, downloadAgentsXLSX } from '../../services/agentsService';

interface AgentWithContacts extends Agent {
  contacts: AgentContact[];
}

const AgentsList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStatus, setCreateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [selectedAgentForContact, setSelectedAgentForContact] = useState<Agent | null>(null);
  const [createContactStatus, setCreateContactStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchData();
  }, []);

  // Check for add query parameter and open modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setShowCreateModal(true);
      // Remove query parameter from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/agents`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/agent-contacts`, { credentials: 'include' })
      ]);

      const agentsResult: ApiResponse<Agent[]> = await agentsRes.json();
      const contactsResult: ApiResponse<AgentContact[]> = await contactsRes.json();

      if (agentsResult.success && contactsResult.success) {
        // Build hierarchy
        const contactsMap = new Map<string, AgentContact[]>();

        contactsResult.data!.forEach(contact => {
          if (!contactsMap.has(contact.agent_id)) {
            contactsMap.set(contact.agent_id, []);
          }
          contactsMap.get(contact.agent_id)!.push(contact);
        });

        const agentsWithContacts = agentsResult.data!.map(agent => ({
          ...agent,
          contacts: contactsMap.get(agent.id) || []
        }));

        setAgents(agentsWithContacts);
        setError(null);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };

  const handleCreateAgent = async (formData: AgentFormData) => {
    setCreateStatus('saving');

    try {
      const response = await fetch(`${API_BASE_URL}/api/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Agent> = await response.json();

      if (result.success && result.data) {
        setCreateStatus('success');
        setShowCreateModal(false);
        // Refresh the list
        await fetchData();
        setTimeout(() => setCreateStatus('idle'), 2000);
      } else {
        setCreateStatus('error');
        alert(result.message || 'Failed to create agent');
      }
    } catch (err) {
      setCreateStatus('error');
      alert('Failed to create agent');
    }
  };

  const handleCreateContact = async (formData: AgentContactFormData) => {
    setCreateContactStatus('saving');

    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<AgentContact> = await response.json();

      if (result.success && result.data) {
        setCreateContactStatus('success');
        setShowCreateContactModal(false);
        setSelectedAgentForContact(null);
        // Refresh the list
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


  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || agent.agent_type === filterType;
    const matchesCountry = !filterCountry || agent.country === filterCountry;

    return matchesSearch && matchesType && matchesCountry;
  }).sort((a, b) => {
    // Sort starred items first, then alphabetically
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get unique types and countries
  const uniqueTypes = Array.from(new Set(agents.map(c => c.agent_type).filter(Boolean))).sort();
  const uniqueCountries = Array.from(new Set(agents.map(c => c.country))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={fetchData} className="mt-2 text-sm text-red-600 hover:text-red-800">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Agents</h1>
          <p className="text-gray-600 mt-1">{agents.length} transaction agents</p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadAgentsCSV()}
            onDownloadXLSX={() => downloadAgentsXLSX()}
            label="Download"
          />
          <Link
            to="/agents/table"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </Link>
          <button
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Agent
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents, contacts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || filterType || filterCountry) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterCountry('');
            }}
            className="mt-3 text-sm text-orange-600 hover:text-orange-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAgents.length} of {agents.length} agents
      </div>

      {/* Hierarchical Agents List */}
      <div className="space-y-3">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No agents found</p>
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const isExpanded = expandedAgents.has(agent.id);

            return (
              <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Agent Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/agents/${agent.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-orange-600"
                          >
                            {agent.name}
                          </Link>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              agent.relationship === 'Strong'
                                ? 'bg-orange-100 text-orange-800'
                                : agent.relationship === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : agent.relationship === 'Developing'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {agent.relationship}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {agent.agent_type || 'Other'} • {agent.country} • {agent.contacts.length} contact(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAgentForContact(agent);
                        setShowCreateContactModal(true);
                      }}
                      className="text-sm bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      + Add Contact
                    </button>
                  </div>
                </div>

                {/* Contacts (when expanded) */}
                {isExpanded && (
                  <div className="divide-y divide-gray-200">
                    {agent.contacts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p>No contacts yet</p>
                        <button
                          onClick={() => {
                            setSelectedAgentForContact(agent);
                            setShowCreateContactModal(true);
                          }}
                          className="mt-2 inline-block text-orange-600 hover:text-orange-800 text-sm"
                        >
                          Create first contact
                        </button>
                      </div>
                    ) : (
                      agent.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <div key={contact.id} className="px-6 py-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Link
                                  to={`/agents/contacts/${contact.id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                                >
                                  {contact.name}
                                </Link>
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
                                {contact.disc_profile && (
                                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                    DISC: {contact.disc_profile}
                                  </span>
                                )}
                              </div>
                              {contact.role && <p className="text-sm text-gray-600 mb-2">{contact.role}</p>}
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
                              to={`/agents/meeting-notes/${contact.id}`}
                              className="ml-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
                            >
                              Start Meeting
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Agent</h2>
            </div>
            <div className="p-6">
              <AgentForm
                onSave={handleCreateAgent}
                onCancel={() => {
                  setShowCreateModal(false);
                  setCreateStatus('idle');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Contact Modal */}
      {showCreateContactModal && selectedAgentForContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Contact</h2>
            </div>
            <div className="p-6">
              <AgentContactForm
                agentId={selectedAgentForContact.id}
                agentName={selectedAgentForContact.name}
                onSave={handleCreateContact}
                onCancel={() => {
                  setShowCreateContactModal(false);
                  setSelectedAgentForContact(null);
                  setCreateContactStatus('idle');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsList;
