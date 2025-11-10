/**
 * useCountUp Hook
 * Animates a number from start value to end value with easing
 * Uses requestAnimationFrame for smooth 60fps animation
 */

import { useState, useEffect } from 'react';

/**
 * Easing function: easeOutQuart
 * Smooth deceleration curve
 */
function easeOutQuart(progress: number): number {
  return 1 - Math.pow(1 - progress, 4);
}

/**
 * Hook for animating number counters
 *
 * @param end - Target number to count to
 * @param duration - Animation duration in milliseconds (default: 1000ms)
 * @param start - Starting number (default: 0)
 * @param decimals - Number of decimal places to show (default: 0)
 * @returns Current animated value
 *
 * @example
 * const animatedCount = useCountUp(totalPartners, 1000);
 * <span>{animatedCount}</span>
 */
export function useCountUp(
  end: number,
  duration: number = 1000,
  start: number = 0,
  decimals: number = 0
): number {
  const [count, setCount] = useState(start);

  useEffect(() => {
    // Don't animate if end value is 0 or negative
    if (end <= 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing function
      const easedProgress = easeOutQuart(progress);

      // Calculate current value
      const currentValue = start + (end - start) * easedProgress;

      // Round to specified decimal places
      const roundedValue = decimals > 0
        ? Math.round(currentValue * Math.pow(10, decimals)) / Math.pow(10, decimals)
        : Math.floor(currentValue);

      setCount(roundedValue);

      // Continue animation if not complete
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start, decimals]);

  return count;
}

/**
 * Hook variant for formatting large numbers with commas
 *
 * @example
 * const formatted = useCountUpFormatted(1234567);
 * // Returns: "1,234,567"
 */
export function useCountUpFormatted(
  end: number,
  duration: number = 1000,
  start: number = 0
): string {
  const count = useCountUp(end, duration, start, 0);
  return count.toLocaleString();
}

/**
 * Hook variant for percentages
 *
 * @example
 * const percentage = useCountUpPercentage(87.5, 1000, 0, 1);
 * // Returns: "87.5%"
 */
export function useCountUpPercentage(
  end: number,
  duration: number = 1000,
  start: number = 0,
  decimals: number = 0
): string {
  const count = useCountUp(end, duration, start, decimals);
  return `${count}%`;
}
