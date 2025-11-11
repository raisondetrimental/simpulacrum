/**
 * WorkstreamMultiSelect Component
 * Multi-select dropdown for selecting non-completed workstreams
 * Displays as "Key + Index" format (e.g., O1, A2, C3)
 */

import React, { useState, useRef, useEffect } from 'react';
import { PlaybookWorkstream } from '../../types/playbook';

interface WorkstreamOption {
  id: string;
  label: string; // e.g., "O1: Onboarding"
  displayCode: string; // e.g., "O1"
}

interface WorkstreamMultiSelectProps {
  workstreams: PlaybookWorkstream[];
  selectedCodes: string[]; // Array of codes like ["O1", "C3", "D1"]
  onChange: (codes: string[]) => void;
  disabled?: boolean;
}

const WorkstreamMultiSelect: React.FC<WorkstreamMultiSelectProps> = ({
  workstreams,
  selectedCodes,
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate workstream options with proper indexing
  const generateOptions = (): WorkstreamOption[] => {
    // Group workstreams by key
    const groupedByKey: { [key: string]: PlaybookWorkstream[] } = {};

    workstreams
      .filter(w => !w.completed) // Only non-completed workstreams
      .forEach(workstream => {
        if (!groupedByKey[workstream.key]) {
          groupedByKey[workstream.key] = [];
        }
        groupedByKey[workstream.key].push(workstream);
      });

    // Generate options with proper indexing
    const options: WorkstreamOption[] = [];
    Object.keys(groupedByKey).sort().forEach(key => {
      groupedByKey[key].forEach((workstream, index) => {
        const displayCode = `${key}${index + 1}`;
        const label = `${displayCode}: ${workstream.mission_goal}`;
        options.push({
          id: workstream.id,
          label,
          displayCode
        });
      });
    });

    return options;
  };

  const options = generateOptions();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = (code: string) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter(c => c !== code));
    } else {
      onChange([...selectedCodes, code]);
    }
  };

  const handleRemoveCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCodes.filter(c => c !== code));
  };

  // Get display label for selected codes
  const getSelectedLabels = (): string => {
    if (selectedCodes.length === 0) return 'Select workstreams...';
    return selectedCodes.join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'}
          min-h-[38px] flex items-center justify-between
        `}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedCodes.length === 0 ? (
            <span className="text-gray-500">Select workstreams...</span>
          ) : (
            selectedCodes.map(code => (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {code}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveCode(code, e)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No non-completed workstreams available
            </div>
          ) : (
            <div className="py-1">
              {options.map(option => (
                <label
                  key={option.displayCode}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCodes.includes(option.displayCode)}
                    onChange={() => handleToggleOption(option.displayCode)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkstreamMultiSelect;