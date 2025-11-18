/**
 * Markets Weekly Report Page
 * Print-friendly page with all markets data and charts
 * Users can print to PDF using Ctrl+P or browser's Print function
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  getMarketsOverview,
  getCorporateBondsYields,
  getCorporateSpreads,
  getCorporateYields,
  getPolicyRates
} from '../../services/marketsService';

const MarketsWeeklyReportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load all market data in parallel
      const [overview, corpBonds, corpSpreads, corpYields, policyRates] = await Promise.all([
        getMarketsOverview(),
        getCorporateBondsYields(),
        getCorporateSpreads(),
        getCorporateYields(),
        getPolicyRates()
      ]);

      setData({
        overview,
        corpBonds,
        corpSpreads,
        corpYields,
        policyRates,
        fxRates: overview.fx_rates  // Use FX data from overview
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load report data</p>
      </div>
    );
  }

  // Extract latest US yields
  const latestUSYields = data.overview?.us_yields?.data?.[data.overview.us_yields.data.length - 1];

  // Prepare yield curve data
  const yieldCurveData = latestUSYields ? [
    { maturity: '1M', yield: latestUSYields['1_month'] },
    { maturity: '3M', yield: latestUSYields['3_month'] },
    { maturity: '6M', yield: latestUSYields['6_month'] },
    { maturity: '1Y', yield: latestUSYields['1_year'] },
    { maturity: '2Y', yield: latestUSYields['2_year'] },
    { maturity: '3Y', yield: latestUSYields['3_year'] },
    { maturity: '5Y', yield: latestUSYields['5_year'] },
    { maturity: '7Y', yield: latestUSYields['7_year'] },
    { maturity: '10Y', yield: latestUSYields['10_year'] },
    { maturity: '20Y', yield: latestUSYields['20_year'] },
    { maturity: '30Y', yield: latestUSYields['30_year'] },
  ] : [];

  // Filter data to last 90 days
  const filterLast90Days = (dataArray: any[]) => {
    if (!dataArray || dataArray.length === 0) return [];
    return dataArray.slice(-90);
  };

  const usYieldsData = filterLast90Days(data.overview?.us_yields?.data || []);
  const corpBondsData = filterLast90Days(data.corpBonds?.data || []);
  const corpSpreadsData = filterLast90Days(data.corpSpreads?.data || []);
  const corpYieldsData = filterLast90Days(data.corpYields?.data || []);
  const policyRatesData = filterLast90Days(data.policyRates?.data || []);
  const fxRatesData = filterLast90Days(data.fxRates?.data || []);

  // Get latest values for summary cards
  const latestPolicyRates = policyRatesData[policyRatesData.length - 1];
  const latestFXRates = fxRatesData[fxRatesData.length - 1];

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10pt;
            line-height: 1.3;
          }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          .page-break-avoid { page-break-inside: avoid; }
          h1 { font-size: 18pt; margin: 8pt 0; }
          h2 { font-size: 14pt; margin: 6pt 0 4pt 0; }
          h3 { font-size: 12pt; margin: 4pt 0 2pt 0; }
          table { font-size: 8pt; }
          .chart-container { height: 250px !important; }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }

        @media screen {
          .print-content {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-gray-100 p-4 border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Markets Weekly Report</h2>
            <p className="text-sm text-gray-600">Ready to print - use Ctrl+P or File → Print → Save as PDF</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Back to Markets
            </button>
          </div>
        </div>
      </div>

      <div className="print-content">
        {/* Cover Page */}
        <div className="page-break">
          <div style={{ paddingTop: '2in', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24pt', fontFamily: 'Times New Roman, serif', marginBottom: '20px' }}>
              Markets Weekly Report
            </h1>
            <p style={{ fontSize: '14pt', marginBottom: '10px' }}>
              Generated: {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            <p style={{ fontSize: '12pt', color: '#666' }}>
              Comprehensive analysis of fixed income, FX, and policy rates markets
            </p>
          </div>
        </div>

        {/* US Treasury Yields Section */}
        <div className="page-break-avoid">
          <h2 style={{ fontFamily: 'Times New Roman, serif', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
            US Treasury Yields
          </h2>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '10px' }}>
            Source: FRED | Last Updated: {new Date(data.overview?.us_yields?.meta?.generated_utc || '').toLocaleString()}
          </p>

          <h3>Current Yield Curve</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="maturity" style={{ fontSize: '10px' }} />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="yield" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h3>90-Day Historical Trends (Key Maturities)</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usYieldsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="2_year" name="2Y" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="10_year" name="10Y" stroke="#16A34A" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="30_year" name="30Y" stroke="#DC2626" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-break"></div>

        {/* Corporate Bonds Section */}
        <div className="page-break-avoid">
          <h2 style={{ fontFamily: 'Times New Roman, serif', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
            Corporate Bonds
          </h2>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '10px' }}>
            Source: FRED | Last Updated: {new Date(data.corpBonds?.meta?.generated_utc || '').toLocaleString()}
          </p>

          <h3>90-Day Trends by Credit Rating</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={corpBondsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="aaa" name="AAA" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="a" name="A" stroke="#16A34A" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="bbb" name="BBB" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="high_yield" name="HY" stroke="#DC2626" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-break"></div>

        {/* Corporate Spreads Section */}
        <div className="page-break-avoid">
          <h2 style={{ fontFamily: 'Times New Roman, serif', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
            Corporate Spreads (OAS)
          </h2>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '10px' }}>
            Source: FRED | Last Updated: {new Date(data.corpSpreads?.meta?.generated_utc || '').toLocaleString()}
          </p>

          <h3>90-Day Spread Trends</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={corpSpreadsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="global_hy" name="Global HY" stroke="#DC2626" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="global_ig" name="Global IG" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="em_corporate" name="EM Corp" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="em_asia" name="EM Asia" stroke="#14B8A6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-break"></div>

        {/* Corporate Yields Section */}
        <div className="page-break-avoid">
          <h2 style={{ fontFamily: 'Times New Roman, serif', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
            Corporate Yields (Effective)
          </h2>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '10px' }}>
            Source: FRED | Last Updated: {new Date(data.corpYields?.meta?.generated_utc || '').toLocaleString()}
          </p>

          <h3>90-Day Yield Trends</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={corpYieldsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="global_hy" name="Global HY" stroke="#DC2626" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="global_ig_bbb" name="Global IG (BBB)" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="em_corporate" name="EM Corp" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-break"></div>

        {/* Policy Rates Section */}
        <div className="page-break-avoid">
          <h2 style={{ fontFamily: 'Times New Roman, serif', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
            Central Bank Policy Rates
          </h2>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '10px' }}>
            Source: BIS SDMX | Last Updated: {new Date(data.policyRates?.meta?.generated_utc || '').toLocaleString()}
          </p>

          <h3>Current Policy Rates by Country</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { country: 'USA', rate: latestPolicyRates?.US },
                  { country: 'UK', rate: latestPolicyRates?.GB },
                  { country: 'S. Korea', rate: latestPolicyRates?.KR },
                  { country: 'Australia', rate: latestPolicyRates?.AU },
                  { country: 'Turkey', rate: latestPolicyRates?.TR },
                  { country: 'Euro Area', rate: latestPolicyRates?.XM }
                ].sort((a, b) => (b.rate || 0) - (a.rate || 0))}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" style={{ fontSize: '10px' }} />
                <YAxis dataKey="country" type="category" width={80} style={{ fontSize: '10px' }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3>90-Day Policy Rate Trends</h3>
          <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={policyRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '9px' }} />
                <Line type="monotone" dataKey="US" name="USA" stroke="#2563EB" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="GB" name="UK" stroke="#16A34A" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="KR" name="S. Korea" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="AU" name="Australia" stroke="#DC2626" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="TR" name="Turkey" stroke="#9333EA" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="XM" name="Euro" stroke="#06B6D4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-break"></div>

        {/* FX Markets Section */}
        <div className="page-break-avoid">
          <h2 style={{ fontFamily: 'Times New Roman, serif', borderBottom: '2px solid #000', paddingBottom: '4px' }}>
            Foreign Exchange Markets
          </h2>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '10px' }}>
            Source: Yahoo Finance | Last Updated: {new Date(data.fxRates?.metadata?.last_updated || '').toLocaleString()}
          </p>

          <h3>90-Day Currency Trends vs. USD</h3>

          {/* VND */}
          <div className="chart-container" style={{ height: '200px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '11pt', marginBottom: '5px' }}>VND - Vietnamese Dong</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="VND" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* TRY */}
          <div className="chart-container" style={{ height: '200px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '11pt', marginBottom: '5px' }}>TRY - Turkish Lira</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="TRY" stroke="#16A34A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-break"></div>

        <div className="page-break-avoid">
          {/* MNT */}
          <div className="chart-container" style={{ height: '200px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '11pt', marginBottom: '5px' }}>MNT - Mongolian Tugrik</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="MNT" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* UZS */}
          <div className="chart-container" style={{ height: '200px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '11pt', marginBottom: '5px' }}>UZS - Uzbek Som</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="UZS" stroke="#DC2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AMD */}
          <div className="chart-container" style={{ height: '200px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '11pt', marginBottom: '5px' }}>AMD - Armenian Dram</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="AMD" stroke="#9333EA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* GBP */}
          <div className="chart-container" style={{ height: '200px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '11pt', marginBottom: '5px' }}>GBP - British Pound</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{ fontSize: '9px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="GBP" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '10px', borderTop: '1px solid #ccc', fontSize: '8pt', textAlign: 'center', color: '#666' }}>
          <p>Markets Weekly Report | Generated {new Date().toLocaleString()} | Meridian Universal</p>
        </div>
      </div>
    </>
  );
};

export default MarketsWeeklyReportPage;
