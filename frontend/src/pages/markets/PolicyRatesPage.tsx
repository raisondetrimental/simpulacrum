import React, { useEffect, useState } from 'react';
import { getPolicyRates, refreshPolicyRates, PolicyRatesData } from '../../services/marketsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PolicyRatesPage: React.FC = () => {
  const [data, setData] = useState<PolicyRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Country toggles (Türkiye hidden by default due to scale difference)
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(
    new Set(['US', 'GB', 'KR', 'AU', 'XM'])
  );

  // Country labels and colors
  const countryLabels: { [key: string]: string } = {
    US: 'USA',
    GB: 'UK',
    KR: 'South Korea',
    AU: 'Australia',
    TR: 'Türkiye',
    XM: 'Euro Area'
  };

  const countryColors: { [key: string]: string } = {
    US: '#3b82f6', // blue
    GB: '#ef4444', // red
    KR: '#10b981', // green
    AU: '#f59e0b', // amber
    TR: '#8b5cf6', // purple
    XM: '#06b6d4'  // cyan
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPolicyRates();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policy rates');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      const result = await refreshPolicyRates();
      setRefreshMessage(result.message);
      await loadData();
    } catch (err) {
      setRefreshMessage(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleCountry = (country: string) => {
    const newSet = new Set(visibleCountries);
    if (newSet.has(country)) {
      newSet.delete(country);
    } else {
      newSet.add(country);
    }
    setVisibleCountries(newSet);
  };

  const showAll = () => setVisibleCountries(new Set(Object.keys(countryLabels)));
  const hideAll = () => setVisibleCountries(new Set());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading policy rates...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'No data available'}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter to last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const filteredData = data.data.filter(row => {
    const rowDate = new Date(row.date);
    return rowDate >= ninetyDaysAgo;
  });

  // Forward fill missing data - assume previous day's value
  const forwardFilledData = filteredData.map((row, index) => {
    const newRow = { ...row };
    Object.keys(countryLabels).forEach(code => {
      if (newRow[code as keyof typeof newRow] === null && index > 0) {
        // Find the most recent non-null value
        for (let i = index - 1; i >= 0; i--) {
          const prevValue = filteredData[i][code as keyof typeof filteredData[0]];
          if (prevValue !== null) {
            (newRow as any)[code] = prevValue;
            break;
          }
        }
      }
    });
    return newRow;
  });

  // Get latest data point (use most recent non-null value for each country)
  const getLatestRate = (countryCode: string) => {
    for (let i = forwardFilledData.length - 1; i >= 0; i--) {
      const value = forwardFilledData[i][countryCode as keyof typeof forwardFilledData[0]];
      if (value !== null) {
        return value as number;
      }
    }
    return null;
  };

  // Calculate last rate change (when it changed and by how many bps)
  const calculateLastChange = (countryCode: string) => {
    let currentRate: number | null = null;
    let changeDate: string | null = null;
    let previousRate: number | null = null;

    // Find the most recent rate
    for (let i = forwardFilledData.length - 1; i >= 0; i--) {
      const value = forwardFilledData[i][countryCode as keyof typeof forwardFilledData[0]];
      if (value !== null) {
        currentRate = value as number;
        break;
      }
    }

    if (currentRate === null) return null;

    // Find when it last changed
    for (let i = forwardFilledData.length - 1; i >= 0; i--) {
      const value = forwardFilledData[i][countryCode as keyof typeof forwardFilledData[0]];
      if (value !== null && (value as number) !== currentRate) {
        previousRate = value as number;
        changeDate = forwardFilledData[i].date;
        break;
      }
    }

    if (!changeDate || previousRate === null) {
      return { weeksAgo: null, bpsChange: null };
    }

    const changeDateTime = new Date(changeDate).getTime();
    const now = new Date().getTime();
    const weeksAgo = Math.floor((now - changeDateTime) / (1000 * 60 * 60 * 24 * 7));
    const bpsChange = (currentRate - previousRate) * 100; // Convert to basis points

    return { weeksAgo, bpsChange };
  };

  // Calculate statistics
  const rates = Object.keys(countryLabels)
    .map(code => getLatestRate(code))
    .filter(rate => rate !== null) as number[];

  const highestRate = Math.max(...rates);
  const lowestRate = Math.min(...rates);
  const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const medianRate = [...rates].sort((a, b) => a - b)[Math.floor(rates.length / 2)];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central Bank Policy Rates</h1>
          <p className="mt-2 text-gray-600">Daily policy rates from BIS SDMX (last 90 days)</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Refresh Message */}
      {refreshMessage && (
        <div className={`p-4 rounded-lg ${refreshMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {refreshMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(countryLabels).map(([code, label]) => {
          const rate = getLatestRate(code);
          const change = calculateLastChange(code);

          return (
            <div key={code} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-3xl font-bold text-gray-900 my-2">
                  {rate !== null ? rate.toFixed(2) : 'N/A'} <span className="text-lg">%</span>
                </p>
                {change && change.weeksAgo !== null && change.bpsChange !== null && (
                  <div className="text-xs text-gray-600">
                    <p className={change.bpsChange >= 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {change.bpsChange >= 0 ? '+' : ''}{change.bpsChange.toFixed(0)} bps
                    </p>
                    <p className="text-gray-500">
                      {change.weeksAgo === 0 ? 'this week' :
                       change.weeksAgo === 1 ? '1 week ago' :
                       `${change.weeksAgo} weeks ago`}
                    </p>
                  </div>
                )}
                {(!change || change.weeksAgo === null) && (
                  <p className="text-xs text-gray-400">No recent change</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-600">Highest Rate</p>
          <p className="text-2xl font-bold text-red-600">{highestRate.toFixed(2)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-600">Lowest Rate</p>
          <p className="text-2xl font-bold text-green-600">{lowestRate.toFixed(2)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-600">Average Rate</p>
          <p className="text-2xl font-bold text-blue-600">{averageRate.toFixed(2)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-600">Median Rate</p>
          <p className="text-2xl font-bold text-purple-600">{medianRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Countries to Display</h3>
          <div className="flex gap-2">
            <button
              onClick={showAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Show All
            </button>
            <button
              onClick={hideAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Hide All
            </button>
          </div>
        </div>

        {/* Country toggle buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(countryLabels).map(([code, label]) => (
            <button
              key={code}
              onClick={() => toggleCountry(code)}
              className={`px-4 py-2 rounded-md border-2 transition-all ${
                visibleCountries.has(code)
                  ? 'border-opacity-100 font-semibold shadow-sm'
                  : 'border-opacity-30 opacity-50'
              }`}
              style={{
                borderColor: countryColors[code],
                backgroundColor: visibleCountries.has(code) ? `${countryColors[code]}15` : 'transparent',
                color: visibleCountries.has(code) ? countryColors[code] : '#6b7280'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Rates (Last 90 Days)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={forwardFilledData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: 'Policy Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            {visibleCountries.has('US') && <Line type="monotone" dataKey="US" stroke={countryColors.US} name="USA" strokeWidth={2} dot={false} connectNulls />}
            {visibleCountries.has('GB') && <Line type="monotone" dataKey="GB" stroke={countryColors.GB} name="UK" strokeWidth={2} dot={false} connectNulls />}
            {visibleCountries.has('KR') && <Line type="monotone" dataKey="KR" stroke={countryColors.KR} name="South Korea" strokeWidth={2} dot={false} connectNulls />}
            {visibleCountries.has('AU') && <Line type="monotone" dataKey="AU" stroke={countryColors.AU} name="Australia" strokeWidth={2} dot={false} connectNulls />}
            {visibleCountries.has('TR') && <Line type="monotone" dataKey="TR" stroke={countryColors.TR} name="Türkiye" strokeWidth={2} dot={false} connectNulls />}
            {visibleCountries.has('XM') && <Line type="monotone" dataKey="XM" stroke={countryColors.XM} name="Euro Area" strokeWidth={2} dot={false} connectNulls />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metadata Footer */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p><strong>Data Source:</strong> {data.meta.source} ({data.meta.dataset})</p>
        <p><strong>Total Days in Database:</strong> {data.meta.total_days}</p>
        <p><strong>Date Range:</strong> {data.meta.date_range.start} to {data.meta.date_range.end}</p>
        <p><strong>Last Updated:</strong> {new Date(data.meta.generated_utc).toLocaleString()}</p>
        <p className="mt-2"><strong>Note:</strong> {data.meta.notes}</p>
      </div>
    </div>
  );
};

export default PolicyRatesPage;
