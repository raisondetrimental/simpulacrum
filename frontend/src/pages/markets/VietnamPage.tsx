import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCountryFundamentals, getCountryCompleteData } from '../../services/countriesService';
import { fxService } from '../../services/fxService';
import CountryTabs from '../../components/features/countries/CountryTabs';
import type { CountryFundamentals as CountryFundamentalsType, CountryCompleteData } from '../../types/country';
import { getCountryImages } from '../../utils/countryImages';
import { getCurrencyCode } from '../../utils/currencyMappings';

const VietnamPage: React.FC = () => {
  const navigate = useNavigate();
  const [fundamentals, setFundamentals] = useState<CountryFundamentalsType | null>(null);
  const [completeData, setCompleteData] = useState<CountryCompleteData | null>(null);
  const [fxData, setFxData] = useState<{
    rate: number;
    name: string;
    changes: {
      '1D': number | null;
      '1W': number | null;
      '1M': number | null;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const images = getCountryImages('vietnam');
  const currencyCode = getCurrencyCode('vietnam');

  const countries = [
    { name: 'Armenia', slug: 'armenia', path: '/dashboard/armenia' },
    { name: 'Mongolia', slug: 'mongolia', path: '/dashboard/mongolia' },
    { name: 'Türkiye', slug: 'turkiye', path: '/dashboard/turkiye' },
    { name: 'Uzbekistan', slug: 'uzbekistan', path: '/dashboard/uzbekistan' },
    { name: 'Vietnam', slug: 'vietnam', path: '/dashboard/vietnam' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [fundamentalsResponse, completeDataResponse, fxRatesResponse] = await Promise.all([
          getCountryFundamentals('vietnam'),
          getCountryCompleteData('vietnam'),
          fxService.getLatest()
        ]);

        if (fundamentalsResponse.success && fundamentalsResponse.data) {
          setFundamentals(fundamentalsResponse.data);
        } else {
          setError(fundamentalsResponse.message || 'Failed to load country fundamentals');
          return;
        }

        if (completeDataResponse.success && completeDataResponse.data) {
          setCompleteData(completeDataResponse.data);
        } else {
          setError(completeDataResponse.message || 'Failed to load complete country data');
          return;
        }

        if (currencyCode && fxRatesResponse.rates[currencyCode]) {
          setFxData(fxRatesResponse.rates[currencyCode]);
        }
      } catch (err) {
        setError('An error occurred while loading country data');
        console.error('Error fetching Vietnam data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currencyCode]);

  return (
    <div className="space-y-6">
      {/* Header with Country Dropdown */}
      <div className="border-b border-gray-200 pb-4">
        <div className="relative inline-block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-3"
          >
            {images.flag && (
              <img
                src={images.flag}
                alt="Flag of Vietnam"
                className="h-8 w-auto object-contain"
              />
            )}
            Vietnam Country Report
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                {countries.map((country) => (
                  <button
                    key={country.slug}
                    onClick={() => {
                      navigate(country.path);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                      country.slug === 'vietnam' ? 'bg-blue-100 font-semibold' : ''
                    }`}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading country data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-900 font-semibold">Error Loading Data</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Country Tabs with Complete Data */}
      {fundamentals && completeData && !loading && (
        <CountryTabs
          fundamentals={fundamentals}
          completeData={completeData}
          fxData={fxData}
          currencyCode={currencyCode || undefined}
        />
      )}
    </div>
  );
};

export default VietnamPage;
