/**
 * SponsorPreferencesGrid Component
 * Reusable component for displaying/editing sponsor investment preferences
 * Used in Corporate detail page and forms
 */

import React, { useState } from 'react';
import {
  SponsorPreferences,
  SPONSOR_PREFERENCE_GROUPS,
  SPONSOR_PREFERENCE_LABELS
} from '../../../types/sponsors';

interface SponsorPreferencesGridProps {
  preferences: Partial<SponsorPreferences>;
  onChange?: (preferences: Partial<SponsorPreferences>) => void;
  readonly?: boolean;
  collapsible?: boolean;
}

const SponsorPreferencesGrid: React.FC<SponsorPreferencesGridProps> = ({
  preferences,
  onChange,
  readonly = false,
  collapsible = true
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(SPONSOR_PREFERENCE_GROUPS.map(g => g.title))
  );

  const toggleGroup = (groupTitle: string) => {
    if (!collapsible) return;

    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupTitle)) {
      newExpanded.delete(groupTitle);
    } else {
      newExpanded.add(groupTitle);
    }
    setExpandedGroups(newExpanded);
  };

  const handleToggle = (key: keyof SponsorPreferences) => {
    if (readonly || !onChange) return;

    const currentValue = preferences[key] || 'N';
    const newValue = currentValue === 'Y' ? 'N' : 'Y';

    onChange({
      ...preferences,
      [key]: newValue
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(SPONSOR_PREFERENCE_GROUPS.map(g => g.title)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  return (
    <div className="space-y-2">
      {/* Expand/Collapse All Controls */}
      {collapsible && (
        <div className="flex justify-end gap-2 mb-2">
          <button
            onClick={expandAll}
            className="text-sm text-green-600 hover:text-green-800"
            type="button"
          >
            Expand All
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-green-600 hover:text-green-800"
            type="button"
          >
            Collapse All
          </button>
        </div>
      )}

      {/* Preference Groups */}
      {SPONSOR_PREFERENCE_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.title);

        return (
          <div
            key={group.title}
            className="border border-gray-200 rounded-md overflow-hidden"
          >
            {/* Group Header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.title)}
              className={`w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors ${
                !collapsible ? 'cursor-default' : ''
              }`}
              disabled={!collapsible}
            >
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              {collapsible && (
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {/* Group Content */}
            {isExpanded && (
              <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.keys.map((key) => {
                  const value = preferences[key] || 'N';
                  const isYes = value === 'Y';

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
                    >
                      <label
                        htmlFor={`pref-${key}`}
                        className="text-sm font-medium text-gray-700 flex-1 cursor-pointer"
                      >
                        {SPONSOR_PREFERENCE_LABELS[key]}
                      </label>

                      {readonly ? (
                        // Read-only display
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isYes
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {value}
                        </span>
                      ) : (
                        // Editable toggle buttons
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(key)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                              isYes
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            Y
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(key)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                              !isYes
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            N
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SponsorPreferencesGrid;
