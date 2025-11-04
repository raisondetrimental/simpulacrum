import React from 'react';
import { SovereignYieldsData } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SovereignYieldsPageProps {
  data: SovereignYieldsData;
}

const SovereignYieldsPage: React.FC<SovereignYieldsPageProps> = ({ data }) => {
  // Prepare data for domestic currency chart
  const domesticChartData = Object.entries(data.domestic_currency).map(([maturity, countries]) => ({
    maturity,
    ...countries
  }));

  // Prepare data for yield curve visualization
  const yieldCurveData = ['1Y', '3Y', '5Y', '10Y'].map(maturity => {
    const rates: any = { maturity };
    Object.keys(data.domestic_currency[maturity] || {}).forEach(country => {
      rates[country] = data.domestic_currency[maturity]?.[country];
    });
    return rates;
  });

  // Prepare data for yield curve without Turkey
  const yieldCurveWithoutTurkey = ['1Y', '3Y', '5Y', '10Y'].map(maturity => {
    const rates: any = { maturity };
    Object.keys(data.domestic_currency[maturity] || {}).forEach(country => {
      if (country !== 'Türkiye') {
        rates[country] = data.domestic_currency[maturity]?.[country];
      }
    });
    return rates;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Sovereign Yields</h1>
        <p className="mt-2 text-gray-600">Government bond yields across countries and maturities</p>
      </div>

      {/* Yield Curves - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Curves - All Countries */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Yield Curves - All Countries</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={yieldCurveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="maturity" />
              <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any, name: string) => [`${Number(value).toFixed(3)}%`, name]} />
              <Line type="monotone" dataKey="USA" stroke="#3b82f6" strokeWidth={2} name="USA" />
              <Line type="monotone" dataKey="Türkiye" stroke="#ef4444" strokeWidth={2} name="Türkiye" />
              <Line type="monotone" dataKey="Vietnam" stroke="#10b981" strokeWidth={2} name="Vietnam" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Yield Curves Without Turkey */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Yield Curves - Excluding Turkey</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={yieldCurveWithoutTurkey}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="maturity" />
              <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any, name: string) => [`${Number(value).toFixed(3)}%`, name]} />
              <Line type="monotone" dataKey="USA" stroke="#3b82f6" strokeWidth={2} name="USA" />
              <Line type="monotone" dataKey="Vietnam" stroke="#10b981" strokeWidth={2} name="Vietnam" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Yield Data by Maturity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturity
                  </th>
                  {Object.keys(data.domestic_currency['1Y'] || {}).map(country => (
                    <th key={country} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {country}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.domestic_currency).map(([maturity, countries]) => (
                  <tr key={maturity}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {maturity}
                    </td>
                    {Object.entries(countries).map(([country, yield_val]) => (
                      <td key={country} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {yield_val ? `${Number(yield_val).toFixed(3)}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Domestic Currency Yields */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Domestic Currency Yields - Bar Chart</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={domesticChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="maturity" />
              <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any, name: string) => [`${Number(value).toFixed(3)}%`, name]} />
              <Bar dataKey="USA" fill="#3b82f6" name="USA" />
              <Bar dataKey="Türkiye" fill="#ef4444" name="Türkiye" />
              <Bar dataKey="Vietnam" fill="#10b981" name="Vietnam" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* USD Denominated Yields */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">USD Denominated Analysis</h2>

        {Object.entries(data.usd_denominated).map(([country, maturities]) => (
          <div key={country} className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{country}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(maturities).map(([maturity, data_point]) => (
                <div key={maturity} className="metric-card">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">{maturity}</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {data_point.rate ? `${Number(data_point.rate).toFixed(3)}%` : 'N/A'}
                    </p>
                    {data_point.changes && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(data_point.changes).map(([period, change]) => (
                          <p key={period} className="text-xs">
                            <span className="text-gray-500">{period}: </span>
                            <span className={change && change > 0 ? 'text-green-600' : 'text-red-600'}>
                              {change ? `${change > 0 ? '+' : ''}${change.toFixed(1)} bps` : 'N/A'}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SovereignYieldsPage;