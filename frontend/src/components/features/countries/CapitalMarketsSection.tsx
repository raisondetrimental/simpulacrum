/**
 * CapitalMarketsSection Component
 * Displays Debt Sustainability Analysis (DSA) and capital markets data
 * For countries with structured data format
 */

import React from 'react';
import type { CountryCompleteData } from '../../../types/country';

interface CapitalMarketsSectionProps {
  data: CountryCompleteData;
}

const CapitalMarketsSection: React.FC<CapitalMarketsSectionProps> = ({ data }) => {
  const imf = data.IMF_Article_IV;

  // Check if this country has capital markets data
  const hasCapitalMarketsData = imf.dsa_risk_rating || imf.sovereign_issuance_notes ||
                                 imf.investor_base_notes || imf.market_depth_notes ||
                                 imf.gross_financing_needs_gdp !== undefined;

  if (!hasCapitalMarketsData) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Capital markets and debt sustainability data not available for this country.</p>
      </div>
    );
  }

  // Determine DSA risk color
  const getRiskColor = (rating?: string) => {
    if (!rating) return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800' };
    const lower = rating.toLowerCase();
    if (lower.includes('low')) return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' };
    if (lower.includes('moderate')) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800' };
    if (lower.includes('high')) return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' };
    return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800' };
  };

  const riskColors = getRiskColor(imf.dsa_risk_rating);

  return (
    <div className="space-y-6">
      {/* Debt Sustainability Analysis (DSA) */}
      {(imf.dsa_risk_rating || imf.dsa_heatmap_summary) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Debt Sustainability Analysis (DSA)</h3>

          {/* Risk Rating Highlight */}
          {imf.dsa_risk_rating && (
            <div className={`${riskColors.bg} border-2 ${riskColors.border} rounded-lg p-6 mb-4`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-600 uppercase mb-1">DSA Risk Rating</h4>
                  <p className={`${typeof imf.dsa_risk_rating === 'string' && imf.dsa_risk_rating.length > 30 ? 'text-lg' : 'text-3xl'} font-bold ${riskColors.text}`}>
                    {imf.dsa_risk_rating}
                  </p>
                </div>
                <svg className={`w-16 h-16 ${riskColors.text} flex-shrink-0 ml-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          )}

          {/* DSA Heatmap Summary */}
          {imf.dsa_heatmap_summary && (
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3">DSA Heatmap Summary</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {imf.dsa_heatmap_summary}
              </p>
            </div>
          )}

          {/* Gross Financing Needs */}
          {imf.gross_financing_needs_gdp !== undefined && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
              <h4 className="text-sm font-medium text-gray-600 uppercase mb-2">Gross Financing Needs</h4>
              <p className={`${typeof imf.gross_financing_needs_gdp === 'number' || (typeof imf.gross_financing_needs_gdp === 'string' && imf.gross_financing_needs_gdp.length < 20) ? 'text-2xl' : 'text-base'} font-bold text-purple-800`}>
                {typeof imf.gross_financing_needs_gdp === 'number' ? imf.gross_financing_needs_gdp.toFixed(1) + '% of GDP' : imf.gross_financing_needs_gdp}
              </p>
            </div>
          )}

          {/* Stress Tests */}
          {imf.stress_tests_bind && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mt-4">
              <h4 className="font-semibold text-orange-900 mb-2">Binding Stress Tests</h4>
              <p className="text-sm text-orange-800 whitespace-pre-wrap leading-relaxed">
                {imf.stress_tests_bind}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Debt Profile */}
      {imf.debt_profile && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Debt Profile</h3>
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {imf.debt_profile}
            </p>
          </div>
        </div>
      )}

      {/* Fiscal Rules */}
      {imf.fiscal_rules && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Fiscal Rules & Framework</h3>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
            <p className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
              {imf.fiscal_rules}
            </p>
          </div>
        </div>
      )}

      {/* Capital Markets Depth & Structure */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Capital Markets Assessment</h3>
        <div className="space-y-4">
          {/* Sovereign Issuance */}
          {imf.sovereign_issuance_notes && (
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sovereign Issuance
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {imf.sovereign_issuance_notes}
              </p>
            </div>
          )}

          {/* Investor Base */}
          {imf.investor_base_notes && (
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Investor Base
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {imf.investor_base_notes}
              </p>
            </div>
          )}

          {/* Market Depth */}
          {imf.market_depth_notes && (
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Market Depth
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {imf.market_depth_notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* IMF Programme Status */}
      {imf.programme_status && (
        <div>
          <h3 className="text-xl font-semibold mb-4">IMF Programme Status</h3>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
            <p className="text-sm text-blue-900 font-medium mb-2">{imf.programme_status}</p>
            {imf.board_date && (
              <p className="text-xs text-blue-700">Board Date: {imf.board_date}</p>
            )}
          </div>
        </div>
      )}

      {/* Next Article IV Cycle */}
      {imf.next_article_iv_cycle && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Next Article IV Consultation:</strong> {imf.next_article_iv_cycle}
          </p>
        </div>
      )}

      {/* Source Footnote */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Source:</strong> IMF Article IV {imf.imf_country_report_no && `Report No. ${imf.imf_country_report_no}`} | <strong>Published:</strong> {imf.publication_date}
        </p>
      </div>
    </div>
  );
};

export default CapitalMarketsSection;
