import React from 'react';
import { CorporateYieldsData } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CorporateBondsPageProps {
  data: CorporateYieldsData;
}

const CorporateBondsPage: React.FC<CorporateBondsPageProps> = ({ data }) => {
  // Prepare data for charts
  const chartData = Object.entries(data).map(([rating, ratingData]) => ({
    rating: rating.replace('High Yield', 'HY'),
    yield: Number(ratingData.effective_yield.toFixed(3)),
    change_1D: ratingData.changes['1D'],
    change_1W: ratingData.changes['1W'],
    change_1M: ratingData.changes['1M']
  }));

  // Sort by typical credit rating order
  const ratingOrder = ['AAA', 'AA', 'A', 'BBB', 'BB', 'HY'];
  const sortedData = chartData.sort((a, b) => {
    const aIndex = ratingOrder.indexOf(a.rating);
    const bIndex = ratingOrder.indexOf(b.rating);
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Corporate Bonds</h1>
        <p className="mt-2 text-gray-600">US Corporate bond yields by credit rating</p>
      </div>

      {/* Corporate Yields Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Yields by Credit Rating</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: any) => [`${value}%`, 'Yield']} />
            <Bar dataKey="yield" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yield Spread Analysis */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Spread Analysis</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: any) => [`${value}%`, 'Yield']} />
            <Line type="monotone" dataKey="yield" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-4">
          Shows the yield progression across credit ratings, illustrating credit risk premiums.
        </p>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Corporate Yields</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1D Change (bps)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1W Change (bps)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1M Change (bps)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data).map(([rating, ratingData]) => (
                <tr key={rating}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ['AAA', 'AA', 'A'].includes(rating) ? 'bg-green-100 text-green-800' :
                      rating === 'BBB' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ratingData.effective_yield.toFixed(3)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    ratingData.changes['1D'] && ratingData.changes['1D'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ratingData.changes['1D'] ?
                      `${ratingData.changes['1D'] > 0 ? '+' : ''}${ratingData.changes['1D']}` : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    ratingData.changes['1W'] && ratingData.changes['1W'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ratingData.changes['1W'] ?
                      `${ratingData.changes['1W'] > 0 ? '+' : ''}${ratingData.changes['1W']}` : 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    ratingData.changes['1M'] && ratingData.changes['1M'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ratingData.changes['1M'] ?
                      `${ratingData.changes['1M'] > 0 ? '+' : ''}${ratingData.changes['1M']}` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Grade</h3>
          <div className="space-y-3">
            {Object.entries(data).filter(([rating]) => ['AAA', 'AA', 'A', 'BBB'].includes(rating)).map(([rating, ratingData]) => (
              <div key={rating} className="flex justify-between">
                <span className="text-gray-600">{rating}</span>
                <span className="font-semibold text-gray-900">{ratingData.effective_yield.toFixed(3)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">High Yield</h3>
          <div className="space-y-3">
            {Object.entries(data).filter(([rating]) => ['BB', 'High Yield'].includes(rating)).map(([rating, ratingData]) => (
              <div key={rating} className="flex justify-between">
                <span className="text-gray-600">{rating}</span>
                <span className="font-semibold text-gray-900">{ratingData.effective_yield.toFixed(3)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Spreads</h3>
          <div className="space-y-3">
            {(() => {
              const aaa = data.AAA?.effective_yield || 0;
              const bbb = data.BBB?.effective_yield || 0;
              const hy = data['High Yield']?.effective_yield || 0;
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AAA-BBB Spread</span>
                    <span className="font-semibold text-gray-900">{((bbb - aaa) * 100).toFixed(0)} bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BBB-HY Spread</span>
                    <span className="font-semibold text-gray-900">{((hy - bbb) * 100).toFixed(0)} bps</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateBondsPage;