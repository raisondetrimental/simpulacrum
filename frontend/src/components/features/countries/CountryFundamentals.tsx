/**
 * CountryFundamentals Component
 * Displays country fundamentals data with professional, compact design
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import type { CountryFundamentals } from '../../../types/country';
import { getCountryImages, getCapitalName } from '../../../utils/countryImages';
import { useScrollReveal } from '../../../hooks/useScrollReveal';

interface CountryFundamentalsProps {
  data: CountryFundamentals;
  fxData?: {
    rate: number;
    name: string;
    changes: {
      '1D': number | null;
      '1W': number | null;
      '1M': number | null;
    };
  } | null;
  currencyCode?: string;
}

const CountryFundamentals: React.FC<CountryFundamentalsProps> = ({ data, fxData, currencyCode }) => {
  const tradeBalance = data.exports.value - data.imports.value;
  const images = getCountryImages(data.slug);
  const capitalName = getCapitalName(data.slug);

  // Scroll reveal hooks for chart animations
  const { ref: ref1, isVisible: isVisible1 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref2, isVisible: isVisible2 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref3, isVisible: isVisible3 } = useScrollReveal({ threshold: 0.1 });

  // Format FX rate for display
  const formatFXRate = (rate: number): string => {
    // For currencies with large rates (like VND), show fewer decimal places
    const decimals = rate > 1000 ? 2 : rate > 10 ? 4 : 6;
    return rate.toFixed(decimals);
  };

  // Prepare chart data - split into historical and projected
  const historicalData = data.gdp_growth_history.filter(d => !d.is_projection);
  const projectedData = data.gdp_growth_history.filter(d => d.is_projection);
  // Include last historical point to connect the lines
  const projectedDataWithConnection = historicalData.length > 0
    ? [historicalData[historicalData.length - 1], ...projectedData]
    : projectedData;

  // Prepare industry pie chart data
  const totalIndustryPercentage = data.top_industries.reduce((sum, industry) => sum + industry.gdp_percentage, 0);
  const industryPieData = [
    ...data.top_industries.map((industry) => ({
      name: industry.name.split(';')[0].replace(/^[A-Z] – /, ''),
      value: industry.gdp_percentage,
      originalName: industry.name
    })),
    {
      name: 'Other',
      value: Math.max(0, 100 - totalIndustryPercentage),
      originalName: 'Other sectors'
    }
  ];

  // Prepare trade data for visualization
  const tradeData = [
    { name: 'Exports', value: data.exports.value, fill: '#10b981' },
    { name: 'Imports', value: data.imports.value, fill: '#ef4444' }
  ];

  // Colors for industry pie chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#a855f7', '#14b8a6', '#84cc16'];
  const GRAY = '#9ca3af';

  // Custom tooltip to avoid showing 2025 twice
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      // Only show the first value (avoid duplicates for 2025)
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '8px',
          fontSize: '12px'
        }}>
          <p style={{ margin: 0 }}>{`${data.payload.year}: ${data.value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const IndustryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '13px',
          maxWidth: '250px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: '4px 0 0 0' }}>{data.value.toFixed(1)}% of GDP</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Compact Stats Header */}
      <div className="grid grid-cols-5 border-b border-gray-200">
        <div className="px-5 py-4 border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-1">GDP ({data.gdp.year})</div>
          <div className="text-2xl font-bold text-gray-900">${data.gdp.value.toFixed(1)}B</div>
        </div>
        <div className="px-5 py-4 border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Growth ({data.gdp.year})</div>
          <div className={`text-2xl font-bold ${
            data.gdp_growth_rate.value >= 5 ? 'text-green-600' :
            data.gdp_growth_rate.value >= 3 ? 'text-blue-600' :
            data.gdp_growth_rate.value >= 0 ? 'text-gray-700' : 'text-red-600'
          }`}>
            {data.gdp_growth_rate.value >= 0 ? '+' : ''}{data.gdp_growth_rate.value.toFixed(1)}%
          </div>
        </div>
        <div className="px-5 py-4 border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Population</div>
          <div className="text-2xl font-bold text-gray-900">{data.population.value.toFixed(2)}M</div>
        </div>
        <div className="px-5 py-4 border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Inflation ({data.inflation_cpi.year})</div>
          <div className={`text-2xl font-bold ${
            data.inflation_cpi.value < 5 ? 'text-green-600' :
            data.inflation_cpi.value < 10 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {data.inflation_cpi.value.toFixed(1)}%
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="text-sm text-gray-500 mb-1">GDP / Capita</div>
          <div className="text-2xl font-bold text-gray-900">${(data.gdp_per_capita.value / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* FX Rate Section */}
      {fxData && currencyCode && (
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <span className="font-semibold">💱 Exchange Rate</span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">Live Data</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">{formatFXRate(fxData.rate)}</span>
                  <span className="text-lg text-gray-600">{currencyCode}/USD</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{fxData.name}</div>
              </div>
              <div className="flex gap-6">
                {fxData.changes['1D'] !== null && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">1D Change</div>
                    <div className={`text-base font-semibold ${
                      fxData.changes['1D']! > 0 ? 'text-green-600' :
                      fxData.changes['1D']! < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {fxData.changes['1D']! > 0 ? '+' : ''}{fxData.changes['1D']!.toFixed(2)}%
                    </div>
                  </div>
                )}
                {fxData.changes['1W'] !== null && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">1W Change</div>
                    <div className={`text-base font-semibold ${
                      fxData.changes['1W']! > 0 ? 'text-green-600' :
                      fxData.changes['1W']! < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {fxData.changes['1W']! > 0 ? '+' : ''}{fxData.changes['1W']!.toFixed(2)}%
                    </div>
                  </div>
                )}
                {fxData.changes['1M'] !== null && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">1M Change</div>
                    <div className={`text-base font-semibold ${
                      fxData.changes['1M']! > 0 ? 'text-green-600' :
                      fxData.changes['1M']! < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {fxData.changes['1M']! > 0 ? '+' : ''}{fxData.changes['1M']!.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-0 border-b border-gray-200">
        {/* GDP Growth Chart - 2 columns */}
        <div
          ref={ref1}
          className={`col-span-2 p-6 border-r border-gray-200 transition-all duration-700 ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">GDP Growth Rate (2021-2027)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 11 }} allowDuplicatedCategory={false} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line data={historicalData} type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              <Line data={projectedDataWithConnection} type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#93c5fd', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-sm text-gray-500 mt-2">Solid: Historical | Dashed: Projections</div>
        </div>

        {/* Location & Governance - 1 column */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Location & Governance</h3>

          {/* Map Image */}
          {images.map && (
            <div className="mb-4">
              <img
                src={images.map}
                alt={`Map of ${data.name}`}
                className="w-full max-w-xs max-h-48 mx-auto object-contain rounded-lg shadow-sm border border-gray-200"
              />
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Capital</span>
              <span className="font-semibold text-gray-900">{data.capital}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Region</span>
              <span className="font-semibold text-gray-900 text-right">{data.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Government</span>
              <span className="font-semibold text-gray-900 text-right">{data.government_type}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="text-gray-500 mb-2">International Organisation</div>
              <div className="flex flex-wrap gap-1.5">
                {data.international_organizations.map((org) => (
                  <span key={org} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capital City Photo - Full Width Slice */}
      {images.capital && (
        <div className="border-b border-gray-200 overflow-hidden relative">
          <div className="w-full h-32 md:h-40 overflow-hidden">
            <img
              src={images.capital}
              alt={`${capitalName}, capital of ${data.name}`}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: 'center 40%' }}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-3">
            <p className="text-sm text-white text-center font-semibold drop-shadow-lg">
              {capitalName}, Capital of {data.name}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Section: Trade & Industries */}
      <div className="grid grid-cols-2 gap-0">
        {/* Trade & Economy */}
        <div
          ref={ref2}
          className={`p-6 border-r border-gray-200 transition-all duration-700 ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Trade & Economy ({data.exports.year})</h3>

          {/* Trade Balance Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Trade Balance</div>
            <div className={`text-2xl font-bold ${tradeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tradeBalance >= 0 ? '+' : ''}${tradeBalance.toFixed(1)}B
            </div>
          </div>

          {/* Trade Bar Chart */}
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={tradeData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} width={55} />
              <Tooltip
                formatter={(value: any) => `$${value.toFixed(1)}B`}
                contentStyle={{ fontSize: '13px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {tradeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Industries */}
        <div
          ref={ref3}
          className={`p-6 transition-all duration-700 ${isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Top Industries by GDP</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={industryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ value }) => value > 5 ? `${value.toFixed(0)}%` : ''}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {industryPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === 'Other' ? GRAY : COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<IndustryTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value) => {
                  const maxLength = 25;
                  return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="text-sm text-gray-500 text-center py-3 bg-gray-50 border-t border-gray-200">
        Data Year: {data.data_year} • Sources: {data.sources.join(', ')}
      </div>
    </div>
  );
};

export default CountryFundamentals;
