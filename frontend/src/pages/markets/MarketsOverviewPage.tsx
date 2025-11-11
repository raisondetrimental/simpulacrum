import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getMarketsOverview, MarketsOverviewData } from '../../services/marketsService';

const MarketsOverviewPage: React.FC = () => {
  const [data, setData] = useState<MarketsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMarketsOverview();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load markets data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading markets overview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  // Get latest values for summary cards
  const latestUSYields = data.us_yields?.data?.[data.us_yields.data.length - 1];
  const previousUSYields = data.us_yields?.data?.[data.us_yields.data.length - 2];
  const latestCorporateYields = data.corporate_yields?.data?.[data.corporate_yields.data.length - 1];
  const latestPolicyRates = data.policy_rates?.data?.[data.policy_rates.data.length - 1];
  const latestFX = data.fx_rates?.data?.[data.fx_rates.data.length - 1];

  // Calculate changes
  const us10YChange = latestUSYields?.['10Y'] && previousUSYields?.['10Y']
    ? latestUSYields['10Y'] - previousUSYields['10Y']
    : null;

  // Prepare US Yield Curve data
  const yieldCurveData = latestUSYields
    ? ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'].map(maturity => ({
        maturity,
        yield: latestUSYields[maturity]
      })).filter(item => item.yield !== null && item.yield !== undefined)
    : [];

  // Prepare Corporate Yields Chart Data (last 90 days)
  const corporateYieldsChartData = data.corporate_yields?.data?.slice(-90) || [];

  // Prepare FX data for display
  const fxCurrencies: Array<{ code: string; name: string }> = [
    { code: 'VND', name: 'Vietnamese Dong' },
    { code: 'TRY', name: 'Turkish Lira' },
    { code: 'MNT', name: 'Mongolian Tugrik' },
    { code: 'UZS', name: 'Uzbek Som' },
    { code: 'AMD', name: 'Armenian Dram' },
    { code: 'GBP', name: 'British Pound' }
  ];

  // Calculate FX changes
  const calculateFXChange = (currency: string, daysBack: number) => {
    if (!data.fx_rates?.data || data.fx_rates.data.length === 0) return null;

    const latestIndex = data.fx_rates.data.length - 1;
    const current = data.fx_rates.data[latestIndex][currency];

    if (current === null || current === undefined) return null;

    const targetIndex = Math.max(0, latestIndex - daysBack);
    const previous = data.fx_rates.data[targetIndex][currency];

    if (previous === null || previous === undefined) return null;

    return ((current - previous) / previous) * 100;
  };

  // Prepare Policy Rates data
  const policyRatesData = [
    { country: 'United States', code: 'US', rate: latestPolicyRates?.US },
    { country: 'United Kingdom', code: 'GB', rate: latestPolicyRates?.GB },
    { country: 'South Korea', code: 'KR', rate: latestPolicyRates?.KR },
    { country: 'Australia', code: 'AU', rate: latestPolicyRates?.AU },
    { country: 'Türkiye', code: 'TR', rate: latestPolicyRates?.TR },
    { country: 'Eurozone', code: 'XM', rate: latestPolicyRates?.XM }
  ];

  // Country mapping for links
  const countryLinks: Record<string, string> = {
    'armenia': '/dashboard/armenia',
    'mongolia': '/dashboard/mongolia',
    'turkiye': '/dashboard/turkiye',
    'uzbekistan': '/dashboard/uzbekistan',
    'vietnam': '/dashboard/vietnam'
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Markets Overview</h1>
        <p className="text-lg text-gray-600">
          Comprehensive snapshot of global financial markets including US Treasuries, corporate credit, foreign exchange, policy rates, and emerging market fundamentals
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* US Treasury 10Y */}
        <div className="card bg-blue-50">
          <div className="text-sm font-medium text-gray-600 mb-1">US Treasury 10Y</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {latestUSYields?.['10Y']?.toFixed(2)}%
          </div>
          <div className={`text-sm font-medium ${us10YChange && us10YChange > 0 ? 'text-red-600' : us10YChange && us10YChange < 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {us10YChange ? `${us10YChange > 0 ? '+' : ''}${us10YChange.toFixed(2)} bps` : 'No change'}
          </div>
        </div>

        {/* US IG Corporate (BBB) */}
        <div className="card bg-green-50">
          <div className="text-sm font-medium text-gray-600 mb-1">US IG Corporate (BBB)</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {latestCorporateYields?.global_ig_bbb?.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500">Investment Grade</div>
        </div>

        {/* US High Yield */}
        <div className="card bg-yellow-50">
          <div className="text-sm font-medium text-gray-600 mb-1">US High Yield</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {latestCorporateYields?.global_hy?.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500">Below Investment Grade</div>
        </div>

        {/* Fed Policy Rate */}
        <div className="card bg-purple-50">
          <div className="text-sm font-medium text-gray-600 mb-1">Fed Policy Rate</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {latestPolicyRates?.US?.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500">Federal Reserve</div>
        </div>

        {/* GBP/USD */}
        <div className="card bg-indigo-50">
          <div className="text-sm font-medium text-gray-600 mb-1">GBP/USD</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {latestFX?.GBP?.toFixed(4)}
          </div>
          <div className={`text-sm font-medium ${calculateFXChange('GBP', 1) && calculateFXChange('GBP', 1)! > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {calculateFXChange('GBP', 1) ? `${calculateFXChange('GBP', 1)! > 0 ? '+' : ''}${calculateFXChange('GBP', 1)!.toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* US Treasury Yields Section */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">US Treasury Yield Curve</h2>
            <p className="text-sm text-gray-600">
              Latest government bond yields across all maturities
            </p>
          </div>
          <Link
            to="/dashboard/usa-historical-yields"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View Historical
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yieldCurveData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="maturity" />
            <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="yield" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} name="Yield" />
          </LineChart>
        </ResponsiveContainer>

        {/* Key Maturities Table */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {['2Y', '5Y', '10Y', '30Y'].map(maturity => (
            <div key={maturity} className="border border-gray-200 rounded p-3 bg-gray-50">
              <div className="text-sm text-gray-600 font-medium">{maturity}</div>
              <div className="text-xl font-bold text-gray-900">
                {latestUSYields?.[maturity]?.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* Curve Statistics */}
        {latestUSYields?.['10Y'] && latestUSYields?.['2Y'] && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">
              Yield Curve Slope (10Y-2Y):
              <span className={`ml-2 font-bold ${(latestUSYields['10Y'] - latestUSYields['2Y']) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(latestUSYields['10Y'] - latestUSYields['2Y']).toFixed(2)} bps
              </span>
              <span className="ml-2 text-gray-600">
                {(latestUSYields['10Y'] - latestUSYields['2Y']) > 0 ? '(Normal)' : '(Inverted)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Corporate Credit Markets */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Corporate Credit Markets</h2>
            <p className="text-sm text-gray-600">
              Effective yields for global and emerging market corporate bonds (90-day trend)
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/corporate-yields"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Yields
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/dashboard/corporate-spreads"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Spreads
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/dashboard/corporate"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Bonds
            </Link>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={corporateYieldsChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: any) => value !== null ? `${value.toFixed(2)}%` : 'N/A'}
            />
            <Legend />
            <Line type="monotone" dataKey="global_hy" stroke="#ef4444" strokeWidth={2} name="Global HY" dot={false} />
            <Line type="monotone" dataKey="global_ig_bbb" stroke="#3b82f6" strokeWidth={2} name="Global IG (BBB)" dot={false} />
            <Line type="monotone" dataKey="em_corporate" stroke="#10b981" strokeWidth={2} name="EM Corporate" dot={false} />
          </LineChart>
        </ResponsiveContainer>

        {/* Corporate Spreads Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded p-4 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium mb-1">IG vs HY Spread</div>
            <div className="text-2xl font-bold text-gray-900">
              {latestCorporateYields?.global_hy && latestCorporateYields?.global_ig_bbb
                ? (latestCorporateYields.global_hy - latestCorporateYields.global_ig_bbb).toFixed(2)
                : 'N/A'}
              {latestCorporateYields?.global_hy && latestCorporateYields?.global_ig_bbb && ' bps'}
            </div>
          </div>
          <div className="border border-gray-200 rounded p-4 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium mb-1">EM Corporate Yield</div>
            <div className="text-2xl font-bold text-gray-900">
              {latestCorporateYields?.em_corporate?.toFixed(2)}%
            </div>
          </div>
          <div className="border border-gray-200 rounded p-4 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium mb-1">EM Asia Yield</div>
            <div className="text-2xl font-bold text-gray-900">
              {latestCorporateYields?.em_asia?.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Foreign Exchange Markets */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Foreign Exchange Markets</h2>
            <p className="text-sm text-gray-600">
              Exchange rates vs USD with performance metrics
            </p>
          </div>
          <Link
            to="/dashboard/fx"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View Details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Daily</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fxCurrencies.map(({ code, name }) => {
                const dailyChange = calculateFXChange(code, 1);
                const weeklyChange = calculateFXChange(code, 7);
                const monthlyChange = calculateFXChange(code, 30);
                const currentRate = latestFX?.[code];

                return (
                  <tr key={code}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{code}/USD</div>
                      <div className="text-xs text-gray-500">{name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {currentRate !== null && currentRate !== undefined ? currentRate.toFixed(4) : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${dailyChange && dailyChange > 0 ? 'text-green-600' : dailyChange && dailyChange < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {dailyChange !== null ? `${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${weeklyChange && weeklyChange > 0 ? 'text-green-600' : weeklyChange && weeklyChange < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {weeklyChange !== null ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${monthlyChange && monthlyChange > 0 ? 'text-green-600' : monthlyChange && monthlyChange < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {monthlyChange !== null ? `${monthlyChange > 0 ? '+' : ''}${monthlyChange.toFixed(2)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Rates Dashboard */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Central Bank Policy Rates</h2>
            <p className="text-sm text-gray-600">
              Current policy interest rates from major central banks
            </p>
          </div>
          <Link
            to="/dashboard/central-banks"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View Trends
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policyRatesData.map((item) => (
            <div key={item.code} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-600 mb-1">{item.country}</div>
              <div className="text-3xl font-bold text-gray-900">
                {item.rate !== null && item.rate !== undefined ? `${item.rate.toFixed(2)}%` : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Focus: Emerging Markets */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Emerging Markets Focus</h2>
          <p className="text-sm text-gray-600">
            Key macroeconomic data for our focus emerging markets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.countries.map((country: any) => (
            <Link
              key={country.slug}
              to={countryLinks[country.slug]}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all bg-white"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">{country.name}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capital:</span>
                  <span className="font-medium text-gray-900">{country.capital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-medium text-gray-900">{country.region}</span>
                </div>
              </div>
              <div className="mt-3 text-blue-600 text-sm font-medium flex items-center">
                View Details
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Infrastructure & Development */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Infrastructure & Development</h2>
          <p className="text-sm text-gray-600">
            Analysis of infrastructure gaps and development metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/infra-gaps"
            className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Infrastructure Gaps</h3>
            <p className="text-sm text-gray-600 mb-3">Regional infrastructure development needs and investment opportunities</p>
            <div className="text-blue-600 text-sm font-medium">Explore →</div>
          </Link>

          <Link
            to="/dashboard/energy-metrics"
            className="border-2 border-gray-200 rounded-lg p-5 hover:border-green-400 hover:shadow-md transition-all bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Energy Metrics</h3>
            <p className="text-sm text-gray-600 mb-3">Energy consumption, production, and infrastructure analysis</p>
            <div className="text-green-600 text-sm font-medium">Explore →</div>
          </Link>

          <Link
            to="/dashboard/transit-friction"
            className="border-2 border-gray-200 rounded-lg p-5 hover:border-orange-400 hover:shadow-md transition-all bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transit Friction</h3>
            <p className="text-sm text-gray-600 mb-3">Transportation bottlenecks and logistics efficiency metrics</p>
            <div className="text-orange-600 text-sm font-medium">Explore →</div>
          </Link>

          <Link
            to="/dashboard/internet-coverage"
            className="border-2 border-gray-200 rounded-lg p-5 hover:border-purple-400 hover:shadow-md transition-all bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Internet Coverage</h3>
            <p className="text-sm text-gray-600 mb-3">Digital infrastructure penetration and connectivity analysis</p>
            <div className="text-purple-600 text-sm font-medium">Explore →</div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default MarketsOverviewPage;
