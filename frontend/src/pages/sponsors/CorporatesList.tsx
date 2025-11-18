/**
 * Corporates List Page (Hierarchical View)
 * Shows Corporates > Contacts
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Corporate, SponsorContact, ApiResponse, CorporateFormData, SponsorContactFormData } from '../../types/sponsors';
import CorporateForm from '../../components/features/sponsors/CorporateForm';
import SponsorContactForm from '../../components/features/sponsors/SponsorContactForm';
import DownloadDropdown from '../../components/ui/DownloadDropdown';
import { API_BASE_URL } from '../../config';
import { downloadCorporatesCSV, downloadCorporatesXLSX } from '../../services/sponsorsService';

interface CorporateWithContacts extends Corporate {
  contacts: SponsorContact[];
}

const CorporatesList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [corporates, setCorporates] = useState<CorporateWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [expandedCorporates, setExpandedCorporates] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setCreateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [selectedCorporateForContact, setSelectedCorporateForContact] = useState<Corporate | null>(null);
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
      const [corporatesRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/corporates`),
        fetch(`${API_BASE_URL}/api/sponsor-contacts`)
      ]);

      const corporatesResult: ApiResponse<Corporate[]> = await corporatesRes.json();
      const contactsResult: ApiResponse<SponsorContact[]> = await contactsRes.json();

      if (corporatesResult.success && contactsResult.success) {
        // Build hierarchy
        const contactsMap = new Map<string, SponsorContact[]>();

        contactsResult.data!.forEach(contact => {
          if (!contactsMap.has(contact.corporate_id)) {
            contactsMap.set(contact.corporate_id, []);
          }
          contactsMap.get(contact.corporate_id)!.push(contact);
        });

        const corporatesWithContacts = corporatesResult.data!.map(corporate => ({
          ...corporate,
          contacts: contactsMap.get(corporate.id) || []
        }));

        setCorporates(corporatesWithContacts);
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

  const toggleCorporate = (corporateId: string) => {
    const newExpanded = new Set(expandedCorporates);
    if (newExpanded.has(corporateId)) {
      newExpanded.delete(corporateId);
    } else {
      newExpanded.add(corporateId);
    }
    setExpandedCorporates(newExpanded);
  };

  const handleCreateCorporate = async (formData: CorporateFormData) => {
    setCreateStatus('saving');

    try {
      const response = await fetch(`${API_BASE_URL}/api/corporates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Corporate> = await response.json();

      if (result.success && result.data) {
        setCreateStatus('success');
        setShowCreateModal(false);
        // Refresh the list
        await fetchData();
        setTimeout(() => setCreateStatus('idle'), 2000);
      } else {
        setCreateStatus('error');
        alert(result.message || 'Failed to create corporate');
      }
    } catch (err) {
      setCreateStatus('error');
      alert('Failed to create corporate');
    }
  };

  const handleCreateContact = async (formData: SponsorContactFormData) => {
    setCreateContactStatus('saving');

    try {
      const response = await fetch(`${API_BASE_URL}/api/sponsor-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<SponsorContact> = await response.json();

      if (result.success && result.data) {
        setCreateContactStatus('success');
        setShowCreateContactModal(false);
        setSelectedCorporateForContact(null);
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


  // Filter corporates
  const filteredCorporates = corporates.filter(corporate => {
    const matchesSearch =
      corporate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corporate.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corporate.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || corporate.type === filterType;
    const matchesCountry = !filterCountry || corporate.country === filterCountry;

    return matchesSearch && matchesType && matchesCountry;
  }).sort((a, b) => {
    // Sort starred items first, then alphabetically
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get unique types and countries
  const uniqueTypes = Array.from(new Set(corporates.map(c => c.type).filter(Boolean))).sort();
  const uniqueCountries = Array.from(new Set(corporates.map(c => c.country))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Corporates</h1>
          <p className="text-gray-600 mt-1">{corporates.length} sponsors</p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadCorporatesCSV()}
            onDownloadXLSX={() => downloadCorporatesXLSX()}
            label="Download"
          />
          <Link
            to="/sponsors/corporates-table"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </Link>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Corporate
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
              placeholder="Search corporates, contacts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="mt-3 text-sm text-green-600 hover:text-green-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCorporates.length} of {corporates.length} corporates
      </div>

      {/* Hierarchical Corporates List */}
      <div className="space-y-3">
        {filteredCorporates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No corporates found</p>
          </div>
        ) : (
          filteredCorporates.map((corporate) => {
            const isExpanded = expandedCorporates.has(corporate.id);

            return (
              <div key={corporate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Corporate Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleCorporate(corporate.id)}
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
                            to={`/sponsors/corporates/${corporate.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-green-600"
                          >
                            {corporate.name}
                          </Link>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              corporate.relationship === 'Strong'
                                ? 'bg-green-100 text-green-800'
                                : corporate.relationship === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : corporate.relationship === 'Developing'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {corporate.relationship}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {corporate.type || 'Other'} • {corporate.country} • {corporate.contacts.length} contact(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCorporateForContact(corporate);
                        setShowCreateContactModal(true);
                      }}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                    >
                      + Add Contact
                    </button>
                  </div>
                </div>

                {/* Contacts (when expanded) */}
                {isExpanded && (
                  <div className="divide-y divide-gray-200">
                    {corporate.contacts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p>No contacts yet</p>
                        <button
                          onClick={() => {
                            setSelectedCorporateForContact(corporate);
                            setShowCreateContactModal(true);
                          }}
                          className="mt-2 inline-block text-green-600 hover:text-green-800 text-sm"
                        >
                          Create first contact
                        </button>
                      </div>
                    ) : (
                      corporate.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <div key={contact.id} className="px-6 py-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Link
                                  to={`/sponsors/contacts/${contact.id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-green-600"
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
                                      ? 'bg-green-100 text-green-800'
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
                              {contact.role && <p className="text-sm text-gray-600 mb-2">{contact.role}</p>}
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
                              to={`/sponsors/meeting-notes/${contact.id}`}
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

      {/* Create Corporate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Corporate</h2>
            </div>
            <div className="p-6">
              <CorporateForm
                onSave={handleCreateCorporate}
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
      {showCreateContactModal && selectedCorporateForContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Contact</h2>
            </div>
            <div className="p-6">
              <SponsorContactForm
                corporateId={selectedCorporateForContact.id}
                corporateName={selectedCorporateForContact.name}
                onSave={handleCreateContact}
                onCancel={() => {
                  setShowCreateContactModal(false);
                  setSelectedCorporateForContact(null);
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

export default CorporatesList;
