/**
 * SmartMetricDisplay Component
 * Parses narrative text to extract and prominently display key numeric values
 * Shows primary metric as headline with supporting context below
 */

import React, { useState } from 'react';
import { extractPrimaryMetric, isNarrative, formatNumber } from '../../../../utils/textProcessing';
import {
  detectTimeSeriesPattern,
  detectIncludesExcludes,
  detectMultiFactPattern,
} from '../../../../utils/structuredTextParsing';
import StructuredNarrativeCard from './StructuredNarrativeCard';
import MultiFactCard from './MultiFactCard';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface SmartMetricDisplayProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  trend?: 'good' | 'warning' | 'bad';
  threshold?: { warning: number; bad: number };
}

const SmartMetricDisplay: React.FC<SmartMetricDisplayProps> = ({
  title,
  value,
  unit = '',
  subtitle,
  trend,
  threshold,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if value is narrative text
  const isText = typeof value === 'string' && isNarrative(value);

  // Check for structured patterns first
  if (isText) {
    const text = value as string;

    // Pattern 1: Time series with includes/excludes (most common in problem fields)
    if (detectTimeSeriesPattern(text) || detectIncludesExcludes(text)) {
      return (
        <div>
          <StructuredNarrativeCard title={title} rawText={text} subtitle={subtitle} />
        </div>
      );
    }

    // Pattern 2: Multi-fact paragraphs
    if (detectMultiFactPattern(text)) {
      return (
        <div>
          <MultiFactCard title={title} rawText={text} maxFacts={8} />
          {subtitle && <p className={TYPOGRAPHY.CARD.subtitle}>{subtitle}</p>}
        </div>
      );
    }
  }

  // Determine color styling
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
    };

    if (trend in trendColors) {
      const colors = trendColors[trend];
      colorClass = colors.color;
      bgClass = colors.bg;
      borderClass = colors.border;
    }
  }

  // Render simple numeric display
  if (typeof value === 'number') {
    return (
      <div
        className={`${bgClass} ${TYPOGRAPHY.LAYOUT.cardPadding} rounded-lg shadow border ${borderClass}`}
      >
        <h4 className={TYPOGRAPHY.CARD.title}>{title}</h4>
        <p className={`${TYPOGRAPHY.METRIC_DISPLAY.numeric} ${colorClass} mt-2`}>
          {formatNumber(value)}
          {unit}
        </p>
        {subtitle && <p className={TYPOGRAPHY.CARD.subtitle}>{subtitle}</p>}
      </div>
    );
  }

  // For narrative text, try to extract primary metric
  if (isText) {
    const text = value as string;
    const metric = extractPrimaryMetric(text);

    return (
      <div className={`${bgClass} ${TYPOGRAPHY.LAYOUT.cardPadding} rounded-lg shadow border ${borderClass}`}>
        <h4 className={TYPOGRAPHY.CARD.title}>{title}</h4>

        {metric ? (
          // Display extracted metric prominently
          <div className="mt-2 space-y-3">
            <div className="flex items-baseline gap-2">
              <p className={`${TYPOGRAPHY.METRIC_DISPLAY.numeric} ${colorClass}`}>
                {formatNumber(metric.value)}
                {metric.unit}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                title="View details"
              >
                ⓘ
              </button>
            </div>

            {/* Expandable context */}
            {isExpanded && (
              <div className="pt-3 border-t border-gray-200">
                <p className={`${TYPOGRAPHY.CARD.body} text-gray-700 leading-relaxed`}>
                  {text}
                </p>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  ← Show less
                </button>
              </div>
            )}

            {!isExpanded && metric.context && (
              <p className="text-xs text-gray-600 italic">
                {metric.context}
              </p>
            )}
          </div>
        ) : (
          // No metric found, display as expandable text
          <div className="mt-2 space-y-2">
            <div className={`relative ${!isExpanded ? 'max-h-20 overflow-hidden' : ''}`}>
              <p className={`${TYPOGRAPHY.CARD.body} ${colorClass} leading-relaxed`}>
                {text}
              </p>
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? '← Show less' : 'Read more →'}
            </button>
          </div>
        )}

        {subtitle && <p className={TYPOGRAPHY.CARD.subtitle}>{subtitle}</p>}
      </div>
    );
  }

  // Fallback for short text
  return (
    <div className={`${bgClass} ${TYPOGRAPHY.LAYOUT.cardPadding} rounded-lg shadow border ${borderClass}`}>
      <h4 className={TYPOGRAPHY.CARD.title}>{title}</h4>
      <p className={`${TYPOGRAPHY.METRIC_DISPLAY.shortText} ${colorClass} mt-2`}>
        {value}
        {unit}
      </p>
      {subtitle && <p className={TYPOGRAPHY.CARD.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default SmartMetricDisplay;
