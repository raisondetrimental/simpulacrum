/**
 * Organization Type Badge Component
 *
 * Displays a color-coded badge showing the organization type
 */

import React from 'react';
import { OrganizationType, getOrganizationTypeLabel, getOrganizationTypeColor } from '../../../types/crm';

interface OrganizationTypeBadgeProps {
  type: OrganizationType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OrganizationTypeBadge: React.FC<OrganizationTypeBadgeProps> = ({
  type,
  size = 'md',
  className = ''
}) => {
  const { bg, text } = getOrganizationTypeColor(type);
  const label = getOrganizationTypeLabel(type);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${bg} ${text} ${sizeClasses[size]} ${className}`}
    >
      {label}
    </span>
  );
};

export default OrganizationTypeBadge;
