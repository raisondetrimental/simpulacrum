/**
 * Capital Partners Table View Page
 * Hierarchical table with investment preference filters
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CapitalPartner, Contact, ApiResponse } from '../../types/liquidity';
import { API_BASE_URL } from '../../config';
import { useTableSort } from '../../hooks/useTableSort';
import { SortableTableHeader, TableHeader } from '../../components/ui/SortableTableHeader';
import CountryMultiSelect from '../../components/ui/CountryMultiSelect';

interface CapitalPartnerWithContacts extends CapitalPartner {
  contacts: Contact[];
}

type FilterState = 'any' | 'Y' | 'N';

// Main investment preference filters (7 commonly used - countries now handled separately)
const MAIN_PREFERENCES = [
  { key: 'transport_infra', label: 'Transport Infrastructure' },
  { key: 'energy_infra', label: 'Energy Infrastructure' },
  { key: 'us_market', label: 'US Market' },
  { key: 'emerging_markets', label: 'Emerging Markets' },
  { key: 'asia_em', label: 'Asia EM' },
  { key: 'africa_em', label: 'Africa EM' },
  { key: 'emea_em', label: 'EMEA EM' },
];

// Advanced filters (remaining preferences)
const ADVANCED_PREFERENCES = [
  { key: 'investment_grade', label: 'Investment Grade' },
  { key: 'high_yield', label: 'High Yield' },
  { key: 'infra_debt', label: 'Infra Debt' },
  { key: 'senior_secured', label: 'Senior Secured' },
  { key: 'subordinated', label: 'Subordinated' },
  { key: 'bonds', label: 'Bonds' },
  { key: 'loan_agreement', label: 'Loan Agreement' },
  { key: 'quasi_sovereign_only', label: 'Quasi-Sovereign Only' },
  { key: 'public_bond_high_yield', label: 'Public Bond High Yield' },
  { key: 'coal', label: 'Coal' },
  { key: 'more_expensive_than_usual', label: 'More Expensive than usual' },
  { key: 'require_bank_guarantee', label: 'Require Bank Guarantee' },
];

const CapitalPartnersTableView: React.FC = () => {
  const [partners, setPartners] = useState<CapitalPartnerWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Main preference filters
  const [mainFilters, setMainFilters] = useState<Record<string, FilterState>>(() => {
    const initial: Record<string, FilterState> = {};
    MAIN_PREFERENCES.forEach(pref => {
      initial[pref.key] = 'any';
    });
    return initial;
  });

  // Advanced preference filters
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, FilterState>>(() => {
    const initial: Record<string, FilterState> = {};
    ADVANCED_PREFERENCES.forEach(pref => {
      initial[pref.key] = 'any';
    });
    return initial;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partnersRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/capital-partners`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/contacts-new`, { credentials: 'include' })
      ]);

      const partnersResult: ApiResponse<CapitalPartner[]> = await partnersRes.json();
      const contactsResult: ApiResponse<Contact[]> = await contactsRes.json();

      if (partnersResult.success && contactsResult.success) {
        // Build hierarchy
        const contactsMap = new Map<string, Contact[]>();

        contactsResult.data!.forEach(contact => {
          if (!contactsMap.has(contact.capital_partner_id)) {
            contactsMap.set(contact.capital_partner_id, []);
          }
          contactsMap.get(contact.capital_partner_id)!.push(contact);
        });

        const partnersWithContacts = partnersResult.data!.map(partner => ({
          ...partner,
          contacts: contactsMap.get(partner.id) || []
        }));

        setPartners(partnersWithContacts);
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

  // Helper to check if a filter matches
  const matchesFilter = (value: string, filter: FilterState): boolean => {
    if (filter === 'any') return true;
    return value === filter;
  };

  // Apply all filters
  const filteredPartners = partners.filter(partner => {
    // Search filter
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Country filter (headquarters)
    const matchesCountry = !filterCountry || partner.country === filterCountry;

    // Countries array filter (investment focus countries)
    const matchesInvestmentCountries = selectedCountries.length === 0 ||
      (partner.countries && partner.countries.some(c => selectedCountries.includes(c)));

    // Main preference filters
    const matchesMainFilters = MAIN_PREFERENCES.every(pref => {
      const value = partner.preferences?.[pref.key] || '';
      return matchesFilter(value, mainFilters[pref.key]);
    });

    // Advanced preference filters
    const matchesAdvancedFilters = ADVANCED_PREFERENCES.every(pref => {
      const value = partner.preferences?.[pref.key] || '';
      return matchesFilter(value, advancedFilters[pref.key]);
    });

    return (
      matchesSearch &&
      matchesCountry &&
      matchesInvestmentCountries &&
      matchesMainFilters &&
      matchesAdvancedFilters
    );
  });

  // Apply sorting to filtered partners
  const { sortedData: sortedPartners, sortConfig, requestSort } = useTableSort(filteredPartners, 'name');

  // Get unique countries
  const uniqueCountries = Array.from(new Set(partners.map(p => p.country))).sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCountry('');

    const clearedMain: Record<string, FilterState> = {};
    MAIN_PREFERENCES.forEach(pref => {
      clearedMain[pref.key] = 'any';
    });
    setMainFilters(clearedMain);

    const clearedAdvanced: Record<string, FilterState> = {};
    ADVANCED_PREFERENCES.forEach(pref => {
      clearedAdvanced[pref.key] = 'any';
    });
    setAdvancedFilters(clearedAdvanced);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    filterCountry ||
    MAIN_PREFERENCES.some(pref => mainFilters[pref.key] !== 'any') ||
    ADVANCED_PREFERENCES.some(pref => advancedFilters[pref.key] !== 'any');

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
          <h1 className="text-3xl font-bold text-gray-900">Capital Partners Table View</h1>
          <p className="text-gray-600 mt-1">{partners.length} capital partners</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/liquidity/capital-partners"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </Link>
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
              placeholder="Search capital partners, contacts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Investment Focus Countries Filter */}
          <div>
            <CountryMultiSelect
              selectedCountries={selectedCountries}
              onChange={setSelectedCountries}
              label="Investment Focus Countries"
              placeholder="Filter by investment countries..."
            />
          </div>
        </div>

        {/* Main Investment Preferences */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Investment Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MAIN_PREFERENCES.map(pref => (
              <div key={pref.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{pref.label}</label>
                <select
                  value={mainFilters[pref.key]}
                  onChange={(e) => setMainFilters(prev => ({ ...prev, [pref.key]: e.target.value as FilterState }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
          >
            {showAdvancedFilters ? '▼' : '▶'} Advanced Filters
          </button>
        </div>

        {/* Advanced Investment Preferences */}
        {showAdvancedFilters && (
          <div className="mb-6 pl-4 border-l-2 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ADVANCED_PREFERENCES.map(pref => (
                <div key={pref.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{pref.label}</label>
                  <select
                    value={advancedFilters[pref.key]}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, [pref.key]: e.target.value as FilterState }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="any">Any</option>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedPartners.length} of {partners.length} capital partners
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sortedPartners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No capital partners found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableTableHeader
                    label="Capital Partner"
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
                    label="Investment Range"
                    sortKey="investment_min"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <TableHeader label="Preferences" />
                  <TableHeader label="Contacts" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPartners.map((partner, partnerIndex) => {
                  // Get active preferences for display
                  const activePrefs = [];

                  // Infrastructure
                  if (partner.preferences?.transport_infra === 'Y') activePrefs.push({ label: 'Transport', type: 'infra' });
                  if (partner.preferences?.energy_infra === 'Y') activePrefs.push({ label: 'Energy', type: 'infra' });

                  // Regions
                  if (partner.preferences?.us_market === 'Y') activePrefs.push({ label: 'US', type: 'region' });
                  if (partner.preferences?.emerging_markets === 'Y') activePrefs.push({ label: 'EM', type: 'region' });
                  if (partner.preferences?.asia_em === 'Y') activePrefs.push({ label: 'Asia', type: 'region' });
                  if (partner.preferences?.africa_em === 'Y') activePrefs.push({ label: 'Africa', type: 'region' });
                  if (partner.preferences?.emea_em === 'Y') activePrefs.push({ label: 'EMEA', type: 'region' });

                  // Countries from countries array
                  if (partner.countries && partner.countries.length > 0) {
                    partner.countries.forEach(countryId => {
                      // Capitalize first letter for display
                      const displayName = countryId.charAt(0).toUpperCase() + countryId.slice(1);
                      activePrefs.push({ label: displayName, type: 'country' });
                    });
                  }

                  return (
                    <React.Fragment key={partner.id}>
                      {/* Partner Row */}
                      <tr className="bg-gray-50 table-row-stagger">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/liquidity/capital-partners/${partner.id}`}
                            className="text-lg font-bold text-gray-900 hover:text-blue-600"
                          >
                            {partner.name}
                          </Link>
                          <div className="mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                            <span className="ml-2 text-sm text-gray-600">
                              {partner.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.investment_min > 0 && partner.investment_max > 0 ? (
                            <>${(partner.investment_min / 1000000).toFixed(0)}M - ${(partner.investment_max / 1000000).toFixed(0)}M {partner.currency}</>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activePrefs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {activePrefs.map((pref, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 text-xs rounded ${
                                    pref.type === 'infra'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {pref.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.contacts.length} contact(s)
                        </td>
                      </tr>

                      {/* Contact Rows */}
                      {partner.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap pl-12">
                            <Link
                              to={`/liquidity/contacts/${contact.id}`}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {contact.name}
                            </Link>
                            <div className="mt-1">
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
                          <td className="px-6 py-4 text-sm text-gray-600" colSpan={2}>
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
                              {contact.team_name && (
                                <div className="text-xs text-gray-500">
                                  Team: {contact.team_name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              to={`/liquidity/meeting-notes/${contact.id}`}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
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
    </div>
  );
};

export default CapitalPartnersTableView;
