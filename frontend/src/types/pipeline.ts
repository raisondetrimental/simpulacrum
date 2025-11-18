/**
 * Pipeline Strategy Types
 * Deal origination pipeline with party orchestration and financing structures
 */

export type PipelineStage =
  | 'ideation'
  | 'outreach'
  | 'negotiation'
  | 'structuring'
  | 'documentation'
  | 'ready_to_close';

export type CommitmentLevel =
  | 'exploring'
  | 'interested'
  | 'committed'
  | 'signed';

export type LenderRole =
  | 'lead_arranger'
  | 'co_arranger'
  | 'participant';

export type AdvisorType =
  | 'legal'
  | 'technical'
  | 'insurance'
  | 'financial';

export type DealQualityRating = 'A' | 'B' | 'C';

export interface PipelineSponsor {
  organization_id: string;
  commitment_level: CommitmentLevel;
  last_contact_date?: string;
  next_action?: string;
  notes?: string;
}

export interface PipelineLender {
  organization_id: string;
  role: LenderRole;
  participation_percentage: number;
  commitment_level: CommitmentLevel;
  last_contact_date?: string;
  notes?: string;
}

export interface PipelineAdvisor {
  organization_id: string;
  advisor_type: AdvisorType;
  commitment_level: CommitmentLevel;
}

export type FinancingType = 'debt' | 'equity' | 'mezzanine' | 'hybrid';

export interface FinancingScenario {
  name: string; // "Base Case", "Aggressive", "Conservative"
  is_preferred: boolean;
  financing_type: FinancingType;
  total_value: number;
  currency: string;

  // Debt-specific fields
  structure?: string; // Senior Secured, Subordinated, etc.
  maturity?: string;
  pricing?: string;
  spread_bps?: number;
  all_in_rate?: number;
  upfront_fee_bps?: number;
  commitment_fee_bps?: number;
  agency_fee?: number;
  security_package?: string;

  // Equity-specific fields
  equity_percentage?: number;
  pre_money_valuation?: number;
  post_money_valuation?: number;
  target_irr?: number;
  target_multiple?: number;
  liquidation_preference?: string;
  board_seats?: number;
  governance_rights?: string;
  drag_along_rights?: boolean;
  tag_along_rights?: boolean;
  anti_dilution_protection?: string;

  // Mezzanine-specific fields
  pik_rate?: number;
  equity_kicker?: number;
  warrant_coverage?: number;
  conversion_price?: number;
  conversion_ratio?: string;
  redemption_premium?: number;
}

export interface PipelineMilestone {
  name: string;
  due_date: string;
  completed: boolean;
  completed_date?: string;
}

export interface PipelineActivityLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface PipelineNote {
  id: string;
  user: string;
  timestamp: string;
  content: string;
  mentions?: string[];
}

export interface PipelineDocument {
  name: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface PipelineStrategy {
  id: string;
  name: string;
  lead_initial: string;
  stage: PipelineStage;
  created_at: string;
  last_updated: string;

  // Parties
  sponsor: PipelineSponsor;
  lenders: PipelineLender[];
  advisors: PipelineAdvisor[];

  // Deal structure
  deal_type: string;
  financing_scenarios: FinancingScenario[];

  // Intelligence
  target_country: string;
  sector: string;
  risk_score?: number;
  feasibility_flags: string[];
  deal_quality_rating?: DealQualityRating;

  // Tracking
  target_close_date: string;
  milestones: PipelineMilestone[];

  // Collaboration
  activity_log: PipelineActivityLog[];
  notes: PipelineNote[];
  documents: PipelineDocument[];

  // Outcomes
  promoted_to_deal_id?: string | null;
  archived: boolean;
  archive_reason: string;

  // Related deals (precedent transactions)
  related_deals: string[]; // Array of deal IDs
}

export interface CreatePipelineRequest {
  name: string;
  lead_initial?: string;
  stage?: PipelineStage;
  sponsor?: PipelineSponsor;
  lenders?: PipelineLender[];
  advisors?: PipelineAdvisor[];
  deal_type?: string;
  financing_scenarios?: FinancingScenario[];
  target_country?: string;
  sector?: string;
  risk_score?: number;
  feasibility_flags?: string[];
  deal_quality_rating?: DealQualityRating;
  target_close_date?: string;
  milestones?: PipelineMilestone[];
  notes?: PipelineNote[];
  documents?: PipelineDocument[];
  related_deals?: string[];
}

export interface UpdatePipelineRequest extends Partial<CreatePipelineRequest> {
  promoted_to_deal_id?: string | null;
  archived?: boolean;
  archive_reason?: string;
}
