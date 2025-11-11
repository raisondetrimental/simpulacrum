/**
 * Corporate Credit Overview Component
 * Displays investment grade and high yield credit markets
 */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CorporateBondsYield } from '../../../services/marketsService';

interface CorporateCreditOverviewProps {
  data: CorporateBondsYield | null;
  loading?: boolean;
}

const CorporateCreditOverview: React.FC<CorporateCreditOverviewProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Corporate Credit Markets</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Get latest values
  const latest = data.data[data.data.length - 1];

  // Investment Grade yields
  const igYields = [
    { rating: 'AAA', yield: latest.aaa, color: 'bg-green-500' },
    { rating: 'AA', yield: latest.aa, color: 'bg-green-400' },
    { rating: 'A', yield: latest.a, color: 'bg-yellow-400' },
    { rating: 'BBB', yield: latest.bbb, color: 'bg-orange-400' }
  ];

  // High Yield
  const hyYields = [
    { rating: 'BB', yield: latest.bb, color: 'bg-red-400' },
    { rating: 'High Yield', yield: latest.high_yield, color: 'bg-red-600' }
  ];

  // Prepare chart data (last 30 days)
  const chartData = data.data.slice(-30).map((item) => ({
    date: item.date,
    AAA: item.aaa,
    BBB: item.bbb,
    'High Yield': item.high_yield
  }));

  // Calculate spreads
  const igHySpread = latest.high_yield && latest.bbb ? (latest.high_yield - latest.bbb) * 100 : null;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Corporate Credit Markets</h2>
        <p className="text-sm text-gray-600">Investment grade and high yield overview</p>
      </div>

      {/* Key Spreads */}
      {igHySpread && (
        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">IG-HY Spread</div>
              <div className="text-2xl font-bold text-gray-900">{igHySpread.toFixed(0)} bps</div>
            </div>
            <div className="text-sm text-gray-600">
              High yield premium over investment grade
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Investment Grade */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Grade</h3>
          <div className="space-y-3">
            {igYields.map((item) => (
              <div key={item.rating} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                  <span className="font-medium text-gray-900">{item.rating}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {item.yield !== null ? `${item.yield.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* High Yield */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">High Yield</h3>
          <div className="space-y-3">
            {hyYields.map((item) => (
              <div key={item.rating} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                  <span className="font-medium text-gray-900">{item.rating}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {item.yield !== null ? `${item.yield.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-day trend chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">30-Day Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value: any) => [`${value?.toFixed(2)}%`, '']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="AAA" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="BBB" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="High Yield" stroke="#dc2626" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Latest data: {latest.date} | Source: ICE BofA via FRED
      </div>
    </div>
  );
};

export default CorporateCreditOverview;
