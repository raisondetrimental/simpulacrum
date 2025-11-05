/**
 * CRM All - Contacts Page (Grouped by Organisation)
 *
 * List view of all contacts grouped by their parent organisations
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllContacts, getAllOrganizations, downloadAllContactsCSV, downloadAllContactsXLSX } from '../../services/crmService';
import { UnifiedContact, UnifiedOrganization, OrganizationTypeFilter as FilterType } from '../../types/crm';
import OrganizationTypeBadge from '../../components/features/crm/OrganizationTypeBadge';
import OrganizationTypeFilter from '../../components/features/crm/OrganizationTypeFilter';
import DownloadDropdown from '../../components/ui/DownloadDropdown';

interface ContactWithOrganization extends UnifiedContact {
  organization?: UnifiedOrganization;
}

const AllContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactWithOrganization[]>([]);
  const [organizations, setOrganizations] = useState<UnifiedOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterOrganizationId, setFilterOrganizationId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsData, orgsData] = await Promise.all([
        getAllContacts(),
        getAllOrganizations()
      ]);

      const orgsMap = new Map(orgsData.map(o => [o.id, o]));

      const contactsWithOrg = contactsData.map(contact => {
        const organization = orgsMap.get(contact.organization_id);
        return { ...contact, organization };
      });

      setContacts(contactsWithOrg);
      setOrganizations(orgsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
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
      contact.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.organization?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || contact.organization_type === filterType;
    const matchesOrganization = !filterOrganizationId || contact.organization_id === filterOrganizationId;

    return matchesSearch && matchesType && matchesOrganization;
  }).sort((a, b) => {
    // Sort by parent's starred status first, then alphabetically by contact name
    const aStarred = a.organization?.starred || false;
    const bStarred = b.organization?.starred || false;
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    return a.name.localeCompare(b.name);
  });

  // Group by organization
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const orgId = contact.organization_id;

    if (!acc[orgId]) {
      acc[orgId] = {
        organization: contact.organization,
        contacts: []
      };
    }

    acc[orgId].contacts.push(contact);
    return acc;
  }, {} as Record<string, { organization?: UnifiedOrganization; contacts: ContactWithOrganization[] }>);

  const getContactLink = (contact: UnifiedContact): string => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/contacts',
      sponsor: '/sponsors/contacts',
      counsel: '/counsel/contacts',
      agent: '/agents/contacts'
    };
    return `${routes[contact.organization_type]}/${contact.id}`;
  };

  const getOrganizationLink = (org: UnifiedOrganization): string => {
    const routes: Record<string, string> = {
      capital_partner: '/liquidity/capital-partners',
      sponsor: '/sponsors/corporates',
      counsel: '/counsel/legal-advisors',
      agent: '/agents'
    };
    return `${routes[org.organization_type]}/${org.id}`;
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
        <button
          onClick={loadData}
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
          <h1 className="text-3xl font-bold text-gray-900">All Contacts</h1>
          <p className="text-gray-600 mt-1">
            {contacts.length} contacts across {organizations.length} organisations
          </p>
        </div>
        <div className="flex gap-3">
          <DownloadDropdown
            onDownloadCSV={() => downloadAllContactsCSV(filterType !== 'all' ? { organization_type: filterType } : undefined)}
            onDownloadXLSX={() => downloadAllContactsXLSX(filterType !== 'all' ? { organization_type: filterType } : undefined)}
            label="Download"
          />
          <Link
            to="/crm/all/organizations"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Organisations View
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, email, team..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Organization Type Filter */}
          <OrganizationTypeFilter
            value={filterType}
            onChange={setFilterType}
          />

          {/* Organisation Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation
            </label>
            <select
              value={filterOrganizationId}
              onChange={(e) => setFilterOrganizationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Organisations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterType !== 'all' || filterOrganizationId) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterOrganizationId('');
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Contacts Grouped by Organisation */}
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
            {(searchTerm || filterType !== 'all' || filterOrganizationId) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterOrganizationId('');
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedContacts).map(([orgId, { organization, contacts: orgContacts }]) => (
            <div key={orgId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Organisation Header */}
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                <div className="flex items-center gap-3">
                  <Link
                    to={organization ? getOrganizationLink(organization) : '#'}
                    className="text-lg font-bold text-gray-900 hover:text-blue-600"
                  >
                    {organization?.name || 'Unknown Organisation'}
                  </Link>
                  {organization && (
                    <>
                      <OrganizationTypeBadge type={organization.organization_type} size="sm" />
                      {organization.starred && (
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </>
                  )}
                </div>
                {organization && (
                  <p className="text-sm text-gray-600">
                    {organization.country} • {organization.headquarters_location} • {orgContacts.length} contact(s)
                  </p>
                )}
              </div>

              {/* Contacts in Organisation */}
              <div className="divide-y divide-gray-100">
                {orgContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={getContactLink(contact)}
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
                        {contact.role && (
                          <p className="text-sm text-gray-600 mt-1">{contact.role}</p>
                        )}
                        {contact.team_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            Team: {contact.team_name}
                          </p>
                        )}
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

export default AllContactsPage;
