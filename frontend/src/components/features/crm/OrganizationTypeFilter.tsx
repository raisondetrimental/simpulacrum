/**
 * Organization Type Filter Component
 *
 * Dropdown filter for selecting organization type
 */

import React from 'react';
import { OrganizationTypeFilter as FilterType, ORGANIZATION_TYPE_LABELS } from '../../../types/crm';

interface OrganizationTypeFilterProps {
  value: FilterType;
  onChange: (type: FilterType) => void;
  className?: string;
  showAllOption?: boolean;
}

const OrganizationTypeFilter: React.FC<OrganizationTypeFilterProps> = ({
  value,
  onChange,
  className = '',
  showAllOption = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor="org-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Organization Type
      </label>
      <select
        id="org-type-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as FilterType)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
      >
        {showAllOption && <option value="all">All Types</option>}
        <option value="capital_partner">{ORGANIZATION_TYPE_LABELS.capital_partner}</option>
        <option value="sponsor">{ORGANIZATION_TYPE_LABELS.sponsor}</option>
        <option value="counsel">{ORGANIZATION_TYPE_LABELS.counsel}</option>
        <option value="agent">{ORGANIZATION_TYPE_LABELS.agent}</option>
      </select>
    </div>
  );
};

export default OrganizationTypeFilter;
