/**
 * FX Dashboard Component
 * Displays foreign exchange rates for 6 key currencies
 */
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { FXRatesYahooData, CurrencyCode } from '../../../types/fxYahoo';

interface FXDashboardProps {
  data: FXRatesYahooData | null;
  loading?: boolean;
}

const FXDashboard: React.FC<FXDashboardProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Foreign Exchange Markets</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currencies: { code: CurrencyCode; name: string; color: string }[] = [
    { code: 'VND', name: 'Vietnamese Dong', color: '#3b82f6' },
    { code: 'TRY', name: 'Turkish Lira', color: '#ef4444' },
    { code: 'MNT', name: 'Mongolian Tugrik', color: '#8b5cf6' },
    { code: 'UZS', name: 'Uzbek Som', color: '#10b981' },
    { code: 'AMD', name: 'Armenian Dram', color: '#f59e0b' },
    { code: 'GBP', name: 'British Pound', color: '#06b6d4' }
  ];

  // Calculate latest rates and changes
  const currencyStats = currencies.map((currency) => {
    // Find latest non-null value
    let latestRate: number | null = null;
    let latestIndex = -1;

    for (let i = data.data.length - 1; i >= 0; i--) {
      if (data.data[i][currency.code] !== null) {
        latestRate = data.data[i][currency.code];
        latestIndex = i;
        break;
      }
    }

    if (latestRate === null || latestIndex === -1) {
      return {
        ...currency,
        rate: null,
        change1D: null,
        change1W: null,
        change1M: null,
        chartData: []
      };
    }

    // Calculate changes
    const findValueAtIndex = (daysBack: number): number | null => {
      const targetIndex = Math.max(0, latestIndex - daysBack);
      for (let i = targetIndex; i >= 0; i--) {
        if (data.data[i][currency.code] !== null) {
          return data.data[i][currency.code];
        }
      }
      return null;
    };

    const day1Value = findValueAtIndex(1);
    const week1Value = findValueAtIndex(7);
    const month1Value = findValueAtIndex(30);

    const calculateChange = (oldValue: number | null): number | null => {
      if (latestRate === null || oldValue === null) return null;
      return ((latestRate - oldValue) / oldValue) * 100;
    };

    // Prepare 30-day chart data
    const chartData = data.data.slice(-30).map((item) => ({
      value: item[currency.code]
    }));

    return {
      ...currency,
      rate: latestRate,
      change1D: calculateChange(day1Value),
      change1W: calculateChange(week1Value),
      change1M: calculateChange(month1Value),
      chartData
    };
  });

  // Find top movers
  const validChanges = currencyStats.filter(c => c.change1M !== null);
  const strongest = validChanges.length > 0
    ? validChanges.reduce((max, curr) => (curr.change1M! > max.change1M! ? curr : max))
    : null;
  const weakest = validChanges.length > 0
    ? validChanges.reduce((min, curr) => (curr.change1M! < min.change1M! ? curr : min))
    : null;

  const getChangeColor = (change: number | null) => {
    if (change === null) return 'text-gray-500';
    // Note: For FX rates (USD per currency), positive = currency weaker, negative = currency stronger
    return change >= 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Foreign Exchange Markets</h2>
        <p className="text-sm text-gray-600">USD rates for 6 key currencies (90-day history)</p>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {strongest && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Strongest Currency (1M)</div>
            <div className="text-sm font-bold text-gray-900">
              {strongest.name}: {strongest.change1M! >= 0 ? '+' : ''}{strongest.change1M!.toFixed(2)}%
            </div>
          </div>
        )}
        {weakest && (
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Weakest Currency (1M)</div>
            <div className="text-sm font-bold text-gray-900">
              {weakest.name}: {weakest.change1M! >= 0 ? '+' : ''}{weakest.change1M!.toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      {/* Currency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencyStats.map((currency) => (
          <div key={currency.code} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors">
            {/* Currency header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs font-medium text-gray-600">{currency.code}/USD</div>
                <div className="text-xs text-gray-500">{currency.name}</div>
              </div>
              <div style={{ width: '60px', height: '30px' }}>
                {currency.chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currency.chartData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={currency.color}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Latest rate */}
            <div className="mb-3">
              <div className="text-2xl font-bold text-gray-900">
                {currency.rate !== null ? currency.rate.toFixed(2) : 'N/A'}
              </div>
            </div>

            {/* Changes */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">1D:</span>
                <span className={`font-semibold ${getChangeColor(currency.change1D)}`}>
                  {currency.change1D !== null ? `${currency.change1D >= 0 ? '+' : ''}${currency.change1D.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1W:</span>
                <span className={`font-semibold ${getChangeColor(currency.change1W)}`}>
                  {currency.change1W !== null ? `${currency.change1W >= 0 ? '+' : ''}${currency.change1W.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1M:</span>
                <span className={`font-semibold ${getChangeColor(currency.change1M)}`}>
                  {currency.change1M !== null ? `${currency.change1M >= 0 ? '+' : ''}${currency.change1M.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Latest data: {data.data[data.data.length - 1]?.date} | Source: Yahoo Finance + ExchangeRate API
      </div>
    </div>
  );
};

export default FXDashboard;
