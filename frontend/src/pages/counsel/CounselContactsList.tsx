/**
 * Counsel Contacts List Page
 * Shows all counsel contacts grouped by Legal Advisor
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CounselContact, LegalAdvisor, ApiResponse } from '../../types/counsel';
import DownloadDropdown from '../../components/ui/DownloadDropdown';
import { API_BASE_URL } from '../../config';
import { downloadCounselContactsCSV, downloadCounselContactsXLSX } from '../../services/counselService';

interface CounselContactWithDetails extends CounselContact {
  legal_advisor?: LegalAdvisor;
}

const CounselContactsList: React.FC = () => {
  const [contacts, setContacts] = useState<CounselContactWithDetails[]>([]);
  const [advisors, setAdvisors] = useState<LegalAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdvisorId, setFilterAdvisorId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, advisorsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/counsel-contacts`),
        fetch(`${API_BASE_URL}/api/legal-advisors`)
      ]);

      const contactsResult: ApiResponse<CounselContact[]> = await contactsRes.json();
      const advisorsResult: ApiResponse<LegalAdvisor[]> = await advisorsRes.json();

      if (contactsResult.success && advisorsResult.success) {
        const advisorsMap = new Map(advisorsResult.data!.map(a => [a.id, a]));

        const contactsWithDetails = contactsResult.data!.map(contact => {
          const advisor = advisorsMap.get(contact.legal_advisor_id);
          return { ...contact, legal_advisor: advisor };
        });

        setContacts(contactsWithDetails);
        setAdvisors(advisorsResult.data!);
        setError(null);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };


  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.legal_advisor?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAdvisor = !filterAdvisorId || contact.legal_advisor_id === filterAdvisorId;

    return matchesSearch && matchesAdvisor;
  }).sort((a, b) => {
    // Sort by parent's starred status first, then alphabetically by contact name
    const aStarred = a.legal_advisor?.starred || false;
    const bStarred = b.legal_advisor?.starred || false;
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Group by legal advisor
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const advisorId = contact.legal_advisor_id;

    if (!acc[advisorId]) {
      acc[advisorId] = {
        advisor: contact.legal_advisor,
        contacts: []
      };
    }

    acc[advisorId].contacts.push(contact);
    return acc;
  }, {} as Record<string, { advisor?: LegalAdvisor; contacts: CounselContactWithDetails[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Counsel Contacts</h1>
          <p className="text-gray-600 mt-1">
            {contacts.length} contacts across {advisors.length} law firms
          </p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadCounselContactsCSV(filterAdvisorId || undefined)}
            onDownloadXLSX={() => downloadCounselContactsXLSX(filterAdvisorId || undefined)}
            label="Download"
          />
          <Link
            to="/counsel/legal-advisors"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Legal Advisors View
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Legal Advisor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Advisor
            </label>
            <select
              value={filterAdvisorId}
              onChange={(e) => setFilterAdvisorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Legal Advisors</option>
              {advisors.map(advisor => (
                <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterAdvisorId) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAdvisorId('');
            }}
            className="mt-3 text-sm text-purple-600 hover:text-purple-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Contacts Grouped by Legal Advisor */}
      <div className="space-y-6">
        {Object.keys(groupedContacts).length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-2 text-gray-600">No contacts found</p>
            {(searchTerm || filterAdvisorId) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterAdvisorId('');
                }}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedContacts).map(([advisorId, { advisor, contacts: advisorContacts }]) => (
            <div key={advisorId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Legal Advisor Header */}
              <div className="bg-purple-50 px-6 py-3 border-b border-purple-200">
                <Link
                  to={`/counsel/legal-advisors/${advisorId}`}
                  className="text-lg font-bold text-gray-900 hover:text-purple-600"
                >
                  {advisor?.name || 'Unknown Legal Advisor'}
                </Link>
                {advisor && (
                  <p className="text-sm text-gray-600">
                    {advisor.country} • {advisorContacts.length} contact(s)
                  </p>
                )}
              </div>

              {/* Contacts within Legal Advisor */}
              <div className="divide-y divide-gray-100">
                {advisorContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/counsel/contacts/${contact.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              contact.relationship === 'Strong'
                                ? 'bg-green-100 text-green-800'
                                : contact.relationship === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : contact.relationship === 'Developing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {contact.relationship}
                          </span>
                          {contact.disc_profile && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                              DISC: {contact.disc_profile}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{contact.role}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {contact.phone}
                            </span>
                          )}
                        </div>
                        {contact.next_contact_reminder && (
                          <p className="text-xs text-orange-600 mt-2">
                            Follow-up: {new Date(contact.next_contact_reminder).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CounselContactsList;
