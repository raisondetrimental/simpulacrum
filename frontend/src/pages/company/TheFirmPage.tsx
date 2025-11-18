import React from 'react';

const TheFirmPage: React.FC = () => {
  // ---- data ----
  const theoryDocuments = [
    {
      title: 'Meridian Universal - Operations (Summarised)',
      filename: 'Meridian Universal - Operations - v3.1 (Summarised).pdf',
      description:
        "Condensed overview of Meridian Universal's operational framework and strategic approach",
    },
    {
      title: 'Meridian Universal',
      filename: 'Meridian Universal.pdf',
      description:
        "Comprehensive documentation of Meridian Universal's theory, structure, and methodology",
    },
  ];

  const researchDocuments = [
    {
      title: 'Sustainable Development',
      filename: '01 Sustainable Development.pdf',
      description: 'Research on sustainable development principles and practices',
    },
    {
      title: 'Infrastructure Financing and Sovereign Debt',
      filename: '02 Infrastructure Financing and Sovereign Debt v2.2 (clean).pdf',
      description:
        'Analysis of infrastructure financing mechanisms and sovereign debt markets',
    },
    {
      title: 'Mongolia Sovereign Debt',
      filename: '03 Mongolia Sovereign Debt.pdf',
      description: "In-depth study of Mongolia's sovereign debt profile and outlook",
    },
    {
      title: 'An Analysis of the E in ESG',
      filename: '04 An Analysis of the E in ESG.pdf',
      description: 'Environmental considerations in ESG investment frameworks',
    },
  ];

  // ---- helpers ----
  const openPDF = (folder: 'Firm Theory' | 'Firm Research', filename: string) => {
    const url = `/documents/${folder}/${encodeURIComponent(filename)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ---- render ----
  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">The Firm</h1>
        <p className="mt-2 text-gray-600">
          Meridian Universal — our mission, vision, and capabilities
        </p>
      </div>

      {/* Intro copy */}
      <div className="card p-6 rounded-xl border border-gray-200">
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            Welcome to Meridian Universal. This page provides an overview of our firm, our approach
            to infrastructure and sovereign financing, and our commitment to delivering value to our
            partners and stakeholders.
          </p>
        </div>
      </div>

      {/* Firm Theory */}
      <section aria-labelledby="firm-theory">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 id="firm-theory" className="text-2xl font-bold text-gray-900">
            Firm Theory
          </h2>
          <p className="mt-2 text-gray-600">
            Foundational documents outlining Meridian Universal&apos;s operational theory and
            strategic framework
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theoryDocuments.map((doc, i) => (
            <div
              key={`theory-${i}`}
              className="card p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{doc.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{doc.description}</p>
                <button
                  onClick={() => openPDF('Firm Theory', doc.filename)}
                  className="w-full px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Open PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Firm Research */}
      <section aria-labelledby="firm-research">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 id="firm-research" className="text-2xl font-bold text-gray-900">
            Fundamental Theory Series
          </h2>
          <p className="mt-2 text-gray-600">
            Academic and analytical research conducted by Meridian Universal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchDocuments.map((doc, i) => (
            <div
              key={`research-${i}`}
              className="card p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{doc.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{doc.description}</p>
                <button
                  onClick={() => openPDF('Firm Research', doc.filename)}
                  className="w-full px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Open PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TheFirmPage;
