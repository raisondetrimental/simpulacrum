import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCorporateYields, refreshCorporateYields, CorporateYieldsData } from '../../services/marketsService';

const CorporateYieldsPage: React.FC = () => {
  const [data, setData] = useState<CorporateYieldsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Toggle states for 90-day chart
  const [showGlobalHY, setShowGlobalHY] = useState(true);
  const [showGlobalIG, setShowGlobalIG] = useState(true);
  const [showEMCorporate, setShowEMCorporate] = useState(true);
  const [showEMAsia, setShowEMAsia] = useState(true);
  const [showEMEMEA, setShowEMEMEA] = useState(true);
  const [showEMLatAm, setShowEMLatAm] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const yieldsData = await getCorporateYields();

      // Filter to last 90 days only
      const today = new Date();
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);

      const filteredData = {
        ...yieldsData,
        data: yieldsData.data.filter((row: any) => {
          const rowDate = new Date(row.date);
          return rowDate >= ninetyDaysAgo;
        })
      };

      setData(filteredData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      const result = await refreshCorporateYields();
      setRefreshMessage('Data refreshed successfully!');

      // Wait a moment then reload data
      setTimeout(async () => {
        await fetchData();
        setTimeout(() => setRefreshMessage(null), 3000);
      }, 1000);
    } catch (err) {
      setRefreshMessage(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading corporate yields data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  // Get latest values
  const latestData = data.data[data.data.length - 1];
  const previousData = data.data[data.data.length - 2];

  // Calculate changes
  const globalHYChange = latestData.global_hy && previousData?.global_hy
    ? latestData.global_hy - previousData.global_hy
    : null;
  const globalIGChange = latestData.global_ig_bbb && previousData?.global_ig_bbb
    ? latestData.global_ig_bbb - previousData.global_ig_bbb
    : null;
  const emCorporateChange = latestData.em_corporate && previousData?.em_corporate
    ? latestData.em_corporate - previousData.em_corporate
    : null;

  // Category labels and colors
  const CATEGORY_LABELS: { [key: string]: string } = {
    global_hy: 'Global High Yield',
    global_ig_bbb: 'Global IG (BBB)',
    em_corporate: 'EM Corporate',
    em_asia: 'EM Asia',
    em_emea: 'EM EMEA',
    em_latam: 'EM LatAm',
  };

  const CATEGORY_COLORS: { [key: string]: string } = {
    global_hy: '#ef4444',
    global_ig_bbb: '#3b82f6',
    em_corporate: '#10b981',
    em_asia: '#8b5cf6',
    em_emea: '#f97316',
    em_latam: '#ec4899',
  };

  // Calculate changes for table
  type CategoryKey = keyof typeof CATEGORY_LABELS;

  const calculateChanges = (category: CategoryKey) => {
    const current = latestData[category];

    // 1 Day change
    const oneDayAgo = data.data[data.data.length - 2];
    const dailyChange = current && oneDayAgo?.[category]
      ? (current - oneDayAgo[category]!) * 100  // Convert to basis points
      : 0;

    // 1 Week change (7 days ago)
    const oneWeekIndex = Math.max(0, data.data.length - 8);
    const oneWeekAgo = data.data[oneWeekIndex];
    const weeklyChange = current && oneWeekAgo?.[category]
      ? (current - oneWeekAgo[category]!) * 100  // Convert to basis points
      : 0;

    // 1 Month change (30 days ago)
    const oneMonthIndex = Math.max(0, data.data.length - 31);
    const oneMonthAgo = data.data[oneMonthIndex];
    const monthlyChange = current && oneMonthAgo?.[category]
      ? (current - oneMonthAgo[category]!) * 100  // Convert to basis points
      : 0;

    return {
      current,
      daily: dailyChange,
      weekly: weeklyChange,
      monthly: monthlyChange,
    };
  };

  // Prepare chart data for 90-day trends
  const chartData = data.data.map(row => ({
    date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    global_hy: row.global_hy,
    global_ig_bbb: row.global_ig_bbb,
    em_corporate: row.em_corporate,
    em_asia: row.em_asia,
    em_emea: row.em_emea,
    em_latam: row.em_latam,
  }));

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Global Corporate Bond Effective Yields</h1>
          <p className="text-sm text-gray-600 mt-1">
            ICE BofA Effective Yields (%) - Last 90 Days
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/corporate-spreads"
            className="px-4 py-2 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            View Spreads
          </Link>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              refreshing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Refresh Message */}
      {refreshMessage && (
        <div className={`p-4 rounded-lg ${
          refreshMessage.includes('success')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {refreshMessage}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Global HY */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Global High Yield</h3>
          <p className="text-3xl font-bold text-gray-900">
            {latestData.global_hy?.toFixed(2) ?? 'N/A'} <span className="text-lg">%</span>
          </p>
          {globalHYChange !== null && (
            <p className={`text-sm mt-2 ${globalHYChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {globalHYChange >= 0 ? '+' : ''}{globalHYChange.toFixed(2)}%
            </p>
          )}
        </div>

        {/* Global IG (BBB) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Global IG (BBB)</h3>
          <p className="text-3xl font-bold text-gray-900">
            {latestData.global_ig_bbb?.toFixed(2) ?? 'N/A'} <span className="text-lg">%</span>
          </p>
          {globalIGChange !== null && (
            <p className={`text-sm mt-2 ${globalIGChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {globalIGChange >= 0 ? '+' : ''}{globalIGChange.toFixed(2)}%
            </p>
          )}
        </div>

        {/* EM Corporate */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">EM Corporate</h3>
          <p className="text-3xl font-bold text-gray-900">
            {latestData.em_corporate?.toFixed(2) ?? 'N/A'} <span className="text-lg">%</span>
          </p>
          {emCorporateChange !== null && (
            <p className={`text-sm mt-2 ${emCorporateChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {emCorporateChange >= 0 ? '+' : ''}{emCorporateChange.toFixed(2)}%
            </p>
          )}
        </div>

        {/* HY-IG Spread */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">HY-IG (BBB) Spread</h3>
          <p className="text-3xl font-bold text-gray-900">
            {latestData.global_hy && latestData.global_ig_bbb
              ? ((latestData.global_hy - latestData.global_ig_bbb) * 100).toFixed(0)
              : 'N/A'} <span className="text-lg">bps</span>
          </p>
          {latestData.global_hy && latestData.global_ig_bbb && previousData?.global_hy && previousData?.global_ig_bbb && (
            <p className={`text-sm mt-2 ${
              ((latestData.global_hy - latestData.global_ig_bbb) - (previousData.global_hy - previousData.global_ig_bbb)) * 100 >= 0
                ? 'text-red-600'
                : 'text-green-600'
            }`}>
              {((latestData.global_hy - latestData.global_ig_bbb) - (previousData.global_hy - previousData.global_ig_bbb)) * 100 >= 0 ? '+' : ''}
              {(((latestData.global_hy - latestData.global_ig_bbb) - (previousData.global_hy - previousData.global_ig_bbb)) * 100).toFixed(0)} bps
            </p>
          )}
        </div>
      </div>

      {/* 90-Day Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">90-Day Yield Trends</h2>

          {/* Toggle Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowGlobalHY(!showGlobalHY)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showGlobalHY
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Global HY
            </button>
            <button
              onClick={() => setShowGlobalIG(!showGlobalIG)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showGlobalIG
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Global IG (BBB)
            </button>
            <button
              onClick={() => setShowEMCorporate(!showEMCorporate)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showEMCorporate
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              EM Corporate
            </button>
            <button
              onClick={() => setShowEMAsia(!showEMAsia)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showEMAsia
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              EM Asia
            </button>
            <button
              onClick={() => setShowEMEMEA(!showEMEMEA)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showEMEMEA
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              EM EMEA
            </button>
            <button
              onClick={() => setShowEMLatAm(!showEMLatAm)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                showEMLatAm
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              EM LatAm
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            {showGlobalHY && <Line type="monotone" dataKey="global_hy" stroke="#ef4444" name="Global HY" strokeWidth={2} dot={false} />}
            {showGlobalIG && <Line type="monotone" dataKey="global_ig_bbb" stroke="#3b82f6" name="Global IG (BBB)" strokeWidth={2} dot={false} />}
            {showEMCorporate && <Line type="monotone" dataKey="em_corporate" stroke="#10b981" name="EM Corporate" strokeWidth={2} dot={false} />}
            {showEMAsia && <Line type="monotone" dataKey="em_asia" stroke="#8b5cf6" name="EM Asia" strokeWidth={2} dot={false} />}
            {showEMEMEA && <Line type="monotone" dataKey="em_emea" stroke="#f97316" name="EM EMEA" strokeWidth={2} dot={false} />}
            {showEMLatAm && <Line type="monotone" dataKey="em_latam" stroke="#ec4899" name="EM LatAm" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* All Categories - Latest Data Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Categories - Latest Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Yield
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1 Day
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1 Week
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1 Month
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((category) => {
                const changes = calculateChanges(category);
                return (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[category]}15`,
                          color: CATEGORY_COLORS[category],
                        }}
                      >
                        {CATEGORY_LABELS[category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {changes.current ? `${changes.current.toFixed(3)}%` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.daily > 0 ? 'text-red-600' : changes.daily < 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {changes.daily !== 0 ? `${changes.daily > 0 ? '+' : ''}${changes.daily.toFixed(1)} bp` : '0 bp'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.weekly > 0 ? 'text-red-600' : changes.weekly < 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {changes.weekly !== 0 ? `${changes.weekly > 0 ? '+' : ''}${changes.weekly.toFixed(1)} bp` : '0 bp'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.monthly > 0 ? 'text-red-600' : changes.monthly < 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {changes.monthly !== 0 ? `${changes.monthly > 0 ? '+' : ''}${changes.monthly.toFixed(1)} bp` : '0 bp'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p><strong>Data Source:</strong> {data.meta.source}</p>
        <p><strong>Total Days in Database:</strong> {data.meta.total_days}</p>
        <p><strong>Date Range:</strong> {data.meta.date_range.start} to {data.meta.date_range.end}</p>
        <p><strong>Last Updated:</strong> {new Date(data.meta.generated_utc).toLocaleString()}</p>
        <p className="mt-2"><strong>Note:</strong> {data.meta.notes}</p>
      </div>
    </div>
  );
};

export default CorporateYieldsPage;
