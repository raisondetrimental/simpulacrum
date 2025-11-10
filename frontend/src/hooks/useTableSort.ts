/**
 * useTableSort Hook
 * Provides sortable table functionality with 3-state sorting:
 * null (default) → ascending → descending → null
 */

import { useState, useMemo } from 'react';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: 'asc' | 'desc' | null;
}

/**
 * Compare two values for sorting
 * Handles strings, numbers, dates, and null/undefined
 */
function compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return direction === 'asc' ? 1 : -1;
  if (b == null) return direction === 'asc' ? -1 : 1;

  // Convert to lowercase for string comparison
  const aVal = typeof a === 'string' ? a.toLowerCase() : a;
  const bVal = typeof b === 'string' ? b.toLowerCase() : b;

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return direction === 'asc'
      ? a.getTime() - b.getTime()
      : b.getTime() - a.getTime();
  }

  // Handle numbers
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  }

  // Handle strings
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return direction === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  }

  // Fallback: convert to string
  const aStr = String(aVal);
  const bStr = String(bVal);
  return direction === 'asc'
    ? aStr.localeCompare(bStr)
    : bStr.localeCompare(aStr);
}

/**
 * Hook for managing table sorting
 *
 * @param data - Array of data to sort
 * @param initialSortKey - Optional initial sort column
 * @returns Object with sortedData, sortConfig, and requestSort function
 *
 * @example
 * const { sortedData, sortConfig, requestSort } = useTableSort(partners, 'name');
 *
 * <th onClick={() => requestSort('name')}>
 *   Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
 * </th>
 */
export function useTableSort<T extends Record<string, any>>(
  data: T[],
  initialSortKey?: keyof T
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialSortKey || null,
    direction: initialSortKey ? 'asc' : null,
  });

  const sortedData = useMemo(() => {
    // No sorting if key is null
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    // Create a copy and sort
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      return compareValues(aValue, bValue, sortConfig.direction!);
    });
  }, [data, sortConfig]);

  /**
   * Request sort on a specific column
   * Cycles through: null → asc → desc → null
   */
  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    // Cycle through states
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({
      key: direction ? key : null,
      direction
    });
  };

  return { sortedData, sortConfig, requestSort };
}
