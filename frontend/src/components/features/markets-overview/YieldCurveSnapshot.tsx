/**
 * Yield Curve Snapshot Component
 * Displays US Treasury yield curve with shape analysis
 */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoricalYield } from '../../../services/marketsService';

interface YieldCurveSnapshotProps {
  data: HistoricalYield | null;
  loading?: boolean;
}

const YieldCurveSnapshot: React.FC<YieldCurveSnapshotProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">US Treasury Yield Curve</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Get latest yield curve data
  const maturities = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'];
  const latestIndex = data.dates.length - 1;

  // Prepare chart data
  const chartData = maturities.map((maturity) => {
    const yieldValue = data.maturities[maturity]?.[latestIndex];
    return {
      maturity: maturity,
      yield: yieldValue !== null ? yieldValue : undefined
    };
  });

  // Calculate curve shape
  const shortRate = data.maturities['3M']?.[latestIndex];
  const longRate = data.maturities['10Y']?.[latestIndex];

  let curveShape = 'Normal';
  let curveColor = 'text-green-600';

  if (shortRate !== null && longRate !== null) {
    const spread = longRate - shortRate;
    if (spread < -0.1) {
      curveShape = 'Inverted';
      curveColor = 'text-red-600';
    } else if (spread < 0.3) {
      curveShape = 'Flat';
      curveColor = 'text-yellow-600';
    }
  }

  // Get key rates for display
  const key10Y = data.maturities['10Y']?.[latestIndex];
  const key2Y = data.maturities['2Y']?.[latestIndex];
  const key30Y = data.maturities['30Y']?.[latestIndex];

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">US Treasury Yield Curve</h2>
          <p className="text-sm text-gray-600">The benchmark for global risk-free rates</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Curve Shape</div>
          <div className={`text-lg font-bold ${curveColor}`}>{curveShape}</div>
        </div>
      </div>

      {/* Key Rates */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">2Y Treasury</div>
          <div className="text-2xl font-bold text-gray-900">{key2Y?.toFixed(2) || 'N/A'}%</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">10Y Treasury</div>
          <div className="text-2xl font-bold text-gray-900">{key10Y?.toFixed(2) || 'N/A'}%</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">30Y Treasury</div>
          <div className="text-2xl font-bold text-gray-900">{key30Y?.toFixed(2) || 'N/A'}%</div>
        </div>
      </div>

      {/* Yield Curve Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="maturity"
            tick={{ fontSize: 12 }}
            label={{ value: 'Maturity', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value: any) => [`${value?.toFixed(2)}%`, 'Yield']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="#1e40af"
            strokeWidth={3}
            dot={{ fill: '#1e40af', r: 5 }}
            name="US Treasury Yield"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Data Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {maturities.map((maturity) => (
                <th key={maturity} className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  {maturity}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              {maturities.map((maturity) => {
                const value = data.maturities[maturity]?.[latestIndex];
                return (
                  <td key={maturity} className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                    {value !== null ? `${value.toFixed(2)}%` : 'N/A'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Latest data: {data.dates[latestIndex]} | Source: Federal Reserve (FRED)
      </div>
    </div>
  );
};

export default YieldCurveSnapshot;
