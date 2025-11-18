/**
 * CountryMultiSelect Component
 * Multi-select dropdown for selecting countries with tag display
 * Shows all countries with priority countries (our focus markets + USA) at the top
 */

import React, { useState, useEffect, useRef } from 'react';
import { ALL_COUNTRIES } from '../../constants/countries';

interface CountryMultiSelectProps {
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CountryMultiSelect: React.FC<CountryMultiSelectProps> = ({
  selectedCountries,
  onChange,
  label = 'Countries',
  placeholder = 'Select countries...',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries based on search term
  const filteredCountries = ALL_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate priority and other countries in filtered results
  const priorityFiltered = filteredCountries.filter(c => c.priority);
  const otherFiltered = filteredCountries.filter(c => !c.priority);

  // Get selected country objects
  const selectedCountryObjects = ALL_COUNTRIES.filter(c => selectedCountries.includes(c.id));

  // Toggle country selection
  const toggleCountry = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      onChange(selectedCountries.filter(id => id !== countryId));
    } else {
      onChange([...selectedCountries, countryId]);
    }
  };

  // Remove country tag
  const removeCountry = (countryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCountries.filter(id => id !== countryId));
  };

  // Select all countries
  const selectAll = () => {
    onChange(ALL_COUNTRIES.map(c => c.id));
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Main dropdown trigger */}
      <div
        className={`min-h-[42px] border border-gray-300 rounded p-2 bg-white cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Selected countries as tags */}
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedCountryObjects.length > 0 ? (
            selectedCountryObjects.map(country => (
              <span
                key={country.id}
                className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm"
              >
                {country.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removeCountry(country.id, e)}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between p-2 border-b border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Clear All
            </button>
          </div>

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              <>
                {/* Priority countries section */}
                {priorityFiltered.length > 0 && (
                  <>
                    {priorityFiltered.map(country => (
                      <div
                        key={country.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                          selectedCountries.includes(country.id) ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => toggleCountry(country.id)}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCountries.includes(country.id)}
                            onChange={() => {}} // Handled by onClick above
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{country.name}</span>
                        </label>
                      </div>
                    ))}

                    {/* Divider between priority and other countries */}
                    {otherFiltered.length > 0 && (
                      <div className="border-t border-gray-200 my-1"></div>
                    )}
                  </>
                )}

                {/* Other countries section */}
                {otherFiltered.map(country => (
                  <div
                    key={country.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                      selectedCountries.includes(country.id) ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => toggleCountry(country.id)}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.id)}
                        onChange={() => {}} // Handled by onClick above
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">{country.name}</span>
                    </label>
                  </div>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>

          {/* Selected count footer */}
          <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
            {selectedCountries.length} of {ALL_COUNTRIES.length} selected
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryMultiSelect;
