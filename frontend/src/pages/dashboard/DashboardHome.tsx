import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardData } from '../../types/dashboard';

interface DashboardHomeProps {
  data: DashboardData;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ data }) => {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (data.metadata?.last_updated) {
      setLastUpdated(new Date(data.metadata.last_updated).toLocaleString());
    }
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Markets, Country Reports & Dashboards
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Real-Time Market Data • Country Analysis • Infrastructure Gap Analysis • Historical Trends
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last Updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Main Dashboard Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Markets Section */}
        <div className="card border-2 border-gray-200 hover:border-slate-400 hover:shadow-lg transition-all">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Markets</h2>
              <p className="text-gray-600 mb-4">
                Comprehensive financial market data including sovereign yields, corporate bonds, FX rates, policy rates, and credit ratings
              </p>
            </div>
          </div>

          {/* Market Data Preview */}
          <div className="space-y-4 mb-6">
            {/* US Treasuries Preview */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">US Treasuries</h3>
              <div className="grid grid-cols-4 gap-2">
                {['2Y', '5Y', '10Y', '30Y'].map(maturity => {
                  const yieldValue = data.sections.sovereign_yields.domestic_currency[maturity]?.['USA'];
                  return (
                    <div key={maturity} className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">{maturity}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {yieldValue ? `${yieldValue.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FX Rates Preview */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Major FX Rates</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.sections.fx_rates).slice(0, 4).map(([currency, currencyData]) => (
                  <div key={currency} className="bg-gray-50 rounded p-2 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">{currency}/USD</p>
                        <p className="text-sm font-bold text-gray-900">
                          {currencyData.rate ? currencyData.rate.toFixed(3) : 'N/A'}
                        </p>
                      </div>
                      {currencyData.changes['1D'] && (
                        <p className={`text-xs font-semibold ${
                          currencyData.changes['1D'] > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {currencyData.changes['1D'] > 0 ? '+' : ''}
                          {typeof currencyData.changes['1D'] === 'number'
                            ? `${(currencyData.changes['1D'] * 100).toFixed(1)}%`
                            : currencyData.changes['1D']}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Markets Links */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Explore Markets</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard/markets"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium"
              >
                Markets Overview
              </Link>
              <Link
                to="/dashboard/sovereign"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium"
              >
                Sovereign Yields
              </Link>
              <Link
                to="/dashboard/corporate"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium"
              >
                Corporate Bonds
              </Link>
              <Link
                to="/dashboard/fx"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium"
              >
                FX Markets
              </Link>
              <Link
                to="/dashboard/central-banks"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium"
              >
                Policy Rates
              </Link>
              <Link
                to="/dashboard/ratings"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium"
              >
                Credit Ratings
              </Link>
              <Link
                to="/dashboard/usa-historical-yields"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-300 rounded-md transition-colors text-center font-medium col-span-2"
              >
                USA Historical Yields
              </Link>
            </div>
          </div>
        </div>

        {/* Country Reports Section */}
        <div className="card border-2 border-gray-200 hover:border-slate-400 hover:shadow-lg transition-all">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Country Reports</h2>
              <p className="text-gray-600 mb-4">
                Comprehensive country-specific analysis and data for key markets
              </p>
            </div>
          </div>

          {/* Country Reports Overview */}
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Country Reports</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Armenia - Market Analysis</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Mongolia - Market Analysis</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Türkiye - Economic Overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Uzbekistan - Investment Opportunities</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Vietnam - Infrastructure Development</p>
                </div>
              </div>
            </div>
          </div>

          {/* Country Reports Links */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Explore Country Reports</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard/armenia"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-emerald-100 border border-gray-200 hover:border-emerald-300 rounded-md transition-colors text-center font-medium"
              >
                Armenia
              </Link>
              <Link
                to="/dashboard/mongolia"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-emerald-100 border border-gray-200 hover:border-emerald-300 rounded-md transition-colors text-center font-medium"
              >
                Mongolia
              </Link>
              <Link
                to="/dashboard/turkiye"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-emerald-100 border border-gray-200 hover:border-emerald-300 rounded-md transition-colors text-center font-medium"
              >
                Türkiye
              </Link>
              <Link
                to="/dashboard/uzbekistan"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-emerald-100 border border-gray-200 hover:border-emerald-300 rounded-md transition-colors text-center font-medium"
              >
                Uzbekistan
              </Link>
              <Link
                to="/dashboard/vietnam"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-emerald-100 border border-gray-200 hover:border-emerald-300 rounded-md transition-colors text-center font-medium"
              >
                Vietnam
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboards Section */}
        <div className="card border-2 border-gray-200 hover:border-slate-400 hover:shadow-lg transition-all">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-stone-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboards</h2>
              <p className="text-gray-600 mb-4">
                Infrastructure gap analysis, transit friction metrics, and internet coverage data
              </p>
            </div>
          </div>

          {/* Infrastructure Overview */}
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-br from-stone-50 to-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Infrastructure Intelligence Areas</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Infrastructure Gap Analysis</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Transit & Transportation Metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
                  <p className="text-sm text-gray-700">Digital Infrastructure Coverage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Links */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Explore Dashboards</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard/infra-gaps"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-stone-100 border border-gray-200 hover:border-stone-300 rounded-md transition-colors text-center font-medium"
              >
                Infra Gaps Overview
              </Link>
              <Link
                to="/dashboard/transit-friction"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-stone-100 border border-gray-200 hover:border-stone-300 rounded-md transition-colors text-center font-medium"
              >
                Transit Friction
              </Link>
              <Link
                to="/dashboard/internet-coverage"
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-stone-100 border border-gray-200 hover:border-stone-300 rounded-md transition-colors text-center font-medium"
              >
                Internet Coverage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="card bg-gradient-to-r from-slate-50 to-stone-50 border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Intelligence Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Real-Time Market Data</h3>
              <p className="text-sm text-gray-600">Live updates on sovereign yields, corporate spreads, FX rates, and policy rates</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-stone-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Dashboard Analytics</h3>
              <p className="text-sm text-gray-600">Comprehensive analysis of infrastructure gaps and project opportunities</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Historical Trends</h3>
              <p className="text-sm text-gray-600">Track historical data and identify market trends over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">
          Select a category above to begin exploring markets, country reports, and dashboards
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/dashboard/markets"
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            View Markets
          </Link>
          <Link
            to="/dashboard/armenia"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            View Country Reports
          </Link>
          <Link
            to="/dashboard/infra-gaps"
            className="px-6 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium"
          >
            View Dashboards
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
