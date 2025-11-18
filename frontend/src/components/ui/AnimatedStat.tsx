/**
 * AnimatedStat Component
 * Displays numbers with count-up animation using easing
 * Reusable for dashboard metrics, statistics, and cards
 */

import { useCountUp, useCountUpFormatted, useCountUpPercentage } from '../../hooks/useCountUp';

interface AnimatedStatProps {
  value: number;
  duration?: number;
  decimals?: number;
  format?: 'number' | 'formatted' | 'percentage';
  prefix?: string;
  suffix?: string;
  className?: string;
  loading?: boolean;
}

/**
 * Animated statistic with count-up effect
 *
 * @param value - Target number to animate to
 * @param duration - Animation duration in milliseconds (default: 1000)
 * @param decimals - Number of decimal places (default: 0)
 * @param format - Display format: 'number', 'formatted' (with commas), or 'percentage'
 * @param prefix - Text to display before the number (e.g., "$", "Total: ")
 * @param suffix - Text to display after the number (e.g., "M", " deals")
 * @param className - Additional CSS classes
 * @param loading - Show skeleton loader while loading
 *
 * @example
 * // Simple number
 * <AnimatedStat value={42} />
 *
 * // Formatted with commas
 * <AnimatedStat value={1234567} format="formatted" />
 *
 * // Percentage
 * <AnimatedStat value={87.5} format="percentage" decimals={1} />
 *
 * // Currency
 * <AnimatedStat value={15000000} format="formatted" prefix="$" suffix="M" />
 *
 * // Loading state
 * <AnimatedStat value={partners?.length || 0} loading={!partners} />
 */
export function AnimatedStat({
  value,
  duration = 1000,
  decimals = 0,
  format = 'number',
  prefix = '',
  suffix = '',
  className = '',
  loading = false,
}: AnimatedStatProps) {
  // Always call hooks unconditionally (Rules of Hooks)
  const animatedNumber = useCountUp(value, duration, 0, decimals);
  const formattedNumber = useCountUpFormatted(value, duration, 0);
  const percentageNumber = useCountUpPercentage(value, duration, 0, decimals);

  // Loading skeleton
  if (loading) {
    return (
      <span className={`inline-block bg-gray-200 rounded animate-pulse h-8 w-20 ${className}`} />
    );
  }

  // Get display value based on format
  let displayValue: string;
  switch (format) {
    case 'formatted':
      displayValue = formattedNumber;
      break;
    case 'percentage':
      displayValue = percentageNumber;
      break;
    case 'number':
    default:
      displayValue = decimals > 0 ? animatedNumber.toFixed(decimals) : String(animatedNumber);
  }

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

/**
 * Animated metric card with label and value
 *
 * @example
 * <AnimatedMetricCard
 *   label="Total Partners"
 *   value={42}
 *   icon="👥"
 *   format="formatted"
 * />
 */
interface AnimatedMetricCardProps {
  label: string;
  value: number;
  duration?: number;
  decimals?: number;
  format?: 'number' | 'formatted' | 'percentage';
  prefix?: string;
  suffix?: string;
  icon?: string;
  loading?: boolean;
  className?: string;
}

export function AnimatedMetricCard({
  label,
  value,
  duration = 1000,
  decimals = 0,
  format = 'number',
  prefix = '',
  suffix = '',
  icon,
  loading = false,
  className = '',
}: AnimatedMetricCardProps) {
  return (
    <div className={`metric-card ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      {loading ? (
        <div className="skeleton h-9 w-24" />
      ) : (
        <div className="text-3xl font-semibold text-gray-900">
          <AnimatedStat
            value={value}
            duration={duration}
            decimals={decimals}
            format={format}
            prefix={prefix}
            suffix={suffix}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Compact stat for inline use
 *
 * @example
 * <CompactAnimatedStat label="Active" value={15} suffix=" deals" />
 */
interface CompactAnimatedStatProps {
  label: string;
  value: number;
  duration?: number;
  format?: 'number' | 'formatted' | 'percentage';
  suffix?: string;
  loading?: boolean;
}

export function CompactAnimatedStat({
  label,
  value,
  duration = 800,
  format = 'number',
  suffix = '',
  loading = false,
}: CompactAnimatedStatProps) {
  return (
    <div className="inline-flex items-baseline gap-1.5">
      <span className="text-sm text-gray-600">{label}:</span>
      {loading ? (
        <span className="skeleton h-4 w-8 inline-block" />
      ) : (
        <span className="text-sm font-semibold text-gray-900">
          <AnimatedStat
            value={value}
            duration={duration}
            format={format}
            suffix={suffix}
          />
        </span>
      )}
    </div>
  );
}
