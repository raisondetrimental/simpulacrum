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
import { getTurkeyYieldCurve, refreshTurkeyYieldCurve, TurkeyYieldCurveData } from '../../services/marketsService';

const TurkeyYieldCurvePage: React.FC = () => {
  const navigate = useNavigate();
  const [yieldData, setYieldData] = useState<TurkeyYieldCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadYieldCurve();
  }, []);

  const loadYieldCurve = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTurkeyYieldCurve();
      setYieldData(data);
    } catch (err) {
      console.error('Error loading Turkey yield curve:', err);
      setError('Failed to load yield curve data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await refreshTurkeyYieldCurve();
      setYieldData(data);
    } catch (err) {
      console.error('Error refreshing Turkey yield curve:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard/turkiye')}
              className="text-sm text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Türkiye Country Report
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Turkey Sovereign Yield Curve
            </h1>
            {yieldData && (
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {formatDate(yieldData.last_updated)}
              </p>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-900 font-semibold">Error Loading Data</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && yieldData && (
        <>
          {/* Data Source Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-blue-900 font-semibold text-sm">Data Source</h3>
                <p className="text-blue-800 text-sm">{yieldData.data_source}</p>
                {yieldData.notes && (
                  <p className="text-blue-700 text-xs mt-1">{yieldData.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Yield Curve Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Yield Curve Visualization</h2>

            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="maturity"
                  label={{ value: 'Maturity', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Yield']}
                  labelFormatter={(label) => `Maturity: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Government Bond Yield"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Complete Yield Table */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Yield Curve Data</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      Maturity
                    </th>
                    <th colSpan={4} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b">
                      Annualized Yield
                    </th>
                    <th colSpan={4} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b">
                      Price
                    </th>
                    <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      Capital Growth
                    </th>
                    <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Update
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Last</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Chg 1M</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Chg 6M</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase border-r">Chg 12M</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Last</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Chg 1M</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Chg 6M</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase border-r">Chg 12M</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yieldData.yields.map((point, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                        {point.maturity} <span className="text-gray-500 text-xs">({point.maturity_text})</span>
                      </td>
                      {/* Yield columns */}
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                        {point.yield?.last?.toFixed(3) || 'N/A'}%
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${point.yield?.chg_1m && point.yield.chg_1m < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {point.yield?.chg_1m !== null ? `${point.yield.chg_1m > 0 ? '+' : ''}${point.yield.chg_1m?.toFixed(1)} bp` : 'N/A'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${point.yield?.chg_6m && point.yield.chg_6m < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {point.yield?.chg_6m !== null ? `${point.yield.chg_6m > 0 ? '+' : ''}${point.yield.chg_6m?.toFixed(1)} bp` : 'N/A'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm border-r ${point.yield?.chg_12m && point.yield.chg_12m < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {point.yield?.chg_12m !== null ? `${point.yield.chg_12m > 0 ? '+' : ''}${point.yield.chg_12m?.toFixed(1)} bp` : 'N/A'}
                      </td>
                      {/* Price columns */}
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {point.price?.last?.toFixed(2) || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${point.price?.chg_1m && point.price.chg_1m < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {point.price?.chg_1m !== null ? `${point.price.chg_1m > 0 ? '+' : ''}${point.price.chg_1m?.toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${point.price?.chg_6m && point.price.chg_6m < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {point.price?.chg_6m !== null ? `${point.price.chg_6m > 0 ? '+' : ''}${point.price.chg_6m?.toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm border-r ${point.price?.chg_12m && point.price.chg_12m < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {point.price?.chg_12m !== null ? `${point.price.chg_12m > 0 ? '+' : ''}${point.price.chg_12m?.toFixed(2)}%` : 'N/A'}
                      </td>
                      {/* Capital Growth */}
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900 border-r">
                        {point.capital_growth?.toFixed(3) || 'N/A'}
                      </td>
                      {/* Last Update */}
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                        {point.last_update || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Short-term yield */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Short-term (3M)</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {yieldData.yields.find(d => d.maturity === '3M')?.yield?.last?.toFixed(2) || 'N/A'}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  1M change: {yieldData.yields.find(d => d.maturity === '3M')?.yield?.chg_1m?.toFixed(1) || 'N/A'} bp
                </p>
              </div>

              {/* Medium-term yield */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Medium-term (5Y)</h3>
                <p className="text-2xl font-bold text-green-600">
                  {yieldData.yields.find(d => d.maturity === '5Y')?.yield?.last?.toFixed(2) || 'N/A'}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  1M change: {yieldData.yields.find(d => d.maturity === '5Y')?.yield?.chg_1m?.toFixed(1) || 'N/A'} bp
                </p>
              </div>

              {/* Long-term yield */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Long-term (10Y)</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {yieldData.yields.find(d => d.maturity === '10Y')?.yield?.last?.toFixed(2) || 'N/A'}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  1M change: {yieldData.yields.find(d => d.maturity === '10Y')?.yield?.chg_1m?.toFixed(1) || 'N/A'} bp
                </p>
              </div>
            </div>

            {/* Curve shape analysis */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Yield Curve Shape</h3>
              <p className="text-sm text-gray-600">
                {(() => {
                  const threeMonth = yieldData.yields.find(d => d.maturity === '3M')?.yield?.last;
                  const tenYear = yieldData.yields.find(d => d.maturity === '10Y')?.yield?.last;

                  if (threeMonth && tenYear) {
                    const spread = tenYear - threeMonth;
                    if (spread > 2) {
                      return `The yield curve is steep (normal) with a spread of ${spread.toFixed(1)}%, indicating expectations of economic expansion and/or higher future inflation.`;
                    } else if (spread < -0.5) {
                      return `The yield curve is inverted with a spread of ${spread.toFixed(1)}%, which historically has been a predictor of economic recession or monetary policy tightening.`;
                    } else {
                      return `The yield curve is relatively flat with a spread of ${spread.toFixed(1)}%, suggesting market uncertainty about future economic conditions.`;
                    }
                  }
                  return 'Insufficient data to analyze curve shape.';
                })()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TurkeyYieldCurvePage;
