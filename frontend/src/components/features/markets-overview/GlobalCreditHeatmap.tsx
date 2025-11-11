/**
 * Global Credit Heatmap Component
 * Displays emerging markets and global corporate yields/spreads
 */
import React from 'react';
import { CorporateYieldsData, CorporateSpreadsData } from '../../../services/marketsService';

interface GlobalCreditHeatmapProps {
  yieldsData: CorporateYieldsData | null;
  spreadsData: CorporateSpreadsData | null;
  loading?: boolean;
}

const GlobalCreditHeatmap: React.FC<GlobalCreditHeatmapProps> = ({ yieldsData, spreadsData, loading }) => {
  if (loading || !yieldsData || !spreadsData) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Global Corporate Yields & Spreads</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Get latest data
  const latestYields = yieldsData.data[yieldsData.data.length - 1];
  const latestSpreads = spreadsData.data[spreadsData.data.length - 1];

  // Calculate 1-month changes
  const monthAgoIndex = Math.max(0, yieldsData.data.length - 30);
  const monthAgoYields = yieldsData.data[monthAgoIndex];

  const categories = [
    {
      name: 'Global HY',
      yield: latestYields.global_hy,
      spread: latestSpreads.global_hy,
      change: latestYields.global_hy && monthAgoYields.global_hy
        ? ((latestYields.global_hy - monthAgoYields.global_hy) / monthAgoYields.global_hy) * 100
        : null
    },
    {
      name: 'Global IG (BBB)',
      yield: latestYields.global_ig_bbb,
      spread: latestSpreads.global_ig,
      change: latestYields.global_ig_bbb && monthAgoYields.global_ig_bbb
        ? ((latestYields.global_ig_bbb - monthAgoYields.global_ig_bbb) / monthAgoYields.global_ig_bbb) * 100
        : null
    },
    {
      name: 'EM Corporate',
      yield: latestYields.em_corporate,
      spread: latestSpreads.em_corporate,
      change: latestYields.em_corporate && monthAgoYields.em_corporate
        ? ((latestYields.em_corporate - monthAgoYields.em_corporate) / monthAgoYields.em_corporate) * 100
        : null
    },
    {
      name: 'EM Asia',
      yield: latestYields.em_asia,
      spread: latestSpreads.em_asia,
      change: latestYields.em_asia && monthAgoYields.em_asia
        ? ((latestYields.em_asia - monthAgoYields.em_asia) / monthAgoYields.em_asia) * 100
        : null
    },
    {
      name: 'EM EMEA',
      yield: latestYields.em_emea,
      spread: latestSpreads.em_emea,
      change: latestYields.em_emea && monthAgoYields.em_emea
        ? ((latestYields.em_emea - monthAgoYields.em_emea) / monthAgoYields.em_emea) * 100
        : null
    },
    {
      name: 'EM LatAm',
      yield: latestYields.em_latam,
      spread: latestSpreads.em_latam,
      change: latestYields.em_latam && monthAgoYields.em_latam
        ? ((latestYields.em_latam - monthAgoYields.em_latam) / monthAgoYields.em_latam) * 100
        : null
    }
  ];

  const getChangeColor = (change: number | null) => {
    if (change === null) return 'text-gray-500';
    if (change > 1) return 'text-red-600';
    if (change > 0) return 'text-orange-600';
    if (change < -1) return 'text-green-600';
    return 'text-green-500';
  };

  const getChangeBg = (change: number | null) => {
    if (change === null) return 'bg-gray-50';
    if (change > 1) return 'bg-red-50';
    if (change > 0) return 'bg-orange-50';
    if (change < -1) return 'bg-green-50';
    return 'bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Global Corporate Yields & Spreads</h2>
        <p className="text-sm text-gray-600">Emerging markets and developed markets credit</p>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Latest Yield</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">OAS Spread</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">1M Change</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-4 py-4 text-right text-sm">
                  <span className="font-bold text-gray-900">
                    {category.yield !== null ? `${category.yield.toFixed(2)}%` : 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-sm">
                  <span className="font-semibold text-gray-700">
                    {category.spread !== null ? `${category.spread.toFixed(0)} bps` : 'N/A'}
                  </span>
                </td>
                <td className={`px-4 py-4 text-right text-sm font-semibold ${getChangeColor(category.change)}`}>
                  {category.change !== null ? `${category.change >= 0 ? '+' : ''}${category.change.toFixed(2)}%` : 'N/A'}
                </td>
                <td className="px-4 py-4 text-center">
                  {category.change !== null && (
                    <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${getChangeBg(category.change)} ${getChangeColor(category.change)}`}>
                      {category.change >= 0 ? '↑' : '↓'}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regional Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Top Performer (1M)</div>
          <div className="text-sm font-bold text-gray-900">
            {(() => {
              const sorted = [...categories].sort((a, b) => (b.change || -Infinity) - (a.change || -Infinity));
              const best = sorted[0];
              return best.change !== null ? `${best.name}: ${best.change >= 0 ? '+' : ''}${best.change.toFixed(2)}%` : 'N/A';
            })()}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Average Spread</div>
          <div className="text-sm font-bold text-gray-900">
            {(() => {
              const validSpreads = categories.filter(c => c.spread !== null).map(c => c.spread!);
              if (validSpreads.length === 0) return 'N/A';
              const avg = validSpreads.reduce((sum, val) => sum + val, 0) / validSpreads.length;
              return `${avg.toFixed(0)} bps`;
            })()}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">EM vs DM Spread</div>
          <div className="text-sm font-bold text-gray-900">
            {(() => {
              const emAvg = latestSpreads.em_corporate;
              const dmAvg = latestSpreads.global_ig;
              if (emAvg !== null && dmAvg !== null) {
                return `+${(emAvg - dmAvg).toFixed(0)} bps`;
              }
              return 'N/A';
            })()}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Latest data: {latestYields.date} | Source: ICE BofA via FRED
      </div>
    </div>
  );
};

export default GlobalCreditHeatmap;
