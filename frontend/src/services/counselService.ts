/**
 * Counsel service (Counsel Module)
 * Handles legal advisors and their contacts
 */
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';

// Types
export interface LegalAdvisor {
  legal_advisor_id: string;
  name: string;
  country: string;
  headquarters_location?: string;
  relationship?: string;
  notes?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CounselContact {
  contact_id: string;
  legal_advisor_id: string;
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
}

export interface CounselMeetingData {
  contact_id: string;
  contact_updates?: Partial<CounselContact>;
  advisor_updates?: Partial<LegalAdvisor>;
  meeting_note?: any;
}

// Legal Advisors API
/**
 * Get all legal advisors
 */
export async function getLegalAdvisors(): Promise<ApiResponse<LegalAdvisor[]>> {
  return apiGet('/api/legal-advisors');
}

/**
 * Get a specific legal advisor by ID
 */
export async function getLegalAdvisor(id: string): Promise<ApiResponse<LegalAdvisor>> {
  return apiGet(`/api/legal-advisors/${id}`);
}

/**
 * Create a new legal advisor
 */
export async function createLegalAdvisor(data: Partial<LegalAdvisor>): Promise<ApiResponse<LegalAdvisor>> {
  return apiPost('/api/legal-advisors', data);
}

/**
 * Update an existing legal advisor
 */
export async function updateLegalAdvisor(id: string, data: Partial<LegalAdvisor>): Promise<ApiResponse<LegalAdvisor>> {
  return apiPut(`/api/legal-advisors/${id}`, data);
}

/**
 * Delete a legal advisor
 */
export async function deleteLegalAdvisor(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/legal-advisors/${id}`);
}

export async function toggleLegalAdvisorStar(id: string): Promise<ApiResponse<LegalAdvisor>> {
  return apiPut(`/api/legal-advisors/${id}/star`, {});
}

// Counsel Contacts API
/**
 * Get all counsel contacts, optionally filtered by legal advisor ID
 */
export async function getCounselContacts(advisorId?: string): Promise<ApiResponse<CounselContact[]>> {
  const query = advisorId ? `?legal_advisor_id=${advisorId}` : '';
  return apiGet(`/api/counsel-contacts${query}`);
}

/**
 * Get a specific counsel contact by ID
 */
export async function getCounselContact(id: string): Promise<ApiResponse<CounselContact>> {
  return apiGet(`/api/counsel-contacts/${id}`);
}

/**
 * Create a new counsel contact
 */
export async function createCounselContact(data: Partial<CounselContact>): Promise<ApiResponse<CounselContact>> {
  return apiPost('/api/counsel-contacts', data);
}

/**
 * Update an existing counsel contact
 */
export async function updateCounselContact(id: string, data: Partial<CounselContact>): Promise<ApiResponse<CounselContact>> {
  return apiPut(`/api/counsel-contacts/${id}`, data);
}

/**
 * Delete a counsel contact
 */
export async function deleteCounselContact(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/counsel-contacts/${id}`);
}

// Counsel Meeting Notes API
/**
 * Save counsel meeting notes (atomic update of contact + advisor + preferences)
 */
export async function saveCounselMeeting(data: CounselMeetingData): Promise<ApiResponse<CounselContact>> {
  return apiPost('/api/counsel-meetings', data);
}

/**
 * Get counsel contacts with upcoming/overdue follow-up reminders
 */
export async function getCounselReminders(): Promise<ApiResponse<any[]>> {
  return apiGet('/api/counsel-meetings/reminders');
}

/**
 * Mark a counsel contact's follow-up reminder as completed
 */
export async function completeCounselReminder(contactId: string): Promise<ApiResponse<CounselContact>> {
  return apiPost(`/api/counsel-contacts/${contactId}/complete-reminder`, {});
}

export async function updateCounselMeetingNote(
  contactId: string,
  meetingId: string,
  data: {
    notes?: string;
    participants?: string;
    next_follow_up?: string;
  }
): Promise<ApiResponse<CounselContact>> {
  return apiPut(`/api/counsel-contacts/${contactId}/meetings/${meetingId}`, data);
}

export async function deleteCounselMeetingNote(contactId: string, meetingId: string): Promise<ApiResponse> {
  return apiDelete(`/api/counsel-contacts/${contactId}/meetings/${meetingId}`);
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Export legal advisors to CSV format
 */
export function exportLegalAdvisorsToCSV(advisors: LegalAdvisor[]): string {
  const headers = [
    'Legal Advisor ID',
    'Name',
    'Type',
    'Country',
    'Headquarters',
    'Relationship',
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
    'Vietnam',
    'Mongolia',
    'Turkey',
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

  const rows = advisors.map(advisor => [
    advisor.legal_advisor_id,
    advisor.name,
    advisor.type || '',
    advisor.country,
    advisor.headquarters_location || '',
    advisor.relationship || '',
    // Investment Preferences
    advisor.counsel_preferences?.investment_grade || '',
    advisor.counsel_preferences?.high_yield || '',
    advisor.counsel_preferences?.infra_debt || '',
    advisor.counsel_preferences?.senior_secured || '',
    advisor.counsel_preferences?.subordinated || '',
    advisor.counsel_preferences?.bonds || '',
    advisor.counsel_preferences?.loan_agreement || '',
    advisor.counsel_preferences?.quasi_sovereign_only || '',
    advisor.counsel_preferences?.public_bond_high_yield || '',
    advisor.counsel_preferences?.us_market || '',
    advisor.counsel_preferences?.emerging_markets || '',
    advisor.counsel_preferences?.asia_em || '',
    advisor.counsel_preferences?.africa_em || '',
    advisor.counsel_preferences?.emea_em || '',
    advisor.counsel_preferences?.vietnam || '',
    advisor.counsel_preferences?.mongolia || '',
    advisor.counsel_preferences?.turkey || '',
    advisor.counsel_preferences?.coal || '',
    advisor.counsel_preferences?.energy_infra || '',
    advisor.counsel_preferences?.transport_infra || '',
    advisor.counsel_preferences?.more_expensive_than_usual || '',
    advisor.counsel_preferences?.require_bank_guarantee || '',
    // Other fields
    advisor.notes || '',
    advisor.created_at || '',
    advisor.updated_at || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download legal advisors as CSV file
 */
export async function downloadLegalAdvisorsCSV(): Promise<void> {
  const response = await getLegalAdvisors();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch legal advisors for export');
  }

  const csv = exportLegalAdvisorsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `legal_advisors_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export counsel contacts to CSV format
 */
export function exportCounselContactsToCSV(contacts: CounselContact[]): string {
  const headers = [
    'Contact ID',
    'Legal Advisor ID',
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
    contact.legal_advisor_id,
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
 * Download counsel contacts as CSV file
 */
export async function downloadCounselContactsCSV(advisorId?: string): Promise<void> {
  const response = await getCounselContacts(advisorId);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch counsel contacts for export');
  }

  const csv = exportCounselContactsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `counsel_contacts_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// XLSX Export Functions
// ============================================================================

/**
 * Download legal advisors as XLSX file
 */
export async function downloadLegalAdvisorsXLSX(): Promise<void> {
  const response = await getLegalAdvisors();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch legal advisors for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(advisor => ({
    'Legal Advisor ID': advisor.legal_advisor_id,
    'Name': advisor.name,
    'Type': advisor.type || '',
    'Country': advisor.country,
    'Headquarters': advisor.headquarters_location || '',
    'Relationship': advisor.relationship || '',
    // Investment Preferences
    'Investment Grade': advisor.counsel_preferences?.investment_grade || '',
    'High Yield': advisor.counsel_preferences?.high_yield || '',
    'Infra Debt': advisor.counsel_preferences?.infra_debt || '',
    'Senior Secured': advisor.counsel_preferences?.senior_secured || '',
    'Subordinated': advisor.counsel_preferences?.subordinated || '',
    'Bonds': advisor.counsel_preferences?.bonds || '',
    'Loan Agreement': advisor.counsel_preferences?.loan_agreement || '',
    'Quasi Sovereign Only': advisor.counsel_preferences?.quasi_sovereign_only || '',
    'Public Bond High Yield': advisor.counsel_preferences?.public_bond_high_yield || '',
    'US Market': advisor.counsel_preferences?.us_market || '',
    'Emerging Markets': advisor.counsel_preferences?.emerging_markets || '',
    'Asia EM': advisor.counsel_preferences?.asia_em || '',
    'Africa EM': advisor.counsel_preferences?.africa_em || '',
    'EMEA EM': advisor.counsel_preferences?.emea_em || '',
    'Vietnam': advisor.counsel_preferences?.vietnam || '',
    'Mongolia': advisor.counsel_preferences?.mongolia || '',
    'Turkey': advisor.counsel_preferences?.turkey || '',
    'Coal': advisor.counsel_preferences?.coal || '',
    'Energy Infra': advisor.counsel_preferences?.energy_infra || '',
    'Transport Infra': advisor.counsel_preferences?.transport_infra || '',
    'More Expensive Than Usual': advisor.counsel_preferences?.more_expensive_than_usual || '',
    'Require Bank Guarantee': advisor.counsel_preferences?.require_bank_guarantee || '',
    // Other fields
    'Notes': advisor.notes || '',
    'Created At': advisor.created_at || '',
    'Updated At': advisor.updated_at || '',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Legal Advisors');

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
  XLSX.writeFile(workbook, `legal_advisors_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Download counsel contacts as XLSX file
 */
export async function downloadCounselContactsXLSX(advisorId?: string): Promise<void> {
  const response = await getCounselContacts(advisorId);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch counsel contacts for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(contact => ({
    'Contact ID': contact.contact_id,
    'Legal Advisor ID': contact.legal_advisor_id,
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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Counsel Contacts');

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
  XLSX.writeFile(workbook, `counsel_contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
