/**
 * Legal Advisors List Page (Hierarchical View)
 * Shows Legal Advisors > Counsel Contacts
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LegalAdvisor, CounselContact, ApiResponse, LegalAdvisorFormData, CounselContactFormData } from '../../types/counsel';
import LegalAdvisorForm from '../../components/features/counsel/LegalAdvisorForm';
import CounselContactForm from '../../components/features/counsel/CounselContactForm';
import DownloadDropdown from '../../components/ui/DownloadDropdown';
import { apiGet, apiPost } from '../../services/api';
import { downloadLegalAdvisorsCSV, downloadLegalAdvisorsXLSX } from '../../services/counselService';

interface LegalAdvisorWithContacts extends LegalAdvisor {
  contacts: CounselContact[];
}

const LegalAdvisorsList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [legalAdvisors, setLegalAdvisors] = useState<LegalAdvisorWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [expandedAdvisors, setExpandedAdvisors] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setCreateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [selectedAdvisorForContact, setSelectedAdvisorForContact] = useState<LegalAdvisor | null>(null);
  const [, setCreateContactStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchData();
  }, []);

  // Check for add query parameter and open modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setShowCreateModal(true);
      // Remove query parameter from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [advisorsResult, contactsResult] = await Promise.all([
        apiGet<LegalAdvisor[]>('/api/legal-advisors'),
        apiGet<CounselContact[]>('/api/counsel-contacts')
      ]);

      if (advisorsResult.success && contactsResult.success) {
        // Build hierarchy
        const contactsMap = new Map<string, CounselContact[]>();

        contactsResult.data!.forEach(contact => {
          if (!contactsMap.has(contact.legal_advisor_id)) {
            contactsMap.set(contact.legal_advisor_id, []);
          }
          contactsMap.get(contact.legal_advisor_id)!.push(contact);
        });

        const advisorsWithContacts = advisorsResult.data!.map(advisor => ({
          ...advisor,
          contacts: contactsMap.get(advisor.id) || []
        }));

        setLegalAdvisors(advisorsWithContacts);
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

  const toggleAdvisor = (advisorId: string) => {
    const newExpanded = new Set(expandedAdvisors);
    if (newExpanded.has(advisorId)) {
      newExpanded.delete(advisorId);
    } else {
      newExpanded.add(advisorId);
    }
    setExpandedAdvisors(newExpanded);
  };

  const handleCreateAdvisor = async (formData: LegalAdvisorFormData) => {
    setCreateStatus('saving');

    try {
      const result = await apiPost<LegalAdvisor>('/api/legal-advisors', formData);

      if (result.success && result.data) {
        setCreateStatus('success');
        setShowCreateModal(false);
        // Refresh the list
        await fetchData();
        setTimeout(() => setCreateStatus('idle'), 2000);
      } else {
        setCreateStatus('error');
        alert(result.message || 'Failed to create legal advisor');
      }
    } catch (err) {
      setCreateStatus('error');
      alert('Failed to create legal advisor');
    }
  };

  const handleCreateContact = async (formData: CounselContactFormData) => {
    setCreateContactStatus('saving');

    try {
      const result = await apiPost<CounselContact>('/api/counsel-contacts', formData);

      if (result.success && result.data) {
        setCreateContactStatus('success');
        setShowCreateContactModal(false);
        setSelectedAdvisorForContact(null);
        // Refresh the list
        await fetchData();
        setTimeout(() => setCreateContactStatus('idle'), 2000);
      } else {
        setCreateContactStatus('error');
        alert(result.message || 'Failed to create contact');
      }
    } catch (err) {
      setCreateContactStatus('error');
      alert('Failed to create contact');
    }
  };


  // Filter legal advisors
  const filteredAdvisors = legalAdvisors.filter(advisor => {
    const matchesSearch =
      advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || advisor.type === filterType;
    const matchesCountry = !filterCountry || advisor.country === filterCountry;

    return matchesSearch && matchesType && matchesCountry;
  }).sort((a, b) => {
    // Sort starred items first, then alphabetically
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get unique types and countries
  const uniqueTypes = Array.from(new Set(legalAdvisors.map(a => a.type).filter(Boolean))).sort();
  const uniqueCountries = Array.from(new Set(legalAdvisors.map(a => a.country))).sort();

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
        <button onClick={fetchData} className="mt-2 text-sm text-red-600 hover:text-red-800">
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
          <h1 className="text-3xl font-bold text-gray-900">Legal Advisors</h1>
          <p className="text-gray-600 mt-1">{legalAdvisors.length} law firms</p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadLegalAdvisorsCSV()}
            onDownloadXLSX={() => downloadLegalAdvisorsXLSX()}
            label="Download"
          />
          <Link
            to="/counsel/legal-advisors-table"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </Link>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Legal Advisor
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search legal advisors, contacts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || filterType || filterCountry) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterCountry('');
            }}
            className="mt-3 text-sm text-purple-600 hover:text-purple-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAdvisors.length} of {legalAdvisors.length} legal advisors
      </div>

      {/* Hierarchical Legal Advisors List */}
      <div className="space-y-3">
        {filteredAdvisors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No legal advisors found</p>
          </div>
        ) : (
          filteredAdvisors.map((advisor) => {
            const isExpanded = expandedAdvisors.has(advisor.id);

            return (
              <div key={advisor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Advisor Header */}
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleAdvisor(advisor.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/counsel/legal-advisors/${advisor.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-purple-600"
                          >
                            {advisor.name}
                          </Link>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              advisor.relationship === 'Strong'
                                ? 'bg-green-100 text-green-800'
                                : advisor.relationship === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : advisor.relationship === 'Developing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {advisor.relationship}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {advisor.type || 'Other'} • {advisor.country} • {advisor.contacts.length} contact(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAdvisorForContact(advisor);
                        setShowCreateContactModal(true);
                      }}
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      + Add Contact
                    </button>
                  </div>
                </div>

                {/* Contacts (when expanded) */}
                {isExpanded && (
                  <div className="divide-y divide-gray-200">
                    {advisor.contacts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p>No contacts yet</p>
                        <button
                          onClick={() => {
                            setSelectedAdvisorForContact(advisor);
                            setShowCreateContactModal(true);
                          }}
                          className="mt-2 inline-block text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Create first contact
                        </button>
                      </div>
                    ) : (
                      advisor.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <div key={contact.id} className="px-6 py-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Link
                                  to={`/counsel/contacts/${contact.id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-purple-600"
                                >
                                  {contact.name}
                                </Link>
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
                              <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
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
                            <Link
                              to={`/counsel/meeting-notes/${contact.id}`}
                              className="ml-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              Meeting Notes
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Legal Advisor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Legal Advisor</h2>
            </div>
            <div className="p-6">
              <LegalAdvisorForm
                onSave={handleCreateAdvisor}
                onCancel={() => {
                  setShowCreateModal(false);
                  setCreateStatus('idle');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Contact Modal */}
      {showCreateContactModal && selectedAdvisorForContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Contact</h2>
            </div>
            <div className="p-6">
              <CounselContactForm
                legalAdvisorId={selectedAdvisorForContact.id}
                legalAdvisorName={selectedAdvisorForContact.name}
                onSave={handleCreateContact}
                onCancel={() => {
                  setShowCreateContactModal(false);
                  setSelectedAdvisorForContact(null);
                  setCreateContactStatus('idle');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAdvisorsList;
