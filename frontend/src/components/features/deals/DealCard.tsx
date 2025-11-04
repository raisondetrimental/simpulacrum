/**
 * DealCard Component
 * Displays a single deal in card format for list views
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Deal,
  DealWithParticipants,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_LABELS,
  formatDealSize,
  formatDealDate,
} from '../../../types/deals';

interface DealCardProps {
  deal: Deal | DealWithParticipants;
  showParticipants?: boolean;
  onEdit?: (deal: Deal) => void;
  onDelete?: (dealId: string) => void;
  compact?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  showParticipants = true,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const statusColorClass = DEAL_STATUS_COLORS[deal.status];
  const dealWithParticipants = deal as DealWithParticipants;
  const participantCount = dealWithParticipants.participants_count || 0;

  // Calculate completion percentage if it's a deal with participants
  const completionPct = deal.total_size > 0 && dealWithParticipants.total_commitments
    ? Math.round((dealWithParticipants.total_commitments / deal.total_size) * 100)
    : null;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 p-5">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded border font-medium ${statusColorClass}`}>
              {DEAL_STATUS_LABELS[deal.status]}
            </span>
            {deal.deal_type && (
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-300">
                {DEAL_TYPE_LABELS[deal.deal_type]}
              </span>
            )}
          </div>

          {/* Deal Name */}
          <Link
            to={`/deals/${deal.id}`}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-1"
          >
            {deal.deal_name}
          </Link>

          {/* Project Name (if different) */}
          {deal.project_name && deal.project_name !== deal.deal_name && (
            <div className="text-sm text-gray-600 italic mb-1">
              Project: {deal.project_name}
            </div>
          )}

          {/* Location & Sector */}
          <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
            {deal.country && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {deal.country}
              </span>
            )}
            {deal.sector && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {deal.sector.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Deal Size */}
        <div className="text-right ml-4">
          <div className="text-sm font-semibold text-gray-500">Deal Size</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDealSize(deal.total_size, deal.currency)}
          </div>
          {deal.structure && (
            <div className="text-xs text-gray-500 mt-1">{deal.structure}</div>
          )}
        </div>
      </div>

      {/* Deal Details Grid */}
      {!compact && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Closing Date */}
            {deal.closing_date && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Closing
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDealDate(deal.closing_date)}
                </div>
              </div>
            )}

            {/* Maturity Date */}
            {deal.maturity_date && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Maturity
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDealDate(deal.maturity_date)}
                </div>
              </div>
            )}

            {/* Pricing */}
            {deal.spread_bps > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Spread
                </div>
                <div className="text-sm font-medium text-gray-900">
                  +{deal.spread_bps} bps
                </div>
              </div>
            )}

            {/* All-in Rate */}
            {deal.all_in_rate > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  All-in Rate
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {deal.all_in_rate}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants Summary */}
      {showParticipants && participantCount > 0 && (
        <div className="bg-blue-50 rounded-md p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700">
              👥 {participantCount} Participant{participantCount !== 1 ? 's' : ''}
            </div>
            {completionPct !== null && (
              <div className="text-xs text-gray-600">
                {completionPct}% Committed
              </div>
            )}
          </div>
          {completionPct !== null && (
            <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(completionPct, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <Link
          to={`/deals/${deal.id}`}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium text-center"
        >
          View Details
        </Link>

        {onEdit && (
          <button
            onClick={() => onEdit(deal)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            title="Edit Deal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${deal.deal_name}"?`)) {
                onDelete(deal.id);
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
            title="Delete Deal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Description Preview (if exists) */}
      {!compact && deal.description && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 italic line-clamp-2">
            {deal.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default DealCard;
