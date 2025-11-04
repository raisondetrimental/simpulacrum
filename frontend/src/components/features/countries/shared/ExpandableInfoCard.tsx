/**
 * ExpandableInfoCard Component
 * Card with expandable content for long-form text
 * Features:
 * - Collapsed state: Shows summary (first 3 lines) with gradient fade
 * - Expanded state: Shows full content
 * - Optional bullet point extraction
 * - Icon support for visual categorization
 */

import React, { useState } from 'react';
import { extractSummary, convertToBullets } from '../../../../utils/textProcessing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface ExpandableInfoCardProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'indigo';
  defaultOpen?: boolean;
  extractBullets?: boolean;
}

const ExpandableInfoCard: React.FC<ExpandableInfoCardProps> = ({
  title,
  content,
  icon,
  variant = 'default',
  defaultOpen = false,
  extractBullets = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);

  // Color variants for different card types
  const variants = {
    default: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      bodyText: 'text-gray-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      bodyText: 'text-blue-800',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      bodyText: 'text-purple-800',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      bodyText: 'text-green-800',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      bodyText: 'text-orange-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      bodyText: 'text-red-800',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      bodyText: 'text-indigo-800',
    },
  };

  const colors = variants[variant];

  // Extract bullets if requested
  const bullets = extractBullets ? convertToBullets(content) : [];
  const hasBullets = bullets.length > 1;

  // Determine if content is long enough to need expansion
  const isLongContent = content.length > 200;
  const summary = isLongContent ? extractSummary(content, 2) : content;

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-lg overflow-hidden ${TYPOGRAPHY.ANIMATION.transition}`}
    >
      {/* Header */}
      <div className={`${TYPOGRAPHY.LAYOUT.cardPadding}`}>
        <div className="flex items-start gap-3">
          {icon && <div className={`flex-shrink-0 ${colors.text}`}>{icon}</div>}
          <div className="flex-1">
            <h4 className={`font-semibold ${colors.text} flex items-center gap-2`}>
              {title}
            </h4>
          </div>
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex-shrink-0 text-xs font-medium ${colors.bodyText} hover:underline`}
            >
              {isExpanded ? '▲ Less' : '▼ More'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-3">
          {hasBullets && isExpanded ? (
            // Render as bullet list
            <ul className="space-y-2 list-disc list-inside">
              {bullets.map((bullet, index) => (
                <li key={index} className={`text-sm ${colors.bodyText} leading-relaxed`}>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : (
            // Render as paragraph
            <div className="relative">
              <div
                className={`${!isExpanded && isLongContent ? 'line-clamp-3' : ''}`}
                style={{ maxWidth: TYPOGRAPHY.LAYOUT.maxWidthReadable }}
              >
                <p className={`text-sm ${colors.bodyText} leading-relaxed whitespace-pre-wrap`}>
                  {isExpanded || !isLongContent ? content : summary}
                </p>
              </div>

              {!isExpanded && isLongContent && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-current to-transparent opacity-10"></div>
              )}
            </div>
          )}
        </div>

        {/* Expand/Collapse button (inline) */}
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 text-xs font-medium ${colors.bodyText} hover:underline inline-flex items-center gap-1`}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <span>↑</span>
              </>
            ) : (
              <>
                <span>Read full description</span>
                <span>→</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpandableInfoCard;
