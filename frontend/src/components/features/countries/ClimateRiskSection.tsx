/**
 * ClimateRiskSection Component
 * Displays climate vulnerability, energy transition, and key risks
 */

import React, { useState } from 'react';
import type { CountryCompleteData } from '../../../types/country';

interface ClimateRiskSectionProps {
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

const ClimateRiskSection: React.FC<ClimateRiskSectionProps> = ({ data }) => {
  const imf = data.IMF_Article_IV;
  const imi = data.IMI_Project_Report;

  const hasClimateData = imf?.climate_vulnerability || imf?.energy_transition || imi?.imi_climate_exposure;

  if (!hasClimateData) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Climate vulnerability and risk data not available for this country.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner if High Climate Risk */}
      {imf?.climate_vulnerability && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-red-800 mb-1">Climate Vulnerability Identified</h3>
              <p className="text-sm text-red-700">
                This country has documented climate vulnerabilities that may impact infrastructure and economic development.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Climate Vulnerability Assessment */}
      {imf?.climate_vulnerability && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Climate Vulnerability</h3>
          <CollapsibleSection
            title="Climate Vulnerability Assessment"
            content={imf.climate_vulnerability}
            defaultOpen={true}
          />
        </div>
      )}

      {/* IMI Climate Exposure */}
      {imi?.imi_climate_exposure && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Climate Exposure Analysis</h3>
          <CollapsibleSection
            title="Climate Exposure from Infrastructure Perspective"
            content={imi.imi_climate_exposure}
          />
        </div>
      )}

      {/* Energy Transition */}
      {imf?.energy_transition && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Energy Transition</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-sm font-semibold text-green-900">
                Energy Transition Strategy & Decarbonization Goals
              </p>
            </div>
          </div>
          <CollapsibleSection
            title="Energy Transition Plans"
            content={imf.energy_transition}
            defaultOpen={true}
          />
        </div>
      )}

      {/* Social and Environmental Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {imf?.poverty_inequality && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Poverty & Inequality</h3>
            <CollapsibleSection
              title="Social Context"
              content={imf.poverty_inequality}
            />
          </div>
        )}

        {imf?.social_protection && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Social Protection</h3>
            <CollapsibleSection
              title="Social Safety Nets"
              content={imf.social_protection}
            />
          </div>
        )}
      </div>

      {/* Key Risks Summary */}
      {imf?.key_risks && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Key Risks</h3>
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-5">
            <h4 className="font-bold text-orange-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Risk Assessment
            </h4>
            <p className="text-sm text-orange-800 whitespace-pre-wrap leading-relaxed">{imf.key_risks}</p>
          </div>
        </div>
      )}

      {/* Policy Recommendations */}
      {imf?.policy_recommendations && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Policy Recommendations</h3>
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-5">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommended Actions
            </h4>
            <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">{imf.policy_recommendations}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateRiskSection;
