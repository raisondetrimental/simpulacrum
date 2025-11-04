/**
 * FinancialSectorSection Component
 * Displays Financial Sector Indicators (FSI) and monetary policy metrics
 * For countries with structured data format
 */

import React from 'react';
import type { CountryCompleteData } from '../../../types/country';
import SmartMetricDisplay from './shared/SmartMetricDisplay';
import AdaptiveStatCard from './shared/AdaptiveStatCard';
import { GRID_CONFIGS } from '../../../constants/typography';

interface FinancialSectorSectionProps {
  data: CountryCompleteData;
}

const FinancialSectorSection: React.FC<FinancialSectorSectionProps> = ({ data }) => {
  const imf = data.IMF_Article_IV;

  // Check if this country has structured FSI data
  const hasFSIData = imf.fsi_car !== undefined || imf.fsi_npl !== undefined ||
                     imf.fsi_roe !== undefined || imf.fsi_lcr !== undefined;

  if (!hasFSIData) {
    // Fall back to narrative format if available
    if (imf.financial_sector_overview) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Financial sector data is available in narrative format. See Macro Analysis tab for details.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Financial sector indicators not available for this country.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Soundness Indicators (FSI) */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Financial Soundness Indicators (FSI)</h3>
        <div className={GRID_CONFIGS.metricsCompact}>
          {imf.fsi_car !== undefined && (
            <SmartMetricDisplay
              title="Capital Adequacy Ratio"
              value={imf.fsi_car}
              unit="%"
              subtitle="CAR"
              threshold={{ warning: 12, bad: 8 }}
            />
          )}
          {imf.fsi_npl !== undefined && (
            <SmartMetricDisplay
              title="Non-Performing Loans"
              value={imf.fsi_npl}
              unit="%"
              subtitle="NPL Ratio"
              threshold={{ warning: 5, bad: 10 }}
            />
          )}
          {imf.fsi_roe !== undefined && (
            <SmartMetricDisplay
              title="Return on Equity"
              value={imf.fsi_roe}
              unit="%"
              subtitle="ROE"
            />
          )}
          {imf.fsi_lcr !== undefined && (
            <SmartMetricDisplay
              title="Liquidity Coverage Ratio"
              value={imf.fsi_lcr}
              unit="%"
              subtitle="LCR"
              threshold={{ warning: 100, bad: 80 }}
            />
          )}
        </div>

        {/* FSI Interpretation Guide */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Indicator Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
            <div>
              <strong>CAR (Capital Adequacy):</strong> Measures bank capital vs risk-weighted assets.
              <span className="text-green-700"> Strong: &gt;12%</span>,
              <span className="text-orange-700"> Adequate: 8-12%</span>,
              <span className="text-red-700"> Weak: &lt;8%</span>
            </div>
            <div>
              <strong>NPL (Non-Performing Loans):</strong> Bad loans as % of total loans.
              <span className="text-green-700"> Healthy: &lt;5%</span>,
              <span className="text-orange-700"> Watch: 5-10%</span>,
              <span className="text-red-700"> Stressed: &gt;10%</span>
            </div>
            <div>
              <strong>ROE (Return on Equity):</strong> Bank profitability measure. Higher is generally better for sustainability.
            </div>
            <div>
              <strong>LCR (Liquidity Coverage):</strong> Short-term liquidity buffer.
              <span className="text-green-700"> Strong: &gt;100%</span>,
              <span className="text-red-700"> Below regulatory minimum: &lt;100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monetary Policy Metrics */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Monetary Policy & Credit Conditions</h3>
        <div className={GRID_CONFIGS.metricsCompact}>
          {imf.policy_rate !== undefined && (
            <AdaptiveStatCard
              title="Policy Rate"
              value={imf.policy_rate}
              unit="%"
              subtitle="Central Bank Rate"
            />
          )}
          {imf.real_policy_rate !== undefined && (
            <AdaptiveStatCard
              title="Real Policy Rate"
              value={imf.real_policy_rate}
              unit="%"
              subtitle="Inflation-adjusted"
            />
          )}
          {imf.credit_growth !== undefined && (
            <AdaptiveStatCard
              title="Credit Growth"
              value={imf.credit_growth}
              unit="%"
              subtitle="YoY change"
            />
          )}
          {imf.dollarisation !== undefined && (
            <AdaptiveStatCard
              title="Dollarisation"
              value={imf.dollarisation}
              unit="%"
              subtitle="FX deposits/loans"
            />
          )}
        </div>
      </div>

      {/* Exchange Rate Regime */}
      {imf.exchange_rate_regime && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Exchange Rate Regime</h3>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-lg font-semibold text-gray-800 mb-2">{imf.exchange_rate_regime}</p>
            {imf.fx_intervention_notes && (
              <p className="text-sm text-gray-700 mt-2">{imf.fx_intervention_notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Macroprudential Measures */}
      {imf.macroprudential_measures && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Macroprudential Policy</h3>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
            <p className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
              {imf.macroprudential_measures}
            </p>
          </div>
        </div>
      )}

      {/* FSAP Links */}
      {imf.fsap_links && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Financial Sector Assessment Program (FSAP)</h3>
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-700">{imf.fsap_links}</p>
          </div>
        </div>
      )}

      {/* Source Footnote */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Source:</strong> IMF Article IV {imf.imf_country_report_no && `Report No. ${imf.imf_country_report_no}`} | <strong>Published:</strong> {imf.publication_date}{imf.data_vintage && ` | Data as of: ${imf.data_vintage}`}
        </p>
      </div>
    </div>
  );
};

export default FinancialSectorSection;
