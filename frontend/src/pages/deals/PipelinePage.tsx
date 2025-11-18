/**
 * Pipeline Page
 * Deal origination workspace for building opportunities from concept to execution
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { PipelineStrategy, PipelineStage } from '../../types/pipeline';
import { getPipelines, deletePipeline } from '../../services/pipelineService';

const PipelinePage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<PipelineStage | 'all'>('all');
  const [filterChampion, setFilterChampion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stages: { value: PipelineStage; label: string; color: string }[] = [
    { value: 'ideation', label: 'Ideation', color: 'bg-gray-100 text-gray-800' },
    { value: 'outreach', label: 'Outreach', color: 'bg-blue-100 text-blue-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'structuring', label: 'Structuring', color: 'bg-orange-100 text-orange-800' },
    { value: 'documentation', label: 'Documentation', color: 'bg-purple-100 text-purple-800' },
    { value: 'ready_to_close', label: 'Ready to Close', color: 'bg-green-100 text-green-800' }
  ];

  const getStageInfo = (stage: PipelineStage) => {
    return stages.find(s => s.value === stage) || stages[0];
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const data = await getPipelines();
      setPipelines(data);
      setError(null);
    } catch (err) {
      setError('Failed to load pipeline strategies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pipelineId: string) => {
    if (!confirm('Are you sure you want to delete this pipeline strategy?')) {
      return;
    }

    try {
      await deletePipeline(pipelineId);
      setPipelines(pipelines.filter(p => p.id !== pipelineId));
    } catch (err) {
      alert('Failed to delete pipeline strategy');
      console.error(err);
    }
  };

  // Get unique lead initials for filter
  const champions = Array.from(new Set(pipelines.map(p => p.lead_initial))).sort();

  // Filter pipelines
  const filteredPipelines = pipelines.filter(pipeline => {
    if (pipeline.archived) return false;
    if (filterStage !== 'all' && pipeline.stage !== filterStage) return false;
    if (filterChampion !== 'all' && pipeline.lead_initial !== filterChampion) return false;
    if (searchQuery && !pipeline.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: filteredPipelines.length,
    totalValue: filteredPipelines.reduce((sum, p) => {
      const preferredScenario = p.financing_scenarios.find(s => s.is_preferred);
      return sum + (preferredScenario?.total_value || 0);
    }, 0),
    byStage: stages.map(stage => ({
      ...stage,
      count: filteredPipelines.filter(p => p.stage === stage.value).length
    }))
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading pipeline strategies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Origination workspace for building opportunities from concept to execution
          </p>
        </div>
        <Link
          to="/pipeline/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + New Pipeline
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Strategies</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-gray-900">
            ${(stats.totalValue / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Active Lead Initials</div>
          <div className="text-2xl font-bold text-gray-900">{champions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Ready to Close</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.byStage.find(s => s.value === 'ready_to_close')?.count || 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as PipelineStage | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Initial</label>
            <select
              value={filterChampion}
              onChange={(e) => setFilterChampion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Lead Initials</option>
              {champions.map(champion => (
                <option key={champion} value={champion}>
                  {champion}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pipeline Cards */}
      {filteredPipelines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No pipeline strategies found</p>
          <Link
            to="/pipeline/new"
            className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create your first pipeline strategy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPipelines.map((pipeline) => {
            const stageInfo = getStageInfo(pipeline.stage);
            const preferredScenario = pipeline.financing_scenarios.find(s => s.is_preferred);

            return (
              <div
                key={pipeline.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <Link
                      to={`/pipeline/${pipeline.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {pipeline.name}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      Lead Initial: {pipeline.lead_initial}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageInfo.color}`}>
                    {stageInfo.label}
                  </span>
                </div>

                {/* Deal Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {preferredScenario && (
                    <div className="text-gray-700">
                      <strong>Value:</strong> {preferredScenario.currency} {(preferredScenario.total_value / 1000000).toFixed(1)}M
                    </div>
                  )}
                  {pipeline.target_country && (
                    <div className="text-gray-700">
                      <strong>Country:</strong> {pipeline.target_country}
                    </div>
                  )}
                  {pipeline.deal_type && (
                    <div className="text-gray-700">
                      <strong>Type:</strong> {pipeline.deal_type}
                    </div>
                  )}
                </div>

                {/* Parties Count */}
                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">{pipeline.lenders.length}</span> Lenders
                  </div>
                  <div>
                    <span className="font-medium">{pipeline.advisors.length}</span> Advisors
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Updated {new Date(pipeline.last_updated).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/pipeline/${pipeline.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(pipeline.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PipelinePage;
