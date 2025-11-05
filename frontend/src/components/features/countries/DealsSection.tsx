/**
 * DealsSection Component
 * Displays deals related to a specific country using fuzzy matching
 * Searches across multiple deal text fields due to incomplete country field data
 */

import React, { useState, useEffect } from 'react';
import { getDeals } from '../../../services/dealsService';
import type { Deal } from '../../../types/deals';
import DealCard from '../deals/DealCard';

interface DealsSectionProps {
  countrySlug: string;
  countryName: string;
}

// Map country slugs to search variants (names and adjective forms)
const COUNTRY_VARIANTS: Record<string, string[]> = {
  armenia: ['armenia', 'armenian'],
  mongolia: ['mongolia', 'mongolian'],
  turkiye: ['turkey', 'turkiye', 'türkiye', 'turkish'],
  uzbekistan: ['uzbekistan', 'uzbek'],
  vietnam: ['vietnam', 'vietnamese', 'viet nam'],
};

/**
 * Check if a deal matches any country variant
 * Performs case-insensitive substring matching across multiple text fields
 */
const matchesCountry = (deal: Deal, variants: string[]): boolean => {
  // Fields to search for country mentions
  const searchFields = [
    deal.country,
    deal.deal_name,
    deal.project_name,
    deal.description,
    deal.project_description,
    deal.notes,
    deal.region,
    deal.key_risks,
    deal.mitigants,
    deal.security_package,
  ];

  // Combine all text fields into a single searchable string
  const searchText = searchFields
    .filter(field => field) // Remove null/undefined
    .join(' ')
    .toLowerCase();

  // Check if any variant appears in the text
  return variants.some(variant => searchText.includes(variant.toLowerCase()));
};

const DealsSection: React.FC<DealsSectionProps> = ({ countrySlug, countryName }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, [countrySlug]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all deals (we'll filter client-side due to fuzzy matching needs)
      const response = await getDeals();

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load deals');
      }

      // Get country variants for fuzzy matching
      const variants = COUNTRY_VARIANTS[countrySlug] || [countrySlug];

      // Filter deals that match any country variant
      const matchingDeals = response.data.filter(deal => matchesCountry(deal, variants));

      setDeals(matchingDeals);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading deals...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-red-900 font-semibold mb-1">Error Loading Deals</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (deals.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Found</h3>
          <p className="text-gray-600">
            No deals have been recorded for {countryName} yet.
          </p>
        </div>
      </div>
    );
  }

  // Deals list
  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {countryName} Deals
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Deals grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deals.map(deal => (
          <DealCard
            key={deal.id}
            deal={deal}
            showParticipants={true}
            compact={false}
          />
        ))}
      </div>
    </div>
  );
};

export default DealsSection;
