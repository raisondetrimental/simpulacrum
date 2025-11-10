/**
 * useScrollReveal Hook
 * Detects when an element scrolls into view and triggers animation
 * Uses Intersection Observer API for performance
 */

import { useState, useEffect, useRef } from 'react';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for revealing elements on scroll
 *
 * @param options - Intersection Observer options
 * @param options.threshold - Percentage of element that must be visible (0-1, default: 0.1)
 * @param options.rootMargin - Margin around root (default: '0px')
 * @param options.triggerOnce - Only trigger once (default: true)
 * @returns Object with ref and isVisible state
 *
 * @example
 * const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
 *
 * <div
 *   ref={ref}
 *   className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
 * >
 *   Content revealed on scroll
 * </div>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show immediately
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Disconnect if triggerOnce is true
          if (triggerOnce && observer) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          // Allow re-hiding if not triggerOnce
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Hook variant with multiple reveal states for staggered animations
 *
 * @example
 * const refs = useMultipleScrollReveals(3);
 *
 * {items.map((item, index) => (
 *   <div
 *     key={item.id}
 *     ref={refs[index]}
 *     className={`transition ${isVisible[index] ? 'opacity-100' : 'opacity-0'}`}
 *   >
 *     {item.content}
 *   </div>
 * ))}
 */
export function useMultipleScrollReveals<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: ScrollRevealOptions = {}
) {
  const refs = useRef<Array<T | null>>([]);
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const {
      threshold = 0.1,
      rootMargin = '0px',
      triggerOnce = true
    } = options;

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleStates(prev => {
              const newStates = [...prev];
              newStates[index] = true;
              return newStates;
            });

            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setVisibleStates(prev => {
              const newStates = [...prev];
              newStates[index] = false;
              return newStates;
            });
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [count, options]);

  const setRef = (index: number) => (el: T | null) => {
    refs.current[index] = el;
  };

  return { setRef, visibleStates };
}
