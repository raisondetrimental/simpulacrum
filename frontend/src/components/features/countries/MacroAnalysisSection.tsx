/**
 * MacroAnalysisSection Component
 * Displays IMF Article IV macroeconomic analysis
 */

import React, { useState } from 'react';
import type { CountryCompleteData } from '../../../types/country';
import AdaptiveStatCard from './shared/AdaptiveStatCard';

interface MacroAnalysisSectionProps {
  data: CountryCompleteData;
}

interface CollapsibleSectionProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
};

// StatCard removed - now using AdaptiveStatCard for intelligent rendering

const MacroAnalysisSection: React.FC<MacroAnalysisSectionProps> = ({ data }) => {
  const imf = data.IMF_Article_IV;

  if (!imf) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">IMF Article IV data not available for this country.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Economic Indicators Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Key Economic Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdaptiveStatCard
            title="GDP Growth"
            value={imf.gdp_growth_current || 'N/A'}
            subtitle="Current"
          />
          <AdaptiveStatCard
            title="Inflation"
            value={imf.inflation_current || 'N/A'}
            subtitle="Consumer Price Index"
          />
          <AdaptiveStatCard
            title="Fiscal Balance"
            value={imf.fiscal_balance_current || 'N/A'}
            subtitle="% of GDP"
          />
          <AdaptiveStatCard
            title="Public Debt"
            value={imf.public_debt_current || 'N/A'}
            subtitle="% of GDP"
          />
        </div>
      </div>

      {/* Macroeconomic Overview */}
      <CollapsibleSection
        title="Macroeconomic Overview"
        content={imf.macro_overview}
        defaultOpen={true}
      />

      {/* Growth and Inflation Outlook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CollapsibleSection
          title="GDP Growth Forecast"
          content={imf.gdp_growth_forecast}
        />
        <CollapsibleSection
          title="Inflation Outlook"
          content={imf.inflation_outlook}
        />
      </div>

      {/* Fiscal Position */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Fiscal Position</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="Fiscal Balance Outlook"
            content={imf.fiscal_balance_outlook}
          />
          <CollapsibleSection
            title="Public Debt Trajectory"
            content={imf.public_debt_trajectory}
          />
        </div>
      </div>

      {/* Monetary & Exchange Rate Policy */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Monetary & Exchange Rate Policy</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="Monetary Policy Stance"
            content={imf.monetary_policy_current}
          />
          <CollapsibleSection
            title="Monetary Policy Outlook"
            content={imf.monetary_policy_outlook}
          />
          {imf.exchange_rate_current && (
            <CollapsibleSection
              title="Exchange Rate"
              content={imf.exchange_rate_current}
            />
          )}
          {imf.exchange_rate_policy && (
            <CollapsibleSection
              title="Exchange Rate Policy"
              content={imf.exchange_rate_policy}
            />
          )}
        </div>
      </div>

      {/* External Sector */}
      <div>
        <h3 className="text-xl font-semibold mb-4">External Sector</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="Foreign Reserves"
            content={imf.reserves_current}
          />
          {imf.reserves_adequacy && (
            <CollapsibleSection
              title="Reserves Adequacy Assessment"
              content={imf.reserves_adequacy}
            />
          )}
          <CollapsibleSection
            title="Current Account"
            content={imf.current_account_current}
          />
          <CollapsibleSection
            title="Current Account Outlook"
            content={imf.current_account_outlook}
          />
          {imf.trade_balance_goods && (
            <CollapsibleSection
              title="Trade Balance"
              content={imf.trade_balance_goods}
            />
          )}
        </div>
      </div>

      {/* FDI and Capital Flows */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Foreign Direct Investment</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="FDI Current Status"
            content={imf.fdi_current}
          />
          <CollapsibleSection
            title="FDI Outlook"
            content={imf.fdi_outlook}
          />
          {imf.capital_flows && (
            <CollapsibleSection
              title="Capital Flows"
              content={imf.capital_flows}
            />
          )}
        </div>
      </div>

      {/* Financial Sector */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Financial Sector</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="Financial Sector Overview"
            content={imf.financial_sector_overview}
          />
          {imf.banking_sector_risks && (
            <CollapsibleSection
              title="Banking Sector Risks"
              content={imf.banking_sector_risks}
            />
          )}
          {imf.financial_sector_reforms && (
            <CollapsibleSection
              title="Financial Sector Reforms"
              content={imf.financial_sector_reforms}
            />
          )}
          {imf.npl_ratio && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Key Financial Indicators</h4>
              <div className="space-y-1 text-sm">
                <p><strong>NPL Ratio:</strong> {imf.npl_ratio}</p>
                {imf.capital_adequacy && <p><strong>Capital Adequacy:</strong> {imf.capital_adequacy}</p>}
                {imf.profitability_liquidity && <p><strong>Profitability & Liquidity:</strong> {imf.profitability_liquidity}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structural Challenges */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Structural Challenges</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="Structural Challenges Overview"
            content={imf.structural_challenges}
          />
          {imf.infrastructure_needs && (
            <CollapsibleSection
              title="Infrastructure Needs"
              content={imf.infrastructure_needs}
            />
          )}
          {imf.governance_business_environment && (
            <CollapsibleSection
              title="Governance & Business Environment"
              content={imf.governance_business_environment}
            />
          )}
        </div>
      </div>

      {/* Risks and Recommendations */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Risks & Policy Recommendations</h3>
        <div className="space-y-4">
          <CollapsibleSection
            title="Key Risks"
            content={imf.key_risks}
            defaultOpen={true}
          />
          <CollapsibleSection
            title="Policy Recommendations"
            content={imf.policy_recommendations}
            defaultOpen={true}
          />
        </div>
      </div>

      {/* Source Footnote */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Source:</strong> {imf.source_name} | <strong>Published:</strong> {imf.publication_date}{imf.consultation_date && ` | Consultation: ${imf.consultation_date}`}
        </p>
      </div>
    </div>
  );
};

export default MacroAnalysisSection;
