/**
 * Deal Precedents Table Component
 * Read-only display of deal precedents
 */

import React from 'react';
import { DealPrecedent } from '../../types/liquidity';

interface DealPrecedentsTableProps {
  deals: DealPrecedent[];
  emptyMessage?: string;
}

const DealPrecedentsTable: React.FC<DealPrecedentsTableProps> = ({
  deals,
  emptyMessage = 'No deal precedents recorded yet.'
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    if (!amount || amount === 0) return 'N/A';

    // Format large numbers with M/B suffixes
    if (amount >= 1_000_000_000) {
      return `${currency} ${(amount / 1_000_000_000).toFixed(2)}B`;
    } else if (amount >= 1_000_000) {
      return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
    } else {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Structure
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pricing
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Spread (bps)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Maturity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deals.map((deal) => (
            <tr key={deal.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {formatDate(deal.deal_date)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {deal.deal_name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {deal.structure}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {deal.pricing || 'N/A'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {deal.spread_bps || 'N/A'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {formatCurrency(deal.size, deal.currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {deal.maturity}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                {deal.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DealPrecedentsTable;
