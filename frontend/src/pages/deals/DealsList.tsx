/**
 * Deals List Page
 * Main deals interface showing all deals with filtering and search
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Deal,
  DealStatus,
  DealType,
  DealSector,
  DealRegion,
  DEAL_STATUSES,
  DEAL_TYPES,
  DEAL_SECTORS,
  DEAL_REGIONS,
  DealFilters,
} from '../../types/deals';
import {
  getDeals,
  deleteDeal,
  downloadDealsCSV,
  downloadDealsXLSX,
} from '../../services/dealsService';
import DealCard from '../../components/features/deals/DealCard';
import DownloadDropdown from '../../components/ui/DownloadDropdown';

const DealsList: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DealStatus | ''>('');
  const [filterType, setFilterType] = useState<DealType | ''>('');
  const [filterSector, setFilterSector] = useState<DealSector | ''>('');
  const [filterRegion, setFilterRegion] = useState<DealRegion | ''>('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');

  // View options
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const response = await getDeals();

      if (response.success && response.data) {
        setDeals(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load deals');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dealId: string) => {
    try {
      const response = await deleteDeal(dealId);
      if (response.success) {
        // Remove from local state
        setDeals(deals.filter(d => d.id !== dealId));
      } else {
        alert(`Failed to delete deal: ${response.message}`);
      }
    } catch (err) {
      alert('Failed to delete deal');
    }
  };

  const handleEdit = (deal: Deal) => {
    navigate(`/deals/${deal.id}/edit`);
  };

  const handleExportCSV = async () => {
    try {
      await downloadDealsCSV(buildFilters());
      // Success - file will be downloaded by browser
    } catch (err) {
      alert('Failed to export deals');
    }
  };

  const buildFilters = (): DealFilters => {
    const filters: DealFilters = {};
    if (searchTerm) filters.search = searchTerm;
    if (filterStatus) filters.status = filterStatus;
    if (filterType) filters.deal_type = filterType;
    if (filterSector) filters.sector = filterSector;
    if (filterRegion) filters.region = filterRegion;
    if (filterCountry) filters.country = filterCountry;
    if (filterCurrency) filters.currency = filterCurrency;
    if (minSize) filters.min_size = parseFloat(minSize);
    if (maxSize) filters.max_size = parseFloat(maxSize);
    return filters;
  };

  // Apply client-side filtering
  const filteredDeals = deals.filter(deal => {
    // Search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        deal.deal_name.toLowerCase().includes(search) ||
        deal.project_name?.toLowerCase().includes(search) ||
        deal.description?.toLowerCase().includes(search) ||
        deal.country?.toLowerCase().includes(search) ||
        deal.deal_number?.toLowerCase().includes(search);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus && deal.status !== filterStatus) return false;

    // Type filter
    if (filterType && deal.deal_type !== filterType) return false;

    // Sector filter
    if (filterSector && deal.sector !== filterSector) return false;

    // Region filter
    if (filterRegion && deal.region !== filterRegion) return false;

    // Country filter
    if (filterCountry && deal.country !== filterCountry) return false;

    // Currency filter
    if (filterCurrency && deal.currency !== filterCurrency) return false;

    // Size filters
    if (minSize && deal.total_size < parseFloat(minSize)) return false;
    if (maxSize && deal.total_size > parseFloat(maxSize)) return false;

    return true;
  });

  // Get unique values for dropdowns
  const uniqueCountries = Array.from(new Set(deals.map(d => d.country).filter(Boolean))).sort();
  const uniqueCurrencies = Array.from(new Set(deals.map(d => d.currency).filter(Boolean))).sort();

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterType('');
    setFilterSector('');
    setFilterRegion('');
    setFilterCountry('');
    setFilterCurrency('');
    setMinSize('');
    setMaxSize('');
  };

  const hasActiveFilters = searchTerm || filterStatus || filterType || filterSector ||
    filterRegion || filterCountry || filterCurrency || minSize || maxSize;

  // Calculate totals
  const totalValue = filteredDeals.reduce((sum, deal) => {
    // Convert all to USD for summary (simplified)
    return sum + deal.total_size;
  }, 0);

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
        <button onClick={fetchDeals} className="mt-2 text-sm text-red-600 hover:text-red-800">
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
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-1">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} • Total Value: ${(totalValue / 1_000_000).toFixed(0)}M
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'compact' : 'cards')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            title={viewMode === 'cards' ? 'Switch to Compact View' : 'Switch to Card View'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {viewMode === 'cards' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              )}
            </svg>
          </button>
          <DownloadDropdown
            onDownloadCSV={() => handleExportCSV()}
            onDownloadXLSX={() => {
              try {
                downloadDealsXLSX(buildFilters());
              } catch (err) {
                alert('Failed to export deals');
              }
            }}
            label="Export"
          />
          <Link
            to="/deals/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + New Deal
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deals, projects, countries..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DealStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {DEAL_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DealType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {DEAL_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value as DealSector | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sectors</option>
              {DEAL_SECTORS.map(sector => (
                <option key={sector} value={sector}>
                  {sector.charAt(0).toUpperCase() + sector.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value as DealRegion | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              {DEAL_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Country */}
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

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Currencies</option>
              {uniqueCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Size Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Size (millions)</label>
            <input
              type="number"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              placeholder="e.g., 10000000 for $10M"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Size (millions)</label>
            <input
              type="number"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
              placeholder="e.g., 100000000 for $100M"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredDeals.length} of {deals.length} deal{deals.length !== 1 ? 's' : ''}
        </div>
        {filteredDeals.length > 0 && (
          <div>
            Filtered Total: ${(totalValue / 1_000_000).toFixed(0)}M
          </div>
        )}
      </div>

      {/* Deals Grid */}
      <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {filteredDeals.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">
              {hasActiveFilters ? 'No deals match your filters' : 'No deals yet'}
            </p>
            {!hasActiveFilters && (
              <Link
                to="/deals/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Deal
              </Link>
            )}
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              showParticipants={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              compact={viewMode === 'compact'}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DealsList;
