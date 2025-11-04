import React from 'react';
import { CreditRatingsData } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CreditRatingsPageProps {
  data: CreditRatingsData;
}

const CreditRatingsPage: React.FC<CreditRatingsPageProps> = ({ data }) => {
  // Prepare data for benchmark yields chart - sorted by rating quality
  const ratingOrder = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC+', 'CCC', 'CCC-', 'CC', 'C', 'SD'];

  const benchmarkData = Object.entries(data)
    .filter(([, ratingData]) => ratingData.benchmark_yields['10Y'])
    .map(([rating, ratingData]) => ({
      rating,
      yield_10Y: ratingData.benchmark_yields['10Y']
    }))
    .sort((a, b) => {
      const aIndex = ratingOrder.indexOf(a.rating);
      const bIndex = ratingOrder.indexOf(b.rating);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Credit Ratings Analysis</h1>
        <p className="mt-2 text-gray-600">Comparable sovereign yields across credit rating spectrum</p>
      </div>

      {/* Rating Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {benchmarkData.map(({ rating, yield_10Y }) => (
          <div key={rating} className="metric-card">
            <div className="text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                rating.includes('AAA') || rating.includes('AA') ? 'bg-green-100 text-green-800' :
                rating.includes('A') ? 'bg-blue-100 text-blue-800' :
                rating.includes('BBB') ? 'bg-yellow-100 text-yellow-800' :
                rating.includes('BB') ? 'bg-orange-100 text-orange-800' :
                rating.includes('B') ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {rating}
              </span>
              <div className="mt-2">
                <p className="text-xs text-gray-500">10Y Yield</p>
                <p className="text-lg font-semibold text-gray-900">
                  {yield_10Y.toFixed(3)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark Yields Comparison */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">10Y Sovereign Yields by Credit Rating</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={benchmarkData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rating"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: any) => [`${Number(value).toFixed(3)}%`, '10Y Yield']} />
            <Bar dataKey="yield_10Y" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yield Progression Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Rating Yield Progression</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rating"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: any) => [`${Number(value).toFixed(3)}%`, '10Y Yield']} />
            <Line type="monotone" dataKey="yield_10Y" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-4">
          Shows yield progression across the credit rating spectrum from highest quality (AAA) to lowest (SD).
        </p>
      </div>

      {/* Detailed Ratings Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Rating Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  10Y Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {benchmarkData.map(({ rating, yield_10Y }, index) => (
                <tr key={rating}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rating.includes('AAA') || rating.includes('AA') ? 'bg-green-100 text-green-800' :
                      rating.includes('A') ? 'bg-blue-100 text-blue-800' :
                      rating.includes('BBB') ? 'bg-yellow-100 text-yellow-800' :
                      rating.includes('BB') ? 'bg-orange-100 text-orange-800' :
                      rating.includes('B') ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {yield_10Y.toFixed(3)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {rating.includes('AAA') || rating.includes('AA') || rating.includes('A') ? 'Investment Grade' :
                     rating.includes('BBB') ? 'Investment Grade (Lower)' :
                     rating.includes('BB') || rating.includes('B') ? 'Speculative Grade' :
                     'High Risk / Default'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const yields = benchmarkData.map(d => d.yield_10Y);
            const investmentGrade = benchmarkData.filter(d =>
              d.rating.includes('AAA') || d.rating.includes('AA') || d.rating.includes('A') || d.rating.includes('BBB')
            );
            const speculativeGrade = benchmarkData.filter(d =>
              d.rating.includes('BB') || d.rating.includes('B')
            );

            return (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lowest Yield</p>
                  <p className="text-xl font-bold text-green-600">
                    {yields.length ? Math.min(...yields).toFixed(3) : 'N/A'}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {benchmarkData.find(d => d.yield_10Y === Math.min(...yields))?.rating || ''}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Highest Yield</p>
                  <p className="text-xl font-bold text-red-600">
                    {yields.length ? Math.max(...yields).toFixed(3) : 'N/A'}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {benchmarkData.find(d => d.yield_10Y === Math.max(...yields))?.rating || ''}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Investment Grade</p>
                  <p className="text-xl font-bold text-blue-600">{investmentGrade.length}</p>
                  <p className="text-xs text-gray-500">AAA to BBB ratings</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Speculative Grade</p>
                  <p className="text-xl font-bold text-orange-600">{speculativeGrade.length}</p>
                  <p className="text-xs text-gray-500">BB and B ratings</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

    </div>
  );
};

export default CreditRatingsPage;