/**
 * MacroAnalysisStructured Component
 * Displays structured macroeconomic data with metrics and charts
 * For countries with numeric/structured format (Armenia, Mongolia, Turkey, Uzbekistan)
 */

import React from 'react';
import type { CountryCompleteData, CountryFundamentals } from '../../../types/country';
import AdaptiveStatCard from './shared/AdaptiveStatCard';
import ExpandableTextBlock from './shared/ExpandableTextBlock';
import { GRID_CONFIGS } from '../../../constants/typography';
import { useScrollReveal } from '../../../hooks/useScrollReveal';

interface MacroAnalysisStructuredProps {
  data: CountryCompleteData;
  fundamentals: CountryFundamentals;
}

interface RiskItemProps {
  label?: string;
  likelihood?: string;
  impact?: string;
}

const RiskItem: React.FC<RiskItemProps> = ({ label, likelihood, impact }) => {
  if (!label) return null;

  const getLikelihoodColor = (level?: string) => {
    if (!level) return 'bg-gray-200 text-gray-800';
    const lower = level.toLowerCase();
    if (lower.includes('high')) return 'bg-red-100 text-red-800 border-red-300';
    if (lower.includes('medium') || lower.includes('moderate')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (lower.includes('low')) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-200 text-gray-800';
  };

  const getImpactColor = (level?: string) => {
    if (!level) return 'bg-gray-200 text-gray-800';
    const lower = level.toLowerCase();
    if (lower.includes('high')) return 'bg-red-100 text-red-800 border-red-300';
    if (lower.includes('medium') || lower.includes('moderate')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (lower.includes('low')) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-3">{label}</h4>
      <div className="flex gap-2">
        {likelihood && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Likelihood</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLikelihoodColor(likelihood)}`}>
              {likelihood}
            </span>
          </div>
        )}
        {impact && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Impact</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImpactColor(impact)}`}>
              {impact}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const MacroAnalysisStructured: React.FC<MacroAnalysisStructuredProps> = ({ data, fundamentals }) => {
  const imf = data.IMF_Article_IV;

  // Use GDP growth history from fundamentals (same as overview page chart)
  const gdpHistory = fundamentals.gdp_growth_history;
  const historicalData = gdpHistory.filter(d => !d.is_projection);
  const projectedData = gdpHistory.filter(d => d.is_projection);

  // Show last 2 historical years + first 2 projected years
  const displayData = [
    ...historicalData.slice(-2),
    ...projectedData.slice(0, 2)
  ].slice(0, 4); // Ensure max 4 cards

  // Scroll reveal hooks for each section
  const { ref: ref1, isVisible: isVisible1 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref2, isVisible: isVisible2 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref3, isVisible: isVisible3 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref4, isVisible: isVisible4 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref5, isVisible: isVisible5 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref6, isVisible: isVisible6 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref7, isVisible: isVisible7 } = useScrollReveal({ threshold: 0.1 });
  const { ref: ref8, isVisible: isVisible8 } = useScrollReveal({ threshold: 0.1 });

  return (
    <div className="space-y-6">
      {/* GDP Growth */}
      <div
        ref={ref1}
        className={`transition-all duration-700 ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <h3 className="text-xl font-semibold mb-4">GDP Growth</h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(displayData.length, 3)} gap-4`}>
          {displayData.map((item, index) => {
            const isLastHistorical = !item.is_projection &&
                                      index === historicalData.slice(-2).length - 1;

            return (
              <AdaptiveStatCard
                key={item.year}
                title={item.year.toString()}
                value={item.value}
                unit="%"
                trend={isLastHistorical && typeof item.value === 'number' ?
                  (item.value > 4 ? 'positive' : item.value > 2 ? 'neutral' : 'negative') :
                  undefined}
              />
            );
          })}
        </div>

        {/* Output Gap */}
        {imf.output_gap !== undefined && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Output Gap:</strong> {typeof imf.output_gap === 'number' ? imf.output_gap.toFixed(1) : imf.output_gap}% {(typeof imf.output_gap === 'number' ? imf.output_gap : parseFloat(imf.output_gap as string)) > 0 ? '(above potential)' : '(below potential)'}
            </p>
          </div>
        )}

        {/* Baseline Outlook */}
        {imf.baseline_growth_outlook && (
          <div className="mt-4">
            <ExpandableTextBlock
              title="Growth Outlook"
              text={imf.baseline_growth_outlook}
              colorScheme="default"
            />
          </div>
        )}
      </div>

      {/* Inflation & Nominal GDP */}
      <div
        ref={ref2}
        className={`transition-all duration-700 ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <h3 className="text-xl font-semibold mb-4">Inflation & Nominal GDP</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imf.cpi_eop_latest !== undefined && (
            <AdaptiveStatCard
              title="CPI Inflation"
              value={imf.cpi_eop_latest}
              unit="%"
              subtitle="End of period"
              trend={typeof imf.cpi_eop_latest === 'number' ? (imf.cpi_eop_latest < 5 ? 'positive' : imf.cpi_eop_latest < 10 ? 'neutral' : 'negative') : undefined}
            />
          )}
          {imf.nominal_gdp_usd !== undefined && (
            <AdaptiveStatCard
              title="Nominal GDP"
              value={typeof imf.nominal_gdp_usd === 'number' ? (imf.nominal_gdp_usd / 1000).toFixed(1) : imf.nominal_gdp_usd}
              unit=" bn USD"
              subtitle="Current prices"
            />
          )}
          {imf.population !== undefined && (
            <AdaptiveStatCard
              title="Population"
              value={typeof imf.population === 'number' ? (imf.population / 1000000).toFixed(2) : imf.population}
              unit=" million"
              subtitle=""
            />
          )}
        </div>
      </div>

      {/* Fiscal Position */}
      <div
        ref={ref3}
        className={`transition-all duration-700 ${isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <h3 className="text-xl font-semibold mb-4">Fiscal Position</h3>
        <div className={GRID_CONFIGS.metrics}>
          {imf.overall_balance_gdp !== undefined && (
            <AdaptiveStatCard
              title="Overall Balance"
              value={imf.overall_balance_gdp}
              unit="% GDP"
              subtitle="Headline balance"
              trend={typeof imf.overall_balance_gdp === 'number' ? (imf.overall_balance_gdp > 0 ? 'positive' : imf.overall_balance_gdp > -3 ? 'neutral' : 'negative') : undefined}
            />
          )}
          {imf.primary_balance_gdp !== undefined && (
            <AdaptiveStatCard
              title="Primary Balance"
              value={imf.primary_balance_gdp}
              unit="% GDP"
              subtitle="Excl. interest"
            />
          )}
          {imf.revenues_gdp !== undefined && (
            <AdaptiveStatCard
              title="Revenues"
              value={imf.revenues_gdp}
              unit="% GDP"
              subtitle="Total revenues"
            />
          )}
          {imf.expenditure_gdp !== undefined && (
            <AdaptiveStatCard
              title="Expenditure"
              value={imf.expenditure_gdp}
              unit="% GDP"
              subtitle="Total spending"
            />
          )}
        </div>

        {/* Public Debt */}
        {imf.public_debt_gdp !== undefined && (
          <div className="mt-4">
            <AdaptiveStatCard
              title="Public Debt"
              value={imf.public_debt_gdp}
              unit="% GDP"
              subtitle="Gross public debt"
              trend={typeof imf.public_debt_gdp === 'number' ? (imf.public_debt_gdp < 40 ? 'positive' : imf.public_debt_gdp < 60 ? 'neutral' : 'negative') : undefined}
            />
          </div>
        )}

        {/* Fiscal Consolidation Path */}
        {imf.fiscal_consolidation_path && (
          <div className="mt-4">
            <ExpandableTextBlock
              title="Fiscal Consolidation Path"
              text={imf.fiscal_consolidation_path}
              colorScheme="info"
            />
          </div>
        )}
      </div>

      {/* External Sector */}
      <div
        ref={ref4}
        className={`transition-all duration-700 ${isVisible4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <h3 className="text-xl font-semibold mb-4">External Sector</h3>
        <div className={GRID_CONFIGS.metrics}>
          {imf.current_account_gdp !== undefined && (
            <AdaptiveStatCard
              title="Current Account"
              value={imf.current_account_gdp}
              unit="% GDP"
              subtitle="Balance"
              trend={typeof imf.current_account_gdp === 'number' ? (imf.current_account_gdp > 0 ? 'positive' : imf.current_account_gdp > -5 ? 'neutral' : 'negative') : undefined}
            />
          )}
          {imf.reserves_usd_bn !== undefined && (
            <AdaptiveStatCard
              title="Reserves"
              value={typeof imf.reserves_usd_bn === 'number' ? imf.reserves_usd_bn.toFixed(1) : imf.reserves_usd_bn}
              unit=" bn USD"
              subtitle="Int'l reserves"
            />
          )}
          {imf.reserves_months_imports !== undefined && (
            <AdaptiveStatCard
              title="Import Cover"
              value={imf.reserves_months_imports}
              unit=" months"
              subtitle="Reserves adequacy"
              trend={typeof imf.reserves_months_imports === 'number' ? (imf.reserves_months_imports > 6 ? 'positive' : imf.reserves_months_imports > 3 ? 'neutral' : 'negative') : undefined}
            />
          )}
          {imf.ara_percent !== undefined && (
            <AdaptiveStatCard
              title="ARA Metric"
              value={imf.ara_percent}
              unit="%"
              subtitle="IMF adequacy"
            />
          )}
        </div>
      </div>

      {/* Macro Overview */}
      {imf.macro_overview && (
        <div
          ref={ref5}
          className={`transition-all duration-700 ${isVisible5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-xl font-semibold mb-4">Macroeconomic Overview</h3>
          <ExpandableTextBlock
            text={imf.macro_overview}
            colorScheme="default"
          />
        </div>
      )}

      {/* Policy Stance */}
      {imf.policy_stance && (
        <div
          ref={ref6}
          className={`transition-all duration-700 ${isVisible6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-xl font-semibold mb-4">Policy Stance</h3>
          <ExpandableTextBlock
            text={imf.policy_stance}
            colorScheme="info"
          />
        </div>
      )}

      {/* Risk Assessment */}
      {(imf.risk_1_label || imf.risk_2_label || imf.risk_3_label) && (
        <div
          ref={ref7}
          className={`transition-all duration-700 ${isVisible7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-xl font-semibold mb-4">Key Risks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RiskItem
              label={imf.risk_1_label}
              likelihood={imf.risk_1_likelihood}
              impact={imf.risk_1_impact}
            />
            <RiskItem
              label={imf.risk_2_label}
              likelihood={imf.risk_2_likelihood}
              impact={imf.risk_2_impact}
            />
            <RiskItem
              label={imf.risk_3_label}
              likelihood={imf.risk_3_likelihood}
              impact={imf.risk_3_impact}
            />
          </div>
        </div>
      )}

      {/* General Key Risks Text */}
      {imf.key_risks && (
        <div
          ref={ref7}
          className={`transition-all duration-700 ${isVisible7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
          <ExpandableTextBlock
            text={imf.key_risks}
            colorScheme="warning"
          />
        </div>
      )}

      {/* Policy Recommendations */}
      {imf.policy_recommendations && (
        <div
          ref={ref8}
          className={`transition-all duration-700 ${isVisible8 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-xl font-semibold mb-4">Policy Recommendations</h3>
          <ExpandableTextBlock
            text={imf.policy_recommendations}
            colorScheme="success"
          />
        </div>
      )}

      {/* Source Footnote */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Source:</strong> IMF Article IV Report {imf.imf_country_report_no && `No. ${imf.imf_country_report_no}`} | <strong>Published:</strong> {imf.publication_date}{imf.mission_dates && ` | Mission: ${imf.mission_dates}`}{imf.data_vintage && ` | Data as of: ${imf.data_vintage}`}
        </p>
      </div>
    </div>
  );
};

export default MacroAnalysisStructured;
