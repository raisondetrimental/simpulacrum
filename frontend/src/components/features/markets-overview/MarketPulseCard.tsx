/**
 * Market Pulse Card Component
 * Displays key market metrics with color-coded changes
 */
import React from 'react';

interface MarketPulseCardProps {
  title: string;
  value: string | number;
  change?: number | null;
  changeLabel?: string;
  unit?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

const MarketPulseCard: React.FC<MarketPulseCardProps> = ({
  title,
  value,
  change,
  changeLabel = '1D',
  unit = '',
  loading = false,
  icon
}) => {
  const getChangeColor = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'text-gray-500';
    return val >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeBgColor = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'bg-gray-100';
    return val >= 0 ? 'bg-green-50' : 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="mb-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
      </div>

      {change !== undefined && change !== null && (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getChangeBgColor(change)} ${getChangeColor(change)}`}>
          <span className="mr-1">{change >= 0 ? '↑' : '↓'}</span>
          <span>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}
          </span>
          <span className="ml-1 text-xs text-gray-500">({changeLabel})</span>
        </div>
      )}
    </div>
  );
};

export default MarketPulseCard;
