import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fxYahooService } from '../../services/fxYahooService';
import type { FXRatesYahooData, CurrencyCode } from '../../types/fxYahoo';

const FXMarketsYahooPage: React.FC = () => {
  const [data, setData] = useState<FXRatesYahooData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Currency colors for charts
  const CURRENCY_COLORS: Record<CurrencyCode, string> = {
    VND: '#3b82f6', // blue
    TRY: '#ef4444', // red
    MNT: '#10b981', // green
    UZS: '#f59e0b', // amber
    AMD: '#8b5cf6', // purple
    GBP: '#06b6d4'  // cyan
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fxYahooService.getYahooRates();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FX rates data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      const result = await fxYahooService.refreshYahooRates();
      setRefreshMessage(result.message);

      // Wait a moment then reload data
      setTimeout(async () => {
        await fetchData();
        setTimeout(() => setRefreshMessage(null), 3000);
      }, 1000);
    } catch (err) {
      setRefreshMessage(err instanceof Error ? err.message : 'Failed to refresh FX rates');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate changes for a currency
  const calculateChanges = (currency: CurrencyCode) => {
    if (!data || data.data.length === 0) return { current: null, day1: null, week1: null, month1: null, month3: null };

    const dataArray = data.data;
    const latestIndex = dataArray.length - 1;
    const current = dataArray[latestIndex][currency];

    // Find indices for different periods (skip null values)
    const findValueAtIndex = (daysBack: number): number | null => {
      const targetIndex = Math.max(0, latestIndex - daysBack);
      for (let i = targetIndex; i >= 0; i--) {
        if (dataArray[i][currency] !== null) {
          return dataArray[i][currency];
        }
      }
      return null;
    };

    const day1Value = findValueAtIndex(1);
    const week1Value = findValueAtIndex(7);
    const month1Value = findValueAtIndex(30);
    const month3Value = findValueAtIndex(90);

    const calculateChange = (oldValue: number | null): number | null => {
      if (current === null || oldValue === null) return null;
      return ((current - oldValue) / oldValue) * 100;
    };

    return {
      current,
      day1: calculateChange(day1Value),
      week1: calculateChange(week1Value),
      month1: calculateChange(month1Value),
      month3: calculateChange(month3Value)
    };
  };

  // Get latest value for a currency
  const getLatestValue = (currency: CurrencyCode): number | null => {
    if (!data || data.data.length === 0) return null;

    // Search from the end to find the most recent non-null value
    for (let i = data.data.length - 1; i >= 0; i--) {
      const value = data.data[i][currency];
      if (value !== null) {
        return value;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FX rates...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'No data available'}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const currencies: CurrencyCode[] = ['VND', 'TRY', 'MNT', 'UZS', 'AMD', 'GBP'];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exchange Rates</h1>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {currencies.map((currency) => {
          const currencyName = data.meta.currencies[currency];
          const latestValue = getLatestValue(currency);
          const changes = calculateChanges(currency);

          return (
            <div key={currency} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">USD:{currency}</p>
                <p className="text-xs text-gray-500">{currencyName}</p>
                <p className="text-2xl font-bold text-gray-900 my-2">
                  {latestValue !== null ? latestValue.toFixed(2) : 'N/A'}
                </p>
                {changes.day1 !== null && (
                  <p className={`text-sm font-medium ${
                    changes.day1 >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {changes.day1 >= 0 ? '+' : ''}{changes.day1.toFixed(2)}%
                  </p>
                )}
                {changes.day1 === null && (
                  <p className="text-sm text-gray-400">No data</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Currency Charts (2x3 grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currencies.map((currency) => {
          const currencyName = data.meta.currencies[currency];

          // Prepare chart data
          const chartData = data.data.map((row) => ({
            date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: row[currency]
          })).filter(item => item.value !== null);

          return (
            <div key={currency} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currency} - {currencyName}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  />
                  <Tooltip formatter={(value: any) => value !== null ? Number(value).toFixed(2) : 'N/A'} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CURRENCY_COLORS[currency]}
                    strokeWidth={2}
                    dot={false}
                    name={currency}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* All Currencies - Latest Data Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Currencies - Latest Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rate
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  3 Month
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencies.map((currency) => {
                const changes = calculateChanges(currency);
                return (
                  <tr key={currency} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: `${CURRENCY_COLORS[currency]}15`,
                          color: CURRENCY_COLORS[currency],
                        }}
                      >
                        {currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.meta.currencies[currency]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {changes.current !== null ? changes.current.toFixed(2) : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.day1 !== null
                        ? changes.day1 > 0 ? 'text-red-600' : changes.day1 < 0 ? 'text-green-600' : 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {changes.day1 !== null ? `${changes.day1 > 0 ? '+' : ''}${changes.day1.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.week1 !== null
                        ? changes.week1 > 0 ? 'text-red-600' : changes.week1 < 0 ? 'text-green-600' : 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {changes.week1 !== null ? `${changes.week1 > 0 ? '+' : ''}${changes.week1.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.month1 !== null
                        ? changes.month1 > 0 ? 'text-red-600' : changes.month1 < 0 ? 'text-green-600' : 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {changes.month1 !== null ? `${changes.month1 > 0 ? '+' : ''}${changes.month1.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      changes.month3 !== null
                        ? changes.month3 > 0 ? 'text-red-600' : changes.month3 < 0 ? 'text-green-600' : 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {changes.month3 !== null ? `${changes.month3 > 0 ? '+' : ''}${changes.month3.toFixed(2)}%` : 'N/A'}
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

export default FXMarketsYahooPage;
