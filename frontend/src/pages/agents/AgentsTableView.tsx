/**
 * Agents Table View Page
 * Filterable table with infrastructure type and region filters
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Agent, AgentContact, ApiResponse, AgentFormData } from '../../types/agents';
import AgentForm from '../../components/features/agents/AgentForm';
import { API_BASE_URL } from '../../config';
import { useTableSort } from '../../hooks/useTableSort';
import { SortableTableHeader, TableHeader } from '../../components/ui/SortableTableHeader';
import CountryMultiSelect from '../../components/ui/CountryMultiSelect';

interface AgentWithContacts extends Agent {
  contacts: AgentContact[];
}

type FilterState = 'any' | 'Y' | 'N';

const AgentsTableView: React.FC = () => {
  const [agents, setAgents] = useState<AgentWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Infrastructure type filters
  const [transportFilter, setTransportFilter] = useState<FilterState>('any');
  const [energyFilter, setEnergyFilter] = useState<FilterState>('any');

  // Region filters
  const [usMarketFilter, setUsMarketFilter] = useState<FilterState>('any');
  const [emFilter, setEmFilter] = useState<FilterState>('any');
  const [asiaEmFilter, setAsiaEmFilter] = useState<FilterState>('any');
  const [africaEmFilter, setAfricaEmFilter] = useState<FilterState>('any');
  const [emeaEmFilter, setEmeaEmFilter] = useState<FilterState>('any');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setCreateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchData();
  }, []);

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

  // Helper to check if a filter matches
  const matchesFilter = (value: string, filter: FilterState): boolean => {
    if (filter === 'any') return true;
    return value === filter;
  };

  // Apply all filters
  const filteredAgents = agents.filter(agent => {
    // Search filter
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Country filter (headquarters)
    const matchesCountry = !filterCountry || agent.country === filterCountry;

    // Countries array filter (investment focus countries)
    const matchesInvestmentCountries = selectedCountries.length === 0 ||
      (agent.countries && agent.countries.some(c => selectedCountries.includes(c)));

    // Get preferences with fallback to empty object
    const prefs = agent.agent_preferences || {};

    // Infrastructure type filters
    const matchesTransport = matchesFilter(prefs.transport_infra, transportFilter);
    const matchesEnergy = matchesFilter(prefs.energy_infra, energyFilter);

    // Region filters
    const matchesUsMarket = matchesFilter(prefs.us_market, usMarketFilter);
    const matchesEm = matchesFilter(prefs.emerging_markets, emFilter);
    const matchesAsiaEm = matchesFilter(prefs.asia_em, asiaEmFilter);
    const matchesAfricaEm = matchesFilter(prefs.africa_em, africaEmFilter);
    const matchesEmeaEm = matchesFilter(prefs.emea_em, emeaEmFilter);

    return (
      matchesSearch &&
      matchesCountry &&
      matchesInvestmentCountries &&
      matchesTransport &&
      matchesEnergy &&
      matchesUsMarket &&
      matchesEm &&
      matchesAsiaEm &&
      matchesAfricaEm &&
      matchesEmeaEm
    );
  });

  // Apply sorting to filtered agents
  const { sortedData: sortedAgents, sortConfig, requestSort } = useTableSort(filteredAgents, 'name');

  // Get unique countries
  const uniqueCountries = Array.from(new Set(agents.map(c => c.country))).sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCountry('');
    setSelectedCountries([]);
    setTransportFilter('any');
    setEnergyFilter('any');
    setUsMarketFilter('any');
    setEmFilter('any');
    setAsiaEmFilter('any');
    setAfricaEmFilter('any');
    setEmeaEmFilter('any');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    filterCountry ||
    selectedCountries.length > 0 ||
    transportFilter !== 'any' ||
    energyFilter !== 'any' ||
    usMarketFilter !== 'any' ||
    emFilter !== 'any' ||
    asiaEmFilter !== 'any' ||
    africaEmFilter !== 'any' ||
    emeaEmFilter !== 'any';

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
          <h1 className="text-3xl font-bold text-gray-900">Transaction Agents Table View</h1>
          <p className="text-gray-600 mt-1">{agents.length} organizations</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/agents/list"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </Link>
          <button
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Agent
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        {/* Search and Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        {/* Infrastructure Types */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Infrastructure Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport Infrastructure</label>
              <select
                value={transportFilter}
                onChange={(e) => setTransportFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Infrastructure</label>
              <select
                value={energyFilter}
                onChange={(e) => setEnergyFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Regions */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3">Regions</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">US Market</label>
              <select
                value={usMarketFilter}
                onChange={(e) => setUsMarketFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emerging Markets</label>
              <select
                value={emFilter}
                onChange={(e) => setEmFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asia EM</label>
              <select
                value={asiaEmFilter}
                onChange={(e) => setAsiaEmFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Africa EM</label>
              <select
                value={africaEmFilter}
                onChange={(e) => setAfricaEmFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EMEA EM</label>
              <select
                value={emeaEmFilter}
                onChange={(e) => setEmeaEmFilter(e.target.value as FilterState)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investment Focus Countries Filter */}
        <div className="mb-6">
          <CountryMultiSelect
            selectedCountries={selectedCountries}
            onChange={setSelectedCountries}
            label="Investment Focus Countries"
            placeholder="Filter by investment countries..."
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedAgents.length} of {agents.length} agents
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sortedAgents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No agents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableTableHeader
                    label="Agent"
                    sortKey="name"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTableHeader
                    label="Country"
                    sortKey="country"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTableHeader
                    label="Investment Need"
                    sortKey="investment_need_min"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <TableHeader label="Infrastructure" />
                  <TableHeader label="Regions" />
                  <TableHeader label="Contacts" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAgents.map((agent) => {
                  // Get preferences with fallback
                  const prefs = agent.agent_preferences || {};

                  // Get active infrastructure types
                  const activeInfra = [];
                  if (prefs.transport_infra === 'Y') activeInfra.push('Transport');
                  if (prefs.energy_infra === 'Y') activeInfra.push('Energy');

                  // Get active regions
                  const activeRegions = [];
                  if (prefs.us_market === 'Y') activeRegions.push('US');
                  if (prefs.emerging_markets === 'Y') activeRegions.push('EM');
                  if (prefs.asia_em === 'Y') activeRegions.push('Asia');
                  if (prefs.africa_em === 'Y') activeRegions.push('Africa');
                  if (prefs.emea_em === 'Y') activeRegions.push('EMEA');

                  return (
                    <React.Fragment key={agent.id}>
                      {/* Agent Row */}
                      <tr className="bg-gray-50 table-row-stagger">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/agents/${agent.id}`}
                            className="text-lg font-bold text-gray-900 hover:text-orange-600"
                          >
                            {agent.name}
                          </Link>
                          <div className="mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.investment_need_min && agent.investment_need_max && agent.investment_need_min > 0 && agent.investment_need_max > 0 ? (
                            <>${(agent.investment_need_min / 1000000).toFixed(0)}M - ${(agent.investment_need_max / 1000000).toFixed(0)}M {agent.currency}</>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activeInfra.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {activeInfra.map(infra => (
                                <span key={infra} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                  {infra}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activeRegions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {activeRegions.map(region => (
                                <span key={region} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                  {region}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.contacts.length} contact(s)
                        </td>
                      </tr>

                      {/* Contact Rows */}
                      {agent.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap pl-12">
                            <Link
                              to={`/agents/contacts/${contact.id}`}
                              className="text-sm font-semibold text-gray-900 hover:text-orange-600"
                            >
                              {contact.name}
                            </Link>
                            <div className="mt-1">
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
                                <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                  DISC: {contact.disc_profile}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {contact.role}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" colSpan={3}>
                            <div className="space-y-1">
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              to={`/agents/meeting?contact=${contact.id}`}
                              className="bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition-colors text-sm"
                            >
                              Meeting Notes
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    </div>
  );
};

export default AgentsTableView;
