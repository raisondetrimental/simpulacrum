import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  getMarketsOverview,
  generateWeeklyMarketsReport,
  MarketsOverviewData,
  getTurkeyYieldCurve,
  getVietnamYieldCurve,
  getUKYieldCurve,
  getHistoricalYieldsUSA,
  TurkeyYieldCurveData,
  VietnamYieldCurveData,
  UKYieldCurveData,
  HistoricalYield,
  refreshAllMarketsData,
  RefreshResult
} from '../../services/marketsService';
import { useAuth } from '../../contexts/AuthContext';

// Unified yield data structure for sovereign comparison
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
}

const MarketsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<MarketsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sovereign yield curve comparison data
  const [sovereignYields, setSovereignYields] = useState<CountryYieldData[]>([
    { country: 'United States', data: null, color: '#8b5cf6', enabled: true },
    { country: 'United Kingdom', data: null, color: '#3b82f6', enabled: true },
    { country: 'Vietnam', data: null, color: '#10b981', enabled: true },
    { country: 'Turkey', data: null, color: '#ef4444', enabled: false }
  ]);

  // Refresh progress modal state
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshResults, setRefreshResults] = useState<RefreshResult[]>([]);
  const [refreshComplete, setRefreshComplete] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const marketData = await getMarketsOverview();
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    loadSovereignYieldCurves();
  }, []);

  // Convert US FRED data to unified format
  const convertUSDataToUnified = (usData: HistoricalYield): UnifiedYieldCurveData => {
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

  // Load all sovereign yield curves
  const loadSovereignYieldCurves = async () => {
    try {
      const [ukData, turkeyData, vietnamData, usData] = await Promise.allSettled([
        getUKYieldCurve(),
        getTurkeyYieldCurve(),
        getVietnamYieldCurve(),
        getHistoricalYieldsUSA()
      ]);

      setSovereignYields(prev => prev.map(country => {
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
      console.error('Error loading sovereign yield curves:', err);
    }
  };

  // Prepare chart data for sovereign yields comparison
  const prepareSovereignChartData = () => {
    const enabledCountries = sovereignYields.filter(c => c.enabled && c.data);
    if (enabledCountries.length === 0) return [];

    const allMaturitiesSet = new Set<number>();
    enabledCountries.forEach(country => {
      if (country.data) {
        country.data.yields.forEach(point => {
          if (point.maturity_years <= 30) {
            allMaturitiesSet.add(point.maturity_years);
          }
        });
      }
    });

    const sortedMaturities = Array.from(allMaturitiesSet).sort((a, b) => a - b);

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

  const handleRefresh = async () => {
    try {
      setShowRefreshModal(true);
      setRefreshing(true);
      setRefreshResults([]);
      setRefreshComplete(false);

      // Call comprehensive refresh endpoint
      const response = await refreshAllMarketsData();

      setRefreshResults(response.results);
      setRefreshComplete(true);

      // Reload the overview data after successful refresh
      if (response.summary.successful > 0) {
        await fetchData(true);
        await loadSovereignYieldCurves();
      }
    } catch (error: any) {
      console.error('Error refreshing market data:', error);
      setError(error?.message || 'Failed to refresh market data');
    } finally {
      setRefreshing(false);
    }
  };

  const closeRefreshModal = () => {
    setShowRefreshModal(false);
    setRefreshResults([]);
    setRefreshComplete(false);
  };

  const handleGenerateReport = async () => {
    try {
      const response = await generateWeeklyMarketsReport();
      // Report opens in new window automatically via service
    } catch (error: any) {
      console.error('Error generating report:', error);
      const message = error?.message || 'Failed to generate weekly report. Please try again.';
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No data available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract latest US yields data
  const latestUSYields = data.us_yields?.data?.[data.us_yields.data.length - 1];
  const previousUSYields = data.us_yields?.data?.[data.us_yields.data.length - 2];

  // Calculate daily change for 10Y Treasury
  const us10YChange = latestUSYields && previousUSYields
    ? ((latestUSYields['10_year'] || 0) - (previousUSYields['10_year'] || 0))
    : 0;

  // Extract latest FX rates from Yahoo Finance data structure
  const latestFXRates = data.fx_rates?.data?.[data.fx_rates.data.length - 1];
  const previousFXRates = data.fx_rates?.data?.[data.fx_rates.data.length - 2];

  // Prepare corporate bonds data (latest 30 days)
  const corporateBondsData = data.corporate_bonds?.data?.slice(-30).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    AAA: d.aaa,
    AA: d.aa,
    A: d.a,
    BBB: d.bbb,
    BB: d.bb,
    'High Yield': d.high_yield,
  })) || [];

  // Prepare corporate yields data (last 30 days)
  const corporateYieldsData = data.corporate_yields?.data?.slice(-30).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Global HY': d.global_hy,
    'Global IG': d.global_ig_bbb,
    'EM Corp': d.em_corporate,
    'EM Asia': d.em_asia,
    'EM EMEA': d.em_emea,
    'EM LatAm': d.em_latam,
  })) || [];

  // Prepare policy rates data - get latest non-null value for each country
  const getPolicyRate = (countryCode: keyof typeof latestPolicyRates) => {
    if (!data.policy_rates?.data) return null;
    // Search backwards through data to find latest non-null value
    for (let i = data.policy_rates.data.length - 1; i >= 0; i--) {
      const rate = data.policy_rates.data[i][countryCode];
      if (rate !== null && rate !== undefined) {
        return rate;
      }
    }
    return null;
  };

  const latestPolicyRates = data.policy_rates?.data?.[data.policy_rates.data.length - 1];
  const policyRatesData = latestPolicyRates
    ? [
        { country: 'United States', rate: getPolicyRate('US'), code: 'US' },
        { country: 'United Kingdom', rate: getPolicyRate('GB'), code: 'GB' },
        { country: 'South Korea', rate: getPolicyRate('KR'), code: 'KR' },
        { country: 'Australia', rate: getPolicyRate('AU'), code: 'AU' },
        { country: 'Turkey', rate: getPolicyRate('TR'), code: 'TR' },
        { country: 'Eurozone', rate: getPolicyRate('XM'), code: 'XM' },
      ]
        .filter(item => item.rate !== null) // Remove entries with no data
        .sort((a, b) => (b.rate || 0) - (a.rate || 0)) // Sort by rate descending
    : [];

  // Navigation sections
  const marketSections = [
    {
      name: 'Sovereign Yields',
      path: '/dashboard/sovereign',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      description: 'Compare sovereign bond yields across US, UK, Vietnam, and Turkey',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400'
    },
    {
      name: 'Corporate Bonds',
      path: '/dashboard/corporate',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      description: 'USA corporate bond yields from AAA to High Yield, updated daily from FRED',
      color: 'bg-green-50 border-green-200 hover:border-green-400'
    },
    {
      name: 'Corporate Spreads',
      path: '/dashboard/corporate-spreads',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      description: 'Option-adjusted spreads for global HY, IG, and emerging market corporates',
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
    },
    {
      name: 'Corporate Yields',
      path: '/dashboard/corporate-yields',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      description: 'Effective yields for global and emerging market corporate bonds',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400'
    },
    {
      name: 'FX Markets',
      path: '/dashboard/fx',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Live foreign exchange rates with daily and weekly changes',
      color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
    },
    {
      name: 'Policy Rates',
      path: '/dashboard/central-banks',
      icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
      description: 'Central bank policy rates for major economies with historical trends',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-4xl font-bold text-gray-900">Market Intelligence Overview</h1>
          <div className="flex gap-3">
            {user?.is_super_admin && (
              <button
                onClick={handleGenerateReport}
                className="flex items-center px-4 py-2 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate Weekly Report
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                refreshing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              <svg
                className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-2">
          Comprehensive real-time data across fixed income, FX, and policy rates markets
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Key Market Metrics */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Market Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* US 10Y Treasury */}
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-1">US 10Y Treasury</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestUSYields?.['10_year']?.toFixed(2)}%
            </p>
            <p className={`text-xs font-medium mt-1 ${us10YChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {us10YChange >= 0 ? '+' : ''}{us10YChange.toFixed(2)} bps
            </p>
          </div>

          {/* US 30Y Treasury */}
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-1">US 30Y Treasury</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestUSYields?.['30_year']?.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Long end</p>
          </div>

          {/* US Policy Rate */}
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-1">Federal Reserve</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestPolicyRates?.US?.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Policy rate</p>
          </div>

          {/* Global HY Yield */}
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-1">Global HY Yield</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.corporate_yields?.data?.[data.corporate_yields.data.length - 1]?.global_hy?.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Effective yield</p>
          </div>

          {/* EM Corporate Yield */}
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-1">EM Corporate</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.corporate_yields?.data?.[data.corporate_yields.data.length - 1]?.em_corporate?.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Effective yield</p>
          </div>

          {/* GBP/USD */}
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-1">GBP/USD</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestFXRates?.GBP ? (1 / latestFXRates.GBP).toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">FX rate</p>
          </div>
        </div>
      </div>

      {/* Sovereign Yield Curve Comparison */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Sovereign Bond Yield Curves</h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare government bond yields across US, UK, Vietnam, and Turkey
            </p>
          </div>
          <Link
            to="/dashboard/sovereign"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Full Comparison
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {prepareSovereignChartData().length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={prepareSovereignChartData()}
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

              {sovereignYields
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
            Loading sovereign yield curves...
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Sources: Federal Reserve (US), worldgovernmentbonds.com (UK, Vietnam, Turkey)
        </p>
      </div>

      {/* Corporate Bond Markets - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corporate Bond Yields */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Corporate Bond Yields (Last 30 Days)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Investment grade (AAA to BBB) and high yield (BB+) corporate bonds
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={corporateBondsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="AAA" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="A" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="BBB" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="High Yield" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Corporate Yields (Effective) */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Corporate Yields (Last 30 Days)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Effective yields for global high yield, investment grade, and emerging market corporates
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={corporateYieldsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="Global HY" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Global IG" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EM Corp" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EM Asia" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Policy Rates */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Central Bank Policy Rates</h2>
        <p className="text-sm text-gray-600 mb-6">
          Current policy rates for major central banks around the world
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={policyRatesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
            <Bar dataKey="rate" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Source: Bank for International Settlements (BIS)
        </p>
      </div>

      {/* FX Markets */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Foreign Exchange Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestFXRates && data.fx_rates?.meta?.currencies && Object.entries(data.fx_rates.meta.currencies).map(([code, name]: [string, any]) => {
            const rate = latestFXRates[code as keyof typeof latestFXRates];
            const previousRate = previousFXRates?.[code as keyof typeof previousFXRates];

            // Skip if no valid rate
            if (!rate && rate !== 0) return null;

            // Calculate daily change percentage
            const dailyChange = rate && previousRate
              ? ((rate - previousRate) / previousRate)
              : null;

            // For GBP, show as GBP/USD (inverted). For others, show as XXX = 1 USD
            const displayRate = code === 'GBP' ? (1 / Number(rate)) : Number(rate);
            const displayPair = code === 'GBP' ? `${code}/USD` : `USD/${code}`;

            return (
              <div key={code} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm font-medium text-gray-600 mb-1">{displayPair}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {displayRate.toFixed(code === 'GBP' ? 4 : 2)}
                </div>
                {dailyChange !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily:</span>
                    <span className={dailyChange >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {dailyChange >= 0 ? '+' : ''}{(dailyChange * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Explore Detailed Market Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className={`border-2 rounded-lg p-6 transition-all ${section.color}`}
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.name}</h3>
                  <p className="text-sm text-gray-700">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-medium text-sm">
                View Details
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Refresh Progress Modal */}
      {showRefreshModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {refreshing && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
                <h2 className="text-xl font-semibold">
                  {refreshing ? 'Refreshing Market Data...' : 'Refresh Complete'}
                </h2>
              </div>
              {refreshComplete && (
                <button
                  onClick={closeRefreshModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {refreshResults.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  Initializing refresh...
                </div>
              ) : (
                <div className="space-y-3">
                  {refreshResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : result.status === 'error'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {result.status === 'success' ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : result.status === 'error' ? (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{result.name}</h3>
                          {result.timestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          result.status === 'success' ? 'text-green-700' :
                          result.status === 'error' ? 'text-red-700' :
                          'text-gray-600'
                        }`}>
                          {result.message || 'Processing...'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {refreshComplete && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold text-green-600">
                      {refreshResults.filter(r => r.status === 'success').length}
                    </span>
                    {' successful, '}
                    <span className="font-semibold text-red-600">
                      {refreshResults.filter(r => r.status === 'error').length}
                    </span>
                    {' failed'}
                  </div>
                  <button
                    onClick={closeRefreshModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsOverviewPage;
