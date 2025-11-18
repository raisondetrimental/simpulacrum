import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DashboardData } from '../../types/dashboard';
import { API_BASE_URL } from '../../config';

interface MarketChartsSectionProps {
  data: DashboardData;
}

// TypeScript interfaces for API data
interface YieldDataPoint {
  date: string;
  '1_month': number | null;
  '3_month': number | null;
  '6_month': number | null;
  '1_year': number | null;
  '2_year': number | null;
  '3_year': number | null;
  '5_year': number | null;
  '7_year': number | null;
  '10_year': number | null;
  '20_year': number | null;
  '30_year': number | null;
}

interface FredYieldsData {
  meta: any;
  data: YieldDataPoint[];
}

interface BondDataPoint {
  date: string;
  aaa: number | null;
  aa: number | null;
  a: number | null;
  bbb: number | null;
  bb: number | null;
  high_yield: number | null;
}

interface CorporateBondsData {
  meta: any;
  data: BondDataPoint[];
}

type MaturityKey = '1_month' | '3_month' | '6_month' | '1_year' | '2_year' | '3_year' | '5_year' | '7_year' | '10_year' | '20_year' | '30_year';
type RatingKey = 'aaa' | 'aa' | 'a' | 'bbb' | 'bb' | 'high_yield';

const MATURITY_LABELS: Record<MaturityKey, string> = {
  '1_month': '1M',
  '3_month': '3M',
  '6_month': '6M',
  '1_year': '1Y',
  '2_year': '2Y',
  '3_year': '3Y',
  '5_year': '5Y',
  '7_year': '7Y',
  '10_year': '10Y',
  '20_year': '20Y',
  '30_year': '30Y',
};

const RATING_LABELS: Record<RatingKey, string> = {
  'aaa': 'AAA',
  'aa': 'AA',
  'a': 'A',
  'bbb': 'BBB',
  'bb': 'BB',
  'high_yield': 'High Yield',
};

const MarketChartsSection: React.FC<MarketChartsSectionProps> = ({ data }) => {
  const [usYields, setUsYields] = useState<FredYieldsData | null>(null);
  const [corporateBonds, setCorporateBonds] = useState<CorporateBondsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const [yieldsResponse, bondsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/historical-yields/usa`),
        fetch(`${API_BASE_URL}/api/corporate-bonds/yields`, { credentials: 'include' })
      ]);

      if (yieldsResponse.ok) {
        const yieldsData = await yieldsResponse.json();
        setUsYields(yieldsData);
      }

      if (bondsResponse.ok) {
        const bondsData = await bondsResponse.json();
        setCorporateBonds(bondsData);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare US Treasury Yield Curve data from latest data point
  const yieldCurveData = usYields && usYields.data.length > 0
    ? (() => {
        const latestData = usYields.data[usYields.data.length - 1];
        return (Object.keys(MATURITY_LABELS) as MaturityKey[]).map(maturity => ({
          maturity: MATURITY_LABELS[maturity],
          yield: latestData[maturity]
        })).filter(item => item.yield !== null);
      })()
    : [];

  // Prepare Corporate Bonds Yield Curve data from latest data point
  const corporateCurveData = corporateBonds && corporateBonds.data.length > 0
    ? (() => {
        const latestData = corporateBonds.data[corporateBonds.data.length - 1];
        return (Object.keys(RATING_LABELS) as RatingKey[]).map(rating => ({
          rating: RATING_LABELS[rating],
          yield: latestData[rating]
        })).filter(item => item.yield !== null);
      })()
    : [];

  // Calculate benchmark changes for US Treasuries
  const calculateYieldChanges = (maturity: MaturityKey) => {
    if (!usYields || usYields.data.length === 0) return { current: 0, daily: 0 };
    const values = usYields.data.map(d => d[maturity]).filter(v => v !== null) as number[];
    const current = values[values.length - 1] || 0;
    const oneDayAgo = values[Math.max(0, values.length - 2)] || current;
    return {
      current,
      daily: current && oneDayAgo ? ((current - oneDayAgo) * 100) : 0,
    };
  };

  // Calculate benchmark changes for Corporate Bonds
  const calculateBondChanges = (rating: RatingKey) => {
    if (!corporateBonds || corporateBonds.data.length === 0) return { current: 0, daily: 0 };
    const values = corporateBonds.data.map(d => d[rating]).filter(v => v !== null) as number[];
    const current = values[values.length - 1] || 0;
    const oneDayAgo = values[Math.max(0, values.length - 2)] || current;
    return {
      current,
      daily: current && oneDayAgo ? ((current - oneDayAgo) * 100) : 0,
    };
  };

  const treasuryBenchmarks = {
    '2_year': calculateYieldChanges('2_year'),
    '10_year': calculateYieldChanges('10_year'),
    '30_year': calculateYieldChanges('30_year'),
  };

  const corporateBenchmarks = {
    'aaa': calculateBondChanges('aaa'),
    'bbb': calculateBondChanges('bbb'),
    'high_yield': calculateBondChanges('high_yield'),
  };

  const curveSpread = treasuryBenchmarks['10_year'].current - treasuryBenchmarks['2_year'].current;
  const investmentGradeSpread = corporateBenchmarks['bbb'].current - corporateBenchmarks['aaa'].current;

  // Calculate Y-axis domains with padding (between 0 and auto)
  const calculateYDomain = (data: any[], key: string) => {
    const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined) as number[];
    if (values.length === 0) return [0, 'auto'];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    // Start Y-axis at min minus 30% of the range (gives breathing room but not starting at 0)
    const yMin = Math.max(0, min - (range * 0.3));
    const yMax = max + (range * 0.1); // Add 10% padding at top

    return [yMin, yMax];
  };

  const treasuryYDomain = yieldCurveData.length > 0 ? calculateYDomain(yieldCurveData, 'yield') : [0, 'auto'];
  const corporateYDomain = corporateCurveData.length > 0 ? calculateYDomain(corporateCurveData, 'yield') : [0, 'auto'];

  // Prepare FX Rates data (top 6 currencies)
  const fxRatesData = Object.entries(data.sections.fx_rates)
    .slice(0, 6)
    .map(([currency, currencyData]) => ({
      currency: `${currency}/USD`,
      rate: currencyData.rate || 0,
      change: currencyData.changes['1D'] ? (currencyData.changes['1D'] * 100) : 0
    }));

  // Custom tooltip for professional look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="font-semibold text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.dataKey === 'value' || entry.dataKey === 'spread' ? '' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/dashboard/markets" className="hover:text-blue-600 transition-colors cursor-pointer">
          <h2 className="text-2xl font-bold text-gray-900">Live Market Intelligence</h2>
        </Link>
        <Link
          to="/dashboard/markets"
          className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          View Full Markets →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* US Treasury Yield Curve */}
        <div className="card bg-white border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">US Treasury Yield Curve</h3>
              <p className="text-xs text-gray-500 mt-1">
                {usYields && usYields.data.length > 0
                  ? `As of ${new Date(usYields.data[usYields.data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Loading...'}
              </p>
            </div>
            <Link to="/markets/usa-historical-yields" className="text-xs text-slate-600 hover:text-slate-800">
              Details →
            </Link>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">2Y</div>
              <div className="text-lg font-bold text-emerald-600">
                {treasuryBenchmarks['2_year'].current.toFixed(2)}%
              </div>
              <div className={`text-xs font-medium ${treasuryBenchmarks['2_year'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {treasuryBenchmarks['2_year'].daily >= 0 ? '+' : ''}{treasuryBenchmarks['2_year'].daily.toFixed(1)} bp
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">10Y</div>
              <div className="text-lg font-bold text-blue-600">
                {treasuryBenchmarks['10_year'].current.toFixed(2)}%
              </div>
              <div className={`text-xs font-medium ${treasuryBenchmarks['10_year'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {treasuryBenchmarks['10_year'].daily >= 0 ? '+' : ''}{treasuryBenchmarks['10_year'].daily.toFixed(1)} bp
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">10Y-2Y</div>
              <div className={`text-lg font-bold ${curveSpread >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {curveSpread >= 0 ? '+' : ''}{curveSpread.toFixed(1)} bp
              </div>
              <div className="text-xs text-gray-500">
                {curveSpread >= 0 ? 'Normal' : 'Inverted'}
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yieldCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="maturity"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                domain={treasuryYDomain as [number, number]}
              />
              <Tooltip
                formatter={(value: any) => `${value.toFixed(3)}%`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Corporate Bond Yields */}
        <div className="card bg-white border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">US Corporate Bond Yields</h3>
              <p className="text-xs text-gray-500 mt-1">
                {corporateBonds && corporateBonds.data.length > 0
                  ? `As of ${new Date(corporateBonds.data[corporateBonds.data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Loading...'}
              </p>
            </div>
            <Link to="/markets/corporate-bonds" className="text-xs text-slate-600 hover:text-slate-800">
              Details →
            </Link>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">AAA</div>
              <div className="text-lg font-bold text-green-600">
                {corporateBenchmarks['aaa'].current.toFixed(2)}%
              </div>
              <div className={`text-xs font-medium ${corporateBenchmarks['aaa'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {corporateBenchmarks['aaa'].daily >= 0 ? '+' : ''}{corporateBenchmarks['aaa'].daily.toFixed(1)} bp
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">BBB</div>
              <div className="text-lg font-bold text-amber-600">
                {corporateBenchmarks['bbb'].current.toFixed(2)}%
              </div>
              <div className={`text-xs font-medium ${corporateBenchmarks['bbb'].daily >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {corporateBenchmarks['bbb'].daily >= 0 ? '+' : ''}{corporateBenchmarks['bbb'].daily.toFixed(1)} bp
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">BBB-AAA</div>
              <div className="text-lg font-bold text-blue-600">
                {investmentGradeSpread.toFixed(1)} bp
              </div>
              <div className="text-xs text-gray-500">
                IG Spread
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={corporateCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="rating"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                domain={corporateYDomain as [number, number]}
              />
              <Tooltip
                formatter={(value: any) => `${value.toFixed(3)}%`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* FX Markets */}
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Foreign Exchange Markets</h3>
              <p className="text-xs text-gray-500 mt-1">Major currency pairs vs. USD</p>
            </div>
            <Link to="/dashboard/fx" className="text-xs text-purple-600 hover:text-purple-800">
              Details →
            </Link>
          </div>

          <div className="space-y-2">
            {fxRatesData.map((fx) => (
              <div
                key={fx.currency}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{fx.currency}</p>
                  <p className="text-xs text-gray-500">Exchange Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-700">{fx.rate.toFixed(4)}</p>
                  <p className={`text-xs font-semibold ${fx.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fx.change >= 0 ? '+' : ''}{fx.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Rates */}
        <div className="card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Central Bank Policy Rates</h3>
              <p className="text-xs text-gray-500 mt-1">Key interest rate targets</p>
            </div>
            <Link to="/dashboard/central-banks" className="text-xs text-orange-600 hover:text-orange-800">
              Details →
            </Link>
          </div>

          <div className="space-y-2">
            {Object.entries(data.sections.central_bank_rates)
              .slice(0, 6)
              .map(([country, rateData]) => (
                <div
                  key={country}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{country}</p>
                    <p className="text-xs text-gray-500">Central Bank Target</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-700">
                      {rateData?.rate !== null && rateData?.rate !== undefined
                        ? `${rateData.rate.toFixed(2)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MarketChartsSection;
