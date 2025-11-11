/**
 * Agents service (Agents Module)
 * Handles transaction agents and their contacts
 */
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';
import type {
  Agent,
  AgentContact,
  AgentFormData,
  AgentContactFormData,
  AgentMeetingNoteFormData,
  AgentMeetingReminder
} from '../types/agents';

// ============================================================================
// Agents API
// ============================================================================

/**
 * Get all agents
 */
export async function getAgents(): Promise<ApiResponse<Agent[]>> {
  return apiGet('/api/agents');
}

/**
 * Get a specific agent by ID
 */
export async function getAgent(id: string): Promise<ApiResponse<Agent>> {
  return apiGet(`/api/agents/${id}`);
}

/**
 * Create a new agent
 */
export async function createAgent(data: AgentFormData): Promise<ApiResponse<Agent>> {
  return apiPost('/api/agents', data);
}

/**
 * Update an existing agent
 */
export async function updateAgent(id: string, data: Partial<AgentFormData>): Promise<ApiResponse<Agent>> {
  return apiPut(`/api/agents/${id}`, data);
}

/**
 * Delete an agent
 */
export async function deleteAgent(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/agents/${id}`);
}

export async function toggleAgentStar(id: string): Promise<ApiResponse<Agent>> {
  return apiPut(`/api/agents/${id}/star`, {});
}

// ============================================================================
// Agent Contacts API
// ============================================================================

/**
 * Get all agent contacts, optionally filtered by agent ID
 */
export async function getAgentContacts(agentId?: string): Promise<ApiResponse<AgentContact[]>> {
  const query = agentId ? `?agent_id=${agentId}` : '';
  return apiGet(`/api/agent-contacts${query}`);
}

/**
 * Get a specific agent contact by ID
 */
export async function getAgentContact(id: string): Promise<ApiResponse<AgentContact>> {
  return apiGet(`/api/agent-contacts/${id}`);
}

/**
 * Create a new agent contact
 */
export async function createAgentContact(data: AgentContactFormData): Promise<ApiResponse<AgentContact>> {
  return apiPost('/api/agent-contacts', data);
}

/**
 * Update an existing agent contact
 */
export async function updateAgentContact(id: string, data: Partial<AgentContactFormData>): Promise<ApiResponse<AgentContact>> {
  return apiPut(`/api/agent-contacts/${id}`, data);
}

/**
 * Delete an agent contact
 */
export async function deleteAgentContact(id: string): Promise<ApiResponse> {
  return apiDelete(`/api/agent-contacts/${id}`);
}

// ============================================================================
// Agent Meeting Notes API
// ============================================================================

/**
 * Save agent meeting notes (atomic update of contact + agent + preferences)
 */
export async function saveAgentMeeting(data: AgentMeetingNoteFormData): Promise<ApiResponse<AgentContact>> {
  return apiPost('/api/agent-meetings', data);
}

/**
 * Get agent contacts with upcoming/overdue follow-up reminders
 */
export async function getAgentReminders(): Promise<ApiResponse<AgentMeetingReminder[]>> {
  return apiGet('/api/agent-meetings/reminders');
}

/**
 * Update a specific meeting note
 */
export async function updateAgentMeetingNote(
  contactId: string,
  meetingId: string,
  data: {
    notes?: string;
    participants?: string;
    next_follow_up?: string | null;
  }
): Promise<ApiResponse<AgentContact>> {
  return apiPut(`/api/agent-contacts/${contactId}/meetings/${meetingId}`, data);
}

/**
 * Delete a specific meeting note
 */
export async function deleteAgentMeetingNote(contactId: string, meetingId: string): Promise<ApiResponse> {
  return apiDelete(`/api/agent-contacts/${contactId}/meetings/${meetingId}`);
}

/**
 * Get deals for a specific agent
 */
export async function getAgentDeals(agentId: string): Promise<ApiResponse<any[]>> {
  return apiGet(`/api/agents/${agentId}/deals`);
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Export agents to CSV format
 */
export function exportAgentsToCSV(agents: Agent[]): string {
  const headers = [
    'Agent ID',
    'Name',
    'Agent Type',
    'Country',
    'Headquarters',
    'Relationship',
    'Countries',
    // Agent Preferences
    'Transport Infra',
    'Energy Infra',
    'US Market',
    'Emerging Markets',
    'Asia EM',
    'Africa EM',
    'EMEA EM',
    // Other fields
    'Notes',
    'Created At',
    'Last Updated',
  ];

  const rows = agents.map(agent => [
    agent.id,
    agent.name,
    agent.agent_type,
    agent.country,
    agent.headquarters_location || '',
    agent.relationship || '',
    Array.isArray(agent.countries) ? agent.countries.join(', ') : '',
    // Agent Preferences
    agent.agent_preferences?.transport_infra || '',
    agent.agent_preferences?.energy_infra || '',
    agent.agent_preferences?.us_market || '',
    agent.agent_preferences?.emerging_markets || '',
    agent.agent_preferences?.asia_em || '',
    agent.agent_preferences?.africa_em || '',
    agent.agent_preferences?.emea_em || '',
    // Other fields
    agent.notes || '',
    agent.created_at || '',
    agent.last_updated || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download agents as CSV file
 */
export async function downloadAgentsCSV(): Promise<void> {
  const response = await getAgents();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch agents for export');
  }

  const csv = exportAgentsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `agents_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export agent contacts to CSV format
 */
export function exportAgentContactsToCSV(contacts: AgentContact[]): string {
  const headers = [
    'Contact ID',
    'Agent ID',
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
    'Last Updated',
  ];

  const rows = contacts.map(contact => [
    contact.id,
    contact.agent_id,
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
    contact.last_updated || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download agent contacts as CSV file
 */
export async function downloadAgentContactsCSV(agentId?: string): Promise<void> {
  const response = await getAgentContacts(agentId);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch agent contacts for export');
  }

  const csv = exportAgentContactsToCSV(response.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `agent_contacts_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// XLSX Export Functions
// ============================================================================

/**
 * Download agents as XLSX file
 */
export async function downloadAgentsXLSX(): Promise<void> {
  const response = await getAgents();

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch agents for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(agent => ({
    'Agent ID': agent.id,
    'Name': agent.name,
    'Agent Type': agent.agent_type,
    'Country': agent.country,
    'Headquarters': agent.headquarters_location || '',
    'Relationship': agent.relationship || '',
    // Agent Preferences
    'Transport Infra': agent.agent_preferences?.transport_infra || '',
    'Energy Infra': agent.agent_preferences?.energy_infra || '',
    'US Market': agent.agent_preferences?.us_market || '',
    'Emerging Markets': agent.agent_preferences?.emerging_markets || '',
    'Asia EM': agent.agent_preferences?.asia_em || '',
    'Africa EM': agent.agent_preferences?.africa_em || '',
    'EMEA EM': agent.agent_preferences?.emea_em || '',
    'Vietnam': agent.agent_preferences?.vietnam || '',
    'Mongolia': agent.agent_preferences?.mongolia || '',
    'Turkey': agent.agent_preferences?.turkey || '',
    // Other fields
    'Notes': agent.notes || '',
    'Created At': agent.created_at || '',
    'Last Updated': agent.last_updated || '',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');

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
  XLSX.writeFile(workbook, `agents_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Download agent contacts as XLSX file
 */
export async function downloadAgentContactsXLSX(agentId?: string): Promise<void> {
  const response = await getAgentContacts(agentId);

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch agent contacts for export');
  }

  // Dynamic import of xlsx library
  const XLSX = await import('xlsx');

  // Prepare data for Excel
  const data = response.data.map(contact => ({
    'Contact ID': contact.id,
    'Agent ID': contact.agent_id,
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
    'Last Updated': contact.last_updated || '',
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agent Contacts');

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
  XLSX.writeFile(workbook, `agent_contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
}
