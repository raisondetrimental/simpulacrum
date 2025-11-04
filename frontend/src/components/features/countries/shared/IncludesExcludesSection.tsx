/**
 * IncludesExcludesSection Component
 * Displays scope definitions with includes/excludes pattern
 * Example: "Includes A, B, C. Excludes X, Y, Z."
 */

import React from 'react';
import { parseScopeDefinition, type ScopeDefinition } from '../../../../utils/structuredTextParsing';

interface IncludesExcludesSectionProps {
  rawText: string;
  defaultCollapsed?: boolean;
}

const IncludesExcludesSection: React.FC<IncludesExcludesSectionProps> = ({
  rawText,
  defaultCollapsed = false,
}) => {
  const scope = parseScopeDefinition(rawText);

  if (!scope || (scope.includes.length === 0 && scope.excludes.length === 0)) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-gray-700">📋 Scope Definition</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Includes */}
        {scope.includes.length > 0 && (
          <div>
            <h5 className="text-xs uppercase tracking-wide font-semibold text-green-700 mb-2">
              ✓ Includes
            </h5>
            <ul className="space-y-1.5">
              {scope.includes.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Excludes */}
        {scope.excludes.length > 0 && (
          <div>
            <h5 className="text-xs uppercase tracking-wide font-semibold text-red-700 mb-2">
              ✗ Excludes
            </h5>
            <ul className="space-y-1.5">
              {scope.excludes.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-600 flex-shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncludesExcludesSection;
