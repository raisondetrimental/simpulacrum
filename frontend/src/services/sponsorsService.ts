/**
 * Sponsors service (Sponsors Module)
 * Handles corporate sponsors and their contacts
 */
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';

// Types
export interface Corporate {
  corporate_id: string;
  name: string;
  country: string;
  headquarters_location?: string;
  investment_need_min?: number;
  investment_need_max?: number;
  infrastructure_types?: string[];
  regions?: string[];
  relationship?: string;
  notes?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface SponsorContact {
  contact_id: string;
  corporate_id: string;
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

export interface SponsorMeetingData {
  contact_id: string;
  contact_updates?: Partial<SponsorContact>;
  corporate_updates?: Partial<Corporate>;
  meeting_note?: any;
}

// Corporates API
/**
 * Get all corporates
 */
export async function getCorporates(): Promise<ApiResponse<Corporate[]>> {
  return apiGet('/api/corporates');
}

/**
 * Get a specific corporate by ID
 */
export async function getCorporate(id: string): Promise<ApiResponse<Corporate>> {
  return apiGet(`/api/corporates/${id}`);
}

/**
 * Create a new corporate
 */
export async function createCorporate(data: Partial<Corporate>): Promise<ApiResponse<Corporate>> {
  return apiPost('/api/corporates', data);
}

/**
 * Update an existing corporate
 */
export async function updateCorporate(id: string, data: Partial<Corporate>): Promise<ApiResponse<Corporate>> {
  return apiPut(`/api/corporates/${id}`, data);
}

/**
 * Delete a corporate
 */
export async function deleteCorporate(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/corporates/${id}`);
}

export async function toggleCorporateStar(id: string): Promise<ApiResponse<Corporate>> {
  return apiPut(`/api/corporates/${id}/star`, {});
}

// Sponsor Contacts API
/**
 * Get all sponsor contacts, optionally filtered by corporate ID
 */
export async function getSponsorContacts(corporateId?: string): Promise<ApiResponse<SponsorContact[]>> {
  const query = corporateId ? `?corporate_id=${corporateId}` : '';
  return apiGet(`/api/sponsor-contacts${query}`);
}

/**
 * Get a specific sponsor contact by ID
 */
export async function getSponsorContact(id: string): Promise<ApiResponse<SponsorContact>> {
  return apiGet(`/api/sponsor-contacts/${id}`);
}

/**
 * Create a new sponsor contact
 */
export async function createSponsorContact(data: Partial<SponsorContact>): Promise<ApiResponse<SponsorContact>> {
  return apiPost('/api/sponsor-contacts', data);
}

/**
 * Update an existing sponsor contact
 */
export async function updateSponsorContact(id: string, data: Partial<SponsorContact>): Promise<ApiResponse<SponsorContact>> {
  return apiPut(`/api/sponsor-contacts/${id}`, data);
}

/**
 * Delete a sponsor contact
 */
export async function deleteSponsorContact(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/sponsor-contacts/${id}`);
}

// Sponsor Meeting Notes API
/**
 * Save sponsor meeting notes (atomic update of contact + corporate)
 */
export async function saveSponsorMeeting(data: SponsorMeetingData): Promise<ApiResponse<SponsorContact>> {
  return apiPost('/api/sponsor-meetings', data);
}

/**
 * Get sponsor contacts with upcoming/overdue follow-up reminders
 */
export async function getSponsorMeetingReminders(): Promise<ApiResponse<any[]>> {
  return apiGet('/api/sponsor-meetings/reminders');
}

export async function updateSponsorMeetingNote(
  contactId: string,
  meetingId: string,
  data: {
    notes?: string;
    participants?: string;
    next_follow_up?: string;
  }
): Promise<ApiResponse<SponsorContact>> {
  return apiPut(`/api/sponsor-contacts/${contactId}/meetings/${meetingId}`, data);
}

export async function deleteSponsorMeetingNote(contactId: string, meetingId: string): Promise<ApiResponse> {
  return apiDelete(`/api/sponsor-contacts/${contactId}/meetings/${meetingId}`);
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Helper function to convert object preferences to readable string
 */
function formatPreferencesObject(obj: Record<string, string> | undefined): string {
  if (!obj) return '';

  return Object.entries(obj)
    .filter(([_, value]) => value === 'Y' || value === 'yes')
    .map(([key, _]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .join('; ');
}

/**
 * Export corporates to CSV format
 */
export function exportCorporatesToCSV(corporates: Corporate[]): string {
  const headers = [
    'Corporate ID',
    'Name',
    'Country',
    'Headquarters',
    'Investment Need Min',
    'Investment Need Max',
    'Currency',
    'Infrastructure Types',
    'Regions',
    'Relationship',
    'Notes',
    'Created At',
    'Updated At',
  ];

  const rows = corporates.map(corp => [
    corp.corporate_id,
    corp.name,
    corp.country,
    corp.headquarters_location || '',
    corp.investment_min || '',
    corp.investment_max || '',
    corp.currency,
    formatPreferencesObject(corp.infrastructure_types as unknown as Record<string, string>),
    formatPreferencesObject(corp.regions as unknown as Record<string, string>),
    corp.relationship || '',
    corp.notes || '',
    corp.created_at || '',
    corp.updated_at || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download corporates as CSV file
 */
export async function downloadCorporatesCSV(): Promise<void> {
  const response = await getCorporates();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch corporates for export');
  }

  const csv = exportCorporatesToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `corporates_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export sponsor contacts to CSV format
 */
export function exportSponsorContactsToCSV(contacts: SponsorContact[]): string {
  const headers = [
    'Contact ID',
    'Corporate ID',
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
    contact.corporate_id,
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
 * Download sponsor contacts as CSV file
 */
export async function downloadSponsorContactsCSV(corporateId?: string): Promise<void> {
  const response = await getSponsorContacts(corporateId);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch sponsor contacts for export');
  }

  const csv = exportSponsorContactsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `sponsor_contacts_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// XLSX Export Functions
// ============================================================================

/**
 * Download corporates as XLSX file
 */
export async function downloadCorporatesXLSX(): Promise<void> {
  const response = await getCorporates();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch corporates for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(corp => ({
    'Corporate ID': corp.corporate_id,
    'Name': corp.name,
    'Country': corp.country,
    'Headquarters': corp.headquarters_location || '',
    'Investment Need Min': corp.investment_min || '',
    'Investment Need Max': corp.investment_max || '',
    'Currency': corp.currency,
    'Infrastructure Types': formatPreferencesObject(corp.infrastructure_types as unknown as Record<string, string>),
    'Regions': formatPreferencesObject(corp.regions as unknown as Record<string, string>),
    'Relationship': corp.relationship || '',
    'Notes': corp.notes || '',
    'Created At': corp.created_at || '',
    'Updated At': corp.updated_at || '',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Corporates');

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
  XLSX.writeFile(workbook, `corporates_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Download sponsor contacts as XLSX file
 */
export async function downloadSponsorContactsXLSX(corporateId?: string): Promise<void> {
  const response = await getSponsorContacts(corporateId);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch sponsor contacts for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(contact => ({
    'Contact ID': contact.contact_id,
    'Corporate ID': contact.corporate_id,
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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sponsor Contacts');

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
  XLSX.writeFile(workbook, `sponsor_contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
