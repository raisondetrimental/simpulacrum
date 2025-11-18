/**
 * Pipeline Service
 * API client for Pipeline strategies endpoints
 */

import { API_BASE_URL } from '../config';
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
  const response = await fetch(`${API_BASE_URL}/api/pipeline`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pipelines');
  }

  return response.json();
};

/**
 * Get a specific pipeline strategy by ID
 */
export const getPipeline = async (pipelineId: string): Promise<PipelineStrategy> => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${pipelineId}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pipeline');
  }

  return response.json();
};

/**
 * Create a new pipeline strategy
 */
export const createPipeline = async (data: CreatePipelineRequest): Promise<PipelineStrategy> => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create pipeline');
  }

  return response.json();
};

/**
 * Update an existing pipeline strategy
 */
export const updatePipeline = async (
  pipelineId: string,
  data: UpdatePipelineRequest
): Promise<PipelineStrategy> => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${pipelineId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update pipeline');
  }

  return response.json();
};

/**
 * Delete a pipeline strategy
 */
export const deletePipeline = async (pipelineId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${pipelineId}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete pipeline');
  }
};

/**
 * Update pipeline stage (for Kanban board)
 */
export const updatePipelineStage = async (
  pipelineId: string,
  stage: PipelineStage
): Promise<PipelineStrategy> => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${pipelineId}/stage`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ stage })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update pipeline stage');
  }

  return response.json();
};

/**
 * Promote a pipeline strategy to a deal in the deals database
 */
export const promotePipelineToDeal = async (
  pipelineId: string
): Promise<{ message: string; deal_id: string; pipeline: PipelineStrategy }> => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${pipelineId}/promote`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to promote pipeline');
  }

  return response.json();
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
