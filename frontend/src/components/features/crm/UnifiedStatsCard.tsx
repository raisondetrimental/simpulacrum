/**
 * Unified Stats Card Component
 *
 * Displays statistics with optional breakdown by organization type
 */

import React from 'react';
import { OrganizationType, ORGANIZATION_TYPE_LABELS, getOrganizationTypeColor } from '../../../types/crm';

interface UnifiedStatsCardProps {
  title: string;
  total: number;
  breakdown?: Partial<Record<OrganizationType, number>>;
  icon?: React.ReactNode;
  className?: string;
}

const UnifiedStatsCard: React.FC<UnifiedStatsCardProps> = ({
  title,
  total,
  breakdown,
  icon,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      {/* Total */}
      <div className="text-3xl font-bold text-gray-900 mb-4">{total.toLocaleString()}</div>

      {/* Breakdown by type */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 mb-2">By Type:</div>
          {Object.entries(breakdown).map(([type, count]) => {
            const orgType = type as OrganizationType;
            const { bg, text } = getOrganizationTypeColor(orgType);
            const label = ORGANIZATION_TYPE_LABELS[orgType];

            return (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${bg} ${text} font-medium text-xs`}>
                  {label}
                </span>
                <span className="font-semibold text-gray-700">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UnifiedStatsCard;
