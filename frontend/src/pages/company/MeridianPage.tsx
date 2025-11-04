import React from 'react';

const Meridian: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">About Meridian</h1>
        <p className="mt-2 text-gray-600">Introduction</p>
      </div>

      {/* Content Placeholder */}
      <div className="card">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Background</h3>
          <p className="text-gray-600">
            Meridian Universal was founded following the terrorist attacks in Sri Lanka in 2019, with the purpose of creating a globally diversified Merchant Banking firm focused in supporting sustainable economic growth that creates prosperity and limits risk of civic instability. This mission has led the firm to build a global distribution of institutional investors and deep expertise in select countries around strategic infrastructure. The Founder, having practiced as an Architect and graduated in Civil Engineering, has implemented these theories in pragmatic national development that helps to plug social gaps and directly contribute to job creation and better social outcomes nationally, using infrastructure, real estate and direct sovereign lending programs as master tools that create market-leading investments whilst executing this mission
          </p>
        </div>
      </div>
    </div>
  );
};

export default Meridian;
