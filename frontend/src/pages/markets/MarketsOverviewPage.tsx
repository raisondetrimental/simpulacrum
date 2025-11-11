/**
 * Markets Overview Page
 * Comprehensive view of global financial markets
 */
import React, { useState, useEffect } from 'react';
import MarketPulseCard from '../../components/features/markets-overview/MarketPulseCard';
import YieldCurveSnapshot from '../../components/features/markets-overview/YieldCurveSnapshot';
import CorporateCreditOverview from '../../components/features/markets-overview/CorporateCreditOverview';
import GlobalCreditHeatmap from '../../components/features/markets-overview/GlobalCreditHeatmap';
import FXDashboard from '../../components/features/markets-overview/FXDashboard';
import PolicyRatesComparison from '../../components/features/markets-overview/PolicyRatesComparison';
import EmergingMarketsGrid from '../../components/features/markets-overview/EmergingMarketsGrid';
import MarketNavigationGrid from '../../components/features/markets-overview/MarketNavigationGrid';
import {
  getHistoricalYieldsUSA,
  getCorporateBondsYields,
  getCorporateSpreads,
  getCorporateYields,
  getPolicyRates,
  HistoricalYield,
  CorporateBondsYield,
  CorporateSpreadsData,
  CorporateYieldsData,
  PolicyRatesData
} from '../../services/marketsService';
import { fxYahooService } from '../../services/fxYahooService';
import { getAllCountries } from '../../services/countriesService';
import { FXRatesYahooData } from '../../types/fxYahoo';
import { CountryFundamentals } from '../../types/country';

const MarketsOverviewPage: React.FC = () => {
  // State for all data
  const [usYields, setUsYields] = useState<HistoricalYield | null>(null);
  const [corporateBonds, setCorporateBonds] = useState<CorporateBondsYield | null>(null);
  const [corporateSpreads, setCorporateSpreads] = useState<CorporateSpreadsData | null>(null);
  const [corporateYields, setCorporateYields] = useState<CorporateYieldsData | null>(null);
  const [fxRates, setFxRates] = useState<FXRatesYahooData | null>(null);
  const [policyRates, setPolicyRates] = useState<PolicyRatesData | null>(null);
  const [countries, setCountries] = useState<CountryFundamentals[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hero metrics state
  const [heroMetrics, setHeroMetrics] = useState({
    us10Y: null as number | null,
    us10YChange: null as number | null,
    igSpread: null as number | null,
    igSpreadChange: null as number | null,
    dxyProxy: null as number | null,
    rateDivergence: null as number | null
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        usYieldsRes,
        corporateBondsRes,
        corporateSpreadsRes,
        corporateYieldsRes,
        fxRatesRes,
        policyRatesRes,
        countriesRes
      ] = await Promise.all([
        getHistoricalYieldsUSA(),
        getCorporateBondsYields(),
        getCorporateSpreads(),
        getCorporateYields(),
        fxYahooService.getYahooRates(),
        getPolicyRates(),
        getAllCountries()
      ]);

      // Set state
      if (usYieldsRes.success && usYieldsRes.data) {
        setUsYields(usYieldsRes.data);

        // Calculate US 10Y change
        const latestIndex = usYieldsRes.data.dates.length - 1;
        const latest10Y = usYieldsRes.data.maturities['10Y']?.[latestIndex];
        const yesterday10Y = usYieldsRes.data.maturities['10Y']?.[latestIndex - 1];

        if (latest10Y !== null && yesterday10Y !== null) {
          setHeroMetrics(prev => ({
            ...prev,
            us10Y: latest10Y,
            us10YChange: latest10Y - yesterday10Y
          }));
        }
      }

      setCorporateBonds(corporateBondsRes);
      setCorporateSpreads(corporateSpreadsRes);
      setCorporateYields(corporateYieldsRes);
      setFxRates(fxRatesRes);
      setPolicyRates(policyRatesRes);

      // Process countries data
      if (countriesRes.success && countriesRes.data) {
        setCountries(countriesRes.data);
      }

      // Calculate IG Spread (BBB - 10Y Treasury)
      const latestBonds = corporateBondsRes.data[corporateBondsRes.data.length - 1];
      const latestSpreads = corporateSpreadsRes.data[corporateSpreadsRes.data.length - 1];
      const yesterdaySpreads = corporateSpreadsRes.data[corporateSpreadsRes.data.length - 2];

      if (latestSpreads.global_ig !== null) {
        setHeroMetrics(prev => ({
          ...prev,
          igSpread: latestSpreads.global_ig,
          igSpreadChange: yesterdaySpreads?.global_ig !== null
            ? latestSpreads.global_ig - yesterdaySpreads.global_ig
            : null
        }));
      }

      // Calculate DXY Proxy (composite FX movement)
      // Simple average of % changes for all currencies
      const latestFX = fxRatesRes.data[fxRatesRes.data.length - 1];
      const yesterdayFX = fxRatesRes.data[fxRatesRes.data.length - 2];

      if (latestFX && yesterdayFX) {
        const currencies: Array<keyof typeof latestFX> = ['VND', 'TRY', 'MNT', 'UZS', 'AMD', 'GBP'];
        let totalChange = 0;
        let count = 0;

        currencies.forEach(curr => {
          if (curr !== 'date' && latestFX[curr] !== null && yesterdayFX[curr] !== null) {
            const change = ((latestFX[curr]! - yesterdayFX[curr]!) / yesterdayFX[curr]!) * 100;
            totalChange += change;
            count++;
          }
        });

        if (count > 0) {
          setHeroMetrics(prev => ({ ...prev, dxyProxy: totalChange / count }));
        }
      }

      // Calculate Central Bank Divergence
      const latestPolicy = policyRatesRes.data[policyRatesRes.data.length - 1];
      const validRates = [
        latestPolicy.US,
        latestPolicy.GB,
        latestPolicy.KR,
        latestPolicy.AU,
        latestPolicy.TR,
        latestPolicy.XM
      ].filter(rate => rate !== null) as number[];

      if (validRates.length > 0) {
        const maxRate = Math.max(...validRates);
        const minRate = Math.min(...validRates);
        setHeroMetrics(prev => ({ ...prev, rateDivergence: maxRate - minRate }));
      }

    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Markets Overview</h1>
        <p className="text-lg text-gray-600">
          Comprehensive global financial markets intelligence: US treasuries, corporate credit, FX, central banks, and emerging markets.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Hero Section - Market Pulse */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Market Pulse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketPulseCard
            title="US 10Y Treasury"
            value={heroMetrics.us10Y !== null ? `${heroMetrics.us10Y.toFixed(2)}%` : 'Loading...'}
            change={heroMetrics.us10YChange}
            changeLabel="1D"
            loading={loading}
          />
          <MarketPulseCard
            title="Global IG Spread (BBB)"
            value={heroMetrics.igSpread !== null ? `${heroMetrics.igSpread.toFixed(0)}` : 'Loading...'}
            unit="bps"
            change={heroMetrics.igSpreadChange}
            changeLabel="1D"
            loading={loading}
          />
          <MarketPulseCard
            title="DXY Proxy"
            value={heroMetrics.dxyProxy !== null ? `${heroMetrics.dxyProxy >= 0 ? '+' : ''}${heroMetrics.dxyProxy.toFixed(2)}%` : 'Loading...'}
            changeLabel="Composite FX"
            loading={loading}
          />
          <MarketPulseCard
            title="Central Bank Divergence"
            value={heroMetrics.rateDivergence !== null ? `${heroMetrics.rateDivergence.toFixed(2)}%` : 'Loading...'}
            changeLabel="Rate Spread"
            loading={loading}
          />
        </div>
      </div>

      {/* US Treasury Yield Curve */}
      <YieldCurveSnapshot data={usYields} loading={loading} />

      {/* Corporate Credit Markets */}
      <CorporateCreditOverview data={corporateBonds} loading={loading} />

      {/* Global Corporate Yields & Spreads */}
      <GlobalCreditHeatmap
        yieldsData={corporateYields}
        spreadsData={corporateSpreads}
        loading={loading}
      />

      {/* Foreign Exchange Markets */}
      <FXDashboard data={fxRates} loading={loading} />

      {/* Central Bank Policy Rates */}
      <PolicyRatesComparison data={policyRates} loading={loading} />

      {/* Emerging Markets Spotlight */}
      <EmergingMarketsGrid countries={countries} loading={loading} />

      {/* Market Intelligence Quick Links */}
      <MarketNavigationGrid />

      {/* Data Freshness */}
      <div className="text-center text-sm text-gray-500 pb-6">
        <p>Data refreshed: {new Date().toLocaleString()}</p>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="mt-2 text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh All Data'}
        </button>
      </div>
    </div>
  );
};

export default MarketsOverviewPage;
