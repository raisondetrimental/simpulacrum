/**
 * Deals Service
 * API client for deals and deal participants management
 */
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';
import type {
  Deal,
  DealFormData,
  DealParticipant,
  DealParticipantFormData,
  DealWithParticipants,
  DealsListResponse,
  DealResponse,
  DealWithParticipantsResponse,
  DealParticipantsResponse,
  DealParticipantResponse,
  DealStatisticsResponse,
  DealSearchRequest,
  DealFilters,
} from '../types/deals';

// ============================================================================
// Deals CRUD
// ============================================================================

/**
 * Get all deals with optional filters
 */
export async function getDeals(filters?: DealFilters): Promise<ApiResponse<Deal[]>> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach(s => params.append('status', s));
    }
    if (filters.deal_type) {
      const types = Array.isArray(filters.deal_type) ? filters.deal_type : [filters.deal_type];
      types.forEach(t => params.append('deal_type', t));
    }
    if (filters.sector) {
      const sectors = Array.isArray(filters.sector) ? filters.sector : [filters.sector];
      sectors.forEach(s => params.append('sector', s));
    }
    if (filters.region) {
      const regions = Array.isArray(filters.region) ? filters.region : [filters.region];
      regions.forEach(r => params.append('region', r));
    }
    if (filters.country) params.append('country', filters.country);
    if (filters.currency) params.append('currency', filters.currency);
    if (filters.min_size) params.append('min_size', filters.min_size.toString());
    if (filters.max_size) params.append('max_size', filters.max_size.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet(`/api/deals${query}`);
}

/**
 * Get a single deal by ID
 */
export async function getDeal(dealId: string): Promise<ApiResponse<DealWithParticipants>> {
  return apiGet(`/api/deals/${dealId}`);
}

/**
 * Create a new deal
 */
export async function createDeal(data: DealFormData): Promise<ApiResponse<Deal>> {
  return apiPost('/api/deals', data);
}

/**
 * Update an existing deal
 */
export async function updateDeal(dealId: string, data: Partial<DealFormData>): Promise<ApiResponse<Deal>> {
  return apiPut(`/api/deals/${dealId}`, data);
}

/**
 * Delete a deal (cascades to participants)
 */
export async function deleteDeal(dealId: string): Promise<ApiResponse> {
  return apiDelete(`/api/deals/${dealId}`);
}

/**
 * Get deal statistics
 */
export async function getDealStatistics(): Promise<DealStatisticsResponse> {
  return apiGet('/api/deals/statistics');
}

/**
 * Advanced deal search
 */
export async function searchDeals(searchRequest: DealSearchRequest): Promise<ApiResponse<Deal[]>> {
  return apiPost('/api/deals/search', searchRequest);
}

// ============================================================================
// Deal Participants
// ============================================================================

/**
 * Get all participants for a deal
 */
export async function getDealParticipants(dealId: string): Promise<ApiResponse<DealParticipant[]>> {
  return apiGet(`/api/deals/${dealId}/participants`);
}

/**
 * Add a participant to a deal
 */
export async function addDealParticipant(
  dealId: string,
  data: DealParticipantFormData
): Promise<ApiResponse<DealParticipant>> {
  return apiPost(`/api/deals/${dealId}/participants`, data);
}

/**
 * Update a deal participant
 */
export async function updateDealParticipant(
  dealId: string,
  participantId: string,
  data: Partial<DealParticipantFormData>
): Promise<ApiResponse<DealParticipant>> {
  return apiPut(`/api/deals/${dealId}/participants/${participantId}`, data);
}

/**
 * Remove a participant from a deal
 */
export async function removeDealParticipant(dealId: string, participantId: string): Promise<ApiResponse> {
  return apiDelete(`/api/deals/${dealId}/participants/${participantId}`);
}

/**
 * Get lender participants for a deal
 */
export async function getDealLenders(dealId: string): Promise<ApiResponse<DealParticipant[]>> {
  return apiGet(`/api/deals/${dealId}/participants/lenders`);
}

/**
 * Get sponsor participants for a deal
 */
export async function getDealSponsors(dealId: string): Promise<ApiResponse<DealParticipant[]>> {
  return apiGet(`/api/deals/${dealId}/participants/sponsors`);
}

/**
 * Get counsel participants for a deal
 */
export async function getDealCounsel(dealId: string): Promise<ApiResponse<DealParticipant[]>> {
  return apiGet(`/api/deals/${dealId}/participants/counsel`);
}

// ============================================================================
// Reverse Lookups (Entity → Deals)
// ============================================================================

/**
 * Get all deals for a capital partner
 */
export async function getCapitalPartnerDeals(partnerId: string): Promise<ApiResponse<DealWithParticipants[]>> {
  return apiGet(`/api/capital-partners/${partnerId}/deals`);
}

/**
 * Get all deals for an investment team
 */
export async function getTeamDeals(teamId: string): Promise<ApiResponse<DealWithParticipants[]>> {
  return apiGet(`/api/teams/${teamId}/deals`);
}

/**
 * Get all deals for a corporate/sponsor
 */
export async function getCorporateDeals(corporateId: string): Promise<ApiResponse<DealWithParticipants[]>> {
  return apiGet(`/api/corporates/${corporateId}/deals`);
}

/**
 * Get all deals for a legal advisor
 */
export async function getLegalAdvisorDeals(advisorId: string): Promise<ApiResponse<DealWithParticipants[]>> {
  return apiGet(`/api/legal-advisors/${advisorId}/deals`);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get deal by ID and separate participants by role
 */
export async function getDealWithSeparatedParticipants(dealId: string): Promise<{
  deal: DealWithParticipants | null;
  lenders: DealParticipant[];
  sponsors: DealParticipant[];
  counsel: DealParticipant[];
  error?: string;
}> {
  try {
    const [dealResponse, lendersResponse, sponsorsResponse, counselResponse] = await Promise.all([
      getDeal(dealId),
      getDealLenders(dealId),
      getDealSponsors(dealId),
      getDealCounsel(dealId),
    ]);

    if (!dealResponse.success || !dealResponse.data) {
      return {
        deal: null,
        lenders: [],
        sponsors: [],
        counsel: [],
        error: dealResponse.message || 'Failed to load deal',
      };
    }

    return {
      deal: dealResponse.data,
      lenders: lendersResponse.data || [],
      sponsors: sponsorsResponse.data || [],
      counsel: counselResponse.data || [],
    };
  } catch (error) {
    return {
      deal: null,
      lenders: [],
      sponsors: [],
      counsel: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all entities that participated in a deal (for display purposes)
 */
export async function getDealEntitiesSummary(dealId: string): Promise<{
  capital_partners: string[];
  teams: string[];
  corporates: string[];
  legal_advisors: string[];
}> {
  const response = await getDealParticipants(dealId);

  if (!response.success || !response.data) {
    return {
      capital_partners: [],
      teams: [],
      corporates: [],
      legal_advisors: [],
    };
  }

  const entities = {
    capital_partners: new Set<string>(),
    teams: new Set<string>(),
    corporates: new Set<string>(),
    legal_advisors: new Set<string>(),
  };

  response.data.forEach((participant) => {
    switch (participant.entity_type) {
      case 'capital_partner':
        entities.capital_partners.add(participant.entity_id);
        break;
      case 'team':
        entities.teams.add(participant.entity_id);
        break;
      case 'corporate':
        entities.corporates.add(participant.entity_id);
        break;
      case 'legal_advisor':
        entities.legal_advisors.add(participant.entity_id);
        break;
    }
  });

  return {
    capital_partners: Array.from(entities.capital_partners),
    teams: Array.from(entities.teams),
    corporates: Array.from(entities.corporates),
    legal_advisors: Array.from(entities.legal_advisors),
  };
}

/**
 * Calculate total commitments for a deal
 */
export async function calculateDealCommitments(dealId: string): Promise<{
  total_commitments: number;
  funded_amount: number;
  participation_pct: number;
}> {
  const response = await getDealParticipants(dealId);

  if (!response.success || !response.data) {
    return {
      total_commitments: 0,
      funded_amount: 0,
      participation_pct: 0,
    };
  }

  const total_commitments = response.data.reduce(
    (sum, p) => sum + (p.commitment_amount || 0),
    0
  );

  const funded_amount = response.data.reduce(
    (sum, p) => sum + (p.funded_amount || 0),
    0
  );

  const participation_pct = response.data.reduce(
    (sum, p) => sum + (p.participation_pct || 0),
    0
  );

  return {
    total_commitments,
    funded_amount,
    participation_pct,
  };
}

/**
 * Validate that participant commitments don't exceed deal size
 */
export function validateParticipantCommitments(
  participants: DealParticipant[],
  dealTotalSize: number
): { valid: boolean; error?: string; total: number } {
  const total = participants.reduce((sum, p) => sum + (p.commitment_amount || 0), 0);

  if (total > dealTotalSize) {
    return {
      valid: false,
      error: `Total commitments (${total.toLocaleString()}) exceed deal size (${dealTotalSize.toLocaleString()})`,
      total,
    };
  }

  return { valid: true, total };
}

/**
 * Get deals summary for dashboard/overview
 */
export async function getDealsSummary(): Promise<{
  total_deals: number;
  active_deals: number;
  pipeline_deals: number;
  total_value_usd: number;
  recent_deals: Deal[];
}> {
  const [dealsResponse, statsResponse] = await Promise.all([
    getDeals({ status: ['active', 'pipeline'] }),
    getDealStatistics(),
  ]);

  const deals = dealsResponse.data || [];
  const stats = statsResponse.data;

  return {
    total_deals: stats?.total_deals || deals.length,
    active_deals: stats?.by_status?.active || deals.filter(d => d.status === 'active').length,
    pipeline_deals: stats?.by_status?.pipeline || deals.filter(d => d.status === 'pipeline').length,
    total_value_usd: stats?.avg_deal_size_usd || 0,
    recent_deals: stats?.recent_activity || deals.slice(0, 5),
  };
}

/**
 * Export deals to CSV format (client-side)
 */
export function exportDealsToCSV(deals: Deal[]): string {
  const headers = [
    'Deal ID',
    'Deal Name',
    'Status',
    'Deal Type',
    'Sector',
    'Country',
    'Total Size',
    'Currency',
    'Deal Date',
    'Closing Date',
    'Maturity Date',
    'Structure',
    'Pricing',
    'Spread (bps)',
  ];

  const rows = deals.map(deal => [
    deal.id,
    deal.deal_name,
    deal.status,
    deal.deal_type,
    deal.sector,
    deal.country,
    deal.total_size,
    deal.currency,
    deal.deal_date,
    deal.closing_date,
    deal.maturity_date,
    deal.structure,
    deal.pricing,
    deal.spread_bps,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download deals as CSV file
 */
export async function downloadDealsCSV(filters?: DealFilters): Promise<void> {
  const response = await getDeals(filters);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch deals for export');
  }

  const csv = exportDealsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// XLSX Export Functions
// ============================================================================

/**
 * Download deals as XLSX file
 */
export async function downloadDealsXLSX(filters?: DealFilters): Promise<void> {
  const response = await getDeals(filters);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch deals for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(deal => ({
    'Deal ID': deal.id,
    'Deal Name': deal.deal_name,
    'Status': deal.status,
    'Deal Type': deal.deal_type,
    'Sector': deal.sector,
    'Country': deal.country,
    'Total Size': deal.total_size,
    'Currency': deal.currency,
    'Deal Date': deal.deal_date,
    'Closing Date': deal.closing_date,
    'Maturity Date': deal.maturity_date,
    'Structure': deal.structure,
    'Pricing': deal.pricing,
    'Spread (bps)': deal.spread_bps,
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deals');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      maxWidth,
      Math.max(
        key.length,
        ...data.map(row => String(row[key as keyof typeof row] || '').length)
      )
    )
  }));
  worksheet['!cols'] = colWidths;

  // Download file
  XLSX.writeFile(workbook, `deals_export_${new Date().toISOString().split('T')[0]}.xlsx`);
}
