import React from 'react';
import { Link } from 'react-router-dom';

const DamnEffectStrategyPage: React.FC = () => {
  const sections = [
    {
      title: 'Pipeline Strategies',
      description: 'Manage and track pipeline investment strategies with detailed parameters and criteria',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      path: '/pipeline',
      color: 'from-indigo-500 to-purple-600',
      features: [
        'Define investment criteria and preferences',
        'Set geographical and sector focus',
        'Manage ticket size parameters',
        'Track strategy performance'
      ]
    },
    {
      title: 'Strategies Sandbox',
      description: 'Experimental workspace for testing and refining investment strategy concepts',
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      path: '/investment-strategies',
      color: 'from-pink-500 to-rose-600',
      features: [
        'Test new strategy frameworks',
        'Match capital partners with sponsors',
        'Analyze investment compatibility',
        'Explore strategic opportunities'
      ]
    },
    {
      title: 'Deals Database',
      description: 'Reference database of precedent transactions and market deals for research and analysis',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/deals',
      color: 'from-emerald-500 to-teal-600',
      features: [
        'Browse precedent transactions',
        'Research comparable deals',
        'Analyze market structures',
        'Reference pricing and terms'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Damn Effect Strategy</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Comprehensive origination and deal management platform for emerging markets infrastructure finance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Introduction Card */}
        <div className="card bg-white border-gray-200 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategic Origination Platform</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The Damn Effect Strategy platform brings together pipeline management, investment matching,
              and deal tracking capabilities. Define your investment strategies, explore opportunities
              through intelligent matching, and manage your deal pipeline all in one integrated system.
            </p>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="group card bg-white border-2 border-gray-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                </svg>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {section.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {section.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Arrow Indicator */}
                <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Open {section.title}</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Workflow Overview */}
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Strategic Workflow</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Define Strategy</h3>
              <p className="text-sm text-gray-600">
                Set investment criteria, preferences, and parameters in Pipeline Strategies
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Match Opportunities</h3>
              <p className="text-sm text-gray-600">
                Use Strategies Sandbox to find compatible partners and sponsors
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Execute Deals</h3>
              <p className="text-sm text-gray-600">
                Track progress and manage participants in Deals Database
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DamnEffectStrategyPage;
