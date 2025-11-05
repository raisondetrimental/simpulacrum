/**
 * CRM All - Organisations Page (Hierarchical View)
 *
 * List view of all organisations across all four types with expandable contacts
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrganizations, getAllContacts, downloadAllOrganizationsCSV, downloadAllOrganizationsXLSX } from '../../services/crmService';
import { UnifiedOrganization, UnifiedContact, OrganizationFilter, OrganizationTypeFilter as FilterType } from '../../types/crm';
import OrganizationTypeBadge from '../../components/features/crm/OrganizationTypeBadge';
import OrganizationTypeFilter from '../../components/features/crm/OrganizationTypeFilter';
import DownloadDropdown from '../../components/ui/DownloadDropdown';

interface OrganizationWithContacts extends UnifiedOrganization {
  contacts: UnifiedContact[];
}

const AllOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgsData, contactsData] = await Promise.all([
        getAllOrganizations(),
        getAllContacts()
      ]);

      // Build hierarchy: Organisations → Contacts
      const orgsWithContacts = orgsData.map(org => {
        const orgContacts = contactsData.filter(c => c.organization_id === org.id);
        return {
          ...org,
          contacts: orgContacts
        };
      });

      setOrganizations(orgsWithContacts);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganization = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  // Filter organisations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contacts.some(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    const matchesType = filterType === 'all' || org.organization_type === filterType;
    const matchesCountry = !filterCountry || org.country === filterCountry;

    return matchesSearch && matchesType && matchesCountry;
  }).sort((a, b) => {
    // Sort starred items first, then alphabetically
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get unique countries
  const uniqueCountries = Array.from(new Set(organizations.map(o => o.country))).sort();

  const getDetailLink = (org: UnifiedOrganization): string => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/capital-partners',
      sponsor: '/sponsors/corporates',
      counsel: '/counsel/legal-advisors',
      agent: '/agents'
    };
    return `${routes[org.organization_type]}/${org.id}`;
  };

  const getContactLink = (contact: UnifiedContact): string => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/contacts',
      sponsor: '/sponsors/contacts',
      counsel: '/counsel/contacts',
      agent: '/agents/contacts'
    };
    return `${routes[contact.organization_type]}/${contact.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={loadData} className="mt-2 text-sm text-red-600 hover:text-red-800">
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
          <h1 className="text-3xl font-bold text-gray-900">All Organisations</h1>
          <p className="text-gray-600 mt-1">{organizations.length} organisations</p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadAllOrganizationsCSV()}
            onDownloadXLSX={() => downloadAllOrganizationsXLSX()}
            label="Download"
          />
          <Link
            to="/crm/all/table"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </Link>
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
              placeholder="Search organisations, contacts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <OrganizationTypeFilter
            value={filterType}
            onChange={setFilterType}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || filterType !== 'all' || filterCountry) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCountry('');
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredOrganizations.length} of {organizations.length} organisations
      </div>

      {/* Hierarchical Organisations List */}
      <div className="space-y-3">
        {filteredOrganizations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No organisations found</p>
          </div>
        ) : (
          filteredOrganizations.map((org) => {
            const isOrgExpanded = expandedOrgs.has(org.id);

            return (
              <div key={org.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Organization Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleOrganization(org.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isOrgExpanded ? 'rotate-90' : ''}`}
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
                            to={getDetailLink(org)}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600"
                          >
                            {org.name}
                          </Link>
                          {org.starred && (
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          <OrganizationTypeBadge type={org.organization_type} size="sm" />
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              org.relationship === 'Strong'
                                ? 'bg-green-100 text-green-800'
                                : org.relationship === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : org.relationship === 'Developing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {org.relationship}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {org.country} • {org.headquarters_location} • {org.contacts.length} contact(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contacts (when expanded) */}
                {isOrgExpanded && (
                  <div className="divide-y divide-gray-200">
                    {org.contacts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p>No contacts yet</p>
                      </div>
                    ) : (
                      org.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <div key={contact.id} className="px-6 py-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Link
                                  to={getContactLink(contact)}
                                  className="text-lg font-semibold text-gray-900 hover:text-blue-600"
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
                              {contact.role && (
                                <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                              )}
                              {contact.team_name && (
                                <p className="text-sm text-gray-500 mb-2">
                                  Team: {contact.team_name}
                                </p>
                              )}
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
    </div>
  );
};

export default AllOrganizationsPage;
