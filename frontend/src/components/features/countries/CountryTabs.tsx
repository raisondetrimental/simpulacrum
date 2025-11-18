/**
 * CountryTabs Component
 * Tabbed interface for comprehensive country reports
 * Dynamically shows tabs based on data format (structured vs narrative)
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { CountryFundamentals, CountryCompleteData } from '../../../types/country';
import { exportCountryCSV, exportCountryXLSX } from '../../../services/countriesService';
import { searchCountryData } from '../../../utils/countrySearch';
import DownloadDropdown from '../../ui/DownloadDropdown';
import CountryFundamentalsComponent from './CountryFundamentals';
import MacroAnalysisSection from './MacroAnalysisSection';
import MacroAnalysisStructured from './MacroAnalysisStructured';
import FinancialSectorSection from './FinancialSectorSection';
import CapitalMarketsSection from './CapitalMarketsSection';
import StrategySection from './StrategySection';
import InfrastructureSection from './InfrastructureSection';
import ClimateRiskSection from './ClimateRiskSection';
import DealsSection from './DealsSection';
import YieldCurveSection from './YieldCurveSection';

type TabId = 'overview' | 'macro' | 'financial' | 'capital-markets' | 'strategy' | 'infrastructure' | 'climate' | 'yield-curve' | 'deals';

interface Tab {
  id: TabId;
  label: string;
}

interface CountryTabsProps {
  fundamentals: CountryFundamentals;
  completeData: CountryCompleteData;
  fxData?: {
    rate: number;
    name: string;
    changes: {
      '1D': number | null;
      '1W': number | null;
      '1M': number | null;
    };
  } | null;
  currencyCode?: string;
}

const CountryTabs: React.FC<CountryTabsProps> = ({ fundamentals, completeData, fxData, currencyCode }) => {
  // Detect data format by checking for field names unique to structured format
  // Armenia, Mongolia, Turkey, Uzbekistan use: real_gdp_growth_t, fsi_car, etc.
  // Vietnam uses: gdp_growth_current, inflation_current, etc.
  const hasStructuredData = completeData.IMF_Article_IV?.['real_gdp_growth_t'] !== undefined ||
                             completeData.IMF_Article_IV?.fsi_car !== undefined;

  // Determine available tabs based on data format
  const getAvailableTabs = (): Tab[] => {
    const baseTabs: Tab[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'macro', label: 'Macro Analysis' },
    ];

    // Check if this country has yield curve data (Turkey or Vietnam)
    const hasYieldCurve = fundamentals.slug === 'turkiye' || fundamentals.slug === 'vietnam';

    if (hasStructuredData) {
      // Structured format tabs (Armenia, Mongolia, Turkey, Uzbekistan)
      const tabs = [
        ...baseTabs,
        { id: 'financial', label: 'Financial Sector' },
        { id: 'capital-markets', label: 'Capital Markets' },
        { id: 'strategy', label: 'Development Strategy' },
        { id: 'infrastructure', label: 'Infrastructure' },
      ];

      // Add yield curve tab before deals for Turkey
      if (hasYieldCurve) {
        tabs.push({ id: 'yield-curve', label: 'Yield Curve' });
      }

      tabs.push({ id: 'deals', label: 'Deals' });
      return tabs;
    } else {
      // Narrative format tabs (Vietnam)
      const tabs = [
        ...baseTabs,
        { id: 'strategy', label: 'Development Strategy' },
        { id: 'infrastructure', label: 'Infrastructure' },
        { id: 'climate', label: 'Climate & Risk' },
      ];

      // Add yield curve tab before deals for Vietnam
      if (hasYieldCurve) {
        tabs.push({ id: 'yield-curve', label: 'Yield Curve' });
      }

      tabs.push({ id: 'deals', label: 'Deals' });
      return tabs;
    }
  };

  const availableTabs = getAvailableTabs();
  const [activeTab, setActiveTab] = useState<TabId>(availableTabs[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Compute search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return new Map();
    }
    return searchCountryData(fundamentals, completeData, searchQuery, hasStructuredData);
  }, [fundamentals, completeData, searchQuery, hasStructuredData]);

  // Auto-switch to first tab with matches when search is performed
  useEffect(() => {
    if (searchQuery.trim() && searchResults.size > 0) {
      const firstMatchTab = Array.from(searchResults.keys())[0] as TabId;
      setActiveTab(firstMatchTab);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, searchResults]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await exportCountryCSV(fundamentals.slug);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Function to find text in DOM and return the range
  const findTextInNode = (node: Node, searchText: string): Range | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const index = text.toLowerCase().indexOf(searchText.toLowerCase());
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + searchText.length);
        return range;
      }
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        const result = findTextInNode(node.childNodes[i], searchText);
        if (result) return result;
      }
    }
    return null;
  };

  // Function to find and scroll to text in the content area
  const scrollToMatch = (searchText: string) => {
    if (!contentRef.current) return;

    // Remove the field name prefix if present
    const textToFind = searchText.includes(': ') ? searchText.split(': ').slice(1).join(': ') : searchText;

    // Clean up the text (remove ellipsis)
    const cleanText = textToFind.replace(/\.\.\./g, '').trim();

    // Get a search phrase (take up to 40 chars for better matching)
    const searchPhrase = cleanText.substring(0, Math.min(cleanText.length, 40));

    // Find the text in the content area only
    const range = findTextInNode(contentRef.current, searchPhrase);

    if (range) {
      // Clear any existing selection
      window.getSelection()?.removeAllRanges();

      // Select the found text
      window.getSelection()?.addRange(range);

      // Get the position
      const rect = range.getBoundingClientRect();

      // Scroll to the element
      window.scrollTo({
        top: window.scrollY + rect.top - 200,
        behavior: 'smooth'
      });

      // Highlight the text
      setTimeout(() => {
        try {
          const span = document.createElement('span');
          span.style.cssText = 'background: #fde047; padding: 2px 4px; border-radius: 3px; animation: flash 2s ease-out;';
          range.surroundContents(span);

          // Remove highlight after animation
          setTimeout(() => {
            try {
              const parent = span.parentNode;
              if (parent) {
                while (span.firstChild) {
                  parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
              }
            } catch (e) {
              console.log('Could not remove highlight');
            }
          }, 2000);
        } catch (e) {
          console.log('Could not add highlight, but text was found and scrolled to');
        }
      }, 300);
    } else {
      alert('Text not found in the current tab content. It may be in a different section.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CountryFundamentalsComponent data={fundamentals} fxData={fxData} currencyCode={currencyCode} />;

      case 'macro':
        return hasStructuredData ?
          <MacroAnalysisStructured data={completeData} fundamentals={fundamentals} /> :
          <MacroAnalysisSection data={completeData} />;

      case 'financial':
        return <FinancialSectorSection data={completeData} />;

      case 'capital-markets':
        return <CapitalMarketsSection data={completeData} />;

      case 'strategy':
        return <StrategySection data={completeData} />;

      case 'infrastructure':
        return <InfrastructureSection data={completeData} />;

      case 'climate':
        return <ClimateRiskSection data={completeData} />;

      case 'yield-curve':
        return <YieldCurveSection countrySlug={fundamentals.slug as 'turkiye' | 'vietnam'} />;

      case 'deals':
        return <DealsSection countrySlug={fundamentals.slug} countryName={fundamentals.name} />;

      default:
        return <CountryFundamentalsComponent data={fundamentals} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search across all tabs..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Export Dropdown */}
          <DownloadDropdown
            onDownloadCSV={() => handleExportCSV()}
            onDownloadXLSX={() => exportCountryXLSX(fundamentals.slug)}
            label="Export"
            disabled={isExporting}
          />
        </div>

        {/* Search Results Summary */}
        {showSearchResults && searchResults.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-900 font-medium">
                Found matches in {searchResults.size} tab{searchResults.size !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {showSearchResults && searchResults.size === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-yellow-900">No matches found for "{searchQuery}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {availableTabs.map((tab) => {
              const matchCount = searchResults.get(tab.id)?.matchCount || 0;
              const hasMatches = matchCount > 0 && showSearchResults;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors relative
                    ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    ${hasMatches ? 'bg-blue-50' : ''}
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {hasMatches && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                        {matchCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Search Results for Current Tab */}
          {showSearchResults && searchResults.get(activeTab) && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-900 mb-3">
                    {searchResults.get(activeTab)!.matchCount} match{searchResults.get(activeTab)!.matchCount !== 1 ? 'es' : ''} found for "{searchQuery}"
                  </h4>

                  <div className="space-y-3">
                    {searchResults.get(activeTab)!.matches.length > 0 && searchResults.get(activeTab)!.matches.slice(0, 5).map((match, index) => {
                      // Parse field name and content if formatted as "field: content"
                      const parts = match.split(': ');
                      const hasFieldName = parts.length > 1;
                      const fieldName = hasFieldName ? parts[0] : '';
                      const content = hasFieldName ? parts.slice(1).join(': ') : match;

                      // Format field name to be more readable
                      const formatFieldName = (field: string) => {
                        return field
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase());
                      };

                      // Escape special regex characters in search query
                      const escapeRegex = (str: string) => {
                        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      };

                      const highlightText = (text: string) => {
                        if (!searchQuery.trim()) return text;

                        const escapedQuery = escapeRegex(searchQuery);
                        const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

                        return parts.map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark key={i} className="bg-yellow-300 px-1 py-0.5 rounded font-bold text-gray-900">
                              {part}
                            </mark>
                          ) : (
                            <React.Fragment key={i}>{part}</React.Fragment>
                          )
                        );
                      };

                      return (
                        <button
                          key={index}
                          onClick={() => scrollToMatch(match)}
                          className="w-full text-left bg-white px-4 py-3 rounded-md border border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {hasFieldName && (
                                <div className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                                  📍 {formatFieldName(fieldName)}
                                </div>
                              )}
                              <div className="text-sm text-gray-800 leading-relaxed">
                                {highlightText(content)}
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {searchResults.get(activeTab)!.matches.length > 5 && (
                      <p className="text-xs text-blue-700 font-medium mt-2">
                        + {searchResults.get(activeTab)!.matches.length - 5} more match{searchResults.get(activeTab)!.matches.length - 5 !== 1 ? 'es' : ''} in this tab
                      </p>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-900">
                    <strong>💡 How to use:</strong> Click on any preview card above to jump to that section in the content below.
                    The text will be highlighted briefly to help you find it.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content area with ref */}
          <div ref={contentRef}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryTabs;
