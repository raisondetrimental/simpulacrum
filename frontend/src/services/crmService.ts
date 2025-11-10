/**
 * Unified CRM Service
 *
 * Provides centralized access to data across all four CRM modules:
 * - Capital Partners (Liquidity)
 * - Sponsors (Corporates)
 * - Counsel (Legal Advisors)
 * - Agents (Transaction Agents)
 */

import {
  UnifiedOrganization,
  UnifiedContact,
  UnifiedCRMStats,
  OrganizationStats,
  ContactStats,
  MeetingStats,
  OrganizationType,
  OrganizationFilter,
  ContactFilter,
  getParentIdField
} from '../types/crm';
import { apiGet } from './api';
import * as XLSX from 'xlsx';

// Import existing service functions
import { getCapitalPartners, getContacts as getCapitalContacts } from './capitalPartnersService';
import { getCorporates, getSponsorContacts } from './sponsorsService';
import { getLegalAdvisors, getCounselContacts } from './counselService';
import { getAgents, getAgentContacts } from './agentsService';

// ============================================================================
// Organization Data Aggregation
// ============================================================================

/**
 * Fetch all organizations across all four modules
 */
export async function getAllOrganizations(filter?: OrganizationFilter): Promise<UnifiedOrganization[]> {
  try {
    // Fetch from all four endpoints in parallel
    const [cpResponse, sponsorResponse, counselResponse, agentResponse] = await Promise.all([
      getCapitalPartners(),
      getCorporates(),
      getLegalAdvisors(),
      getAgents()
    ]);

    const organizations: UnifiedOrganization[] = [];

    // Transform Capital Partners
    if (cpResponse.success && cpResponse.data) {
      cpResponse.data.forEach((cp: any) => {
        organizations.push({
          id: cp.id,
          name: cp.name,
          organization_type: 'capital_partner',
          country: cp.country || '',
          headquarters_location: cp.headquarters_location || '',
          relationship: cp.relationship || 'Developing',
          notes: cp.notes || '',
          created_at: cp.created_at || '',
          last_updated: cp.last_updated || cp.updated_at || '',
          starred: cp.starred || false,
          type: cp.type,
          company_description: cp.company_description,
          preferences: cp.preferences,
          investment_min: cp.investment_min,
          investment_max: cp.investment_max,
          currency: cp.currency
        });
      });
    }

    // Transform Sponsors (Corporates)
    if (sponsorResponse.success && sponsorResponse.data) {
      sponsorResponse.data.forEach((corp: any) => {
        organizations.push({
          id: corp.id,
          name: corp.name,
          organization_type: 'sponsor',
          country: corp.country || '',
          headquarters_location: corp.headquarters_location || '',
          relationship: corp.relationship || 'Developing',
          notes: corp.notes || '',
          created_at: corp.created_at || '',
          last_updated: corp.last_updated || '',
          starred: corp.starred || false,
          company_description: corp.company_description,
          infrastructure_types: corp.infrastructure_types,
          regions: corp.regions,
          investment_need_min: corp.investment_need_min,
          investment_need_max: corp.investment_need_max,
          currency: corp.currency
        });
      });
    }

    // Transform Counsel (Legal Advisors)
    if (counselResponse.success && counselResponse.data) {
      counselResponse.data.forEach((advisor: any) => {
        organizations.push({
          id: advisor.id,
          name: advisor.name,
          organization_type: 'counsel',
          country: advisor.country || '',
          headquarters_location: advisor.headquarters_location || '',
          relationship: advisor.relationship || 'Developing',
          notes: advisor.notes || '',
          created_at: advisor.created_at || '',
          last_updated: advisor.last_updated || '',
          starred: advisor.starred || false,
          counsel_preferences: advisor.counsel_preferences
        });
      });
    }

    // Transform Agents
    if (agentResponse.success && agentResponse.data) {
      agentResponse.data.forEach((agent: any) => {
        organizations.push({
          id: agent.id,
          name: agent.name,
          organization_type: 'agent',
          country: agent.country || '',
          headquarters_location: agent.headquarters_location || '',
          relationship: agent.relationship || 'Developing',
          notes: agent.notes || '',
          created_at: agent.created_at || '',
          last_updated: agent.last_updated || '',
          starred: agent.starred || false,
          agent_type: agent.agent_type,
          agent_preferences: agent.agent_preferences
        });
      });
    }

    // Apply filters
    return filterOrganizations(organizations, filter);
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}

/**
 * Filter organizations based on criteria
 */
function filterOrganizations(
  organizations: UnifiedOrganization[],
  filter?: OrganizationFilter
): UnifiedOrganization[] {
  if (!filter) return organizations;

  let filtered = organizations;

  // Filter by organization type
  if (filter.organization_type && filter.organization_type !== 'all') {
    filtered = filtered.filter(org => org.organization_type === filter.organization_type);
  }

  // Filter by relationship
  if (filter.relationship) {
    filtered = filtered.filter(org => org.relationship === filter.relationship);
  }

  // Filter by country
  if (filter.country) {
    filtered = filtered.filter(org =>
      org.country.toLowerCase().includes(filter.country!.toLowerCase())
    );
  }

  // Filter by starred status
  if (filter.starred !== undefined) {
    filtered = filtered.filter(org => org.starred === filter.starred);
  }

  // Filter by search term
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(org =>
      org.name.toLowerCase().includes(searchLower) ||
      org.country.toLowerCase().includes(searchLower) ||
      org.headquarters_location.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

// ============================================================================
// Contact Data Aggregation
// ============================================================================

/**
 * Fetch all contacts across all four modules
 */
export async function getAllContacts(filter?: ContactFilter): Promise<UnifiedContact[]> {
  try {
    // Fetch from all four endpoints in parallel
    const [cpContactsResponse, sponsorContactsResponse, counselContactsResponse, agentContactsResponse] = await Promise.all([
      getCapitalContacts(),
      getSponsorContacts(),
      getCounselContacts(),
      getAgentContacts()
    ]);

    const contacts: UnifiedContact[] = [];

    // Transform Capital Partner Contacts
    if (cpContactsResponse.success && cpContactsResponse.data) {
      cpContactsResponse.data.forEach((contact: any) => {
        contacts.push({
          ...contact,
          organization_type: 'capital_partner',
          organization_id: contact.capital_partner_id,
          meeting_history: contact.meeting_history || []
        });
      });
    }

    // Transform Sponsor Contacts
    if (sponsorContactsResponse.success && sponsorContactsResponse.data) {
      sponsorContactsResponse.data.forEach((contact: any) => {
        contacts.push({
          ...contact,
          organization_type: 'sponsor',
          organization_id: contact.corporate_id,
          meeting_history: contact.meeting_history || []
        });
      });
    }

    // Transform Counsel Contacts
    if (counselContactsResponse.success && counselContactsResponse.data) {
      counselContactsResponse.data.forEach((contact: any) => {
        contacts.push({
          ...contact,
          organization_type: 'counsel',
          organization_id: contact.legal_advisor_id,
          meeting_history: contact.meeting_history || []
        });
      });
    }

    // Transform Agent Contacts
    if (agentContactsResponse.success && agentContactsResponse.data) {
      agentContactsResponse.data.forEach((contact: any) => {
        contacts.push({
          ...contact,
          organization_type: 'agent',
          organization_id: contact.agent_id,
          meeting_history: contact.meeting_history || []
        });
      });
    }

    // Apply filters
    return filterContacts(contacts, filter);
  } catch (error) {
    console.error('Error fetching all contacts:', error);
    return [];
  }
}

/**
 * Filter contacts based on criteria
 */
function filterContacts(
  contacts: UnifiedContact[],
  filter?: ContactFilter
): UnifiedContact[] {
  if (!filter) return contacts;

  let filtered = contacts;

  // Filter by organization type
  if (filter.organization_type && filter.organization_type !== 'all') {
    filtered = filtered.filter(contact => contact.organization_type === filter.organization_type);
  }

  // Filter by organization ID
  if (filter.organization_id) {
    filtered = filtered.filter(contact => contact.organization_id === filter.organization_id);
  }

  // Filter by reminder status
  if (filter.has_reminder !== undefined) {
    filtered = filtered.filter(contact =>
      filter.has_reminder ? !!contact.next_contact_reminder : !contact.next_contact_reminder
    );
  }

  // Filter by overdue reminders
  if (filter.overdue_reminders) {
    const now = new Date();
    filtered = filtered.filter(contact => {
      if (!contact.next_contact_reminder) return false;
      const reminderDate = new Date(contact.next_contact_reminder);
      return reminderDate < now;
    });
  }

  // Filter by search term
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(contact =>
      contact.name.toLowerCase().includes(searchLower) ||
      contact.role?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

// ============================================================================
// Statistics and Aggregation
// ============================================================================

/**
 * Calculate comprehensive CRM statistics
 */
export async function getCRMStatistics(): Promise<UnifiedCRMStats> {
  const [organizations, contacts] = await Promise.all([
    getAllOrganizations(),
    getAllContacts()
  ]);

  // Organization statistics
  const orgStats: OrganizationStats = {
    total: organizations.length,
    by_type: {
      capital_partner: organizations.filter(o => o.organization_type === 'capital_partner').length,
      sponsor: organizations.filter(o => o.organization_type === 'sponsor').length,
      counsel: organizations.filter(o => o.organization_type === 'counsel').length,
      agent: organizations.filter(o => o.organization_type === 'agent').length
    },
    by_relationship: {
      Strong: organizations.filter(o => o.relationship === 'Strong').length,
      Medium: organizations.filter(o => o.relationship === 'Medium').length,
      Developing: organizations.filter(o => o.relationship === 'Developing').length,
      Cold: organizations.filter(o => o.relationship === 'Cold').length
    },
    starred_count: organizations.filter(o => o.starred).length
  };

  // Contact statistics
  const now = new Date();
  const contactStats: ContactStats = {
    total: contacts.length,
    by_organization_type: {
      capital_partner: contacts.filter(c => c.organization_type === 'capital_partner').length,
      sponsor: contacts.filter(c => c.organization_type === 'sponsor').length,
      counsel: contacts.filter(c => c.organization_type === 'counsel').length,
      agent: contacts.filter(c => c.organization_type === 'agent').length
    },
    overdue_reminders: contacts.filter(c => {
      if (!c.next_contact_reminder) return false;
      return new Date(c.next_contact_reminder) < now;
    }).length,
    upcoming_reminders: contacts.filter(c => {
      if (!c.next_contact_reminder) return false;
      const reminderDate = new Date(c.next_contact_reminder);
      const daysUntil = Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    }).length,
    contacts_with_meetings: contacts.filter(c => c.meeting_history && c.meeting_history.length > 0).length
  };

  // Meeting statistics
  const allMeetings = contacts.flatMap(c => c.meeting_history || []);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const meetingStats: MeetingStats = {
    total_meetings: allMeetings.length,
    by_organization_type: {
      capital_partner: contacts.filter(c => c.organization_type === 'capital_partner')
        .reduce((sum, c) => sum + (c.meeting_history?.length || 0), 0),
      sponsor: contacts.filter(c => c.organization_type === 'sponsor')
        .reduce((sum, c) => sum + (c.meeting_history?.length || 0), 0),
      counsel: contacts.filter(c => c.organization_type === 'counsel')
        .reduce((sum, c) => sum + (c.meeting_history?.length || 0), 0),
      agent: contacts.filter(c => c.organization_type === 'agent')
        .reduce((sum, c) => sum + (c.meeting_history?.length || 0), 0)
    },
    recent_meetings_count: allMeetings.filter(m => new Date(m.date) >= thirtyDaysAgo).length,
    scheduled_reminders: contacts.filter(c => c.next_contact_reminder && new Date(c.next_contact_reminder) >= now).length
  };

  return {
    organizations: orgStats,
    contacts: contactStats,
    meetings: meetingStats,
    last_updated: new Date().toISOString()
  };
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export all organizations to CSV with comprehensive data including all investment preferences
 */
export function exportOrganizationsToCSV(organizations: UnifiedOrganization[]): string {
  const headers = [
    // Base fields
    'ID',
    'Name',
    'Organization Type',
    'Country',
    'Headquarters Location',
    'Relationship',
    'Starred',
    'Notes',
    'Company Description',
    'Created At',
    'Last Updated',
    // Type-specific fields
    'Type (Capital Partner)',
    'Agent Type',
    'Investment Min',
    'Investment Max',
    'Investment Need Min',
    'Investment Need Max',
    'Currency',
    // All 23 Investment Preferences
    'Investment Grade',
    'High Yield',
    'Infrastructure Debt',
    'Senior Secured',
    'Subordinated',
    'Bonds',
    'Loan Agreement',
    'Quasi Sovereign Only',
    'Public Bond High Yield',
    'US Market',
    'Emerging Markets',
    'Asia EM',
    'Africa EM',
    'EMEA EM',
    'Vietnam',
    'Mongolia',
    'Turkey',
    'Coal',
    'Energy Infrastructure',
    'Transport Infrastructure',
    'More Expensive Than Usual',
    'Require Bank Guarantee'
  ];

  const rows = organizations.map(org => {
    // Get preferences from the appropriate field based on org type
    const prefs = org.preferences || org.counsel_preferences || org.agent_preferences || {};

    return [
      // Base fields
      org.id || '',
      org.name || '',
      org.organization_type || '',
      org.country || '',
      org.headquarters_location || '',
      org.relationship || '',
      org.starred ? 'Yes' : 'No',
      org.notes || '',
      org.company_description || '',
      org.created_at || '',
      org.last_updated || '',
      // Type-specific fields
      org.type || '',
      org.agent_type || '',
      org.investment_min || '',
      org.investment_max || '',
      org.investment_need_min || '',
      org.investment_need_max || '',
      org.currency || '',
      // All 23 Investment Preferences (showing Y/N/any or blank)
      prefs.investment_grade || '',
      prefs.high_yield || '',
      prefs.infra_debt || '',
      prefs.senior_secured || '',
      prefs.subordinated || '',
      prefs.bonds || '',
      prefs.loan_agreement || '',
      prefs.quasi_sovereign_only || '',
      prefs.public_bond_high_yield || '',
      prefs.us_market || '',
      prefs.emerging_markets || '',
      prefs.asia_em || '',
      prefs.africa_em || '',
      prefs.emea_em || '',
      prefs.vietnam || '',
      prefs.mongolia || '',
      prefs.turkey || '',
      prefs.coal || '',
      prefs.energy_infra || '',
      prefs.transport_infra || '',
      prefs.more_expensive_than_usual || '',
      prefs.require_bank_guarantee || ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download all organizations as CSV
 */
export async function downloadAllOrganizationsCSV(filter?: OrganizationFilter): Promise<void> {
  const organizations = await getAllOrganizations(filter);
  const csv = exportOrganizationsToCSV(organizations);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `all_organizations_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export all contacts to CSV
 */
export function exportContactsToCSV(contacts: UnifiedContact[]): string {
  const headers = [
    'ID',
    'Name',
    'Organization Type',
    'Organization ID',
    'Role',
    'Email',
    'Phone',
    'Last Contact',
    'Next Reminder'
  ];

  const rows = contacts.map(contact => [
    contact.id,
    contact.name,
    contact.organization_type,
    contact.organization_id,
    contact.role,
    contact.email,
    contact.phone,
    contact.last_contact_date || '',
    contact.next_contact_reminder || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download all contacts as CSV
 */
export async function downloadAllContactsCSV(filter?: ContactFilter): Promise<void> {
  const contacts = await getAllContacts(filter);
  const csv = exportContactsToCSV(contacts);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `all_contacts_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// Excel (XLSX) Export Functions
// ============================================================================

/**
 * Download all organizations as XLSX using proper Excel format
 */
export async function downloadAllOrganizationsXLSX(filter?: OrganizationFilter): Promise<void> {
  const organizations = await getAllOrganizations(filter);

  const headers = [
    // Base fields
    'ID',
    'Name',
    'Organization Type',
    'Country',
    'Headquarters Location',
    'Relationship',
    'Starred',
    'Notes',
    'Company Description',
    'Created At',
    'Last Updated',
    // Type-specific fields
    'Type (Capital Partner)',
    'Agent Type',
    'Investment Min',
    'Investment Max',
    'Investment Need Min',
    'Investment Need Max',
    'Currency',
    // All 23 Investment Preferences
    'Investment Grade',
    'High Yield',
    'Infrastructure Debt',
    'Senior Secured',
    'Subordinated',
    'Bonds',
    'Loan Agreement',
    'Quasi Sovereign Only',
    'Public Bond High Yield',
    'US Market',
    'Emerging Markets',
    'Asia EM',
    'Africa EM',
    'EMEA EM',
    'Vietnam',
    'Mongolia',
    'Turkey',
    'Coal',
    'Energy Infrastructure',
    'Transport Infrastructure',
    'More Expensive Than Usual',
    'Require Bank Guarantee'
  ];

  const rows = organizations.map(org => {
    // Get preferences from the appropriate field based on org type
    const prefs = org.preferences || org.counsel_preferences || org.agent_preferences || {};

    return [
      // Base fields
      org.id || '',
      org.name || '',
      org.organization_type || '',
      org.country || '',
      org.headquarters_location || '',
      org.relationship || '',
      org.starred ? 'Yes' : 'No',
      org.notes || '',
      org.company_description || '',
      org.created_at || '',
      org.last_updated || '',
      // Type-specific fields
      org.type || '',
      org.agent_type || '',
      org.investment_min || '',
      org.investment_max || '',
      org.investment_need_min || '',
      org.investment_need_max || '',
      org.currency || '',
      // All 23 Investment Preferences (showing Y/N/any or blank)
      prefs.investment_grade || '',
      prefs.high_yield || '',
      prefs.infra_debt || '',
      prefs.senior_secured || '',
      prefs.subordinated || '',
      prefs.bonds || '',
      prefs.loan_agreement || '',
      prefs.quasi_sovereign_only || '',
      prefs.public_bond_high_yield || '',
      prefs.us_market || '',
      prefs.emerging_markets || '',
      prefs.asia_em || '',
      prefs.africa_em || '',
      prefs.emea_em || '',
      prefs.vietnam || '',
      prefs.mongolia || '',
      prefs.turkey || '',
      prefs.coal || '',
      prefs.energy_infra || '',
      prefs.transport_infra || '',
      prefs.more_expensive_than_usual || '',
      prefs.require_bank_guarantee || ''
    ];
  });

  // Create worksheet data with headers
  const wsData = [headers, ...rows];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Organisations');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `all_organisations_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Download all contacts as XLSX using proper Excel format
 */
export async function downloadAllContactsXLSX(filter?: ContactFilter): Promise<void> {
  const contacts = await getAllContacts(filter);

  const headers = [
    'ID',
    'Name',
    'Organization Type',
    'Organization ID',
    'Role',
    'Email',
    'Phone',
    'Team Name',
    'Relationship',
    'DISC Profile',
    'Last Contact',
    'Next Reminder',
    'Total Meetings'
  ];

  const rows = contacts.map(contact => [
    contact.id,
    contact.name,
    contact.organization_type,
    contact.organization_id,
    contact.role || '',
    contact.email || '',
    contact.phone || '',
    contact.team_name || '',
    contact.relationship || '',
    contact.disc_profile || '',
    contact.last_contact_date || '',
    contact.next_contact_reminder || '',
    contact.meeting_history ? contact.meeting_history.length : 0
  ]);

  // Create worksheet data with headers
  const wsData = [headers, ...rows];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `all_contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ============================================================================
// Meeting Notes Management
// ============================================================================

/**
 * Update a meeting note across any CRM module
 */
export async function updateMeetingNote(
  organizationType: OrganizationType,
  contactId: string,
  meetingId: string,
  data: {
    notes?: string;
    participants?: string;
    next_follow_up?: string;
  }
): Promise<any> {
  const endpointMap: Record<OrganizationType, string> = {
    capital_partner: `/api/contacts-new/${contactId}/meetings/${meetingId}`,
    sponsor: `/api/sponsor-contacts/${contactId}/meetings/${meetingId}`,
    counsel: `/api/counsel-contacts/${contactId}/meetings/${meetingId}`,
    agent: `/api/agent-contacts/${contactId}/meetings/${meetingId}`
  };

  const endpoint = endpointMap[organizationType];
  if (!endpoint) {
    throw new Error(`Unknown organization type: ${organizationType}`);
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  return response.json();
}

/**
 * Delete a meeting note across any CRM module
 */
export async function deleteMeetingNote(
  organizationType: OrganizationType,
  contactId: string,
  meetingId: string
): Promise<any> {
  const endpointMap: Record<OrganizationType, string> = {
    capital_partner: `/api/contacts-new/${contactId}/meetings/${meetingId}`,
    sponsor: `/api/sponsor-contacts/${contactId}/meetings/${meetingId}`,
    counsel: `/api/counsel-contacts/${contactId}/meetings/${meetingId}`,
    agent: `/api/agent-contacts/${contactId}/meetings/${meetingId}`
  };

  const endpoint = endpointMap[organizationType];
  if (!endpoint) {
    throw new Error(`Unknown organization type: ${organizationType}`);
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${endpoint}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  return response.json();
}