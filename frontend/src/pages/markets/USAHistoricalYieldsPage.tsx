import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../../config';

// TypeScript interfaces
interface YieldDataPoint {
  date: string;
  '1_month': number | null;
  '3_month': number | null;
  '6_month': number | null;
  '1_year': number | null;
  '2_year': number | null;
  '3_year': number | null;
  '5_year': number | null;
  '7_year': number | null;
  '10_year': number | null;
  '20_year': number | null;
  '30_year': number | null;
}

interface FredData {
  meta: any;
  data: YieldDataPoint[];
}

type MaturityKey = '1_month' | '3_month' | '6_month' | '1_year' | '2_year' | '3_year' | '5_year' | '7_year' | '10_year' | '20_year' | '30_year';

// Color palette for yield curves (red → violet spectrum)
const MATURITY_COLORS: Record<MaturityKey, string> = {
  '1_month': '#ef4444',    // red
  '3_month': '#f59e0b',    // amber
  '6_month': '#84cc16',    // lime
  '1_year': '#22c55e',     // green
  '2_year': '#10b981',     // emerald
  '3_year': '#14b8a6',     // teal
  '5_year': '#06b6d4',     // cyan
  '7_year': '#0ea5e9',     // sky
  '10_year': '#3b82f6',    // blue
  '20_year': '#6366f1',    // indigo
  '30_year': '#8b5cf6',    // violet
};

// Display labels for maturities
const MATURITY_LABELS: Record<MaturityKey, string> = {
  '1_month': '1M',
  '3_month': '3M',
  '6_month': '6M',
  '1_year': '1Y',
  '2_year': '2Y',
  '3_year': '3Y',
  '5_year': '5Y',
  '7_year': '7Y',
  '10_year': '10Y',
  '20_year': '20Y',
  '30_year': '30Y',
};

const UsaHistoricalYieldsPage: React.FC = () => {
  const [data, setData] = useState<FredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMaturities, setVisibleMaturities] = useState<Set<MaturityKey>>(
    new Set(['3_month', '2_year', '10_year', '30_year']) // Default: benchmark yields
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching from:', `${API_BASE_URL}/api/historical-yields/usa`);

      const response = await fetch(`${API_BASE_URL}/api/historical-yields/usa`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fredData = await response.json();
      console.log('Received data:', fredData);
      console.log('Total data points:', fredData.data?.length);

      // Filter to last 90 days only
      const today = new Date();
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);

      const filteredData = {
        ...fredData,
        data: fredData.data.filter((row: any) => {
          const rowDate = new Date(row.date);
          return rowDate >= ninetyDaysAgo;
        })
      };

      console.log('Filtered to last 90 days:', filteredData.data.length, 'data points');
      setData(filteredData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaturity = (maturity: MaturityKey) => {
    setVisibleMaturities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(maturity)) {
        newSet.delete(maturity);
      } else {
        newSet.add(maturity);
      }
      return newSet;
    });
  };

  const showAll = () => {
    setVisibleMaturities(new Set(Object.keys(MATURITY_COLORS) as MaturityKey[]));
  };

  const hideAll = () => {
    setVisibleMaturities(new Set());
  };

  const showBenchmarks = () => {
    setVisibleMaturities(new Set(['3_month', '2_year', '10_year', '30_year']));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading US sovereign yields...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const dateRange = {
    start: data.data[0]?.date || '',
    end: data.data[data.data.length - 1]?.date || '',
  };

  // Get latest yield curve data for bar chart
  const latestData = data.data[data.data.length - 1];
  const yieldCurveData = (Object.keys(MATURITY_COLORS) as MaturityKey[]).map(maturity => ({
    maturity: MATURITY_LABELS[maturity],
    yield: latestData[maturity],
    color: MATURITY_COLORS[maturity]
  })).filter(item => item.yield !== null);

  // Calculate max yield for Y-axis domain
  const maxYield = Math.max(...yieldCurveData.map(d => d.yield || 0));
  const yAxisMax = Math.ceil(maxYield + 0.5); // Add 0.5% padding and round up

  // Calculate changes (1 day, 1 week, 1 month)
  const calculateChanges = (maturity: MaturityKey) => {
    const values = data.data.map(d => d[maturity]).filter(v => v !== null) as number[];
    const current = values[values.length - 1];
    const oneDayAgo = values[Math.max(0, values.length - 2)] || current;
    const oneWeekAgo = values[Math.max(0, values.length - 8)] || current;
    const oneMonthAgo = values[Math.max(0, values.length - 31)] || current;

    return {
      current,
      daily: current && oneDayAgo ? ((current - oneDayAgo) * 100) : 0,
      weekly: current && oneWeekAgo ? ((current - oneWeekAgo) * 100) : 0,
      monthly: current && oneMonthAgo ? ((current - oneMonthAgo) * 100) : 0,
    };
  };

  const benchmarkChanges = {
    '2_year': calculateChanges('2_year'),
    '10_year': calculateChanges('10_year'),
    '30_year': calculateChanges('30_year'),
  };

  // Calculate curve steepness (10Y - 2Y spread)
  const curveSpread = benchmarkChanges['10_year'].current - benchmarkChanges['2_year'].current;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            US Sovereign Yields
          </h1>
          <p className="text-lg text-gray-600">
            United States Treasury Securities - Real-time yield curve analysis
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Data from Federal Reserve Economic Data (FRED) • Last updated: {new Date(data.meta.generated_utc).toLocaleString()}
          </p>
        </div>

        {/* Current Yield Curve Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Yield Curve</h2>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">2-Year Treasury</div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {benchmarkChanges['2_year'].current.toFixed(3)}%
              </div>
              <div className={`text-sm font-medium ${benchmarkChanges['2_year'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {benchmarkChanges['2_year'].daily >= 0 ? '+' : ''}{benchmarkChanges['2_year'].daily.toFixed(1)} bp (1D)
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">10-Year Treasury</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {benchmarkChanges['10_year'].current.toFixed(3)}%
              </div>
              <div className={`text-sm font-medium ${benchmarkChanges['10_year'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {benchmarkChanges['10_year'].daily >= 0 ? '+' : ''}{benchmarkChanges['10_year'].daily.toFixed(1)} bp (1D)
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">30-Year Treasury</div>
              <div className="text-3xl font-bold text-violet-600 mb-1">
                {benchmarkChanges['30_year'].current.toFixed(3)}%
              </div>
              <div className={`text-sm font-medium ${benchmarkChanges['30_year'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {benchmarkChanges['30_year'].daily >= 0 ? '+' : ''}{benchmarkChanges['30_year'].daily.toFixed(1)} bp (1D)
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">10Y-2Y Spread</div>
              <div className={`text-3xl font-bold mb-1 ${curveSpread >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {curveSpread >= 0 ? '+' : ''}{curveSpread.toFixed(1)} bp
              </div>
              <div className="text-sm text-gray-500">
                {curveSpread >= 0 ? 'Normal (Steep)' : 'Inverted'}
              </div>
            </div>
          </div>

          {/* Yield Curve Line Chart */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Snapshot as of {new Date(latestData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yieldCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="maturity"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, yAxisMax]}
                  />
                  <Tooltip
                    formatter={(value: any) => `${value.toFixed(3)}%`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 90-Day Historical Analysis Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">90-Day Trend Analysis</h2>
          <p className="text-gray-600 mb-6">
            Historical movements from {dateRange.start} to {dateRange.end}
          </p>

          {/* Maturity Selection Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Maturities to Display</h3>
              <div className="flex gap-2">
                <button
                  onClick={showBenchmarks}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Benchmarks
                </button>
                <button
                  onClick={showAll}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Show All
                </button>
                <button
                  onClick={hideAll}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Hide All
                </button>
              </div>
            </div>

            {/* Maturity toggle buttons */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MATURITY_COLORS) as MaturityKey[]).map((maturity) => (
                <button
                  key={maturity}
                  onClick={() => toggleMaturity(maturity)}
                  className={`px-4 py-2 rounded-md border-2 transition-all ${
                    visibleMaturities.has(maturity)
                      ? 'border-opacity-100 font-semibold shadow-sm'
                      : 'border-opacity-30 opacity-50 hover:opacity-75'
                  }`}
                  style={{
                    borderColor: MATURITY_COLORS[maturity],
                    backgroundColor: visibleMaturities.has(maturity) ? `${MATURITY_COLORS[maturity]}15` : 'white',
                    color: visibleMaturities.has(maturity) ? MATURITY_COLORS[maturity] : '#6b7280',
                  }}
                >
                  {MATURITY_LABELS[maturity]}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-3">
              {visibleMaturities.size} of {Object.keys(MATURITY_COLORS).length} maturities selected
            </p>
          </div>

          {/* Historical Chart */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Treasury Yield Time Series</h3>
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value: any) => {
                      if (typeof value === 'number') {
                        return `${value.toFixed(3)}%`;
                      }
                      return value;
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  {(Object.keys(MATURITY_COLORS) as MaturityKey[]).map((maturity) =>
                    visibleMaturities.has(maturity) ? (
                      <Line
                        key={maturity}
                        type="monotone"
                        dataKey={maturity}
                        name={MATURITY_LABELS[maturity]}
                        stroke={MATURITY_COLORS[maturity]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        connectNulls
                      />
                    ) : null
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Latest Yields Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Maturities - Latest Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Yield
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1 Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1 Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1 Month
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Object.keys(MATURITY_COLORS) as MaturityKey[]).map((maturity) => {
                  const changes = calculateChanges(maturity);

                  return (
                    <tr key={maturity} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-md font-medium"
                          style={{
                            backgroundColor: `${MATURITY_COLORS[maturity]}15`,
                            color: MATURITY_COLORS[maturity],
                          }}
                        >
                          {MATURITY_LABELS[maturity]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {changes.current ? `${changes.current.toFixed(3)}%` : 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        changes.daily > 0 ? 'text-red-600' :
                        changes.daily < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {changes.daily !== 0 && (
                          <span>{changes.daily > 0 ? '+' : ''}{changes.daily.toFixed(1)} bp</span>
                        )}
                        {changes.daily === 0 && '—'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        changes.weekly > 0 ? 'text-red-600' :
                        changes.weekly < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {changes.weekly !== 0 && (
                          <span>{changes.weekly > 0 ? '+' : ''}{changes.weekly.toFixed(1)} bp</span>
                        )}
                        {changes.weekly === 0 && '—'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        changes.monthly > 0 ? 'text-red-600' :
                        changes.monthly < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {changes.monthly !== 0 && (
                          <span>{changes.monthly > 0 ? '+' : ''}{changes.monthly.toFixed(1)} bp</span>
                        )}
                        {changes.monthly === 0 && '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsaHistoricalYieldsPage;
