/**
 * MultiFactCard Component
 * Displays multiple key facts in scannable bullet list format
 * Highlights facts with metrics and importance levels
 */

import React from 'react';
import { extractKeyFacts, type KeyFact } from '../../../../utils/structuredTextParsing';

interface MultiFactCardProps {
  title: string;
  rawText: string;
  maxFacts?: number;
  showImportanceIndicators?: boolean;
}

const MultiFactCard: React.FC<MultiFactCardProps> = ({
  title,
  rawText,
  maxFacts = 10,
  showImportanceIndicators = false,
}) => {
  const facts = extractKeyFacts(rawText);

  if (facts.length === 0) {
    return null;
  }

  // Sort by importance
  const sortedFacts = [...facts].sort((a, b) => {
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  const displayFacts = sortedFacts.slice(0, maxFacts);

  const getImportanceColor = (importance: KeyFact['importance']) => {
    switch (importance) {
      case 'high':
        return 'text-blue-600';
      case 'medium':
        return 'text-gray-600';
      case 'low':
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>

      <ul className="space-y-2.5">
        {displayFacts.map((fact, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              className={`flex-shrink-0 mt-1 ${getImportanceColor(fact.importance)} ${
                fact.hasMetric ? 'font-bold' : ''
              }`}
            >
              •
            </span>
            <span
              className={`text-sm leading-relaxed ${
                fact.importance === 'high' ? 'text-gray-900 font-medium' : 'text-gray-700'
              }`}
            >
              {fact.text}
            </span>
            {showImportanceIndicators && fact.hasMetric && (
              <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Metric
              </span>
            )}
          </li>
        ))}
      </ul>

      {facts.length > maxFacts && (
        <p className="mt-3 text-xs text-gray-500 italic">
          +{facts.length - maxFacts} more facts
        </p>
      )}
    </div>
  );
};

export default MultiFactCard;
