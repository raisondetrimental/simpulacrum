/**
 * Pipeline Service
 * API client for Pipeline strategies endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete, apiFetch } from './api';
import type {
  PipelineStrategy,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  PipelineStage
} from '../types/pipeline';

/**
 * Get all pipeline strategies
 */
export const getPipelines = async (): Promise<PipelineStrategy[]> => {
  const result = await apiGet<PipelineStrategy[]>('/api/pipeline');
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch pipelines');
  }
  return result.data;
};

/**
 * Get a specific pipeline strategy by ID
 */
export const getPipeline = async (pipelineId: string): Promise<PipelineStrategy> => {
  const result = await apiGet<PipelineStrategy>(`/api/pipeline/${pipelineId}`);
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch pipeline');
  }
  return result.data;
};

/**
 * Create a new pipeline strategy
 */
export const createPipeline = async (data: CreatePipelineRequest): Promise<PipelineStrategy> => {
  const result = await apiPost<PipelineStrategy>('/api/pipeline', data);
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to create pipeline');
  }
  return result.data;
};

/**
 * Update an existing pipeline strategy
 */
export const updatePipeline = async (
  pipelineId: string,
  data: UpdatePipelineRequest
): Promise<PipelineStrategy> => {
  const result = await apiPut<PipelineStrategy>(`/api/pipeline/${pipelineId}`, data);
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to update pipeline');
  }
  return result.data;
};

/**
 * Delete a pipeline strategy
 */
export const deletePipeline = async (pipelineId: string): Promise<void> => {
  const result = await apiDelete(`/api/pipeline/${pipelineId}`);
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete pipeline');
  }
};

/**
 * Update pipeline stage (for Kanban board)
 */
export const updatePipelineStage = async (
  pipelineId: string,
  stage: PipelineStage
): Promise<PipelineStrategy> => {
  const result = await apiFetch<PipelineStrategy>(`/api/pipeline/${pipelineId}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage })
  });
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to update pipeline stage');
  }
  return result.data;
};

/**
 * Promote a pipeline strategy to a deal in the deals database
 */
export const promotePipelineToDeal = async (
  pipelineId: string
): Promise<{ message: string; deal_id: string; pipeline: PipelineStrategy }> => {
  const result = await apiPost<{ message: string; deal_id: string; pipeline: PipelineStrategy }>(
    `/api/pipeline/${pipelineId}/promote`
  );
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to promote pipeline');
  }
  return result.data;
};

/**
 * Helper: Get pipelines filtered by stage
 */
export const getPipelinesByStage = async (stage: PipelineStage): Promise<PipelineStrategy[]> => {
  const pipelines = await getPipelines();
  return pipelines.filter(p => p.stage === stage);
};

/**
 * Helper: Get pipelines filtered by lead initial
 */
export const getPipelinesByChampion = async (champion: string): Promise<PipelineStrategy[]> => {
  const pipelines = await getPipelines();
  return pipelines.filter(p => p.lead_initial === champion);
};

/**
 * Helper: Get active (non-archived) pipelines
 */
export const getActivePipelines = async (): Promise<PipelineStrategy[]> => {
  const pipelines = await getPipelines();
  return pipelines.filter(p => !p.archived);
};

/**
 * Helper: Get archived pipelines
 */
export const getArchivedPipelines = async (): Promise<PipelineStrategy[]> => {
  const pipelines = await getPipelines();
  return pipelines.filter(p => p.archived);
};
