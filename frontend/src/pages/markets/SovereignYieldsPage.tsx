import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  getTurkeyYieldCurve,
  getVietnamYieldCurve,
  getUKYieldCurve,
  getHistoricalYieldsUSA,
  TurkeyYieldCurveData,
  VietnamYieldCurveData,
  UKYieldCurveData,
  HistoricalYield
} from '../../services/marketsService';

// Unified yield data structure
interface UnifiedYieldPoint {
  maturity: string;
  maturity_text: string;
  maturity_years: number;
  yield: {
    last: number;
    chg_1m: number | null;
    chg_6m: number | null;
    chg_12m: number | null;
  };
}

interface UnifiedYieldCurveData {
  last_updated: string;
  country: string;
  currency: string;
  data_source: string;
  yields: UnifiedYieldPoint[];
}

interface CountryYieldData {
  country: string;
  data: UnifiedYieldCurveData | null;
  color: string;
  enabled: boolean;
  detailPath: string;
}

const SovereignYieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [countries, setCountries] = useState<CountryYieldData[]>([
    {
      country: 'United States',
      data: null,
      color: '#8b5cf6', // purple
      enabled: true,
      detailPath: '/dashboard/usa-historical-yields'
    },
    {
      country: 'United Kingdom',
      data: null,
      color: '#3b82f6', // blue
      enabled: true,
      detailPath: '/dashboard/uk/yield-curve'
    },
    {
      country: 'Vietnam',
      data: null,
      color: '#10b981', // green
      enabled: true,
      detailPath: '/dashboard/vietnam/yield-curve'
    },
    {
      country: 'Turkey',
      data: null,
      color: '#ef4444', // red
      enabled: false,
      detailPath: '/dashboard/turkiye/yield-curve'
    }
  ]);

  useEffect(() => {
    loadAllYieldCurves();
  }, []);

  // Convert US FRED data to unified format
  const convertUSDataToUnified = (usData: HistoricalYield): UnifiedYieldCurveData => {
    // Get the most recent data point
    const latestData = usData.data[usData.data.length - 1];

    const maturityMapping = [
      { key: '1_month' as keyof typeof latestData, label: '1M', text: '1 month', years: 1/12 },
      { key: '3_month' as keyof typeof latestData, label: '3M', text: '3 months', years: 0.25 },
      { key: '6_month' as keyof typeof latestData, label: '6M', text: '6 months', years: 0.5 },
      { key: '1_year' as keyof typeof latestData, label: '1Y', text: '1 year', years: 1 },
      { key: '2_year' as keyof typeof latestData, label: '2Y', text: '2 years', years: 2 },
      { key: '3_year' as keyof typeof latestData, label: '3Y', text: '3 years', years: 3 },
      { key: '5_year' as keyof typeof latestData, label: '5Y', text: '5 years', years: 5 },
      { key: '7_year' as keyof typeof latestData, label: '7Y', text: '7 years', years: 7 },
      { key: '10_year' as keyof typeof latestData, label: '10Y', text: '10 years', years: 10 },
      { key: '20_year' as keyof typeof latestData, label: '20Y', text: '20 years', years: 20 },
      { key: '30_year' as keyof typeof latestData, label: '30Y', text: '30 years', years: 30 }
    ];

    const yields: UnifiedYieldPoint[] = maturityMapping
      .map(m => ({
        maturity: m.label,
        maturity_text: m.text,
        maturity_years: m.years,
        yield: {
          last: latestData[m.key] as number,
          chg_1m: null,
          chg_6m: null,
          chg_12m: null
        }
      }))
      .filter(y => y.yield.last !== null);

    return {
      last_updated: usData.meta.generated_utc,
      country: 'United States',
      currency: 'USD',
      data_source: usData.meta.source,
      yields
    };
  };

  const loadAllYieldCurves = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all yield curve data in parallel
      const [ukData, turkeyData, vietnamData, usData] = await Promise.allSettled([
        getUKYieldCurve(),
        getTurkeyYieldCurve(),
        getVietnamYieldCurve(),
        getHistoricalYieldsUSA()
      ]);

      setCountries(prev => prev.map(country => {
        if (country.country === 'United Kingdom' && ukData.status === 'fulfilled') {
          return { ...country, data: ukData.value as UnifiedYieldCurveData };
        }
        if (country.country === 'Turkey' && turkeyData.status === 'fulfilled') {
          return { ...country, data: turkeyData.value as UnifiedYieldCurveData };
        }
        if (country.country === 'Vietnam' && vietnamData.status === 'fulfilled') {
          return { ...country, data: vietnamData.value as UnifiedYieldCurveData };
        }
        if (country.country === 'United States' && usData.status === 'fulfilled') {
          return { ...country, data: convertUSDataToUnified(usData.value) };
        }
        return country;
      }));
    } catch (err) {
      console.error('Error loading yield curves:', err);
      setError('Failed to load some yield curve data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (countryName: string) => {
    setCountries(prev =>
      prev.map(c =>
        c.country === countryName ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  // Prepare chart data by combining all enabled countries
  const prepareChartData = () => {
    const enabledCountries = countries.filter(c => c.enabled && c.data);
    if (enabledCountries.length === 0) return [];

    // Collect all unique maturities in years (limited to 30 years max)
    const allMaturitiesSet = new Set<number>();
    enabledCountries.forEach(country => {
      if (country.data) {
        country.data.yields.forEach(point => {
          if (point.maturity_years <= 30) {  // Only include maturities up to 30 years
            allMaturitiesSet.add(point.maturity_years);
          }
        });
      }
    });

    const sortedMaturities = Array.from(allMaturitiesSet).sort((a, b) => a - b);

    // Create chart data points
    return sortedMaturities.map(maturityYears => {
      const dataPoint: any = {
        maturity_years: maturityYears,
        maturity: maturityYears < 1 ? `${Math.round(maturityYears * 12)}M` : `${Math.round(maturityYears)}Y`
      };

      enabledCountries.forEach(country => {
        if (country.data) {
          const matchingPoint = country.data.yields.find(
            p => Math.abs(p.maturity_years - maturityYears) < 0.01
          );
          if (matchingPoint && matchingPoint.yield?.last !== null) {
            dataPoint[country.country] = matchingPoint.yield.last;
          }
        }
      });

      return dataPoint;
    });
  };

  const chartData = prepareChartData();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCountryStats = (countryData: CountryYieldData) => {
    if (!countryData.data) return null;

    const yields = countryData.data.yields;
    const shortTerm = yields.find(d => d.maturity_years <= 0.5)?.yield?.last;
    const mediumTerm = yields.find(d => d.maturity_years >= 4 && d.maturity_years <= 6)?.yield?.last;
    const longTerm = yields.find(d => d.maturity_years >= 9 && d.maturity_years <= 11)?.yield?.last;

    return { shortTerm, mediumTerm, longTerm };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sovereign Bond Yields Comparison
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Compare government bond yield curves across multiple countries
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading yield curve data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Country Selection Controls */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Countries to Compare</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {countries.map((country) => (
                <div
                  key={country.country}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    country.enabled
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${!country.data ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => country.data && toggleCountry(country.country)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: country.color }}
                      />
                      <span className="font-semibold text-gray-900">{country.country}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={country.enabled}
                      disabled={!country.data}
                      onChange={() => {}}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </div>

                  {country.data ? (
                    <div className="text-xs text-gray-600">
                      <div>{country.data.yields.length} maturities</div>
                      <div className="text-gray-500">Updated: {formatDate(country.data.last_updated)}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">Data not available</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Yield Curve Comparison</h2>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="maturity_years"
                    type="number"
                    domain={[0, 30]}
                    label={{ value: 'Maturity (Years)', position: 'insideBottom', offset: -5 }}
                    tickFormatter={(value) => {
                      if (value === 0) return '0';
                      if (value < 1) return `${Math.round(value * 12)}M`;
                      return `${value}Y`;
                    }}
                  />
                  <YAxis
                    label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    labelFormatter={(label) => {
                      const years = Number(label);
                      if (years < 1) return `${Math.round(years * 12)} Month${Math.round(years * 12) > 1 ? 's' : ''}`;
                      return `${years} Year${years > 1 ? 's' : ''}`;
                    }}
                  />
                  <Legend />

                  {countries
                    .filter(c => c.enabled && c.data)
                    .map(country => (
                      <Line
                        key={country.country}
                        type="monotone"
                        dataKey={country.country}
                        stroke={country.color}
                        strokeWidth={2}
                        dot={{ fill: country.color, r: 4 }}
                        activeDot={{ r: 6 }}
                        name={country.country}
                        connectNulls={true}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Please select at least one country to display the comparison chart
              </div>
            )}
          </div>

          {/* Country Cards with Key Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {countries.filter(c => c.data).map((country) => {
              const stats = getCountryStats(country);

              return (
                <div key={country.country} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: country.color }}
                      />
                      <h3 className="text-xl font-bold text-gray-900">{country.country}</h3>
                    </div>
                    <button
                      onClick={() => navigate(country.detailPath)}
                      className="btn btn-sm btn-outline flex items-center gap-2"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {country.data && (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Short-term</div>
                          <div className="text-lg font-bold text-blue-600">
                            {stats?.shortTerm?.toFixed(2) || 'N/A'}%
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Medium-term</div>
                          <div className="text-lg font-bold text-green-600">
                            {stats?.mediumTerm?.toFixed(2) || 'N/A'}%
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Long-term</div>
                          <div className="text-lg font-bold text-purple-600">
                            {stats?.longTerm?.toFixed(2) || 'N/A'}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          <span className="font-medium">{country.data.yields.length}</span> maturities tracked
                        </div>
                        <div className="text-gray-500">
                          Updated: {formatDate(country.data.last_updated)}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Data Source:</span> {country.data.data_source}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-blue-900 font-semibold mb-2">About Yield Curves</h3>
                <p className="text-blue-800 text-sm mb-2">
                  Government bond yield curves show the relationship between bond yields and their time to maturity.
                  They provide insights into market expectations about future interest rates, inflation, and economic growth.
                </p>
                <ul className="text-blue-800 text-sm space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Normal (Steep) Curve:</strong> Long-term yields higher than short-term, indicating economic growth expectations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Flat Curve:</strong> Similar yields across maturities, suggesting economic uncertainty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Inverted Curve:</strong> Short-term yields higher than long-term, historically a recession predictor</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SovereignYieldsPage;
