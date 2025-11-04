/**
 * StructuredNarrativeCard Component
 * Orchestrates TimeSeriesCard, IncludesExcludesSection, and context display
 * Intelligently decomposes complex narrative text into structured components
 */

import React from 'react';
import { decomposeNarrative } from '../../../../utils/structuredTextParsing';
import TimeSeriesCard from './TimeSeriesCard';
import IncludesExcludesSection from './IncludesExcludesSection';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface StructuredNarrativeCardProps {
  title: string;
  rawText: string;
  subtitle?: string;
  interpretLower?: 'good' | 'bad';  // For time series trend interpretation
}

const StructuredNarrativeCard: React.FC<StructuredNarrativeCardProps> = ({
  title,
  rawText,
  subtitle,
  interpretLower = 'good',
}) => {
  // Decompose the narrative into structured components
  const structure = decomposeNarrative(rawText);

  // If no structured data found, return null (fallback to other components)
  if (!structure.hasStructuredData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Time Series Table */}
      {structure.timeSeries && structure.timeSeries.length > 0 && (
        <TimeSeriesCard
          title={title}
          rawText={rawText}
          defaultCollapsed={structure.timeSeries.length > 6}
          highlightRecent={true}
          interpretLower={interpretLower}
        />
      )}

      {/* Scope Definition (Includes/Excludes) */}
      {structure.scope && (
        <IncludesExcludesSection rawText={rawText} />
      )}

      {/* Context/Narrative */}
      {structure.context && structure.context.length > 10 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 flex-shrink-0 mt-0.5">💡</span>
            <div>
              <h5 className="text-xs uppercase tracking-wide font-semibold text-blue-900 mb-2">
                Context
              </h5>
              <p className={`${TYPOGRAPHY.CARD.body} text-blue-900 leading-relaxed`}>
                {structure.context}
              </p>
            </div>
          </div>
        </div>
      )}

      {subtitle && (
        <p className={TYPOGRAPHY.CARD.subtitle}>{subtitle}</p>
      )}
    </div>
  );
};

export default StructuredNarrativeCard;
