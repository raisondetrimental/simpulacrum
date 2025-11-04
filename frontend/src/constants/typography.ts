/**
 * Typography Constants
 * Consistent text styles for country page components
 */

export const TYPOGRAPHY = {
  // Metric display styles based on content type
  METRIC_DISPLAY: {
    numeric: 'text-4xl font-bold',
    shortText: 'text-xl font-semibold',
    longText: 'text-base font-normal',
  },

  // Card component styles
  CARD: {
    title: 'text-sm font-semibold uppercase tracking-wide text-gray-500',
    subtitle: 'text-xs text-gray-600 mt-1',
    body: 'text-sm leading-relaxed text-gray-700',
    bodyLarge: 'text-base leading-relaxed text-gray-700',
  },

  // Section heading styles
  SECTION: {
    h1: 'text-2xl font-bold text-gray-900',
    h2: 'text-xl font-semibold text-gray-800',
    h3: 'text-lg font-semibold text-gray-800',
    h4: 'text-base font-semibold text-gray-700',
  },

  // Layout constants
  LAYOUT: {
    maxLinesCollapsed: 3,
    maxWidthReadable: '75ch', // ~75 characters for optimal readability
    cardPadding: 'p-5',
    cardPaddingCompact: 'p-4',
    sectionSpacing: 'space-y-6',
  },

  // Animation classes
  ANIMATION: {
    transition: 'transition-all duration-300 ease-in-out',
    hoverScale: 'hover:scale-[1.02] transition-transform duration-200',
  },
} as const;

// Content type detection thresholds
export const CONTENT_THRESHOLDS = {
  shortTextMaxLength: 50,
  summaryMaxLength: 150,
  defaultSummarySentences: 2,
} as const;

// Responsive grid configurations
export const GRID_CONFIGS = {
  metrics: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  metricsCompact: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  textCards: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  fullWidth: 'grid grid-cols-1 gap-4',
} as const;
