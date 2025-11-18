import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PipelineStrategy {
  id: string;
  name: string;
  stage: string;
  financing_scenarios?: Array<{
    total_value: number;
    currency: string;
  }>;
}

interface PipelineVisualizationProps {
  deals: PipelineStrategy[]; // Renamed for backward compatibility but actually pipeline strategies
  loading?: boolean;
}

const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({ deals: pipelines, loading }) => {
  // Define pipeline stages with British English labels and colors
  const stageConfig: Record<string, { label: string; color: string; order: number }> = {
    ideation: { label: 'Ideation', color: '#94a3b8', order: 1 },
    outreach: { label: 'Outreach', color: '#60a5fa', order: 2 },
    negotiation: { label: 'Negotiation', color: '#3b82f6', order: 3 },
    structuring: { label: 'Structuring', color: '#8b5cf6', order: 4 },
    documentation: { label: 'Documentation', color: '#10b981', order: 5 },
    ready_to_close: { label: 'Ready to Close', color: '#059669', order: 6 }
  };

  // Calculate pipelines by stage
  const pipelinesByStage = Object.keys(stageConfig).map((stage) => {
    const pipelinesInStage = pipelines.filter((p) => p.stage === stage);

    // Calculate total value from financing scenarios
    const totalValue = pipelinesInStage.reduce((sum, p) => {
      const scenarioValue = p.financing_scenarios?.[0]?.total_value || 0;
      return sum + scenarioValue;
    }, 0);

    return {
      stage,
      label: stageConfig[stage].label,
      count: pipelinesInStage.length,
      value: totalValue,
      color: stageConfig[stage].color,
      order: stageConfig[stage].order
    };
  }).sort((a, b) => a.order - b.order);

  // Calculate active pipeline (all stages)
  const activePipeline = pipelinesByStage.reduce((sum, s) => sum + s.count, 0);

  // Calculate total value across all pipelines
  const totalValue = pipelines.reduce((sum, p) => {
    const scenarioValue = p.financing_scenarios?.[0]?.total_value || 0;
    return sum + scenarioValue;
  }, 0);

  // Count pipelines in final stage
  const readyToClose = pipelinesByStage.find((s) => s.stage === 'ready_to_close')?.count || 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg border border-slate-700">
          <p className="font-semibold text-sm mb-1">{data.label}</p>
          <p className="text-xs text-slate-300">Pipelines: {data.count}</p>
          {data.value > 0 && (
            <p className="text-xs text-slate-300">
              Value: ${(data.value / 1000000).toFixed(1)}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Loading pipeline data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Deal Pipeline Visualisation</h2>
        <Link
          to="/pipeline"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View All Pipelines →
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">Total Pipelines</p>
              <p className="text-3xl font-bold text-blue-900">{pipelines.length}</p>
            </div>
            <div className="bg-blue-500 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-700 font-medium mb-1">Active Pipeline</p>
              <p className="text-3xl font-bold text-indigo-900">{activePipeline}</p>
            </div>
            <div className="bg-indigo-500 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium mb-1">Ready to Close</p>
              <p className="text-3xl font-bold text-emerald-900">{readyToClose}</p>
            </div>
            <div className="bg-emerald-500 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium mb-1">Total Value</p>
              <p className="text-2xl font-bold text-purple-900">
                ${totalValue > 0 ? `${(totalValue / 1000000).toFixed(1)}M` : '0'}
              </p>
            </div>
            <div className="bg-purple-500 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Chart */}
      <div className="card bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pipelinesByStage} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: '#334155' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Pipelines">
              {pipelinesByStage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Stage Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-6">
          {pipelinesByStage.map((stage) => (
            <div
              key={stage.stage}
              className="text-center p-3 bg-white rounded-lg border-2 hover:shadow-md transition-all"
              style={{ borderColor: stage.color }}
            >
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: stage.color }}></div>
              <p className="text-xs text-gray-500 font-medium mb-1">{stage.label}</p>
              <p className="text-xl font-bold" style={{ color: stage.color }}>
                {stage.count}
              </p>
              {stage.value > 0 && (
                <p className="text-xs text-gray-500 mt-1">${(stage.value / 1000000).toFixed(1)}M</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Health Indicators */}
      <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pipeline Health</h3>
            <p className="text-sm text-indigo-100">
              {activePipeline > 0
                ? `${activePipeline} active ${activePipeline === 1 ? 'pipeline' : 'pipelines'} moving through stages`
                : 'No active pipelines'}
            </p>
          </div>
          <div className="flex gap-8">
            {readyToClose > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{readyToClose}</p>
                <p className="text-xs text-indigo-200 mt-1">Ready to Close</p>
              </div>
            )}
            {pipelinesByStage.find((s) => s.stage === 'negotiation')?.count! > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {pipelinesByStage.find((s) => s.stage === 'negotiation')?.count}
                </p>
                <p className="text-xs text-indigo-200 mt-1">In Negotiation</p>
              </div>
            )}
            {totalValue > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  ${(totalValue / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-indigo-200 mt-1">Pipeline Value</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualization;
