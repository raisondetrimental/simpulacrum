/**
 * Capital Partners service (Liquidity Module)
 */
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';

// Types (should eventually move to shared types)
export interface CapitalPartner {
  id: string;
  name: string;
  type: string;
  country: string;
  headquarters_location?: string;
  relationship?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  capital_partner_id: string;
  team_name?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  relationship?: string;
  disc_profile?: string;
  contact_notes?: string;
  meeting_history?: any[];
  last_contact_date?: string;
  next_contact_reminder?: string;
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
}

// Capital Partners API
export async function getCapitalPartners(): Promise<ApiResponse<CapitalPartner[]>> {
  return apiGet('/api/capital-partners');
}

export async function getCapitalPartner(id: string): Promise<ApiResponse<CapitalPartner>> {
  return apiGet(`/api/capital-partners/${id}`);
}

export async function createCapitalPartner(data: Partial<CapitalPartner>): Promise<ApiResponse<CapitalPartner>> {
  return apiPost('/api/capital-partners', data);
}

export async function updateCapitalPartner(id: string, data: Partial<CapitalPartner>): Promise<ApiResponse<CapitalPartner>> {
  return apiPut(`/api/capital-partners/${id}`, data);
}

export async function deleteCapitalPartner(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/capital-partners/${id}`);
}

export async function toggleCapitalPartnerStar(id: string): Promise<ApiResponse<CapitalPartner>> {
  return apiPut(`/api/capital-partners/${id}/star`, {});
}

// Contacts API
export async function getContacts(filters?: { capital_partner_id?: string }): Promise<ApiResponse<Contact[]>> {
  const params = new URLSearchParams();
  if (filters?.capital_partner_id) params.append('capital_partner_id', filters.capital_partner_id);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet(`/api/contacts-new${query}`);
}

export async function getContact(id: string): Promise<ApiResponse<Contact>> {
  return apiGet(`/api/contacts-new/${id}`);
}

export async function createContact(data: Partial<Contact>): Promise<ApiResponse<Contact>> {
  return apiPost('/api/contacts-new', data);
}

export async function updateContact(id: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> {
  return apiPut(`/api/contacts-new/${id}`, data);
}

export async function deleteContact(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/contacts-new/${id}`);
}

// Meeting Notes API
export async function saveMeetingNotes(data: {
  contact_id: string;
  contact_updates?: Partial<Contact>;
  meeting_note?: any;
}): Promise<ApiResponse<Contact>> {
  return apiPost('/api/meeting-notes', data);
}

export async function getMeetingReminders(): Promise<ApiResponse<any[]>> {
  return apiGet('/api/meeting-notes/reminders');
}

export async function updateMeetingNote(
  contactId: string,
  meetingId: string,
  data: {
    notes?: string;
    participants?: string;
    next_follow_up?: string;
  }
): Promise<ApiResponse<Contact>> {
  return apiPut(`/api/contacts-new/${contactId}/meetings/${meetingId}`, data);
}

export async function deleteMeetingNote(contactId: string, meetingId: string): Promise<ApiResponse> {
  return apiDelete(`/api/contacts-new/${contactId}/meetings/${meetingId}`);
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Export capital partners to CSV format
 */
export function exportCapitalPartnersToCSV(partners: CapitalPartner[]): string {
  const headers = [
    'ID',
    'Name',
    'Type',
    'Country',
    'Headquarters',
    'Relationship',
    'Investment Min',
    'Investment Max',
    'Currency',
    // Investment Preferences
    'Investment Grade',
    'High Yield',
    'Infra Debt',
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
    'Coal',
    'Energy Infra',
    'Transport Infra',
    'More Expensive Than Usual',
    'Require Bank Guarantee',
    // Other fields
    'Notes',
    'Created At',
    'Updated At',
  ];

  const rows = partners.map(partner => [
    partner.id,
    partner.name,
    partner.type,
    partner.country,
    partner.headquarters_location || '',
    partner.relationship || '',
    partner.investment_min || '',
    partner.investment_max || '',
    partner.currency || '',
    // Investment Preferences
    partner.preferences?.investment_grade || '',
    partner.preferences?.high_yield || '',
    partner.preferences?.infra_debt || '',
    partner.preferences?.senior_secured || '',
    partner.preferences?.subordinated || '',
    partner.preferences?.bonds || '',
    partner.preferences?.loan_agreement || '',
    partner.preferences?.quasi_sovereign_only || '',
    partner.preferences?.public_bond_high_yield || '',
    partner.preferences?.us_market || '',
    partner.preferences?.emerging_markets || '',
    partner.preferences?.asia_em || '',
    partner.preferences?.africa_em || '',
    partner.preferences?.emea_em || '',
    partner.preferences?.coal || '',
    partner.preferences?.energy_infra || '',
    partner.preferences?.transport_infra || '',
    partner.preferences?.more_expensive_than_usual || '',
    partner.preferences?.require_bank_guarantee || '',
    // Other fields
    partner.notes || '',
    partner.created_at || '',
    partner.updated_at || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download capital partners as CSV file
 */
export async function downloadCapitalPartnersCSV(): Promise<void> {
  const response = await getCapitalPartners();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch capital partners for export');
  }

  const csv = exportCapitalPartnersToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `capital_partners_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export contacts to CSV format
 */
export function exportContactsToCSV(contacts: Contact[]): string {
  const headers = [
    'Contact ID',
    'Capital Partner ID',
    'Team Name',
    'Name',
    'Role',
    'Email',
    'Phone',
    'LinkedIn',
    'Relationship',
    'DISC Profile',
    'Contact Notes',
    'Last Contact Date',
    'Next Contact Reminder',
    'Created At',
    'Updated At',
  ];

  const rows = contacts.map(contact => [
    contact.contact_id,
    contact.capital_partner_id,
    contact.team_name || '',
    contact.name,
    contact.role || '',
    contact.email || '',
    contact.phone || '',
    contact.linkedin || '',
    contact.relationship || '',
    contact.disc_profile || '',
    contact.contact_notes || '',
    contact.last_contact_date || '',
    contact.next_contact_reminder || '',
    contact.created_at || '',
    contact.updated_at || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download contacts as CSV file
 */
export async function downloadContactsCSV(filters?: { capital_partner_id?: string }): Promise<void> {
  const response = await getContacts(filters);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch contacts for export');
  }

  const csv = exportContactsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// XLSX Export Functions
// ============================================================================

/**
 * Download capital partners as XLSX file
 */
export async function downloadCapitalPartnersXLSX(): Promise<void> {
  const response = await getCapitalPartners();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch capital partners for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(partner => ({
    'ID': partner.id,
    'Name': partner.name,
    'Type': partner.type,
    'Country': partner.country,
    'Headquarters': partner.headquarters_location || '',
    'Relationship': partner.relationship || '',
    'Investment Min': partner.investment_min || '',
    'Investment Max': partner.investment_max || '',
    'Currency': partner.currency || '',
    // Investment Preferences
    'Investment Grade': partner.preferences?.investment_grade || '',
    'High Yield': partner.preferences?.high_yield || '',
    'Infra Debt': partner.preferences?.infra_debt || '',
    'Senior Secured': partner.preferences?.senior_secured || '',
    'Subordinated': partner.preferences?.subordinated || '',
    'Bonds': partner.preferences?.bonds || '',
    'Loan Agreement': partner.preferences?.loan_agreement || '',
    'Quasi Sovereign Only': partner.preferences?.quasi_sovereign_only || '',
    'Public Bond High Yield': partner.preferences?.public_bond_high_yield || '',
    'US Market': partner.preferences?.us_market || '',
    'Emerging Markets': partner.preferences?.emerging_markets || '',
    'Asia EM': partner.preferences?.asia_em || '',
    'Africa EM': partner.preferences?.africa_em || '',
    'EMEA EM': partner.preferences?.emea_em || '',
    'Coal': partner.preferences?.coal || '',
    'Energy Infra': partner.preferences?.energy_infra || '',
    'Transport Infra': partner.preferences?.transport_infra || '',
    'More Expensive Than Usual': partner.preferences?.more_expensive_than_usual || '',
    'Require Bank Guarantee': partner.preferences?.require_bank_guarantee || '',
    // Other fields
    'Notes': partner.notes || '',
    'Created At': partner.created_at || '',
    'Updated At': partner.updated_at || '',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Capital Partners');

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
  XLSX.writeFile(workbook, `capital_partners_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Download contacts as XLSX file
 */
export async function downloadContactsXLSX(filters?: { capital_partner_id?: string }): Promise<void> {
  const response = await getContacts(filters);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch contacts for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(contact => ({
    'Contact ID': contact.id,
    'Capital Partner ID': contact.capital_partner_id,
    'Team Name': contact.team_name || '',
    'Name': contact.name,
    'Role': contact.role || '',
    'Email': contact.email || '',
    'Phone': contact.phone || '',
    'LinkedIn': contact.linkedin || '',
    'Relationship': contact.relationship || '',
    'DISC Profile': contact.disc_profile || '',
    'Contact Notes': contact.contact_notes || '',
    'Last Contact Date': contact.last_contact_date || '',
    'Next Contact Reminder': contact.next_contact_reminder || '',
    'Created At': contact.created_at || '',
    'Updated At': contact.updated_at || '',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

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
  XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
