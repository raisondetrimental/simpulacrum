/**
 * TypeScript types for Deals Module
 * Comprehensive deal tracking with many-to-many participant relationships
 */

// ============================================================================
// Deal Types
// ============================================================================

export type DealStatus = 'pipeline' | 'active' | 'closed' | 'cancelled';

export type DealType =
  | 'project_finance'
  | 'corporate_loan'
  | 'bond'
  | 'mezzanine'
  | 'equity'
  | 'bridge_loan'
  | 'term_loan'
  | 'revolving_credit'
  | 'hybrid'
  | 'other';

export type DealSector =
  | 'energy'
  | 'transport'
  | 'social'
  | 'telecom'
  | 'water'
  | 'digital'
  | 'real_estate'
  | 'other';

export type DealRegion =
  | 'US'
  | 'Europe Developed'
  | 'Asia Developed'
  | 'Emerging Markets'
  | 'Asia EM'
  | 'Africa EM'
  | 'LATAM EM'
  | 'EMEA EM'
  | 'Other';

export type DealStructure =
  | 'Senior Secured'
  | 'Senior Unsecured'
  | 'Subordinated'
  | 'Mezzanine'
  | 'Hybrid'
  | 'Convertible'
  | 'Bridge Loan'
  | 'Term Loan'
  | 'Revolving Credit'
  | 'Bond'
  | 'Other';

export type SyndicationType = 'club' | 'underwritten' | 'best_efforts' | 'bilateral' | 'other';

// ============================================================================
// Deal Interface (Main Record)
// ============================================================================

export interface Deal {
  // Identification
  id: string;
  deal_name: string;
  deal_number: string;

  // Dates
  deal_date: string;
  signing_date: string;
  closing_date: string;
  first_drawdown_date: string;
  maturity_date: string;

  // Classification
  status: DealStatus;
  deal_type: DealType;
  sector: DealSector;
  sub_sector: string;
  country: string;
  region: DealRegion;

  // Financial Terms
  total_size: number;
  currency: string;
  structure: DealStructure;
  pricing: string;
  spread_bps: number;
  all_in_rate: number;
  maturity: string;

  // Fees
  upfront_fee_bps: number;
  commitment_fee_bps: number;
  agency_fee: number;

  // Covenants & Terms
  covenants: Record<string, any>;

  // Security & Guarantees
  security_package: string;
  guarantees: string[];

  // Project Details
  project_name: string;
  project_capacity: string;
  project_description: string;

  // Documentation
  description: string;
  notes: string;
  key_risks: string;
  mitigants: string;

  // Syndication
  syndication_type: SyndicationType;
  lead_arranger_id: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  deal_team_members: string[];
}

// ============================================================================
// Deal Participant Types
// ============================================================================

export type ParticipantEntityType = 'capital_partner' | 'corporate' | 'legal_advisor' | 'agent';

export type ParticipantRole =
  // Capital Partner & Team Roles
  | 'lender'
  | 'arranger'
  | 'lead_arranger'
  | 'agent'
  | 'bookrunner'
  | 'underwriter'
  | 'guarantor'
  | 'investor'
  // Corporate Roles
  | 'sponsor'
  | 'borrower'
  | 'offtaker'
  | 'epc_contractor'
  | 'operator'
  // Legal Advisor Roles
  | 'lender_counsel'
  | 'sponsor_counsel'
  | 'agent_counsel'
  | 'general_counsel'
  // Agent Roles
  | 'placement_agent'
  | 'settlement_agent'
  | 'clearing_agent'
  | 'trustee'
  | 'paying_agent'
  | 'fiscal_agent'
  | 'administrative_agent'
  | 'collateral_agent';

export type ParticipantSeniority = 'senior' | 'mezzanine' | 'subordinated' | 'equity' | 'other';

export type ParticipantStatus =
  | 'committed'
  | 'funded'
  | 'active'
  | 'repaid'
  | 'sold'
  | 'cancelled';

export type TicketSizeCategory = 'small' | 'medium' | 'large';

// ============================================================================
// Deal Participant Interface (Junction Table)
// ============================================================================

export interface DealParticipant {
  // Identification
  id: string;
  deal_id: string;

  // Entity Reference
  entity_type: ParticipantEntityType;
  entity_id: string;

  // Role & Participation
  role: ParticipantRole;
  role_detail: string;

  // Financial Commitment
  commitment_amount: number;
  funded_amount: number;
  participation_pct: number;
  hold_amount: number;
  sold_amount: number;

  // Terms
  seniority: ParticipantSeniority;
  ticket_size_category: TicketSizeCategory;

  // Dates
  commitment_date: string;
  funded_date: string;

  // Status
  status: ParticipantStatus;

  // Notes
  notes: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Enhanced Types with Joined Data
// ============================================================================

export interface DealWithParticipants extends Deal {
  participants?: DealParticipant[];
  participants_count?: number;
  total_commitments?: number;
}

export interface DealParticipantWithEntity extends DealParticipant {
  // Enriched entity details
  entity_name?: string;
  entity_details?: {
    name?: string;
    type?: string;
    country?: string;
    headquarters_location?: string;
    relationship?: string;
  };
}

export interface DealWithEnrichedParticipants extends Deal {
  participants?: DealParticipantWithEntity[];
  lenders?: DealParticipantWithEntity[];
  sponsors?: DealParticipantWithEntity[];
  counsel?: DealParticipantWithEntity[];
  participants_count?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DealResponse {
  success: boolean;
  data?: Deal;
  message?: string;
}

export interface DealsListResponse {
  success: boolean;
  data?: Deal[];
  count?: number;
  message?: string;
}

export interface DealWithParticipantsResponse {
  success: boolean;
  data?: DealWithParticipants;
  message?: string;
}

export interface DealParticipantsResponse {
  success: boolean;
  data?: DealParticipant[];
  count?: number;
  message?: string;
}

export interface DealParticipantResponse {
  success: boolean;
  data?: DealParticipant;
  message?: string;
}

export interface DealStatisticsResponse {
  success: boolean;
  data?: {
    total_deals: number;
    by_status: Record<DealStatus, number>;
    by_sector: Record<string, number>;
    by_region: Record<string, number>;
    total_value_by_currency: Record<string, number>;
    avg_deal_size_usd: number;
    recent_activity: Deal[];
  };
  message?: string;
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface DealFormData {
  deal_name: string;
  deal_number?: string;
  deal_date?: string;
  signing_date?: string;
  closing_date?: string;
  first_drawdown_date?: string;
  maturity_date?: string;
  status: DealStatus;
  deal_type?: DealType;
  sector?: DealSector;
  sub_sector?: string;
  country?: string;
  region?: DealRegion;
  total_size?: number;
  currency: string;
  structure?: DealStructure;
  pricing?: string;
  spread_bps?: number;
  all_in_rate?: number;
  maturity?: string;
  upfront_fee_bps?: number;
  commitment_fee_bps?: number;
  agency_fee?: number;
  covenants?: Record<string, any>;
  security_package?: string;
  guarantees?: string[];
  project_name?: string;
  project_capacity?: string;
  project_description?: string;
  description?: string;
  notes?: string;
  key_risks?: string;
  mitigants?: string;
  syndication_type?: SyndicationType;
  lead_arranger_id?: string;
  deal_team_members?: string[];
}

export interface DealParticipantFormData {
  deal_id: string;
  entity_type: ParticipantEntityType;
  entity_id: string;
  role: ParticipantRole;
  role_detail?: string;
  commitment_amount?: number;
  funded_amount?: number;
  participation_pct?: number;
  hold_amount?: number;
  sold_amount?: number;
  seniority?: ParticipantSeniority;
  ticket_size_category?: TicketSizeCategory;
  commitment_date?: string;
  funded_date?: string;
  status?: ParticipantStatus;
  notes?: string;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface DealFilters {
  status?: DealStatus | DealStatus[];
  deal_type?: DealType | DealType[];
  sector?: DealSector | DealSector[];
  region?: DealRegion | DealRegion[];
  country?: string;
  currency?: string;
  min_size?: number;
  max_size?: number;
  date_from?: string;
  date_to?: string;
  search?: string; // Search in deal_name, project_name, description
}

export interface DealSearchRequest {
  filters?: DealFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const DEAL_STATUSES: DealStatus[] = ['pipeline', 'active', 'closed', 'cancelled'];

export const DEAL_TYPES: DealType[] = [
  'project_finance',
  'corporate_loan',
  'bond',
  'mezzanine',
  'equity',
  'bridge_loan',
  'term_loan',
  'revolving_credit',
  'hybrid',
  'other',
];

export const DEAL_SECTORS: DealSector[] = [
  'energy',
  'transport',
  'social',
  'telecom',
  'water',
  'digital',
  'real_estate',
  'other',
];

export const DEAL_SUB_SECTORS: Record<DealSector, string[]> = {
  energy: ['renewable_solar', 'renewable_wind', 'renewable_hydro', 'oil_gas', 'nuclear', 'thermal', 'other'],
  transport: ['rail', 'road', 'aviation', 'ports', 'logistics', 'other'],
  social: ['healthcare', 'education', 'housing', 'other'],
  telecom: ['mobile', 'broadband', 'data_centers', 'towers', 'other'],
  water: ['treatment', 'distribution', 'desalination', 'other'],
  digital: ['fiber', 'cloud', 'software', 'other'],
  real_estate: ['commercial', 'residential', 'industrial', 'other'],
  other: ['other'],
};

export const DEAL_STRUCTURES: DealStructure[] = [
  'Senior Secured',
  'Senior Unsecured',
  'Subordinated',
  'Mezzanine',
  'Hybrid',
  'Convertible',
  'Bridge Loan',
  'Term Loan',
  'Revolving Credit',
  'Bond',
  'Other',
];

export const DEAL_REGIONS: DealRegion[] = [
  'US',
  'Europe Developed',
  'Asia Developed',
  'Emerging Markets',
  'Asia EM',
  'Africa EM',
  'LATAM EM',
  'EMEA EM',
  'Other',
];

export const SYNDICATION_TYPES: SyndicationType[] = [
  'club',
  'underwritten',
  'best_efforts',
  'bilateral',
  'other',
];

export const PARTICIPANT_ENTITY_TYPES: ParticipantEntityType[] = [
  'capital_partner',
  'corporate',
  'legal_advisor',
  'agent',
];

export const PARTICIPANT_ROLES_BY_ENTITY: Record<ParticipantEntityType, ParticipantRole[]> = {
  capital_partner: [
    'lender',
    'arranger',
    'lead_arranger',
    'agent',
    'bookrunner',
    'underwriter',
    'guarantor',
    'investor',
  ],
  corporate: ['sponsor', 'borrower', 'guarantor', 'offtaker', 'epc_contractor', 'operator'],
  legal_advisor: ['lender_counsel', 'sponsor_counsel', 'agent_counsel', 'general_counsel'],
  agent: [
    'placement_agent',
    'underwriter',
    'settlement_agent',
    'clearing_agent',
    'trustee',
    'paying_agent',
    'fiscal_agent',
    'administrative_agent',
    'collateral_agent',
  ],
};

export const PARTICIPANT_SENIORITY_OPTIONS: ParticipantSeniority[] = [
  'senior',
  'mezzanine',
  'subordinated',
  'equity',
  'other',
];

export const PARTICIPANT_STATUS_OPTIONS: ParticipantStatus[] = [
  'committed',
  'funded',
  'active',
  'repaid',
  'sold',
  'cancelled',
];

export const TICKET_SIZE_CATEGORIES: TicketSizeCategory[] = ['small', 'medium', 'large'];

export const DEAL_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'VND', 'TRY', 'MNT', 'UZS', 'AMD', 'Other'
];

// ============================================================================
// Display Labels
// ============================================================================

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  pipeline: 'Pipeline',
  active: 'Active',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  pipeline: 'bg-blue-100 text-blue-800 border-blue-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  closed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  project_finance: 'Project Finance',
  corporate_loan: 'Corporate Loan',
  bond: 'Bond',
  mezzanine: 'Mezzanine',
  equity: 'Equity',
  bridge_loan: 'Bridge Loan',
  term_loan: 'Term Loan',
  revolving_credit: 'Revolving Credit',
  hybrid: 'Hybrid',
  other: 'Other',
};

export const PARTICIPANT_ROLE_LABELS: Record<ParticipantRole, string> = {
  lender: 'Lender',
  arranger: 'Arranger',
  lead_arranger: 'Lead Arranger',
  agent: 'Agent',
  bookrunner: 'Bookrunner',
  underwriter: 'Underwriter',
  guarantor: 'Guarantor',
  investor: 'Investor',
  sponsor: 'Sponsor',
  borrower: 'Borrower',
  offtaker: 'Offtaker',
  epc_contractor: 'EPC Contractor',
  operator: 'Operator',
  lender_counsel: 'Lender Counsel',
  sponsor_counsel: 'Sponsor Counsel',
  agent_counsel: 'Agent Counsel',
  general_counsel: 'General Counsel',
  placement_agent: 'Placement Agent',
  settlement_agent: 'Settlement Agent',
  clearing_agent: 'Clearing Agent',
  trustee: 'Trustee',
  paying_agent: 'Paying Agent',
  fiscal_agent: 'Fiscal Agent',
  administrative_agent: 'Administrative Agent',
  collateral_agent: 'Collateral Agent',
};

export const PARTICIPANT_ENTITY_TYPE_LABELS: Record<ParticipantEntityType, string> = {
  capital_partner: 'Capital Partner',
  corporate: 'Corporate/Sponsor',
  legal_advisor: 'Legal Advisor',
  agent: 'Transaction Agent',
};

export const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
  committed: 'Committed',
  funded: 'Funded',
  active: 'Active',
  repaid: 'Repaid',
  sold: 'Sold',
  cancelled: 'Cancelled',
};

export const PARTICIPANT_STATUS_COLORS: Record<ParticipantStatus, string> = {
  committed: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  funded: 'bg-blue-100 text-blue-800 border-blue-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  repaid: 'bg-gray-100 text-gray-800 border-gray-300',
  sold: 'bg-purple-100 text-purple-800 border-purple-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format deal size for display
 */
export function formatDealSize(size: number, currency: string): string {
  if (size >= 1_000_000_000) {
    return `${currency} ${(size / 1_000_000_000).toFixed(2)}B`;
  } else if (size >= 1_000_000) {
    return `${currency} ${(size / 1_000_000).toFixed(2)}M`;
  } else if (size >= 1_000) {
    return `${currency} ${(size / 1_000).toFixed(2)}K`;
  }
  return `${currency} ${size.toLocaleString()}`;
}

/**
 * Calculate participation percentage
 */
export function calculateParticipationPercentage(commitment: number, totalSize: number): number {
  if (totalSize === 0) return 0;
  return Math.round((commitment / totalSize) * 100 * 100) / 100; // Round to 2 decimals
}

/**
 * Format date for display
 */
export function formatDealDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClass(status: DealStatus): string {
  return DEAL_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get participant status badge classes
 */
export function getParticipantStatusBadgeClass(status: ParticipantStatus): string {
  return PARTICIPANT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Validate deal form data
 */
export function validateDealForm(data: Partial<DealFormData>): string[] {
  const errors: string[] = [];

  if (!data.deal_name || data.deal_name.trim() === '') {
    errors.push('Deal name is required');
  }

  if (!data.currency || data.currency.trim() === '') {
    errors.push('Currency is required');
  }

  if (!data.status) {
    errors.push('Status is required');
  }

  if (data.total_size && data.total_size < 0) {
    errors.push('Total size must be a positive number');
  }

  if (data.spread_bps && data.spread_bps < 0) {
    errors.push('Spread (bps) must be a positive number');
  }

  return errors;
}

/**
 * Validate participant form data
 */
export function validateParticipantForm(data: Partial<DealParticipantFormData>): string[] {
  const errors: string[] = [];

  if (!data.deal_id) {
    errors.push('Deal ID is required');
  }

  if (!data.entity_type) {
    errors.push('Entity type is required');
  }

  if (!data.entity_id) {
    errors.push('Entity is required');
  }

  if (!data.role) {
    errors.push('Role is required');
  }

  if (data.commitment_amount && data.commitment_amount < 0) {
    errors.push('Commitment amount must be a positive number');
  }

  if (data.funded_amount && data.funded_amount < 0) {
    errors.push('Funded amount must be a positive number');
  }

  if (data.participation_pct && (data.participation_pct < 0 || data.participation_pct > 100)) {
    errors.push('Participation percentage must be between 0 and 100');
  }

  return errors;
}
