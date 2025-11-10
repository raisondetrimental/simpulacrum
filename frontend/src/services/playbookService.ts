/**
 * Playbook Service
 * API client for Playbook management (Admin only)
 */

import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';
import {
  PlaybookContact,
  PlaybookCalendarEntry,
  PlaybookDeal,
  PlaybookPerson,
  PlaybookWorkstream,
  PlaybookFiling
} from '../types/playbook';

// ============================================================================
// EXTERNAL CONTACTS
// ============================================================================

/**
 * Get all playbook contacts
 */
export async function getPlaybookContacts(): Promise<ApiResponse<PlaybookContact[]>> {
  return apiGet<PlaybookContact[]>('/api/playbook/contacts');
}

/**
 * Get specific playbook contact by ID
 */
export async function getPlaybookContact(id: string): Promise<ApiResponse<PlaybookContact>> {
  return apiGet<PlaybookContact>(`/api/playbook/contacts/${id}`);
}

/**
 * Create new playbook contact
 */
export async function createPlaybookContact(
  contact: Omit<PlaybookContact, 'id'>
): Promise<ApiResponse<PlaybookContact>> {
  return apiPost<PlaybookContact>('/api/playbook/contacts', contact);
}

/**
 * Update playbook contact
 */
export async function updatePlaybookContact(
  id: string,
  contact: Partial<PlaybookContact>
): Promise<ApiResponse<PlaybookContact>> {
  return apiPut<PlaybookContact>(`/api/playbook/contacts/${id}`, contact);
}

/**
 * Delete playbook contact
 */
export async function deletePlaybookContact(id: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/playbook/contacts/${id}`);
}

/**
 * Export playbook contacts to CSV
 */
export async function exportPlaybookContactsCSV(): Promise<void> {
  const { apiUrl } = await import('../config');
  const url = apiUrl('/api/playbook/contacts/export/csv');

  const response = await fetch(url, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to export contacts');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'playbook_contacts.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// ============================================================================
// CALENDAR
// ============================================================================

/**
 * Get all playbook calendar entries
 * Optional date filtering with query parameters
 */
export async function getPlaybookCalendar(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<PlaybookCalendarEntry[]>> {
  let endpoint = '/api/playbook/calendar';

  if (params) {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }

  return apiGet<PlaybookCalendarEntry[]>(endpoint);
}

/**
 * Create new calendar entry
 */
export async function createPlaybookCalendarEntry(
  entry: Omit<PlaybookCalendarEntry, 'id'>
): Promise<ApiResponse<PlaybookCalendarEntry>> {
  return apiPost<PlaybookCalendarEntry>('/api/playbook/calendar', entry);
}

/**
 * Update calendar entry
 */
export async function updatePlaybookCalendarEntry(
  id: string,
  entry: Partial<PlaybookCalendarEntry>
): Promise<ApiResponse<PlaybookCalendarEntry>> {
  return apiPut<PlaybookCalendarEntry>(`/api/playbook/calendar/${id}`, entry);
}

/**
 * Delete calendar entry
 */
export async function deletePlaybookCalendarEntry(id: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/playbook/calendar/${id}`);
}

// ============================================================================
// DEAL FLOW
// ============================================================================

/**
 * Get all playbook deals
 */
export async function getPlaybookDeals(): Promise<ApiResponse<PlaybookDeal[]>> {
  return apiGet<PlaybookDeal[]>('/api/playbook/deals');
}

/**
 * Create new playbook deal
 */
export async function createPlaybookDeal(
  deal: Omit<PlaybookDeal, 'id'>
): Promise<ApiResponse<PlaybookDeal>> {
  return apiPost<PlaybookDeal>('/api/playbook/deals', deal);
}

/**
 * Update playbook deal
 */
export async function updatePlaybookDeal(
  id: string,
  deal: Partial<PlaybookDeal>
): Promise<ApiResponse<PlaybookDeal>> {
  return apiPut<PlaybookDeal>(`/api/playbook/deals/${id}`, deal);
}

/**
 * Delete playbook deal
 */
export async function deletePlaybookDeal(id: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/playbook/deals/${id}`);
}

// ============================================================================
// PEOPLE/TEAM
// ============================================================================

/**
 * Get all playbook team members
 */
export async function getPlaybookPeople(): Promise<ApiResponse<PlaybookPerson[]>> {
  return apiGet<PlaybookPerson[]>('/api/playbook/people');
}

/**
 * Create new team member
 */
export async function createPlaybookPerson(
  person: Omit<PlaybookPerson, 'id'>
): Promise<ApiResponse<PlaybookPerson>> {
  return apiPost<PlaybookPerson>('/api/playbook/people', person);
}

/**
 * Update team member
 */
export async function updatePlaybookPerson(
  id: string,
  person: Partial<PlaybookPerson>
): Promise<ApiResponse<PlaybookPerson>> {
  return apiPut<PlaybookPerson>(`/api/playbook/people/${id}`, person);
}

/**
 * Delete team member
 */
export async function deletePlaybookPerson(id: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/playbook/people/${id}`);
}

// ============================================================================
// WORKSTREAMS
// ============================================================================

/**
 * Get all playbook workstreams
 */
export async function getPlaybookWorkstreams(): Promise<ApiResponse<PlaybookWorkstream[]>> {
  return apiGet<PlaybookWorkstream[]>('/api/playbook/workstreams');
}

/**
 * Create new workstream
 */
export async function createPlaybookWorkstream(
  workstream: Omit<PlaybookWorkstream, 'id'>
): Promise<ApiResponse<PlaybookWorkstream>> {
  return apiPost<PlaybookWorkstream>('/api/playbook/workstreams', workstream);
}

/**
 * Update workstream
 */
export async function updatePlaybookWorkstream(
  id: string,
  workstream: Partial<PlaybookWorkstream>
): Promise<ApiResponse<PlaybookWorkstream>> {
  return apiPut<PlaybookWorkstream>(`/api/playbook/workstreams/${id}`, workstream);
}

/**
 * Delete workstream
 */
export async function deletePlaybookWorkstream(id: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/playbook/workstreams/${id}`);
}

/**
 * Toggle completion status for workstream or subtask
 */
export async function toggleWorkstreamCompletion(
  workstreamId: string,
  subtaskId?: string
): Promise<ApiResponse<PlaybookWorkstream>> {
  return apiPost<PlaybookWorkstream>(
    `/api/playbook/workstreams/${workstreamId}/toggle`,
    subtaskId ? { subtask_id: subtaskId } : {}
  );
}

/**
 * Create new subtask for a workstream
 */
export async function createSubtask(
  workstreamId: string,
  subtask: { process: string; category?: string; deliverable?: string }
): Promise<ApiResponse<PlaybookWorkstream>> {
  return apiPost<PlaybookWorkstream>(
    `/api/playbook/workstreams/${workstreamId}/subtasks`,
    subtask
  );
}

// ============================================================================
// FILING INSTRUCTIONS
// ============================================================================

/**
 * Get filing instructions
 */
export async function getPlaybookFiling(): Promise<ApiResponse<PlaybookFiling>> {
  return apiGet<PlaybookFiling>('/api/playbook/filing');
}

/**
 * Update filing instructions
 */
export async function updatePlaybookFiling(
  filing: PlaybookFiling
): Promise<ApiResponse<PlaybookFiling>> {
  return apiPut<PlaybookFiling>('/api/playbook/filing', filing);
}
