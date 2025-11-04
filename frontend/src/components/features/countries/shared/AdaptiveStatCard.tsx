/**
 * AdaptiveStatCard Component
 * Intelligently renders content based on type:
 * - Numbers: Large display with bold styling
 * - Short text: Medium display with proper wrapping
 * - Long text: Expandable card with read more toggle
 */

import React, { useState } from 'react';
import { detectContentType, formatNumber } from '../../../../utils/textProcessing';
import {
  detectTimeSeriesPattern,
  detectIncludesExcludes,
} from '../../../../utils/structuredTextParsing';
import StructuredNarrativeCard from './StructuredNarrativeCard';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface AdaptiveStatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  trend?: 'good' | 'warning' | 'bad' | 'positive' | 'neutral' | 'negative';
  threshold?: { warning: number; bad: number };
}

const AdaptiveStatCard: React.FC<AdaptiveStatCardProps> = ({
  title,
  value,
  unit = '',
  subtitle,
  trend,
  threshold,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentType = detectContentType(value);

  // Check for structured patterns first (long text only)
  if (contentType === 'long-text' && typeof value === 'string') {
    const text = value as string;

    // If contains time series or includes/excludes, use structured component
    if (detectTimeSeriesPattern(text) || detectIncludesExcludes(text)) {
      return (
        <StructuredNarrativeCard
          title={title}
          rawText={text}
          subtitle={subtitle}
        />
      );
    }
  }

  // Determine color based on trend or threshold
  let colorClass = 'text-gray-900';
  let bgClass = 'bg-white';
  let borderClass = 'border-gray-200';

  if (threshold && typeof value === 'number') {
    if (value < threshold.bad) {
      colorClass = 'text-red-700';
      bgClass = 'bg-red-50';
      borderClass = 'border-red-300';
    } else if (value < threshold.warning) {
      colorClass = 'text-orange-700';
      bgClass = 'bg-orange-50';
      borderClass = 'border-orange-300';
    } else {
      colorClass = 'text-green-700';
      bgClass = 'bg-green-50';
      borderClass = 'border-green-300';
    }
  } else if (trend) {
    const trendColors = {
      good: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
      warning: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
      bad: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
      positive: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
      neutral: { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-300' },
      negative: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
    };

    if (trend in trendColors) {
      const colors = trendColors[trend as keyof typeof trendColors];
      colorClass = colors.color;
      bgClass = colors.bg;
      borderClass = colors.border;
    }
  }

  // Render based on content type
  const renderContent = () => {
    switch (contentType) {
      case 'number':
        return (
          <p className={`${TYPOGRAPHY.METRIC_DISPLAY.numeric} ${colorClass}`}>
            {formatNumber(value as number)}
            {unit}
          </p>
        );

      case 'short-text':
        return (
          <p className={`${TYPOGRAPHY.METRIC_DISPLAY.shortText} ${colorClass}`}>
            {value}
            {unit}
          </p>
        );

      case 'long-text':
        const text = value as string;
        const shouldTruncate = text.length > 150;

        return (
          <div className="space-y-2">
            <div
              className={`relative ${!isExpanded && shouldTruncate ? 'max-h-24 overflow-hidden' : ''}`}
            >
              <p className={`${TYPOGRAPHY.CARD.body} ${colorClass} leading-relaxed`}>
                {text}
              </p>
              {!isExpanded && shouldTruncate && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </div>

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isExpanded ? '← Show less' : 'Read more →'}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={`${bgClass} ${TYPOGRAPHY.LAYOUT.cardPadding} rounded-lg shadow border ${borderClass} ${TYPOGRAPHY.ANIMATION.transition}`}
    >
      <h4 className={TYPOGRAPHY.CARD.title}>{title}</h4>
      <div className="mt-2">{renderContent()}</div>
      {subtitle && <p className={TYPOGRAPHY.CARD.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default AdaptiveStatCard;
