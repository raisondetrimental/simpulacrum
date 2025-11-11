/**
 * CRM All - Table View Page (Hierarchical Table)
 *
 * Comprehensive hierarchical table view of all organisations with nested contacts
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrganizations, getAllContacts, downloadAllOrganizationsCSV } from '../../services/crmService';
import { UnifiedOrganization, UnifiedContact, OrganizationTypeFilter as FilterType } from '../../types/crm';
import OrganizationTypeBadge from '../../components/features/crm/OrganizationTypeBadge';
import OrganizationTypeFilter from '../../components/features/crm/OrganizationTypeFilter';

interface OrganizationWithContacts extends UnifiedOrganization {
  contacts: UnifiedContact[];
}

const AllTableViewPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCountry, setFilterCountry] = useState<string>('');

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

      // Build hierarchy
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

  // Apply filters
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || org.organization_type === filterType;
    const matchesCountry = !filterCountry || org.country === filterCountry;

    return matchesSearch && matchesType && matchesCountry;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Get unique countries
  const uniqueCountries = Array.from(new Set(organizations.map(o => o.country))).sort();

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterType !== 'all' || filterCountry;

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCountry('');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">All Organisations Table View</h1>
          <p className="text-gray-600 mt-1">{organizations.length} organisations</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/crm/all/organizations"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        {/* Search, Type, and Country */}
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

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredOrganizations.length} of {organizations.length} organisations
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrganizations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No organisations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation / Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country / Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => {
                  return (
                    <React.Fragment key={org.id}>
                      {/* Organisation Row */}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={getDetailLink(org)}
                            className="text-lg font-bold text-gray-900 hover:text-blue-600"
                          >
                            {org.name}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                            {org.starred && (
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrganizationTypeBadge type={org.organization_type} size="sm" />
                          {org.type && (
                            <div className="text-sm text-gray-600 mt-1">{org.type}</div>
                          )}
                          {org.agent_type && (
                            <div className="text-sm text-gray-600 mt-1">{org.agent_type}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {org.country}
                          <div className="text-xs text-gray-500 mt-1">{org.headquarters_location}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {/* Investment Range (all organization types) */}
                          {org.investment_min && org.investment_max && (
                            <div>
                              ${(org.investment_min / 1000000).toFixed(0)}M - ${(org.investment_max / 1000000).toFixed(0)}M {org.currency}
                            </div>
                          )}
                          {!org.investment_min && (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {org.contacts.length} contact(s)
                        </td>
                      </tr>

                      {/* Contact Rows */}
                      {org.contacts
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap pl-12">
                            <Link
                              to={getContactLink(contact)}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {contact.name}
                            </Link>
                            <div className="mt-1">
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
                                <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                  DISC: {contact.disc_profile}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" colSpan={2}>
                            {contact.role}
                            {contact.team_name && (
                              <div className="text-xs text-gray-500 mt-1">
                                Team: {contact.team_name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" colSpan={2}>
                            <div className="space-y-1">
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {contact.phone}
                                </div>
                              )}
                              {contact.next_contact_reminder && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Follow-up: {new Date(contact.next_contact_reminder).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTableViewPage;
