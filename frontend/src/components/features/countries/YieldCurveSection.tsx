/**
 * YieldCurveSection Component
 * Displays sovereign yield curve data for a specific country within country tabs
 */

import React, { useState, useEffect } from 'react';
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
  refreshTurkeyYieldCurve,
  refreshVietnamYieldCurve,
  TurkeyYieldCurveData,
  VietnamYieldCurveData
} from '../../../services/marketsService';

interface YieldCurveSectionProps {
  countrySlug: 'turkiye' | 'vietnam';
}

type YieldCurveData = TurkeyYieldCurveData | VietnamYieldCurveData;

const YieldCurveSection: React.FC<YieldCurveSectionProps> = ({ countrySlug }) => {
  const [yieldData, setYieldData] = useState<YieldCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countryName = countrySlug === 'turkiye' ? 'Turkey' : 'Vietnam';

  useEffect(() => {
    loadYieldCurve();
  }, [countrySlug]);

  const loadYieldCurve = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = countrySlug === 'turkiye'
        ? await getTurkeyYieldCurve()
        : await getVietnamYieldCurve();
      setYieldData(data);
    } catch (err) {
      console.error(`Error loading ${countryName} yield curve:`, err);
      setError('Failed to load yield curve data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = countrySlug === 'turkiye'
        ? await refreshTurkeyYieldCurve()
        : await refreshVietnamYieldCurve();
      setYieldData(data);
    } catch (err) {
      console.error(`Error refreshing ${countryName} yield curve:`, err);
      setError('Failed to refresh yield curve data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter out null yields for the chart
  const chartData = yieldData?.yields
    .filter(point => point.yield?.last !== null && point.yield?.last !== undefined)
    .map(point => ({
      maturity: point.maturity,
      maturity_years: point.maturity_years,
      yield: point.yield.last
    })) || [];

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading yield curve data...</p>
        </div>
      </div>
    );
  }

  if (error || !yieldData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-900 font-semibold">Error Loading Yield Curve</h3>
            <p className="text-red-700 text-sm">{error || 'No data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get key yields for summary
  const shortTermYield = yieldData.yields.find(d => d.maturity_years <= 0.5)?.yield?.last;
  const mediumTermYield = yieldData.yields.find(d => d.maturity_years >= 4 && d.maturity_years <= 6)?.yield?.last;
  const longTermYield = yieldData.yields.find(d => d.maturity_years >= 9 && d.maturity_years <= 11)?.yield?.last;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {countryName} Sovereign Yield Curve
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {formatDate(yieldData.last_updated)}
          </p>
        </div>
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

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Short-term (≤6M)</p>
          <p className="text-2xl font-bold text-blue-600">
            {shortTermYield?.toFixed(2) || 'N/A'}%
          </p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-gray-600 mb-1">Medium-term (5Y)</p>
          <p className="text-2xl font-bold text-green-600">
            {mediumTermYield?.toFixed(2) || 'N/A'}%
          </p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Long-term (10Y)</p>
          <p className="text-2xl font-bold text-purple-600">
            {longTermYield?.toFixed(2) || 'N/A'}%
          </p>
        </div>
      </div>

      {/* Yield Curve Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Curve</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="maturity"
              label={{ value: 'Maturity', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => `Maturity: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="yield"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5, fill: '#2563eb' }}
              name="Yield"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Data Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Yield Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maturity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield (%)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1M Change (bp)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  6M Change (bp)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  12M Change (bp)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {yieldData.yields.map((point) => (
                <tr key={point.maturity} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {point.maturity_text}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    {point.yield.last?.toFixed(2) || 'N/A'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                    point.yield.chg_1m && point.yield.chg_1m > 0 ? 'text-red-600' :
                    point.yield.chg_1m && point.yield.chg_1m < 0 ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {point.yield.chg_1m !== null && point.yield.chg_1m !== undefined
                      ? `${point.yield.chg_1m > 0 ? '+' : ''}${point.yield.chg_1m.toFixed(1)}`
                      : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                    point.yield.chg_6m && point.yield.chg_6m > 0 ? 'text-red-600' :
                    point.yield.chg_6m && point.yield.chg_6m < 0 ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {point.yield.chg_6m !== null && point.yield.chg_6m !== undefined
                      ? `${point.yield.chg_6m > 0 ? '+' : ''}${point.yield.chg_6m.toFixed(1)}`
                      : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                    point.yield.chg_12m && point.yield.chg_12m > 0 ? 'text-red-600' :
                    point.yield.chg_12m && point.yield.chg_12m < 0 ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {point.yield.chg_12m !== null && point.yield.chg_12m !== undefined
                      ? `${point.yield.chg_12m > 0 ? '+' : ''}${point.yield.chg_12m.toFixed(1)}`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Source */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Data Source</p>
            <p>{yieldData.data_source}</p>
            {yieldData.notes && (
              <p className="mt-2 text-gray-600">{yieldData.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldCurveSection;
