import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCorporateBondsYields, refreshCorporateBondsYields, CorporateBondsYield } from '../../services/marketsService';

// TypeScript interfaces
interface BondDataPoint {
  date: string;
  aaa: number | null;
  aa: number | null;
  a: number | null;
  bbb: number | null;
  bb: number | null;
  high_yield: number | null;
}

type RatingKey = 'aaa' | 'aa' | 'a' | 'bbb' | 'bb' | 'high_yield';

// Color palette for credit ratings (green � yellow � red spectrum: investment grade to high yield)
const RATING_COLORS: Record<RatingKey, string> = {
  'aaa': '#22c55e',       // green (highest credit quality)
  'aa': '#84cc16',        // lime
  'a': '#eab308',         // yellow
  'bbb': '#f59e0b',       // amber (lowest investment grade)
  'bb': '#f97316',        // orange (high yield)
  'high_yield': '#ef4444', // red (highest risk)
};

// Display labels for ratings
const RATING_LABELS: Record<RatingKey, string> = {
  'aaa': 'AAA',
  'aa': 'AA',
  'a': 'A',
  'bbb': 'BBB',
  'bb': 'BB',
  'high_yield': 'High Yield',
};

const CorporateBondsPage: React.FC = () => {
  const [data, setData] = useState<CorporateBondsYield | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [visibleRatings, setVisibleRatings] = useState<Set<RatingKey>>(
    new Set(['aaa', 'bbb', 'high_yield']) // Default: benchmark ratings
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching corporate bonds yields...');

      const bondsData = await getCorporateBondsYields();
      console.log('Received data:', bondsData);
      console.log('Total data points:', bondsData.data?.length);

      // Filter to last 90 days only
      const today = new Date();
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);

      const filteredData = {
        ...bondsData,
        data: bondsData.data.filter((row: any) => {
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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      console.log('Refreshing corporate bonds data from FRED...');

      const result = await refreshCorporateBondsYields();
      console.log('Refresh result:', result);

      // Show success message
      setRefreshMessage('Data refreshed successfully!');

      // Reload the data after 1 second
      setTimeout(async () => {
        await fetchData();
        // Clear success message after 3 seconds
        setTimeout(() => setRefreshMessage(null), 3000);
      }, 1000);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setRefreshMessage(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleRating = (rating: RatingKey) => {
    setVisibleRatings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rating)) {
        newSet.delete(rating);
      } else {
        newSet.add(rating);
      }
      return newSet;
    });
  };

  const showAll = () => {
    setVisibleRatings(new Set(Object.keys(RATING_COLORS) as RatingKey[]));
  };

  const hideAll = () => {
    setVisibleRatings(new Set());
  };

  const showBenchmarks = () => {
    setVisibleRatings(new Set(['aaa', 'bbb', 'high_yield']));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading US corporate bond yields...</p>
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

  // Get latest credit curve data for line chart
  const latestData = data.data[data.data.length - 1];
  const creditCurveData = (Object.keys(RATING_COLORS) as RatingKey[]).map(rating => ({
    rating: RATING_LABELS[rating],
    yield: latestData[rating],
    color: RATING_COLORS[rating]
  })).filter(item => item.yield !== null);

  // Calculate max yield for Y-axis domain
  const maxYield = Math.max(...creditCurveData.map(d => d.yield || 0));
  const yAxisMax = Math.ceil(maxYield + 0.5); // Add 0.5% padding and round up

  // Calculate changes (1 day, 1 week, 1 month)
  const calculateChanges = (rating: RatingKey) => {
    const values = data.data.map(d => d[rating]).filter(v => v !== null) as number[];
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
    'aaa': calculateChanges('aaa'),
    'bbb': calculateChanges('bbb'),
    'high_yield': calculateChanges('high_yield'),
  };

  // Calculate credit spreads
  const investmentGradeSpread = benchmarkChanges['bbb'].current - benchmarkChanges['aaa'].current;
  const creditRiskPremium = benchmarkChanges['high_yield'].current - benchmarkChanges['bbb'].current;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                US Corporate Bond Yields
              </h1>
              <p className="text-lg text-gray-600">
                ICE BofA US Corporate Bond Effective Yields - Credit rating analysis
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Data from Federal Reserve Economic Data (FRED) • Last updated: {new Date(data.meta.generated_utc).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  refreshing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {refreshing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </span>
                )}
              </button>
              {refreshMessage && (
                <div
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    refreshMessage.includes('successfully')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {refreshMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Credit Curve Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Credit Rating Curve</h2>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">AAA Corporate</div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {benchmarkChanges['aaa'].current.toFixed(3)}%
              </div>
              <div className={`text-sm font-medium ${benchmarkChanges['aaa'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {benchmarkChanges['aaa'].daily >= 0 ? '+' : ''}{benchmarkChanges['aaa'].daily.toFixed(1)} bp (1D)
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">BBB Corporate</div>
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {benchmarkChanges['bbb'].current.toFixed(3)}%
              </div>
              <div className={`text-sm font-medium ${benchmarkChanges['bbb'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {benchmarkChanges['bbb'].daily >= 0 ? '+' : ''}{benchmarkChanges['bbb'].daily.toFixed(1)} bp (1D)
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">BBB-AAA Spread</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {investmentGradeSpread.toFixed(1)} bp
              </div>
              <div className="text-sm text-gray-500">
                Investment Grade
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">HY-BBB Spread</div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {creditRiskPremium.toFixed(1)} bp
              </div>
              <div className="text-sm text-gray-500">
                Credit Risk Premium
              </div>
            </div>
          </div>

          {/* Credit Curve Line Chart */}
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
                <LineChart data={creditCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="rating"
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

          {/* Rating Selection Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Credit Ratings to Display</h3>
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

            {/* Rating toggle buttons */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RATING_COLORS) as RatingKey[]).map((rating) => (
                <button
                  key={rating}
                  onClick={() => toggleRating(rating)}
                  className={`px-4 py-2 rounded-md border-2 transition-all ${
                    visibleRatings.has(rating)
                      ? 'border-opacity-100 font-semibold shadow-sm'
                      : 'border-opacity-30 opacity-50 hover:opacity-75'
                  }`}
                  style={{
                    borderColor: RATING_COLORS[rating],
                    backgroundColor: visibleRatings.has(rating) ? `${RATING_COLORS[rating]}15` : 'white',
                    color: visibleRatings.has(rating) ? RATING_COLORS[rating] : '#6b7280',
                  }}
                >
                  {RATING_LABELS[rating]}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-3">
              {visibleRatings.size} of {Object.keys(RATING_COLORS).length} ratings selected
            </p>
          </div>

          {/* Historical Chart */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Corporate Bond Yield Time Series</h3>
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
                  {(Object.keys(RATING_COLORS) as RatingKey[]).map((rating) =>
                    visibleRatings.has(rating) ? (
                      <Line
                        key={rating}
                        type="monotone"
                        dataKey={rating}
                        name={RATING_LABELS[rating]}
                        stroke={RATING_COLORS[rating]}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Credit Ratings - Latest Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Rating
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
                {(Object.keys(RATING_COLORS) as RatingKey[]).map((rating) => {
                  const changes = calculateChanges(rating);

                  return (
                    <tr key={rating} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-md font-medium"
                          style={{
                            backgroundColor: `${RATING_COLORS[rating]}15`,
                            color: RATING_COLORS[rating],
                          }}
                        >
                          {RATING_LABELS[rating]}
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
                        {changes.daily === 0 && ''}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        changes.weekly > 0 ? 'text-red-600' :
                        changes.weekly < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {changes.weekly !== 0 && (
                          <span>{changes.weekly > 0 ? '+' : ''}{changes.weekly.toFixed(1)} bp</span>
                        )}
                        {changes.weekly === 0 && ''}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        changes.monthly > 0 ? 'text-red-600' :
                        changes.monthly < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {changes.monthly !== 0 && (
                          <span>{changes.monthly > 0 ? '+' : ''}{changes.monthly.toFixed(1)} bp</span>
                        )}
                        {changes.monthly === 0 && ''}
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

export default CorporateBondsPage;
