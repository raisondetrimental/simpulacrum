/**
 * Investment Strategies Page - Completely Rebuilt
 * Simple approach: Create strategies, view ALL matching organizations
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InvestmentMatchesResponse, InvestmentProfile, SavedStrategy, Contact } from '../../types/investment';
import { getInvestmentStrategies, saveInvestmentStrategies, getInvestmentMatches } from '../../services/investmentService';
import CountryMultiSelect from '../../components/ui/CountryMultiSelect';

// Helper function to get organization detail link
const getOrganizationLink = (profile: InvestmentProfile): string => {
  switch (profile.category) {
    case 'capital_partner':
      return `/liquidity/capital-partners/${profile.entity_id}`;
    case 'sponsor':
      return `/sponsors/corporates/${profile.entity_id}`;
    case 'counsel':
      return `/counsel/legal-advisors/${profile.entity_id}`;
    case 'agent':
      return `/agents/${profile.entity_id}`;
    default:
      return '#';
  }
};

// Helper function to get contact detail link
const getContactLink = (contact: Contact): string => {
  switch (contact.parent_org_type) {
    case 'capital_partner':
      return `/liquidity/contacts/${contact.id}`;
    case 'sponsor':
      return `/sponsors/contacts/${contact.id}`;
    case 'counsel':
      return `/counsel/contacts/${contact.id}`;
    case 'agent':
      return `/agents/contacts/${contact.id}`;
    default:
      return '#';
  }
};

// ALL 19 preference columns (countries now handled separately via multi-select)
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
  { key: 'coal', label: 'Coal' },
  { key: 'energy_infra', label: 'Energy Infra' },
  { key: 'transport_infra', label: 'Transport Infra' },
  { key: 'more_expensive_than_usual', label: 'More Expensive than usual' },
  { key: 'require_bank_guarantee', label: 'Require Bank Guarantee' },
];

type FilterState = 'any' | 'Y' | 'N';

const TriStateToggle: React.FC<{
  label: string;
  value: FilterState;
  onChange: (value: FilterState) => void;
}> = ({ label, value, onChange }) => {
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

const RelationshipBadge: React.FC<{ relationship?: string | null }> = ({ relationship }) => {
  if (!relationship) return null;

  const getBadgeClass = () => {
    switch (relationship) {
      case 'Strong': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Developing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getBadgeClass()}`}>
      {relationship}
    </span>
  );
};

const InvestmentStrategiesPage: React.FC = () => {
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<InvestmentMatchesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'organizations' | 'contacts'>('organizations');

  // Contact filters
  const [roleFilter, setRoleFilter] = useState('');
  const [orgTypeFilters, setOrgTypeFilters] = useState<Set<string>>(new Set());
  const [relationshipFilters, setRelationshipFilters] = useState<Set<string>>(new Set());
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'overdue' | 'due_soon' | 'no_reminder'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'organization' | 'last_contact'>('name');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newPreferenceFilters, setNewPreferenceFilters] = useState<Record<string, FilterState>>(() => {
    const initial: Record<string, FilterState> = {};
    PREFERENCE_COLUMNS.forEach((col) => {
      initial[col.key] = 'any';
    });
    return initial;
  });
  const [newSizeFilter, setNewSizeFilter] = useState({ minInvestment: 0, maxInvestment: 0 });
  const [newCountries, setNewCountries] = useState<string[]>([]);

  const formatMillions = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    const amountInMillions = value / 1_000_000;
    const formatted = amountInMillions.toLocaleString(undefined, {
      maximumFractionDigits: amountInMillions >= 100 ? 0 : 1
    });
    return `$${formatted}M`;
  };

  const sortByRelationship = (entities: InvestmentProfile[]) => {
    const order: Record<string, number> = { 'Strong': 1, 'Medium': 2, 'Developing': 3, 'Cold': 4 };
    return [...entities].sort((a, b) => {
      const aOrder = order[a.relationship || ''] || 999;
      const bOrder = order[b.relationship || ''] || 999;
      return aOrder - bOrder;
    });
  };

  // Filter and sort contacts
  const getFilteredContacts = () => {
    if (!matchResults || !matchResults.all_contacts) return [];

    let filtered = matchResults.all_contacts.filter(contact => {
      // Role filter
      if (roleFilter && !contact.role.toLowerCase().includes(roleFilter.toLowerCase())) {
        return false;
      }

      // Organization type filter
      if (orgTypeFilters.size > 0 && !orgTypeFilters.has(contact.parent_org_type)) {
        return false;
      }

      // Relationship filter
      if (relationshipFilters.size > 0 && !relationshipFilters.has(contact.relationship || '')) {
        return false;
      }

      // Follow-up status filter
      if (followUpFilter !== 'all') {
        const today = new Date();
        const reminderDate = contact.next_contact_reminder ? new Date(contact.next_contact_reminder) : null;

        if (followUpFilter === 'overdue' && (!reminderDate || reminderDate >= today)) {
          return false;
        }
        if (followUpFilter === 'due_soon') {
          if (!reminderDate) return false;
          const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil < 0 || daysUntil > 7) return false;
        }
        if (followUpFilter === 'no_reminder' && reminderDate) {
          return false;
        }
      }

      return true;
    });

    // Sort contacts
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'organization') {
        return a.parent_org_name.localeCompare(b.parent_org_name);
      } else if (sortBy === 'last_contact') {
        const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
        const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
        return dateB - dateA; // Most recent first
      }
      return 0;
    });

    return filtered;
  };

  const toggleOrgTypeFilter = (type: string) => {
    const newFilters = new Set(orgTypeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setOrgTypeFilters(newFilters);
  };

  const toggleRelationshipFilter = (relationship: string) => {
    const newFilters = new Set(relationshipFilters);
    if (newFilters.has(relationship)) {
      newFilters.delete(relationship);
    } else {
      newFilters.add(relationship);
    }
    setRelationshipFilters(newFilters);
  };

  const exportContactsCSV = () => {
    const contacts = getFilteredContacts();
    if (contacts.length === 0) return;

    const headers = ['Name', 'Role', 'Organization', 'Type', 'Email', 'Phone', 'Last Contact', 'Next Reminder', 'Relationship'];
    const rows = contacts.map(contact => [
      contact.name,
      contact.role,
      contact.parent_org_name,
      contact.parent_org_type,
      contact.email || '',
      contact.phone || '',
      contact.last_contact_date || '',
      contact.next_contact_reminder || '',
      contact.relationship || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `investment_strategy_contacts_${selectedStrategy?.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOrgTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'capital_partner': return 'bg-green-100 text-green-800 border-green-200';
      case 'sponsor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'agent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'counsel': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatOrgType = (type: string) => {
    switch (type) {
      case 'capital_partner': return 'Capital Partner';
      case 'sponsor': return 'Sponsor';
      case 'agent': return 'Agent';
      case 'counsel': return 'Counsel';
      default: return type;
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getReminderClass = (reminderDate: string | null | undefined) => {
    if (!reminderDate) return '';
    const today = new Date();
    const reminder = new Date(reminderDate);
    const daysUntil = Math.ceil((reminder.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'text-red-600 font-semibold'; // Overdue
    if (daysUntil <= 7) return 'text-orange-600 font-semibold'; // Due soon
    return '';
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  useEffect(() => {
    if (selectedStrategyId) {
      loadMatches();
    } else {
      setMatchResults(null);
    }
  }, [selectedStrategyId]);

  const loadStrategies = async () => {
    try {
      const result = await getInvestmentStrategies();
      if (result.success && result.data) {
        setSavedStrategies(result.data);
      }
    } catch (err) {
      console.error('Failed to load strategies:', err);
    }
  };

  const loadMatches = async () => {
    const strategy = savedStrategies.find(s => s.id === selectedStrategyId);
    if (!strategy) return;

    setLoading(true);
    setError(null);

    try {
      // Send ALL preference filters (not just shared keys)
      const filteredPreferences: Record<string, string> = {};
      Object.entries(strategy.preferenceFilters).forEach(([key, value]) => {
        if (value !== 'any') {
          filteredPreferences[key] = value;
        }
      });

      const result = await getInvestmentMatches(
        filteredPreferences,
        {
          minInvestment: strategy.sizeFilter.minInvestment,
          maxInvestment: strategy.sizeFilter.maxInvestment,
          unit: 'million'
        },
        strategy.countries && strategy.countries.length > 0 ? strategy.countries : undefined
      );

      if (result.success) {
        setMatchResults(result);
      } else {
        setError(result.message || 'Failed to load matches');
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Failed to load matching organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStrategy = (strategy: SavedStrategy) => {
    setEditingStrategyId(strategy.id);
    setNewStrategyName(strategy.name);
    setNewPreferenceFilters({ ...strategy.preferenceFilters });
    setNewSizeFilter({ ...strategy.sizeFilter });
    setNewCountries(strategy.countries ? [...strategy.countries] : []);
    setShowCreateModal(true);
  };

  const handleCreateStrategy = async () => {
    if (!newStrategyName.trim()) {
      alert('Please enter a strategy name');
      return;
    }

    if (editingStrategyId) {
      // Update existing strategy
      const updatedStrategies = savedStrategies.map(s =>
        s.id === editingStrategyId
          ? {
              ...s,
              name: newStrategyName.trim(),
              preferenceFilters: { ...newPreferenceFilters },
              sizeFilter: { ...newSizeFilter },
              countries: newCountries.length > 0 ? [...newCountries] : undefined,
            }
          : s
      );

      try {
        const result = await saveInvestmentStrategies(updatedStrategies);
        if (result.success) {
          setSavedStrategies(updatedStrategies);
          setSelectedStrategyId(editingStrategyId);

          // Reset modal
          setEditingStrategyId(null);
          setNewStrategyName('');
          const resetFilters: Record<string, FilterState> = {};
          PREFERENCE_COLUMNS.forEach((col) => {
            resetFilters[col.key] = 'any';
          });
          setNewPreferenceFilters(resetFilters);
          setNewSizeFilter({ minInvestment: 0, maxInvestment: 0 });
          setNewCountries([]);
          setShowCreateModal(false);
        } else {
          alert('Failed to update strategy: ' + result.message);
        }
      } catch (err) {
        alert('Failed to update strategy');
      }
    } else {
      // Create new strategy
      const newStrategy: SavedStrategy = {
        id: Date.now().toString(),
        name: newStrategyName.trim(),
        preferenceFilters: { ...newPreferenceFilters },
        sizeFilter: { ...newSizeFilter },
        countries: newCountries.length > 0 ? [...newCountries] : undefined,
        createdAt: new Date().toISOString(),
      };

      const updatedStrategies = [...savedStrategies, newStrategy];

      try {
        const result = await saveInvestmentStrategies(updatedStrategies);
        if (result.success) {
          setSavedStrategies(updatedStrategies);
          setSelectedStrategyId(newStrategy.id);

          // Reset modal
          setNewStrategyName('');
          const resetFilters: Record<string, FilterState> = {};
          PREFERENCE_COLUMNS.forEach((col) => {
            resetFilters[col.key] = 'any';
          });
          setNewPreferenceFilters(resetFilters);
          setNewSizeFilter({ minInvestment: 0, maxInvestment: 0 });
          setNewCountries([]);
          setShowCreateModal(false);
        } else {
          alert('Failed to save strategy: ' + result.message);
        }
      } catch (err) {
        alert('Failed to save strategy');
      }
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;

    if (selectedStrategyId === strategyId) {
      setSelectedStrategyId(null);
    }

    const updatedStrategies = savedStrategies.filter(s => s.id !== strategyId);

    try {
      const result = await saveInvestmentStrategies(updatedStrategies);
      if (result.success) {
        setSavedStrategies(updatedStrategies);
      } else {
        alert('Failed to delete strategy');
      }
    } catch (err) {
      alert('Failed to delete strategy');
    }
  };

  const totalMatches = matchResults
    ? matchResults.counts.capital_partners +
      matchResults.counts.sponsors +
      matchResults.counts.agents +
      matchResults.counts.counsel
    : 0;

  const selectedStrategy = savedStrategies.find(s => s.id === selectedStrategyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Strategies Sandbox</h1>
        <p className="mt-2 text-gray-600">
          Create and save custom filter combinations to find matching organizations across all CRM modules.
        </p>
      </div>

      {/* Strategy Management */}
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {savedStrategies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No saved strategies yet.</p>
            <p className="mt-2 text-sm">Click "Create New Strategy" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedStrategies.map((strategy) => {
              const activePrefs = Object.values(strategy.preferenceFilters).filter(v => v !== 'any').length;
              const hasSizeFilter = strategy.sizeFilter.minInvestment > 0 || strategy.sizeFilter.maxInvestment > 0;
              const hasCountries = strategy.countries && strategy.countries.length > 0;

              return (
                <div
                  key={strategy.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedStrategyId === strategy.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedStrategyId(strategy.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 flex-1">
                      {strategy.name}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStrategy(strategy);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit strategy"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStrategy(strategy.id);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete strategy"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{activePrefs} preference filter{activePrefs !== 1 ? 's' : ''}</div>
                    {hasSizeFilter && (
                      <div>
                        Size: ${strategy.sizeFilter.minInvestment}M - ${strategy.sizeFilter.maxInvestment}M
                      </div>
                    )}
                    {hasCountries && (
                      <div>
                        {strategy.countries!.length} countr{strategy.countries!.length !== 1 ? 'ies' : 'y'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Section */}
      {selectedStrategy && (
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedStrategy.name}
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('organizations')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'organizations'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Organizations
                {matchResults && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    {totalMatches}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'contacts'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contacts
                {matchResults && matchResults.all_contacts && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    {matchResults.all_contacts.length}
                  </span>
                )}
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && !loading && (
              <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {!loading && !error && matchResults && activeTab === 'organizations' && (
              <>
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-5 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-500">Capital Partners</div>
                    <div className="text-3xl font-bold text-gray-900">{matchResults.counts.capital_partners}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-500">Sponsors</div>
                    <div className="text-3xl font-bold text-gray-900">{matchResults.counts.sponsors}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-500">Agents</div>
                    <div className="text-3xl font-bold text-gray-900">{matchResults.counts.agents}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-500">Counsel</div>
                    <div className="text-3xl font-bold text-gray-900">{matchResults.counts.counsel}</div>
                  </div>
                  <div className="bg-blue-600 text-white rounded-lg shadow-sm p-4">
                    <div className="text-sm opacity-90">Total Matches</div>
                    <div className="text-3xl font-bold">{totalMatches}</div>
                  </div>
                </div>

                {/* Capital Partners Table */}
                {matchResults.results.capital_partners.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Capital Partners</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Range</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortByRelationship(matchResults.results.capital_partners).map((partner) => (
                            <tr key={partner.profile_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={getOrganizationLink(partner)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {partner.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(partner.metadata?.country as string) || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatMillions(partner.ticket_min)} - {formatMillions(partner.ticket_max)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <RelationshipBadge relationship={partner.relationship} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sponsors Table */}
                {matchResults.results.sponsors.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Sponsors</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Need</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortByRelationship(matchResults.results.sponsors).map((sponsor) => (
                            <tr key={sponsor.profile_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={getOrganizationLink(sponsor)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {sponsor.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(sponsor.metadata?.country as string) || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {sponsor.ticket_min && sponsor.ticket_max
                                  ? `${formatMillions(sponsor.ticket_min)} - ${formatMillions(sponsor.ticket_max)}`
                                  : '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <RelationshipBadge relationship={sponsor.relationship} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Agents Table */}
                {matchResults.results.agents.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Transaction Agents</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortByRelationship(matchResults.results.agents).map((agent) => (
                            <tr key={agent.profile_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={getOrganizationLink(agent)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {agent.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(agent.metadata?.agent_type as string) || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(agent.metadata?.headquarters_location as string) || (agent.metadata?.country as string) || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <RelationshipBadge relationship={agent.relationship} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Counsel Table */}
                {matchResults.results.counsel.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Legal Advisors</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortByRelationship(matchResults.results.counsel).map((counsel) => (
                            <tr key={counsel.profile_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={getOrganizationLink(counsel)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {counsel.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(counsel.metadata?.headquarters_location as string) || (counsel.metadata?.country as string) || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <RelationshipBadge relationship={counsel.relationship} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {totalMatches === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No organizations match this strategy.</p>
                    <p className="text-sm mt-2">Try adjusting the filters or creating a new strategy.</p>
                  </div>
                )}
              </>
            )}

            {/* Contacts Tab */}
            {!loading && !error && matchResults && activeTab === 'contacts' && (
              <>
                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Contacts</h3>

                  <div className="space-y-4">
                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role (search)
                      </label>
                      <input
                        type="text"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        placeholder="e.g., CEO, CFO, Director..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Organization Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['capital_partner', 'sponsor', 'agent', 'counsel'].map(type => (
                          <button
                            key={type}
                            onClick={() => toggleOrgTypeFilter(type)}
                            className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                              orgTypeFilters.has(type)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {formatOrgType(type)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Relationship Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Strong', 'Medium', 'Developing', 'Cold'].map(rel => (
                          <button
                            key={rel}
                            onClick={() => toggleRelationshipFilter(rel)}
                            className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                              relationshipFilters.has(rel)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Status
                      </label>
                      <select
                        value={followUpFilter}
                        onChange={(e) => setFollowUpFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Contacts</option>
                        <option value="overdue">Overdue Reminders</option>
                        <option value="due_soon">Due This Week</option>
                        <option value="no_reminder">No Reminder Set</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Name</option>
                        <option value="organization">Organization</option>
                        <option value="last_contact">Last Contact Date</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contacts Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contacts ({getFilteredContacts().length})
                    </h3>
                    <button
                      onClick={exportContactsCSV}
                      disabled={getFilteredContacts().length === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Export to CSV
                    </button>
                  </div>

                  {getFilteredContacts().length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Reminder</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getFilteredContacts().map((contact) => (
                            <tr key={contact.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={getContactLink(contact)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {contact.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {contact.role}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{contact.parent_org_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getOrgTypeBadgeClass(contact.parent_org_type)}`}>
                                  {formatOrgType(contact.parent_org_type)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {contact.email ? (
                                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                                    {contact.email}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(contact.last_contact_date)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${getReminderClass(contact.next_contact_reminder)}`}>
                                {formatDate(contact.next_contact_reminder)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <RelationshipBadge relationship={contact.relationship} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No contacts match the selected filters.</p>
                      <p className="text-sm mt-2">Try adjusting your filter criteria.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingStrategyId ? 'Edit Strategy' : 'Create New Strategy'}
              </h2>

              {/* Strategy Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={newStrategyName}
                  onChange={(e) => setNewStrategyName(e.target.value)}
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

              {/* Country Filters */}
              <div className="mb-6">
                <CountryMultiSelect
                  selectedCountries={newCountries}
                  onChange={setNewCountries}
                  label="Investment Focus Countries"
                  placeholder="Select countries to filter by..."
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to match all countries</p>
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
                    setEditingStrategyId(null);
                    setNewStrategyName('');
                    const resetFilters: Record<string, FilterState> = {};
                    PREFERENCE_COLUMNS.forEach((col) => {
                      resetFilters[col.key] = 'any';
                    });
                    setNewPreferenceFilters(resetFilters);
                    setNewSizeFilter({ minInvestment: 0, maxInvestment: 0 });
                    setNewCountries([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStrategy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingStrategyId ? 'Update Strategy' : 'Save Strategy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentStrategiesPage;
