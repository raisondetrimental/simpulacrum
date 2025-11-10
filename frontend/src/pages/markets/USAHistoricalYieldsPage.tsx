import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../../config';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface HistoricalData {
  metadata: {
    last_updated: string;
    source_file: string;
    generated_by: string;
    date_range: {
      start: string;
      end: string;
      days: number;
    };
  };
  dates: string[];
  maturities: {
    [key: string]: (number | null)[];
  };
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number | null;
}

const MATURITY_COLORS = {
  '1M': '#ef4444',    // red
  '2M': '#f97316',    // orange
  '3M': '#f59e0b',    // amber
  '4M': '#eab308',    // yellow
  '6M': '#84cc16',    // lime
  '1Y': '#22c55e',    // green
  '2Y': '#10b981',    // emerald
  '3Y': '#14b8a6',    // teal
  '5Y': '#06b6d4',    // cyan
  '7Y': '#0ea5e9',    // sky
  '10Y': '#3b82f6',   // blue
  '20Y': '#6366f1',   // indigo
  '30Y': '#8b5cf6',   // violet
};

const USAHistoricalYieldsPage: React.FC = () => {
  const [data, setData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMaturities, setVisibleMaturities] = useState<Set<string>>(
    new Set(['3M', '2Y', '10Y', '30Y']) // Default to showing key maturities
  );

  // Scroll reveal hooks
  const { ref: ref1, isVisible: isVisible1 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref2, isVisible: isVisible2 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref3, isVisible: isVisible3 } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/historical-yields/usa`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load historical yields');
      console.error('Error fetching historical yields:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaturity = (maturity: string) => {
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
    setVisibleMaturities(new Set(Object.keys(MATURITY_COLORS)));
  };

  const hideAll = () => {
    setVisibleMaturities(new Set());
  };

  const showBenchmarks = () => {
    setVisibleMaturities(new Set(['3M', '2Y', '10Y', '30Y']));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading historical yields...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData: ChartDataPoint[] = data.dates.map((date, index) => {
    const point: ChartDataPoint = { date };
    Object.entries(data.maturities).forEach(([maturity, values]) => {
      point[maturity] = values[index];
    });
    return point;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            USA Treasury Yields - Historical Analysis
          </h1>
          <p className="text-lg text-gray-600">
            3-Month Historical View ({data.metadata.date_range.start} to {data.metadata.date_range.end})
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(data.metadata.last_updated).toLocaleString()}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Maturities to Display</h2>
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

          {/* Maturity toggles */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(MATURITY_COLORS).map(([maturity, color]) => (
              <button
                key={maturity}
                onClick={() => toggleMaturity(maturity)}
                className={`px-4 py-2 rounded-md border-2 transition-all ${
                  visibleMaturities.has(maturity)
                    ? 'border-opacity-100 font-semibold shadow-sm'
                    : 'border-opacity-30 opacity-50 hover:opacity-75'
                }`}
                style={{
                  borderColor: color,
                  backgroundColor: visibleMaturities.has(maturity) ? `${color}15` : 'white',
                  color: visibleMaturities.has(maturity) ? color : '#6b7280',
                }}
              >
                {maturity}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-3">
            {visibleMaturities.size} of {Object.keys(MATURITY_COLORS).length} maturities selected
          </p>
        </div>

        {/* Chart */}
        <div
          ref={ref1}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 transition-all duration-700 ${
            isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
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
              {Object.entries(MATURITY_COLORS).map(([maturity, color]) =>
                visibleMaturities.has(maturity) ? (
                  <Line
                    key={maturity}
                    type="monotone"
                    dataKey={maturity}
                    stroke={color}
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

        {/* Summary Stats */}
        <div
          ref={ref2}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-all duration-700 ${
            isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Data Points</div>
            <div className="text-2xl font-bold text-gray-900">{data.dates.length} days</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Maturities Tracked</div>
            <div className="text-2xl font-bold text-gray-900">{Object.keys(data.maturities).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Date Range</div>
            <div className="text-sm font-semibold text-gray-900">
              {new Date(data.metadata.date_range.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' - '}
              {new Date(data.metadata.date_range.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Source</div>
            <div className="text-sm font-semibold text-gray-900">Markets Dashboard</div>
          </div>
        </div>

        {/* Current Yields Table */}
        <div
          ref={ref3}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-700 ${
            isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Yields (Most Recent Data)</h2>
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
                    Change (1 Week)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change (1 Month)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.maturities).map(([maturity, values]) => {
                  const current = values[values.length - 1];
                  const oneWeekAgo = values[Math.max(0, values.length - 8)] || values[values.length - 1];
                  const oneMonthAgo = values[Math.max(0, values.length - 31)] || values[values.length - 1];

                  const weekChange = current && oneWeekAgo ? ((current - oneWeekAgo) * 100).toFixed(1) : 'N/A';
                  const monthChange = current && oneMonthAgo ? ((current - oneMonthAgo) * 100).toFixed(1) : 'N/A';

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
                          {maturity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {current ? `${current.toFixed(3)}%` : 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        weekChange === 'N/A' ? 'text-gray-500' :
                        parseFloat(weekChange) > 0 ? 'text-red-600' :
                        parseFloat(weekChange) < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {weekChange !== 'N/A' && (
                          <span>{parseFloat(weekChange) > 0 ? '+' : ''}{weekChange} bp</span>
                        )}
                        {weekChange === 'N/A' && 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        monthChange === 'N/A' ? 'text-gray-500' :
                        parseFloat(monthChange) > 0 ? 'text-red-600' :
                        parseFloat(monthChange) < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {monthChange !== 'N/A' && (
                          <span>{parseFloat(monthChange) > 0 ? '+' : ''}{monthChange} bp</span>
                        )}
                        {monthChange === 'N/A' && 'N/A'}
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

export default USAHistoricalYieldsPage;
