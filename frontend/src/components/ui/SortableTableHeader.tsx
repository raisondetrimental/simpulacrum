/**
 * SortableTableHeader Component
 * Reusable table header with 3-state sorting (null → asc → desc)
 * Visual indicators: arrows and highlight for active column
 */

import React from 'react';
import { SortConfig } from '../../hooks/useTableSort';

interface SortableTableHeaderProps<T> {
  label: string;
  sortKey: keyof T;
  sortConfig: SortConfig<T>;
  onSort: (key: keyof T) => void;
  align?: 'left' | 'center' | 'right';
}

/**
 * Sortable table header cell with visual indicators
 *
 * @param label - Display text for the column
 * @param sortKey - Key to sort by (must match data object key)
 * @param sortConfig - Current sort configuration
 * @param onSort - Function to trigger sort
 * @param align - Text alignment (default: left)
 *
 * @example
 * <SortableTableHeader
 *   label="Partner Name"
 *   sortKey="name"
 *   sortConfig={sortConfig}
 *   onSort={requestSort}
 * />
 */
export function SortableTableHeader<T>({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = 'left',
}: SortableTableHeaderProps<T>) {
  const isActive = sortConfig.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th
      className={`
        table-header-cell cursor-pointer select-none
        transition-all duration-200
        ${alignClass}
        ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
      `}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{label}</span>
        <div className="flex flex-col w-3">
          {direction === 'asc' && (
            <span className="text-blue-600 text-sm leading-none">↑</span>
          )}
          {direction === 'desc' && (
            <span className="text-blue-600 text-sm leading-none">↓</span>
          )}
          {!direction && (
            <span className="text-gray-400 text-xs leading-none opacity-50 group-hover:opacity-100">
              ⇅
            </span>
          )}
        </div>
      </div>
    </th>
  );
}

/**
 * Standard (non-sortable) table header for consistency
 *
 * @example
 * <TableHeader label="Actions" align="right" />
 */
interface TableHeaderProps {
  label: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

export function TableHeader({ label, align = 'left', colSpan }: TableHeaderProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th className={`table-header-cell ${alignClass}`} colSpan={colSpan}>
      <span className="font-medium">{label}</span>
    </th>
  );
}
