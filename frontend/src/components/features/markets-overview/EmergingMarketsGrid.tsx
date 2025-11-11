/**
 * Emerging Markets Grid Component
 * Displays quick fundamentals for 5 focus countries
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { CountryFundamentals } from '../../../types/country';

interface EmergingMarketsGridProps {
  countries: CountryFundamentals[];
  loading?: boolean;
}

const EmergingMarketsGrid: React.FC<EmergingMarketsGridProps> = ({ countries, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emerging Markets Spotlight</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emerging Markets Spotlight</h2>
        <p className="text-gray-600">No country data available.</p>
      </div>
    );
  }

  // Calculate regional totals
  const totalGDP = countries.reduce((sum, country) => sum + (country.gdp?.value || 0), 0);
  const totalPopulation = countries.reduce((sum, country) => sum + (country.population?.value || 0), 0);
  const avgGrowth = countries.reduce((sum, country) => sum + (country.gdp_growth_rate?.value || 0), 0) / countries.length;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Emerging Markets Spotlight</h2>
        <p className="text-sm text-gray-600">Quick fundamentals for 5 focus countries</p>
      </div>

      {/* Regional Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Combined GDP</div>
          <div className="text-2xl font-bold text-gray-900">
            ${(totalGDP / 1000).toFixed(1)}T
          </div>
          <div className="text-xs text-gray-600">2024 estimate</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Total Population</div>
          <div className="text-2xl font-bold text-gray-900">
            {(totalPopulation / 1000000).toFixed(0)}M
          </div>
          <div className="text-xs text-gray-600">2024 estimate</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Average Growth</div>
          <div className="text-2xl font-bold text-gray-900">
            {avgGrowth.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">2024 estimate</div>
        </div>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {countries.map((country) => (
          <Link
            key={country.slug}
            to={`/${country.slug}`}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all bg-white"
          >
            {/* Country Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{country.name}</h3>
              <div className="text-xs text-gray-600">{country.capital}</div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              {/* GDP */}
              <div>
                <div className="text-xs text-gray-600 mb-1">GDP ({country.gdp.year})</div>
                <div className="text-base font-bold text-gray-900">
                  ${country.gdp.value >= 1000
                    ? `${(country.gdp.value / 1000).toFixed(1)}T`
                    : `${country.gdp.value.toFixed(1)}B`
                  }
                </div>
              </div>

              {/* GDP Growth */}
              <div>
                <div className="text-xs text-gray-600 mb-1">GDP Growth ({country.gdp_growth_rate.year})</div>
                <div className={`text-base font-bold ${
                  country.gdp_growth_rate.value >= 5 ? 'text-green-600' :
                  country.gdp_growth_rate.value >= 3 ? 'text-blue-600' :
                  'text-gray-900'
                }`}>
                  {country.gdp_growth_rate.value.toFixed(1)}%
                </div>
              </div>

              {/* Inflation */}
              <div>
                <div className="text-xs text-gray-600 mb-1">Inflation (CPI {country.inflation_cpi.year})</div>
                <div className={`text-base font-bold ${
                  country.inflation_cpi.value > 8 ? 'text-red-600' :
                  country.inflation_cpi.value > 4 ? 'text-orange-600' :
                  'text-gray-900'
                }`}>
                  {country.inflation_cpi.value.toFixed(1)}%
                </div>
              </div>

              {/* Top Industries */}
              {country.top_industries && country.top_industries.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Top Industries</div>
                  <div className="text-xs text-gray-700">
                    {country.top_industries.slice(0, 2).map(ind => ind.name).join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-blue-600 font-medium text-xs">
                View Details
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        Data vintage: 2024 | Sources: IMF, EBRD, ADB, National Statistics Offices
      </div>
    </div>
  );
};

export default EmergingMarketsGrid;
