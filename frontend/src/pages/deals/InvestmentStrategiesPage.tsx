/**
 * Saved Filters Page for Liquidity/DES
 * Allows users to create, save, manage, and apply custom filter combinations
 * Includes investment preferences AND investment size ranges
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CapitalPartner, Contact, ApiResponse } from '../../types/liquidity';
import { InvestmentMatchesResponse, MatchEntrySummary, SponsorMatchEntry } from '../../types/investment';
import { API_BASE_URL } from '../../config';

// Preference column keys matching the database
const PREFERENCE_COLUMNS = [
  { key: 'investment_grade', label: 'Investment Grade' },
  { key: 'high_yield', label: 'High Yield' },
  { key: 'infra_debt', label: 'Infra Debt' },
  { key: 'senior_secured', label: 'Senior Secured' },
  { key: 'subordinated', label: 'Subordinated' },
  { key: 'bonds', label: 'Bonds' },
  { key: 'loan_agreement', label: 'Loan Agreement' },
  { key: 'quasi_sovereign_only', label: 'Quasi-Sovereign Only' },
  { key: 'public_bond_high_yield', label: 'Public Bond High Yield' },
  { key: 'us_market', label: 'US Market' },
  { key: 'emerging_markets', label: 'Emerging Markets' },
  { key: 'asia_em', label: 'Asia EM' },
  { key: 'africa_em', label: 'Africa EM' },
  { key: 'emea_em', label: 'EMEA EM' },
  { key: 'vietnam', label: 'Vietnam' },
  { key: 'mongolia', label: 'Mongolia' },
  { key: 'turkey', label: 'Turkey' },
  { key: 'coal', label: 'Coal' },
  { key: 'energy_infra', label: 'Energy Infra' },
  { key: 'transport_infra', label: 'Transport Infra' },
  { key: 'more_expensive_than_usual', label: 'More Expensive than usual' },
  { key: 'require_bank_guarantee', label: 'Require Bank Guarantee' },
];

type FilterState = 'any' | 'Y' | 'N';

interface InvestmentSizeFilter {
  minInvestment: number; // in millions USD
  maxInvestment: number; // in millions USD
}

interface SavedFilter {
  id: string;
  name: string;
  preferenceFilters: Record<string, FilterState>;
  sizeFilter: InvestmentSizeFilter;
  createdAt: string;
}

interface PartnerWithContacts extends CapitalPartner {
  contacts: Contact[];
}

interface TriStateToggleProps {
  label: string;
  value: FilterState;
  onChange: (value: FilterState) => void;
}

const TriStateToggle: React.FC<TriStateToggleProps> = ({ label, value, onChange }) => {
  const display = value === 'any' ? '—' : value;
  const title = value === 'any' ? 'No filter' : value === 'Y' ? 'Yes' : 'No';

  const handleClick = () => {
    const next: FilterState = value === 'any' ? 'Y' : value === 'Y' ? 'N' : 'any';
    onChange(next);
  };

  const getButtonClass = () => {
    if (value === 'Y') return 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100';
    if (value === 'N') return 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100';
    return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
  };

  return (
    <button
      onClick={handleClick}
      title={`${label}: ${title}`}
      className={`px-3 py-2 rounded-md border text-sm transition-colors ${getButtonClass()}`}
    >
      <span className="font-medium mr-1">{label}:</span>
      <span className="font-semibold inline-block w-4 text-center">{display}</span>
    </button>
  );
};

const SavedFiltersPage: React.FC = () => {
  const [partners, setPartners] = useState<PartnerWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);

  const [matchResults, setMatchResults] = useState<InvestmentMatchesResponse | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newPreferenceFilters, setNewPreferenceFilters] = useState<Record<string, FilterState>>(() => {
    const initial: Record<string, FilterState> = {};
    PREFERENCE_COLUMNS.forEach((col) => {
      initial[col.key] = 'any';
    });
    return initial;
  });
  const [newSizeFilter, setNewSizeFilter] = useState<InvestmentSizeFilter>({
    minInvestment: 0,
    maxInvestment: 0
  });

  const preferenceLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    PREFERENCE_COLUMNS.forEach((col) => {
      map[col.key] = col.label;
    });
    return map;
  }, []);

  const formatMillions = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    const amountInMillions = value / 1_000_000;
    const formatted = amountInMillions.toLocaleString(undefined, {
      maximumFractionDigits: amountInMillions >= 100 ? 0 : 1
    });
    return `$${formatted}M`;
  };

  const renderOverlapBadges = (preferences: string[]) => {
    if (!preferences || preferences.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {preferences.map((pref) => (
          <span key={pref} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            {preferenceLabelMap[pref] || pref}
          </span>
        ))}
      </div>
    );
  };

  // Load saved filters from API on mount
  useEffect(() => {
    fetchFilters();
  }, []);

  // Memoize selected filter
  const selectedFilter = useMemo(() => {
    if (!selectedFilterId) return null;
    return savedFilters.find(f => f.id === selectedFilterId) || null;
  }, [selectedFilterId, savedFilters]);

  useEffect(() => {
    if (!selectedFilter) {
      setMatchResults(null);
      setMatchError(null);
      return;
    }

    const controller = new AbortController();

    const loadMatches = async () => {
      setMatchLoading(true);
      setMatchError(null);
      try {
        // Filter to only send SHARED preference keys that work across sponsors and partners
        // The backend only matches on these 10 shared keys
        const SHARED_PREFERENCE_KEYS = [
          'transport_infra',
          'energy_infra',
          'us_market',
          'emerging_markets',
          'asia_em',
          'africa_em',
          'emea_em',
          'vietnam',
          'mongolia',
          'turkey'
        ];

        // Only include shared preferences in the filter
        const filteredPreferences: Record<string, string> = {};
        Object.entries(selectedFilter.preferenceFilters).forEach(([key, value]) => {
          if (SHARED_PREFERENCE_KEYS.includes(key) && value !== 'any') {
            filteredPreferences[key] = value;
          }
        });

        const requestBody = {
          preferenceFilters: filteredPreferences,
          ticketRange: {
            minInvestment: selectedFilter.sizeFilter.minInvestment,
            maxInvestment: selectedFilter.sizeFilter.maxInvestment,
            unit: 'million'
          }
        };

        const response = await fetch(`${API_BASE_URL}/api/investment-matches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          credentials: 'include',
          signal: controller.signal
        });

        const data: InvestmentMatchesResponse = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load unified investment matches.');
        }
        setMatchResults(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Unified investment match error:', error);
        setMatchError(error instanceof Error ? error.message : 'Unable to load unified investment matches.');
        setMatchResults(null);
      } finally {
        setMatchLoading(false);
      }
    };

    loadMatches();

    return () => {
      controller.abort();
    };
  }, [selectedFilter]);

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investment-strategies`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success && result.data) {
        setSavedFilters(result.data);
      }
    } catch (err) {
      console.error('Failed to load investment strategies:', err);
    }
  };

  // Fetch data from API
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
        const partnersWithContacts = partnersResult.data!.map(partner => {
          const partnerContacts = contactsResult.data!.filter(
            c => c.capital_partner_id === partner.id
          );

          return { ...partner, contacts: partnerContacts };
        });

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

  const handleCreateFilter = async () => {
    if (!newFilterName.trim()) {
      alert('Please enter a strategy name');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName.trim(),
      preferenceFilters: { ...newPreferenceFilters },
      sizeFilter: { ...newSizeFilter },
      createdAt: new Date().toISOString(),
    };

    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);

    // Save to backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/investment-strategies/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFilters),
        credentials: 'include'
      });

      const result = await response.json();
      if (!result.success) {
        alert('Failed to save strategy: ' + result.message);
        setSavedFilters(savedFilters); // Revert on error
        return;
      }
    } catch (err) {
      alert('Failed to save strategy. Make sure the API server is running.');
      setSavedFilters(savedFilters); // Revert on error
      return;
    }

    // Reset modal state
    setNewFilterName('');
    const resetFilters: Record<string, FilterState> = {};
    PREFERENCE_COLUMNS.forEach((col) => {
      resetFilters[col.key] = 'any';
    });
    setNewPreferenceFilters(resetFilters);
    setNewSizeFilter({ minInvestment: 0, maxInvestment: 0 });
    setShowCreateModal(false);

    setSelectedFilterId(newFilter.id);
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      // Clear selection first if deleting the selected filter
      if (selectedFilterId === filterId) {
        setSelectedFilterId(null);
      }

      const updatedFilters = savedFilters.filter(f => f.id !== filterId);

      // Update state optimistically
      setSavedFilters(updatedFilters);

      // Save to backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/investment-strategies/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFilters),
          credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
          alert('Failed to delete strategy: ' + result.message);
          setSavedFilters(savedFilters); // Revert on error
          if (selectedFilterId === filterId) {
            setSelectedFilterId(filterId); // Restore selection
          }
          return;
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete strategy. Make sure the API server is running.');
        setSavedFilters(savedFilters); // Revert on error
        if (selectedFilterId === filterId) {
          setSelectedFilterId(filterId); // Restore selection
        }
        return;
      }
    }
  };

  const handlePartnerClick = (partnerId: string) => {
    setExpandedPartner(expandedPartner === partnerId ? null : partnerId);
  };


  // Filter partners based on selected filter
  const filteredPartners = useMemo(() => {
    if (!selectedFilter) return [];

    return partners.filter(partner => {
      // Check preference filters on the partner
      const preferencesMatch = PREFERENCE_COLUMNS.every((col) => {
        const state = selectedFilter.preferenceFilters[col.key];
        const cell = (partner.preferences?.[col.key] || '').toUpperCase();
        if (state === 'any') return true;
        if (state === 'Y') return cell === 'Y';
        if (state === 'N') return cell === 'N';
        return true;
      });

      // Check investment size filters on the partner
      let sizeMatch = true;
      if (selectedFilter.sizeFilter.minInvestment > 0 && partner.investment_max) {
        const partnerMaxInMM = partner.investment_max / 1000000;
        sizeMatch = sizeMatch && partnerMaxInMM >= selectedFilter.sizeFilter.minInvestment;
      }
      if (selectedFilter.sizeFilter.maxInvestment > 0 && partner.investment_min) {
        const partnerMinInMM = partner.investment_min / 1000000;
        sizeMatch = sizeMatch && partnerMinInMM <= selectedFilter.sizeFilter.maxInvestment;
      }

      return preferencesMatch && sizeMatch;
    });
  }, [partners, selectedFilter]);

  const totalMatches = filteredPartners.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Error loading data</p>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Investment Strategies</h1>
        <p className="mt-2 text-gray-600">
          Create and save custom filter combinations including investment preferences and deal size ranges.
        </p>
      </div>

      {/* Create New Strategy Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Saved Strategies</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + Create New Strategy
        </button>
      </div>

      {/* Saved Strategies List */}
      <div className="card">
        {savedFilters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No saved strategies yet.</p>
            <p className="mt-2 text-sm">Click "Create New Strategy" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedFilters.map((filter) => {
              const activePrefs = Object.values(filter.preferenceFilters).filter(v => v !== 'any').length;
              const hasSizeFilter = filter.sizeFilter.minInvestment > 0 || filter.sizeFilter.maxInvestment > 0;

              return (
                <div
                  key={filter.id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedFilterId === filter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <button
                      onClick={() => setSelectedFilterId(filter.id)}
                      className="text-left flex-1"
                    >
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {filter.name}
                      </h3>
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete filter"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{activePrefs} preference filter{activePrefs !== 1 ? 's' : ''}</div>
                    {hasSizeFilter && (
                      <div>
                        Size: ${filter.sizeFilter.minInvestment}M - ${filter.sizeFilter.maxInvestment}M
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtered Results */}
      {selectedFilter && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Results for "{selectedFilter.name}"
            </h2>
            <span className="text-sm text-gray-600">
              {totalMatches} matching partner{totalMatches !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {filteredPartners.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No partners match this filter combination.
              </div>
            ) : (
              filteredPartners.map(partner => {
                const isExpanded = expandedPartner === partner.id;

                return (
                  <div key={partner.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Partner Header */}
                    <div
                      onClick={() => handlePartnerClick(partner.id)}
                      className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div>
                            <Link
                              to={`/liquidity/capital-partners/${partner.id}`}
                              className="text-lg font-bold text-gray-900 hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {partner.name}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {partner.type} • {partner.country}
                              {(partner.investment_min > 0 || partner.investment_max > 0) && (
                                <> • ${(partner.investment_min / 1000000).toFixed(0)}M - ${(partner.investment_max / 1000000).toFixed(0)}M USD</>
                              )}
                              {partner.contacts.length > 0 && (
                                <> • {partner.contacts.length} contact{partner.contacts.length !== 1 ? 's' : ''}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contacts (when expanded) */}
                    {isExpanded && partner.contacts.length > 0 && (
                      <div className="divide-y divide-gray-200">
                        {partner.contacts.map(contact => (
                          <div key={contact.id} className="px-6 py-4 bg-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Link
                                  to={`/liquidity/contacts/${contact.id}`}
                                  className="font-semibold text-gray-900 hover:text-blue-600"
                                >
                                  {contact.name}
                                </Link>
                                <p className="text-sm text-gray-600">{contact.role}</p>
                                {contact.team_name && (
                                  <p className="text-sm text-gray-500">Team: {contact.team_name}</p>
                                )}
                                {contact.email && (
                                  <p className="text-sm text-gray-500">{contact.email}</p>
                                )}
                              </div>
                              <Link
                                to={`/liquidity/meeting-notes/${contact.id}`}
                                className="ml-4 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                              >
                                Start Meeting
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedFilter && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Unified CRM Matches</h2>
              <p className="text-sm text-gray-600 mt-1">
                Cross-references capital partner mandates with sponsor opportunities using shared filters.
              </p>
            </div>
          </div>

          {matchLoading && (
            <div className="mt-4 text-sm text-gray-500">Loading cross-CRM matches...</div>
          )}

          {matchError && !matchLoading && (
            <div className="mt-4 border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
              {matchError}
            </div>
          )}

          {!matchLoading && !matchError && (
            <>
              {matchResults ? (
                <div className="mt-6 space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                      <div className="text-sm text-gray-500">Capital Partners</div>
                      <div className="text-2xl font-semibold text-gray-900">{matchResults.counts.capital_partners}</div>
                      <div className="text-xs text-gray-500 mt-1">Matching organisations</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                      <div className="text-sm text-gray-500">Partner Teams</div>
                      <div className="text-2xl font-semibold text-gray-900">{matchResults.counts.capital_partner_teams}</div>
                      <div className="text-xs text-gray-500 mt-1">Mandates aligned to filters</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                      <div className="text-sm text-gray-500">Sponsors</div>
                      <div className="text-2xl font-semibold text-gray-900">{matchResults.counts.sponsors}</div>
                      <div className="text-xs text-gray-500 mt-1">Opportunities matching filters</div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
                    <h3 className="text-lg font-semibold text-gray-900">Sponsor Overlaps</h3>
                    {matchResults.pairings.by_sponsor.length === 0 ? (
                      <p className="text-sm text-gray-600 mt-2">
                        No sponsors match this strategy yet. Capture additional mandates or broaden the filters.
                      </p>
                    ) : (
                      <div className="space-y-6 mt-4">
                        {matchResults.pairings.by_sponsor.map((entry: SponsorMatchEntry) => {
                          const sponsor = entry.sponsor_profile;
                          return (
                            <div key={sponsor.profile_id} className="border border-gray-200 rounded-md p-4">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{sponsor.name}</h4>
                                  <div className="text-sm text-gray-600">
                                    {sponsor.metadata?.headquarters_location || sponsor.organization_name}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Ticket range {formatMillions(sponsor.ticket_min)} - {formatMillions(sponsor.ticket_max)}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">
                                  {entry.capital_partners.length + entry.capital_partner_teams.length} matches
                                </div>
                              </div>

                              {entry.capital_partners.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Capital Partners</h5>
                                  <div className="space-y-3 mt-2">
                                    {entry.capital_partners.map((match: MatchEntrySummary) => (
                                      <div key={match.profile_id} className="border border-gray-100 rounded-md p-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">{match.capital_partner_name || match.name}</div>
                                            <div className="text-xs text-gray-500">
                                              Ticket window {formatMillions(match.ticket_min)} - {formatMillions(match.ticket_max)}
                                            </div>
                                            {match.ticket_overlap && (
                                              <div className="text-xs text-gray-500 mt-1">
                                                Overlap {formatMillions(match.ticket_overlap.min)} - {formatMillions(match.ticket_overlap.max)}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">Overlap drivers: {match.overlap_size}</div>
                                        </div>
                                        {renderOverlapBadges(match.overlap_preferences)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.capital_partner_teams.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Capital Partner Teams</h5>
                                  <div className="space-y-3 mt-2">
                                    {entry.capital_partner_teams.map((match: MatchEntrySummary) => (
                                      <div key={match.profile_id} className="border border-gray-100 rounded-md p-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">{match.name}</div>
                                            {match.capital_partner_name && (
                                              <div className="text-xs text-gray-500">{match.capital_partner_name}</div>
                                            )}
                                            <div className="text-xs text-gray-500 mt-1">
                                              Ticket window {formatMillions(match.ticket_min)} - {formatMillions(match.ticket_max)}
                                            </div>
                                            {match.ticket_overlap && (
                                              <div className="text-xs text-gray-500 mt-1">
                                                Overlap {formatMillions(match.ticket_overlap.min)} - {formatMillions(match.ticket_overlap.max)}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">Overlap drivers: {match.overlap_size}</div>
                                        </div>
                                        {renderOverlapBadges(match.overlap_preferences)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">Select a saved strategy to see cross-CRM matches.</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Strategy</h2>

              {/* Strategy Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="e.g., High Yield Emerging Markets $50M+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Investment Size Filters */}
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Size Range (USD)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum (in millions)
                    </label>
                    <input
                      type="number"
                      value={newSizeFilter.minInvestment}
                      onChange={(e) => setNewSizeFilter({ ...newSizeFilter, minInvestment: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave 0 for no minimum</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum (in millions)
                    </label>
                    <input
                      type="number"
                      value={newSizeFilter.maxInvestment}
                      onChange={(e) => setNewSizeFilter({ ...newSizeFilter, maxInvestment: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave 0 for no maximum</p>
                  </div>
                </div>
              </div>

              {/* Preference Filters */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Preferences</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click toggles to cycle through: no filter (—) → Yes (Y) → No (N)
                </p>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_COLUMNS.map((col) => (
                    <TriStateToggle
                      key={col.key}
                      label={col.label}
                      value={newPreferenceFilters[col.key]}
                      onChange={(value) => setNewPreferenceFilters((prev) => ({ ...prev, [col.key]: value }))}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewFilterName('');
                    const resetFilters: Record<string, FilterState> = {};
                    PREFERENCE_COLUMNS.forEach((col) => {
                      resetFilters[col.key] = 'any';
                    });
                    setNewPreferenceFilters(resetFilters);
                    setNewSizeFilter({ minInvestment: 0, maxInvestment: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedFiltersPage;
