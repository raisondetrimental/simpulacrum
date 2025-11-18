/**
 * ExpandableTextBlock Component
 * Displays long narrative text with extracted headline and expandable details
 * Ideal for DSA risk ratings, policy stances, and other narrative fields
 */

import React, { useState } from 'react';
import { extractHeadline } from '../../../../utils/structuredTextParsing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface ExpandableTextBlockProps {
  title?: string;
  text: string;
  defaultExpanded?: boolean;
  colorScheme?: 'default' | 'info' | 'warning' | 'success' | 'danger';
  showHeadline?: boolean;
  maxHeadlineWords?: number;
}

const ExpandableTextBlock: React.FC<ExpandableTextBlockProps> = ({
  title,
  text,
  defaultExpanded = false,
  colorScheme = 'default',
  showHeadline = true,
  maxHeadlineWords = 10,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!text) return null;

  // Extract headline
  const headline = showHeadline ? extractHeadline(text, maxHeadlineWords) : '';
  const hasHeadline = headline && headline.length > 0 && headline !== text;

  // Determine if text is actually long enough to need expansion
  const needsExpansion = text.length > 200;

  // Color scheme mapping
  const colorSchemes = {
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
      headlineText: 'text-gray-900',
      bodyText: 'text-gray-700',
      buttonText: 'text-blue-600 hover:text-blue-800',
      accentBorder: 'border-l-gray-400',
      gradientFrom: 'from-white',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      headlineText: 'text-blue-900',
      bodyText: 'text-blue-800',
      buttonText: 'text-blue-700 hover:text-blue-900',
      accentBorder: 'border-l-blue-500',
      gradientFrom: 'from-blue-50',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      headlineText: 'text-orange-900',
      bodyText: 'text-orange-800',
      buttonText: 'text-orange-700 hover:text-orange-900',
      accentBorder: 'border-l-orange-500',
      gradientFrom: 'from-orange-50',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      headlineText: 'text-green-900',
      bodyText: 'text-green-800',
      buttonText: 'text-green-700 hover:text-green-900',
      accentBorder: 'border-l-green-500',
      gradientFrom: 'from-green-50',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      headlineText: 'text-red-900',
      bodyText: 'text-red-800',
      buttonText: 'text-red-700 hover:text-red-900',
      accentBorder: 'border-l-red-500',
      gradientFrom: 'from-red-50',
    },
  };

  const colors = colorSchemes[colorScheme];

  return (
    <div
      className={`${colors.bg} ${TYPOGRAPHY.LAYOUT.cardPadding} rounded-lg shadow border ${colors.border} border-l-4 ${colors.accentBorder} ${TYPOGRAPHY.ANIMATION.transition}`}
    >
      {/* Optional Title */}
      {title && (
        <h4 className={`${TYPOGRAPHY.CARD.title} mb-2`}>{title}</h4>
      )}

      {/* Headline (if extracted) */}
      {hasHeadline && (
        <div className="mb-3">
          <p className={`text-base font-semibold ${colors.headlineText} leading-snug`}>
            {headline}
          </p>
        </div>
      )}

      {/* Expandable Details */}
      <div className="space-y-2">
        {/* Collapsed Preview or Full Text */}
        <div
          className={`relative ${
            !isExpanded && needsExpansion && !hasHeadline ? 'max-h-20 overflow-hidden' : ''
          }`}
        >
          <p className={`${TYPOGRAPHY.CARD.body} ${colors.bodyText} leading-relaxed whitespace-pre-wrap`}>
            {isExpanded || !needsExpansion || hasHeadline ? text : text.slice(0, 200) + '...'}
          </p>
          {!isExpanded && needsExpansion && !hasHeadline && (
            <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t ${colors.gradientFrom} to-transparent pointer-events-none`}></div>
          )}
        </div>

        {/* Expand/Collapse Button - Only show if text actually needs expansion */}
        {needsExpansion && (hasHeadline || !isExpanded) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-xs font-medium ${colors.buttonText} transition-colors flex items-center gap-1`}
          >
            {isExpanded ? (
              <>
                <span>▲</span>
                <span>Show less</span>
              </>
            ) : (
              <>
                <span>▼</span>
                <span>Read more</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpandableTextBlock;
