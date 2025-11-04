import React, { useEffect, useState } from 'react';
import { FXRatesData } from '../../types/dashboard';
import { fxService } from '../../services/fxService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FXMarketsPage: React.FC = () => {
  const [data, setData] = useState<FXRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fxService.getLatest();
      setData(response.rates);
      setLastUpdated(response.last_updated);
    } catch (err: any) {
      console.error('Failed to load FX data:', err);
      setError(err.response?.data?.message || 'Failed to load FX data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fxService.refresh();
      setData(response.rates);
      setLastUpdated(response.last_updated);
    } catch (err: any) {
      console.error('Failed to refresh FX data:', err);
      setError(err.response?.data?.message || 'Failed to refresh FX data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading FX data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading FX Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {refreshing ? 'Refreshing...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No FX Data Available</h2>
            <p className="text-yellow-700 mb-4">Click refresh to fetch the latest exchange rates.</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
            >
              {refreshing ? 'Refreshing...' : '🔄 Refresh Rates'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for rates chart
  const ratesChartData = Object.entries(data).map(([currency, currencyData]) => ({
    currency,
    rate: currencyData.rate,
    name: currencyData.name
  })).filter(item => item.rate && !isNaN(Number(item.rate)));

  // Prepare data for changes chart (1W changes)
  const changesChartData = Object.entries(data).map(([currency, currencyData]) => ({
    currency,
    change_1W: currencyData.changes['1W'],
    name: currencyData.name
  })).filter(item => item.change_1W && !isNaN(Number(item.change_1W)));

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Button */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FX Markets</h1>
            <p className="mt-2 text-gray-600">Emerging market currencies vs USD (Live data from ExchangeRate-API)</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {lastUpdated && (
              <p className="text-sm text-gray-600">
                Last refreshed: <span className="font-medium">{formatDateTime(lastUpdated)}</span>
              </p>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${
                refreshing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Rates'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* FX Rates Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data).map(([currency, currencyData]) => (
          <div key={currency} className="metric-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{currency}/USD</p>
                <p className="text-lg font-semibold text-gray-900">{currencyData.name}</p>
                <p className="text-xl font-bold text-primary-600 mt-1">
                  {currencyData.rate ? currencyData.rate.toFixed(4) : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                {currencyData.changes['1D'] !== null && (
                  <p className={`text-sm font-medium ${
                    currencyData.changes['1D']! > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    1D: {currencyData.changes['1D']! > 0 ? '+' : ''}
                    {typeof currencyData.changes['1D'] === 'number' ?
                      currencyData.changes['1D'].toFixed(2) : currencyData.changes['1D']}%
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.entries(currencyData.changes).map(([period, change]) => (
                <div key={period} className="text-center">
                  <p className="text-xs text-gray-500">{period}</p>
                  <p className={`text-sm font-medium ${
                    change && change > 0 ? 'text-green-600' :
                    change && change < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {change !== null ?
                      (typeof change === 'number' ?
                        `${change > 0 ? '+' : ''}${change.toFixed(2)}%` :
                        String(change).substring(0, 8)) : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Changes Chart */}
      {changesChartData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">1-Week Changes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={changesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="currency" />
              <YAxis label={{ value: 'Change (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any, _name: string, props: any) => [
                `${Number(value).toFixed(2)}%`,
                `${props.payload.name} (${props.payload.currency})`
              ]} />
              <Bar dataKey="change_1W" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed FX Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed FX Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1D Change (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1W Change (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1M Change (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data).map(([currency, currencyData]) => (
                <tr key={currency}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {currencyData.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {currencyData.rate ? currencyData.rate.toFixed(6) : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    currencyData.changes['1D'] && currencyData.changes['1D'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currencyData.changes['1D'] !== null ?
                      `${currencyData.changes['1D']! > 0 ? '+' : ''}${
                        typeof currencyData.changes['1D'] === 'number' ?
                          currencyData.changes['1D'].toFixed(2) :
                          currencyData.changes['1D']
                      }%` : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    currencyData.changes['1W'] && currencyData.changes['1W'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currencyData.changes['1W'] !== null ?
                      `${currencyData.changes['1W']! > 0 ? '+' : ''}${
                        typeof currencyData.changes['1W'] === 'number' ?
                          currencyData.changes['1W'].toFixed(2) :
                          currencyData.changes['1W']
                      }%` : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    currencyData.changes['1M'] && currencyData.changes['1M'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currencyData.changes['1M'] !== null ?
                      `${currencyData.changes['1M']! > 0 ? '+' : ''}${
                        typeof currencyData.changes['1M'] === 'number' ?
                          currencyData.changes['1M'].toFixed(2) :
                          currencyData.changes['1M']
                      }%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Pairs</p>
            <p className="text-2xl font-bold text-gray-900">{Object.keys(data).length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Rates</p>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(data).filter(d => d.rate && !isNaN(Number(d.rate))).length}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">With Changes</p>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(data).filter(d =>
                d.changes['1D'] !== null || d.changes['1W'] !== null || d.changes['1M'] !== null
              ).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FXMarketsPage;
