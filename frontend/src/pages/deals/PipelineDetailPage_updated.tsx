/**
 * Pipeline Detail Page - UPDATED VERSION
 * Create/edit pipeline strategies with organization selection and financing structures
 * This is an updated version with improved financing scenarios matching deals structure
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type {
  PipelineStrategy,
  CreatePipelineRequest,
  PipelineStage,
  CommitmentLevel,
  LenderRole,
  AdvisorType,
  FinancingScenario,
  FinancingType
} from '../../types/pipeline';
import { getPipeline, createPipeline, updatePipeline } from '../../services/pipelineService';
import { getCapitalPartners } from '../../services/capitalPartnersService';
import { getCorporates } from '../../services/sponsorsService';
import { getLegalAdvisors } from '../../services/counselService';
import { getAgents } from '../../services/agentsService';
import { ALL_COUNTRIES } from '../../constants/countries';

interface Organization {
  id: string;
  name: string;
  organization_type: string;
  country?: string;
}

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'structuring', label: 'Structuring' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'ready_to_close', label: 'Ready to Close' }
];

const COMMITMENT_LEVELS: { value: CommitmentLevel; label: string }[] = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'interested', label: 'Interested' },
  { value: 'committed', label: 'Committed' },
  { value: 'signed', label: 'Signed' }
];

const LENDER_ROLES: { value: LenderRole; label: string }[] = [
  { value: 'lead_arranger', label: 'Lead Arranger' },
  { value: 'co_arranger', label: 'Co-Arranger' },
  { value: 'participant', label: 'Participant' }
];

const ADVISOR_TYPES: { value: AdvisorType; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'technical', label: 'Technical' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'financial', label: 'Financial' }
];

const FINANCING_TYPES: { value: FinancingType; label: string }[] = [
  { value: 'debt', label: 'Debt / Project Finance' },
  { value: 'equity', label: 'Equity' },
  { value: 'mezzanine', label: 'Mezzanine' },
  { value: 'hybrid', label: 'Hybrid' }
];

const DEAL_STRUCTURES = [
  'Senior Secured',
  'Senior Unsecured',
  'Subordinated',
  'Convertible',
  'Mezzanine',
  'PIK Toggle',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'Other'];

// Add the rest of the component here - I'll show the key changes in the financing scenarios section
// (This file is just for reference - we'll update the actual PipelineDetailPage.tsx)
