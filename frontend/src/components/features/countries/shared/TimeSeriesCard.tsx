/**
 * TimeSeriesCard Component
 * Displays time series data in structured table format with trends
 * Handles patterns like: "64.5% (2022), 45.9% (2023 - sharp decline), 46.0% (2025 proj)..."
 */

import React, { useState } from 'react';
import {
  parseTimeSeriesData,
  calculateChange,
  getTrendEmoji,
  dedupTimeSeriesByYear,
  type TimeSeriesPoint,
} from '../../../../utils/structuredTextParsing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface TimeSeriesCardProps {
  title: string;
  rawText: string;
  defaultView?: 'table' | 'compact';
  defaultCollapsed?: boolean;
  highlightRecent?: boolean;
  interpretLower?: 'good' | 'bad';  // Is lower value good (debt) or bad (growth)?
}

const TimeSeriesCard: React.FC<TimeSeriesCardProps> = ({
  title,
  rawText,
  defaultView = 'table',
  defaultCollapsed = true,
  highlightRecent = true,
  interpretLower = 'good',
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const [view, setView] = useState<'table' | 'compact'>(defaultView);

  // Parse time series data
  const dataPoints = parseTimeSeriesData(rawText);

  if (dataPoints.length === 0) {
    return null;
  }

  // Deduplicate by year (keeps first occurrence when multiple values for same year)
  const dedupedPoints = dedupTimeSeriesByYear(dataPoints);

  // Sort by year
  const sortedPoints = [...dedupedPoints].sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Split into actual and projected
  const actualPoints = sortedPoints.filter(p => !p.isProjection);
  const projectedPoints = sortedPoints.filter(p => p.isProjection);

  // Determine what to show based on collapsed state
  const visiblePoints = isExpanded
    ? sortedPoints
    : [...actualPoints.slice(-2), ...projectedPoints.slice(0, 3)];

  // Calculate changes for each point
  const pointsWithChanges = visiblePoints.map((point, index) => {
    if (index === 0) return { ...point, change: null };

    const previous = visiblePoints[index - 1];
    const change = calculateChange(point.value, previous.value, point.unit);

    // Determine if change is good based on interpretLower
    const isGoodChange = interpretLower === 'good'
      ? change.direction === 'down'
      : change.direction === 'up';

    return {
      ...point,
      change,
      isGoodChange,
    };
  });

  // Find latest actual value
  const latestActual = actualPoints[actualPoints.length - 1];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${TYPOGRAPHY.LAYOUT.cardPadding}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <div className="flex items-center gap-2">
          {dataPoints.length > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? '▲ Collapse' : `▼ Show all (${dataPoints.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Year
              </th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Value
              </th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Change
              </th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {pointsWithChanges.map((point, index) => {
              const isLatestActual = highlightRecent && point.year === latestActual?.year;

              return (
                <tr
                  key={`${point.year}-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isLatestActual ? 'bg-blue-50' : ''
                  } ${point.isProjection ? 'text-gray-500' : ''}`}
                >
                  {/* Year */}
                  <td className="py-2 px-3 font-medium">
                    {point.year}
                    {isLatestActual && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                        Latest
                      </span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="py-2 px-3 text-right font-semibold text-gray-900">
                    {point.value.toFixed(1)}
                    {point.unit}
                  </td>

                  {/* Change */}
                  <td className="py-2 px-3 text-right">
                    {point.change ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          point.isGoodChange
                            ? 'text-green-700'
                            : point.change.direction === 'neutral'
                            ? 'text-gray-500'
                            : 'text-red-700'
                        }`}
                      >
                        {getTrendEmoji(point.change.direction, point.isGoodChange)}
                        <span className="text-xs font-medium">
                          {point.change.percentage >= 0 ? '+' : ''}
                          {point.change.percentage.toFixed(1)}
                          {point.change.displayMode === 'points' ? 'pp' : '%'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Note/Annotation */}
                  <td className="py-2 px-3 text-xs">
                    {point.isProjection && (
                      <span className="italic text-gray-500">Projected</span>
                    )}
                    {point.annotation && !point.isProjection && (
                      <span className="text-gray-600">{point.annotation}</span>
                    )}
                    {!point.annotation && !point.isProjection && index === 0 && (
                      <span className="text-gray-400">Base year</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      {!isExpanded && dataPoints.length > visiblePoints.length && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
          {dataPoints.length - visiblePoints.length} more data points available
        </div>
      )}
    </div>
  );
};

export default TimeSeriesCard;
