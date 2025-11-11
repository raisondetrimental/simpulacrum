import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { DashboardData } from '../../types/dashboard';

interface MarketsOverviewPageProps {
  data: DashboardData;
}

const MarketsOverviewPage: React.FC<MarketsOverviewPageProps> = ({ data }) => {
  // Prepare yield curve comparison data (USA vs Vietnam)
  const yieldCurveData = ['1Y', '3Y', '5Y', '10Y'].map(maturity => ({
    maturity,
    USA: data.sections.sovereign_yields.domestic_currency[maturity]?.['USA'] || null,
    Vietnam: data.sections.sovereign_yields.domestic_currency[maturity]?.['Vietnam'] || null,
  }));

  // FX rates data
  const fxRates = data.sections.fx_rates;

  // Market sections for navigation
  const marketSections = [
    {
      name: 'Sovereign Yields',
      path: '/sovereign',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      description: 'Government bond yields across maturities for major economies, including both domestic currency and USD-denominated debt.',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400'
    },
    {
      name: 'Corporate Bonds',
      path: '/corporate',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      description: 'USA corporate bond yields, from AAA investment grade to high yield debt.',
      color: 'bg-green-50 border-green-200 hover:border-green-400'
    },
    {
      name: 'FX Markets',
      path: '/fx',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Foreign exchange rates for major currency pairs with daily and weekly changes.',
      color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
    },
    {
      name: 'Policy Rates',
      path: '/central-banks',
      icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
      description: 'Central bank policy rates for major economies, including recent changes and trends.',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400'
    },
    {
      name: 'Tools',
      path: '/tools',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      description: 'Excel data refresh controls and PDF report generation tools.',
      color: 'bg-gray-50 border-gray-200 hover:border-gray-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Market Intelligence Overview</h1>
        <p className="text-lg text-gray-600">
          Comprehensive view of global financial markets, including sovereign yields, corporate bonds, foreign exchange, and central bank policy rates.
        </p>
      </div>

      {/* Charts Section - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Curve Comparison */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sovereign Yield Curves</h2>
          <p className="text-sm text-gray-600 mb-6">
            Comparison of USA and Vietnam government bond yields
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yieldCurveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="maturity" />
              <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="USA" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Vietnam" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FX Data Section */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Foreign Exchange Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(fxRates).map(([pair, data]) => (
            <div key={pair} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-600 mb-1">{pair}</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{data.rate?.toFixed(4) || 'N/A'}</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily:</span>
                <span className={data.daily_change && data.daily_change > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {data.daily_change ? `${data.daily_change > 0 ? '+' : ''}${data.daily_change.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weekly:</span>
                <span className={data.weekly_change && data.weekly_change > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {data.weekly_change ? `${data.weekly_change > 0 ? '+' : ''}${data.weekly_change.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Explore Market Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className={`border-2 rounded-lg p-6 transition-all ${section.color}`}
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.name}</h3>
                  <p className="text-sm text-gray-700">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-medium text-sm">
                View Details
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketsOverviewPage;
