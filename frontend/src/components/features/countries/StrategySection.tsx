/**
 * StrategySection Component
 * Displays development bank strategy (EBRD/ADB)
 */

import React, { useState } from 'react';
import type { CountryCompleteData } from '../../../types/country';
import ExpandableInfoCard from './shared/ExpandableInfoCard';
import { GRID_CONFIGS } from '../../../constants/typography';

interface StrategySectionProps {
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

const StrategySection: React.FC<StrategySectionProps> = ({ data }) => {
  // Check which strategy is available (EBRD or ADB)
  const strategy = data.EBRD_Country_Strategy || data.ADB_Country_Strategy;
  const strategyType = data.EBRD_Country_Strategy ? 'EBRD' : 'ADB';

  if (!strategy) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Development bank strategy data not available for this country.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategic Overview */}
      {strategy.strategic_priorities_overview && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Strategic Priorities</h3>
          <CollapsibleSection
            title="Strategic Priorities Overview"
            content={strategy.strategic_priorities_overview}
            defaultOpen={true}
          />
        </div>
      )}

      {/* Individual Priorities */}
      {(strategy.priority_1 || strategy.priority_2 || strategy.priority_3 || strategy.priority_4) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Strategic Priorities</h3>
          <div className="space-y-4">
            {strategy.priority_1 && (
              <CollapsibleSection
                title="Priority 1"
                content={strategy.priority_1}
                defaultOpen={true}
              />
            )}
            {strategy.priority_2 && (
              <CollapsibleSection
                title="Priority 2"
                content={strategy.priority_2}
              />
            )}
            {strategy.priority_3 && (
              <CollapsibleSection
                title="Priority 3"
                content={strategy.priority_3}
              />
            )}
            {strategy.priority_4 && (
              <CollapsibleSection
                title="Priority 4"
                content={strategy.priority_4}
              />
            )}
          </div>
        </div>
      )}

      {/* EBRD Transition Quality Gaps */}
      {(strategy.competitive_gaps || strategy.well_governed_gaps || strategy.green_gaps ||
        strategy.inclusive_gaps || strategy.resilient_gaps || strategy.integrated_gaps) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Transition Quality Assessment</h3>
          <div className={GRID_CONFIGS.textCards}>
            {strategy.competitive_gaps && (
              <ExpandableInfoCard
                title="Competitive"
                content={strategy.competitive_gaps}
                variant="blue"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            )}
            {strategy.well_governed_gaps && (
              <ExpandableInfoCard
                title="Well-Governed"
                content={strategy.well_governed_gaps}
                variant="purple"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
            )}
            {strategy.green_gaps && (
              <ExpandableInfoCard
                title="Green"
                content={strategy.green_gaps}
                variant="green"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                }
              />
            )}
            {strategy.inclusive_gaps && (
              <ExpandableInfoCard
                title="Inclusive"
                content={strategy.inclusive_gaps}
                variant="orange"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            )}
            {strategy.resilient_gaps && (
              <ExpandableInfoCard
                title="Resilient"
                content={strategy.resilient_gaps}
                variant="red"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
            )}
            {strategy.integrated_gaps && (
              <ExpandableInfoCard
                title="Integrated"
                content={strategy.integrated_gaps}
                variant="indigo"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Cross-Cutting Themes */}
      {strategy.cross_cutting_themes && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Cross-Cutting Themes</h3>
          <CollapsibleSection
            title="Cross-Cutting Themes"
            content={strategy.cross_cutting_themes}
          />
        </div>
      )}

      {/* Policy & Governance */}
      {(strategy.business_climate || strategy.soe_governance || strategy.competition_policy ||
        strategy.ppp_legal_framework || strategy.sector_bottlenecks) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Policy & Governance Framework</h3>
          <div className="space-y-4">
            {strategy.business_climate && (
              <CollapsibleSection title="Business Climate" content={strategy.business_climate} defaultOpen={true} />
            )}
            {strategy.soe_governance && (
              <CollapsibleSection title="SOE Governance" content={strategy.soe_governance} />
            )}
            {strategy.competition_policy && (
              <CollapsibleSection title="Competition Policy" content={strategy.competition_policy} />
            )}
            {strategy.ppp_legal_framework && (
              <CollapsibleSection title="PPP Legal Framework" content={strategy.ppp_legal_framework} />
            )}
            {strategy.sector_bottlenecks && (
              <CollapsibleSection title="Sector Bottlenecks" content={strategy.sector_bottlenecks} />
            )}
            {strategy.policy_dialogue_focus && (
              <CollapsibleSection title="Policy Dialogue Focus" content={strategy.policy_dialogue_focus} />
            )}
          </div>
        </div>
      )}

      {/* Flagship Projects */}
      {(strategy.flagship_projects_summary || strategy.flagship_1_name) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Flagship Projects</h3>
          <div className="space-y-4">
            {strategy.flagship_projects_summary && (
              <CollapsibleSection
                title="Flagship Projects Summary"
                content={strategy.flagship_projects_summary}
              />
            )}

            {/* Flagship Project 1 */}
            {strategy.flagship_1_name && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-bold text-blue-900 mb-4">{strategy.flagship_1_name}</h4>

                {/* Description/Scope */}
                {(strategy.flagship_1_description || strategy.flagship_1_scope) && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Description</h5>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {strategy.flagship_1_description || strategy.flagship_1_scope}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Capex */}
                  {(strategy.flagship_1_capex || strategy.flagship_1_capex_usd) && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase mb-1">Capex</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {strategy.flagship_1_capex || strategy.flagship_1_capex_usd}
                      </p>
                    </div>
                  )}
                  {/* Revenue Model */}
                  {(strategy.flagship_1_revenue || strategy.flagship_1_revenue_model) && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase mb-1">Revenue Model</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {strategy.flagship_1_revenue || strategy.flagship_1_revenue_model}
                      </p>
                    </div>
                  )}
                  {/* Government Support */}
                  {(strategy.flagship_1_government_support || strategy.flagship_1_gov_support) && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase mb-1">Government Support</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {(strategy.flagship_1_government_support || strategy.flagship_1_gov_support || '').substring(0, 50)}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Full Government Support Details */}
                {(strategy.flagship_1_government_support || strategy.flagship_1_gov_support) && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900">
                      View Full Government Support Details
                    </summary>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {strategy.flagship_1_government_support || strategy.flagship_1_gov_support}
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* Flagship Project 2 */}
            {strategy.flagship_2_name && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-bold text-green-900 mb-4">{strategy.flagship_2_name}</h4>

                {strategy.flagship_2_description && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Description</h5>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {strategy.flagship_2_description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regional Cooperation */}
      {strategy.regional_cooperation && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Regional Cooperation & Integration</h3>
          <CollapsibleSection
            title="Regional Cooperation Initiatives"
            content={strategy.regional_cooperation}
          />
        </div>
      )}

      {/* Source Footnote */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Source:</strong> {strategy.source_name} | <strong>Published:</strong> {strategy.publication_date} | <strong>Strategy Period:</strong> {strategy.strategy_period} | <strong>Bank:</strong> {strategyType}
        </p>
      </div>
    </div>
  );
};

export default StrategySection;
