/**
 * InfrastructureSection Component
 * Displays infrastructure pipeline and IMI project report data
 */

import React, { useState } from 'react';
import type { CountryCompleteData } from '../../../types/country';
import AdaptiveStatCard from './shared/AdaptiveStatCard';

interface InfrastructureSectionProps {
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

const InfrastructureSection: React.FC<InfrastructureSectionProps> = ({ data }) => {
  const imi = data.IMI_Project_Report;

  if (!imi) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Infrastructure project report data not available for this country.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      {imi.imi_overview && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Infrastructure Overview</h3>
          <CollapsibleSection
            title="Market Intelligence Overview"
            content={imi.imi_overview}
            defaultOpen={true}
          />
        </div>
      )}

      {/* Macroeconomic Context */}
      {imi.imi_macroeconomic_context && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Macroeconomic Context</h3>
          <CollapsibleSection
            title="Economic Context for Infrastructure"
            content={imi.imi_macroeconomic_context}
          />
        </div>
      )}

      {/* Infrastructure Assessment */}
      {imi.imi_infrastructure_assessment && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Infrastructure Gap Assessment</h3>
          <CollapsibleSection
            title="Infrastructure Assessment"
            content={imi.imi_infrastructure_assessment}
            defaultOpen={true}
          />
        </div>
      )}

      {/* Pipeline Highlight */}
      {imi.pipeline_total_usd && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Infrastructure Pipeline</h3>
          <AdaptiveStatCard
            title="Total Pipeline Value"
            value={imi.pipeline_total_usd}
          />
        </div>
      )}

      {/* PPP Framework */}
      {(imi.imi_ppp_framework || imi.ppp_law_name || imi.ppp_unit_name) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Public-Private Partnership Framework</h3>

          {/* Narrative PPP Framework */}
          {imi.imi_ppp_framework && (
            <CollapsibleSection
              title="PPP Framework Assessment"
              content={imi.imi_ppp_framework}
              defaultOpen={true}
            />
          )}

        {/* Structured PPP Legal Framework */}
        {(imi.ppp_law_name || imi.sector_laws || imi.procurement_rules) && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-3">PPP Legal Framework</h4>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-5 space-y-3">
              {imi.ppp_law_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">PPP Law</p>
                  <p className="font-semibold text-gray-900">
                    {imi.ppp_law_name}
                    {imi.ppp_law_year && <span className="text-gray-600"> ({imi.ppp_law_year})</span>}
                  </p>
                </div>
              )}
              {imi.sector_laws && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Sector Laws</p>
                  <p className="text-sm text-gray-700">{imi.sector_laws}</p>
                </div>
              )}
              {imi.procurement_rules && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Procurement Rules</p>
                  <p className="text-sm text-gray-700">{imi.procurement_rules}</p>
                </div>
              )}
              {imi.tariff_indexation_rules && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tariff Indexation</p>
                  <p className="text-sm text-gray-700">{imi.tariff_indexation_rules}</p>
                </div>
              )}
              {imi.dispute_resolution && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Dispute Resolution</p>
                  <p className="text-sm text-gray-700">{imi.dispute_resolution}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PPP Institutional Framework */}
        {(imi.ppp_unit_name || imi.fiscal_risk_unit || imi.line_ministry_roles || imi.approval_workflow) && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-3">PPP Institutional Framework</h4>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 space-y-3">
              {imi.ppp_unit_name && (
                <div>
                  <p className="text-xs text-indigo-600 uppercase font-medium">PPP Unit</p>
                  <p className="text-sm text-indigo-900">{imi.ppp_unit_name}</p>
                </div>
              )}
              {imi.fiscal_risk_unit && (
                <div>
                  <p className="text-xs text-indigo-600 uppercase font-medium">Fiscal Risk Management</p>
                  <p className="text-sm text-indigo-900">{imi.fiscal_risk_unit}</p>
                </div>
              )}
              {imi.line_ministry_roles && (
                <div>
                  <p className="text-xs text-indigo-600 uppercase font-medium">Line Ministry Roles</p>
                  <p className="text-sm text-indigo-900">{imi.line_ministry_roles}</p>
                </div>
              )}
              {imi.approval_workflow && (
                <div>
                  <p className="text-xs text-indigo-600 uppercase font-medium">Approval Workflow</p>
                  <p className="text-sm text-indigo-900 whitespace-pre-wrap">{imi.approval_workflow}</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Pipeline Breakdown */}
      {(imi.pipeline_by_sector || imi.pipeline_by_stage) && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Pipeline Breakdown</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {imi.pipeline_by_sector && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  By Sector
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{imi.pipeline_by_sector}</p>
              </div>
            )}
            {imi.pipeline_by_stage && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  By Stage
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{imi.pipeline_by_stage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sovereign Credit */}
      {imi.imi_sovereign_credit && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Sovereign Credit Profile</h3>
          <CollapsibleSection
            title="Sovereign Credit Assessment"
            content={imi.imi_sovereign_credit}
          />
        </div>
      )}

      {/* Legal & Regulatory */}
      {imi.imi_legal_regulatory && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Legal & Regulatory Environment</h3>
          <CollapsibleSection
            title="Legal and Regulatory Framework"
            content={imi.imi_legal_regulatory}
          />
        </div>
      )}

      {/* Source Footnote */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Source:</strong> {imi.source_name} | <strong>Published:</strong> {imi.publication_date}{imi.prepared_by && ` | Prepared by: ${imi.prepared_by}`}
        </p>
      </div>
    </div>
  );
};

export default InfrastructureSection;
