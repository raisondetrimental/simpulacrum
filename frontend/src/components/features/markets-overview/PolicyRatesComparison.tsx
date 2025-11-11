/**
 * Policy Rates Comparison Component
 * Displays central bank policy rates with timeline
 */
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { PolicyRatesData } from '../../../services/marketsService';

interface PolicyRatesComparisonProps {
  data: PolicyRatesData | null;
  loading?: boolean;
}

const PolicyRatesComparison: React.FC<PolicyRatesComparisonProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Central Bank Policy Rates</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Get latest rates
  const latest = data.data[data.data.length - 1];

  const countries = [
    { code: 'US', name: 'USA', fullName: 'Federal Funds Rate', rate: latest.US, color: '#3b82f6' },
    { code: 'GB', name: 'UK', fullName: 'Bank Rate', rate: latest.GB, color: '#10b981' },
    { code: 'XM', name: 'Euro Area', fullName: 'Deposit Facility', rate: latest.XM, color: '#8b5cf6' },
    { code: 'AU', name: 'Australia', fullName: 'Cash Rate', rate: latest.AU, color: '#f59e0b' },
    { code: 'KR', name: 'South Korea', fullName: 'Base Rate', rate: latest.KR, color: '#06b6d4' },
    { code: 'TR', name: 'Türkiye', fullName: 'Policy Rate', rate: latest.TR, color: '#ef4444' }
  ];

  // Sort by rate for bar chart
  const sortedCountries = [...countries].sort((a, b) => (b.rate || 0) - (a.rate || 0));

  // Prepare bar chart data
  const barData = sortedCountries.map((country) => ({
    name: country.name,
    rate: country.rate
  }));

  // Prepare 6-month timeline data (last 180 days)
  const timelineData = data.data.slice(-180).filter((_, index) => index % 7 === 0).map((item) => ({
    date: item.date,
    US: item.US,
    GB: item.GB,
    XM: item.XM,
    AU: item.AU,
    KR: item.KR,
    TR: item.TR
  }));

  // Calculate monetary policy stance
  const tightening = countries.filter((c) => {
    if (c.rate === null) return false;
    const sixMonthsAgo = data.data[Math.max(0, data.data.length - 180)];
    const oldRate = sixMonthsAgo[c.code as keyof typeof sixMonthsAgo];
    return oldRate !== null && c.rate > oldRate;
  });

  const easing = countries.filter((c) => {
    if (c.rate === null) return false;
    const sixMonthsAgo = data.data[Math.max(0, data.data.length - 180)];
    const oldRate = sixMonthsAgo[c.code as keyof typeof sixMonthsAgo];
    return oldRate !== null && c.rate < oldRate;
  });

  const onHold = countries.length - tightening.length - easing.length;

  // Calculate rate divergence
  const validRates = countries.filter(c => c.rate !== null).map(c => c.rate!);
  const maxRate = validRates.length > 0 ? Math.max(...validRates) : null;
  const minRate = validRates.length > 0 ? Math.min(...validRates) : null;
  const divergence = maxRate !== null && minRate !== null ? maxRate - minRate : null;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Central Bank Policy Rates</h2>
        <p className="text-sm text-gray-600">Global monetary policy stance</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Rate Divergence</div>
          <div className="text-2xl font-bold text-gray-900">
            {divergence !== null ? `${divergence.toFixed(2)}%` : 'N/A'}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Tightening</div>
          <div className="text-2xl font-bold text-green-700">{tightening.length}</div>
          <div className="text-xs text-gray-600">banks raising rates</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Easing</div>
          <div className="text-2xl font-bold text-red-700">{easing.length}</div>
          <div className="text-xs text-gray-600">banks cutting rates</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">On Hold</div>
          <div className="text-2xl font-bold text-gray-700">{onHold}</div>
          <div className="text-xs text-gray-600">banks unchanged</div>
        </div>
      </div>

      {/* Current Rates Bar Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Rates (sorted)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} label={{ value: 'Rate (%)', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(value: any) => [`${value?.toFixed(2)}%`, 'Policy Rate']} />
            <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 6-Month Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">6-Month Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
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
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: any) => [`${value?.toFixed(2)}%`, '']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="US" stroke="#3b82f6" strokeWidth={2} dot={false} name="USA" />
            <Line type="monotone" dataKey="GB" stroke="#10b981" strokeWidth={2} dot={false} name="UK" />
            <Line type="monotone" dataKey="XM" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Euro" />
            <Line type="monotone" dataKey="AU" stroke="#f59e0b" strokeWidth={2} dot={false} name="Australia" />
            <Line type="monotone" dataKey="KR" stroke="#06b6d4" strokeWidth={2} dot={false} name="S. Korea" />
            {/* Hide Türkiye by default due to scale difference */}
            <Line type="monotone" dataKey="TR" stroke="#ef4444" strokeWidth={2} dot={false} name="Türkiye" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Rates List */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {countries.map((country) => (
          <div key={country.code} className="border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">{country.name}</div>
            <div className="text-xl font-bold text-gray-900">
              {country.rate !== null ? `${country.rate.toFixed(2)}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">{country.fullName}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Latest data: {latest.date} | Source: BIS SDMX
      </div>
    </div>
  );
};

export default PolicyRatesComparison;
