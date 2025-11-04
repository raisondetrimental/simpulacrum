import React from 'react';
import { CentralBankRatesData } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CentralBanksPageProps {
  data: CentralBankRatesData;
}

const CentralBanksPage: React.FC<CentralBanksPageProps> = ({ data }) => {
  // Prepare data for chart
  const chartData = Object.entries(data).map(([country, bankData]) => ({
    country: country.length > 15 ? country.substring(0, 15) + '...' : country,
    fullCountry: country,
    rate: bankData.policy_rate
  })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Central Bank Policy Rates</h1>
        <p className="mt-2 text-gray-600">Monetary policy rates set by central banks worldwide</p>
      </div>

      {/* Policy Rates Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data)
          .sort(([,a], [,b]) => b.policy_rate - a.policy_rate)
          .map(([country, bankData]) => (
          <div key={country} className="metric-card">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">{country}</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">
                {bankData.policy_rate.toFixed(2)}%
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  bankData.policy_rate >= 10 ? 'bg-red-100 text-red-800' :
                  bankData.policy_rate >= 5 ? 'bg-yellow-100 text-yellow-800' :
                  bankData.policy_rate >= 2 ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {bankData.policy_rate >= 10 ? 'Very High' :
                   bankData.policy_rate >= 5 ? 'High' :
                   bankData.policy_rate >= 2 ? 'Moderate' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Rates Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Central Bank Policy Rates Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="country"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis label={{ value: 'Policy Rate (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value: any, _name: string, props: any) => [
                `${Number(value).toFixed(2)}%`,
                `${props.payload.fullCountry}`
              ]}
            />
            <Bar dataKey="rate" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rate Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Very High (≥10%)', color: 'bg-red-100 text-red-800', threshold: 10 },
          { title: 'High (5-10%)', color: 'bg-yellow-100 text-yellow-800', min: 5, max: 10 },
          { title: 'Moderate (2-5%)', color: 'bg-blue-100 text-blue-800', min: 2, max: 5 },
          { title: 'Low (<2%)', color: 'bg-green-100 text-green-800', max: 2 }
        ].map((category) => {
          const countries = Object.entries(data).filter(([, bankData]) => {
            if (category.threshold) return bankData.policy_rate >= category.threshold;
            if (category.min && category.max) return bankData.policy_rate >= category.min && bankData.policy_rate < category.max;
            if (category.max) return bankData.policy_rate < category.max;
            return false;
          });

          return (
            <div key={category.title} className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{category.title}</h3>
              <div className="space-y-2">
                {countries.map(([country, bankData]) => (
                  <div key={country} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{country}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {bankData.policy_rate.toFixed(2)}%
                    </span>
                  </div>
                ))}
                {countries.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No countries in this range</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Central Bank Rates</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data)
                .sort(([,a], [,b]) => b.policy_rate - a.policy_rate)
                .map(([country, bankData], index) => (
                <tr key={country}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-lg font-semibold">{bankData.policy_rate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bankData.policy_rate >= 10 ? 'bg-red-100 text-red-800' :
                      bankData.policy_rate >= 5 ? 'bg-yellow-100 text-yellow-800' :
                      bankData.policy_rate >= 2 ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {bankData.policy_rate >= 10 ? 'Very High' :
                       bankData.policy_rate >= 5 ? 'High' :
                       bankData.policy_rate >= 2 ? 'Moderate' : 'Low'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{index + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const rates = Object.values(data).map(d => d.policy_rate);
            const highest = Math.max(...rates);
            const lowest = Math.min(...rates);
            const average = rates.reduce((a, b) => a + b, 0) / rates.length;
            const median = [...rates].sort((a, b) => a - b)[Math.floor(rates.length / 2)];

            return (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Highest Rate</p>
                  <p className="text-xl font-bold text-red-600">{highest.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lowest Rate</p>
                  <p className="text-xl font-bold text-green-600">{lowest.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Rate</p>
                  <p className="text-xl font-bold text-blue-600">{average.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Median Rate</p>
                  <p className="text-xl font-bold text-purple-600">{median.toFixed(2)}%</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CentralBanksPage;