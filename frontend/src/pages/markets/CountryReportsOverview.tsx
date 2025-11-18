import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCountries } from '../../services/countriesService';
import { fxYahooService } from '../../services/fxYahooService';
import type { CountryListItem } from '../../types/country';
import { getCountryImages } from '../../utils/countryImages';
import { getCurrencyCode } from '../../utils/currencyMappings';

interface CountryCardData extends CountryListItem {
  fxRate?: number;
  fxChange1D?: number | null;
  fxChange1W?: number | null;
  fxChange1M?: number | null;
  currencyName?: string;
}

const CountryReportsOverview: React.FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the 5 supported countries for detailed reports
  const supportedCountries = ['armenia', 'mongolia', 'turkiye', 'uzbekistan', 'vietnam'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch country list and FX rates in parallel
        const [countriesResponse, fxRatesResponse] = await Promise.all([
          getAllCountries(),
          fxYahooService.getLatest()
        ]);

        if (countriesResponse.success && countriesResponse.data) {
          // Filter to only supported countries and enrich with FX data
          const enrichedCountries = countriesResponse.data
            .filter(country => supportedCountries.includes(country.slug))
            .map(country => {
              const currencyCode = getCurrencyCode(country.slug);
              const fxData = currencyCode ? fxRatesResponse.rates[currencyCode] : null;

              return {
                ...country,
                fxRate: fxData?.rate,
                fxChange1D: fxData?.changes['1D'],
                fxChange1W: fxData?.changes['1W'],
                fxChange1M: fxData?.changes['1M'],
                currencyName: fxData?.name
              };
            })
            // Sort in the order defined in supportedCountries
            .sort((a, b) => {
              return supportedCountries.indexOf(a.slug) - supportedCountries.indexOf(b.slug);
            });

          setCountries(enrichedCountries);
        } else {
          setError(countriesResponse.message || 'Failed to load countries');
        }
      } catch (err) {
        setError('An error occurred while loading data');
        console.error('Error fetching country reports overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number | null | undefined) => {
    if (change === null || change === undefined) return 'text-gray-500';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading country reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Country Reports</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive macroeconomic analysis and market intelligence for key emerging markets
        </p>
      </div>

      {/* Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">About Country Reports</h2>
        <p className="text-blue-800">
          Each country report includes detailed analysis from IMF Article IV consultations,
          EBRD/ADB country strategies, infrastructure project assessments, and real-time FX data.
          Access comprehensive macroeconomic indicators, fiscal metrics, financial sector data,
          and development priorities.
        </p>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => {
          const images = getCountryImages(country.slug);

          return (
            <div
              key={country.slug}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Flag and Country Name */}
              <div className="flex items-center gap-3 mb-4">
                {images.flag && (
                  <img
                    src={images.flag}
                    alt={`Flag of ${country.name}`}
                    className="h-8 w-auto object-contain"
                  />
                )}
                <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
              </div>

              {/* Basic Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capital:</span>
                  <span className="font-semibold text-gray-900">{country.capital}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-semibold text-gray-900">{country.region}</span>
                </div>
              </div>

              {/* FX Rate Card */}
              {country.fxRate && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Exchange Rate</div>
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {country.fxRate.toFixed(4)} {country.currencyName || 'per USD'}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">1D</div>
                      <div className={getChangeColor(country.fxChange1D)}>
                        {formatChange(country.fxChange1D)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">1W</div>
                      <div className={getChangeColor(country.fxChange1W)}>
                        {formatChange(country.fxChange1W)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">1M</div>
                      <div className={getChangeColor(country.fxChange1M)}>
                        {formatChange(country.fxChange1M)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View Report Button */}
              <button
                onClick={() => navigate(`/dashboard/${country.slug}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                View Report
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
        Data sources: IMF Article IV Consultations, EBRD/ADB Country Strategies, Market Intelligence Reports
      </div>
    </div>
  );
};

export default CountryReportsOverview;
