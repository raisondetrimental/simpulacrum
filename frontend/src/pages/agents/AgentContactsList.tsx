/**
 * Agent Contacts List Page
 * Shows all agent contacts grouped by Agent
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AgentContact, Agent, ApiResponse } from '../../types/agents';
import DownloadDropdown from '../../components/ui/DownloadDropdown';
import { API_BASE_URL } from '../../config';
import { downloadAgentContactsCSV, downloadAgentContactsXLSX } from '../../services/agentsService';

interface AgentContactWithDetails extends AgentContact {
  agent?: Agent;
}

const AgentContactsList: React.FC = () => {
  const [contacts, setContacts] = useState<AgentContactWithDetails[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgentId, setFilterAgentId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/agent-contacts`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/agents`, { credentials: 'include' })
      ]);

      const contactsResult: ApiResponse<AgentContact[]> = await contactsRes.json();
      const agentsResult: ApiResponse<Agent[]> = await agentsRes.json();

      if (contactsResult.success && agentsResult.success) {
        const agentsMap = new Map(agentsResult.data!.map(c => [c.id, c]));

        const contactsWithDetails = contactsResult.data!.map(contact => {
          const agent = agentsMap.get(contact.agent_id);
          return { ...contact, agent };
        });

        setContacts(contactsWithDetails);
        setAgents(agentsResult.data!);
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


  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.agent?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAgent = !filterAgentId || contact.agent_id === filterAgentId;

    return matchesSearch && matchesAgent;
  }).sort((a, b) => {
    // Sort by parent's starred status first, then alphabetically by contact name
    const aStarred = a.agent?.starred || false;
    const bStarred = b.agent?.starred || false;
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Group by agent
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const agentId = contact.agent_id;

    if (!acc[agentId]) {
      acc[agentId] = {
        agent: contact.agent,
        contacts: []
      };
    }

    acc[agentId].contacts.push(contact);
    return acc;
  }, {} as Record<string, { agent?: Agent; contacts: AgentContactWithDetails[] }>);

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
        <button
          onClick={fetchData}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
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
          <h1 className="text-3xl font-bold text-gray-900">Agent Contacts</h1>
          <p className="text-gray-600 mt-1">
            {contacts.length} contacts across {agents.length} agents
          </p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadAgentContactsCSV(filterAgentId || undefined)}
            onDownloadXLSX={() => downloadAgentContactsXLSX(filterAgentId || undefined)}
            label="Download"
          />
          <Link
            to="/agents/list"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Agents View
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={filterAgentId}
              onChange={(e) => setFilterAgentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterAgentId) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAgentId('');
            }}
            className="mt-3 text-sm text-orange-600 hover:text-orange-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Contacts Grouped by Agent */}
      <div className="space-y-6">
        {Object.keys(groupedContacts).length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-2 text-gray-600">No contacts found</p>
            {(searchTerm || filterAgentId) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterAgentId('');
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedContacts).map(([agentId, { agent, contacts: agentContacts }]) => (
            <div key={agentId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Agent Header */}
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                <Link
                  to={`/agents/${agentId}`}
                  className="text-lg font-bold text-gray-900 hover:text-orange-600"
                >
                  {agent?.name || 'Unknown Agent'}
                </Link>
                {agent && (
                  <p className="text-sm text-gray-600">
                    {agent.country} • {agentContacts.length} contact(s)
                  </p>
                )}
              </div>

              {/* Contacts within Agent */}
              <div className="divide-y divide-gray-100">
                {agentContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/agents/contacts/${contact.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
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
                        <p className="text-sm text-gray-600 mt-1">{contact.role}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentContactsList;
