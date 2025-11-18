/**
 * Structured Text Parsing Utilities
 * Parse complex text patterns into structured data for better display
 */

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  year: string;           // "2022", "2023", "2024"
  value: number;          // 64.5
  unit: string;           // "%", "million", "bn USD"
  annotation?: string;    // "sharp decline", "proj", "est"
  isProjection: boolean;  // true if projected/estimated
  rawText: string;        // Original text segment
}

/**
 * Scope definition (includes/excludes pattern)
 */
export interface ScopeDefinition {
  includes: string[];
  excludes: string[];
  rawIncludes?: string;
  rawExcludes?: string;
}

/**
 * Extracted key fact
 */
export interface KeyFact {
  text: string;
  hasMetric: boolean;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Decomposed narrative structure
 */
export interface NarrativeStructure {
  timeSeries?: TimeSeriesPoint[];
  scope?: ScopeDefinition;
  context: string;
  keyFacts: KeyFact[];
  hasStructuredData: boolean;
}

/**
 * Parse time series data from text
 * Matches patterns like: "64.5% (2022)", "45.9% (2023 - sharp decline)", "46.0% (2025 proj)"
 */
export function parseTimeSeriesData(text: string): TimeSeriesPoint[] {
  if (!text) return [];

  const points: TimeSeriesPoint[] = [];

  // Pattern: value + unit (optional) + (year + annotation (optional))
  // Examples: "64.5% (2022)", "45.9% (2023 - sharp decline)", "12.3 billion (2024 proj)"
  const timeSeriesPattern = /(\d+\.?\d*)\s*(%|billion|million|bn|mn|thousand)?\s*\((\d{4})(?:\s*[-–—]\s*(.+?))?\)/gi;

  let match;
  while ((match = timeSeriesPattern.exec(text)) !== null) {
    const [fullMatch, valueStr, unit, year, annotation] = match;

    // Check if this is projection/estimate
    const annotationLower = (annotation || '').toLowerCase();
    const isProjection = /proj|est|forecast|predicted|expected/.test(annotationLower + fullMatch.toLowerCase());

    points.push({
      year,
      value: parseFloat(valueStr),
      unit: unit || '',
      annotation: annotation?.trim(),
      isProjection,
      rawText: fullMatch,
    });
  }

  return points;
}

/**
 * Parse includes/excludes scope definition
 */
export function parseScopeDefinition(text: string): ScopeDefinition | null {
  if (!text) return null;

  const includesMatch = text.match(/Includes[:\s]+([^.]+?)\.?\s*(?:Excludes|$)/i);
  const excludesMatch = text.match(/Excludes[:\s]+([^.]+?)\.?\s*$/i);

  if (!includesMatch && !excludesMatch) {
    return null;
  }

  const parseList = (listText: string): string[] => {
    if (!listText) return [];

    // Split by common delimiters
    const items = listText
      .split(/[;,]|(?:\s+and\s+)/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 200); // Sanity check

    return items;
  };

  return {
    includes: includesMatch ? parseList(includesMatch[1]) : [],
    excludes: excludesMatch ? parseList(excludesMatch[1]) : [],
    rawIncludes: includesMatch?.[1],
    rawExcludes: excludesMatch?.[1],
  };
}

/**
 * Extract key facts from text
 * Identifies sentences with metrics, trends, or important information
 */
export function extractKeyFacts(text: string): KeyFact[] {
  if (!text) return [];

  // Split by sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  const facts: KeyFact[] = sentences.map(sentence => {
    const trimmed = sentence.trim();

    // Check if sentence contains metrics
    const hasMetric = /\d+\.?\d*\s*(%|billion|million|bn|mn|thousand|USD|EUR)/.test(trimmed);

    // Check importance keywords
    const hasHighImportance = /\b(significant|substantial|major|sharp|critical|key|primary|main|increased markedly|declined significantly)\b/i.test(trimmed);
    const hasMediumImportance = /\b(moderate|continued|steady|maintained|remained|stable)\b/i.test(trimmed);

    let importance: 'high' | 'medium' | 'low' = 'low';
    if (hasHighImportance || hasMetric) {
      importance = 'high';
    } else if (hasMediumImportance) {
      importance = 'medium';
    }

    return {
      text: trimmed,
      hasMetric,
      importance,
    };
  });

  return facts.filter(fact => fact.text.length > 10 && fact.text.length < 300);
}

/**
 * Decompose narrative text into structured components
 */
export function decomposeNarrative(text: string): NarrativeStructure {
  if (!text) {
    return {
      context: '',
      keyFacts: [],
      hasStructuredData: false,
    };
  }

  // Extract time series
  const timeSeries = parseTimeSeriesData(text);

  // Extract scope definition
  const scope = parseScopeDefinition(text);

  // Remove time series and scope text to get remaining context
  let remainingText = text;

  // Remove scope definition text
  if (scope) {
    remainingText = remainingText.replace(/Includes[:\s]+[^.]+\.\s*/gi, '');
    remainingText = remainingText.replace(/Excludes[:\s]+[^.]+\.\s*/gi, '');
  }

  // Remove time series segments
  timeSeries.forEach(point => {
    remainingText = remainingText.replace(point.rawText, '');
  });

  // Clean up remaining text
  remainingText = remainingText
    .replace(/\s*,\s*,/g, ',')  // Remove double commas
    .replace(/\s{2,}/g, ' ')     // Remove extra spaces
    .replace(/\.\s*\./g, '.')    // Remove double periods
    .trim();

  // Extract key facts from remaining context
  const keyFacts = extractKeyFacts(remainingText);

  return {
    timeSeries: timeSeries.length > 0 ? timeSeries : undefined,
    scope: scope || undefined,
    context: remainingText,
    keyFacts,
    hasStructuredData: timeSeries.length > 0 || !!scope,
  };
}

/**
 * Detect if text contains time series pattern
 */
export function detectTimeSeriesPattern(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  // Look for at least 2 year-value pairs with standard format
  const pattern = /\d+\.?\d*\s*(%|billion|million|bn|mn)?\s*\(\d{4}[^)]*\)/gi;
  const matches = text.match(pattern);

  if ((matches?.length || 0) >= 2) return true;

  // Also detect comma-separated list patterns with years and projections
  // Pattern: "-, -, -3.1% (2023 proj), -3.1% (2024 proj), -3.6% (2025 proj)"
  const commaListPattern = /(?:[-\d.]+%?\s*(?:\([^)]*\))?,\s*){2,}/gi;
  const yearInListPattern = /\d{4}\s*(?:proj|est|forecast)/i;

  if (commaListPattern.test(text) && yearInListPattern.test(text)) {
    return true;
  }

  // Detect sequences of years with dashes: "2023, 2024, 2025" or with values
  const yearSequencePattern = /\d{4}(?:\s*[-–—]\s*\d{4}|\s*,\s*\d{4}){1,}/;
  if (yearSequencePattern.test(text)) {
    return true;
  }

  return false;
}

/**
 * Detect if text contains includes/excludes pattern
 */
export function detectIncludesExcludes(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  return /\b(includes|excludes)\b[:\s]/i.test(text);
}

/**
 * Detect if text is a multi-fact paragraph (5+ sentences with metrics)
 */
export function detectMultiFactPattern(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const sentencesWithMetrics = sentences.filter(s =>
    /\d+\.?\d*\s*(%|billion|million|bn|mn|thousand)/.test(s)
  );

  return sentencesWithMetrics.length >= 3;
}

/**
 * Calculate percentage change between two values
 * Special handling: if unit is "%", shows absolute difference (percentage points) instead of percentage change
 */
export function calculateChange(current: number, previous: number, unit?: string): {
  absolute: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  displayMode: 'percent' | 'points';
} {
  const absolute = current - previous;

  // Special case: For percentage values, show absolute difference (percentage points)
  // Example: 19% → 17% should show "-2pp" not "-10.5%"
  if (unit === '%') {
    return {
      absolute,
      percentage: absolute, // Store as points, not percentage
      direction: Math.abs(absolute) > 0.1 ? (absolute > 0 ? 'up' : 'down') : 'neutral',
      displayMode: 'points',
    };
  }

  // For non-percentage values, calculate percentage change as usual
  const percentage = previous !== 0 ? (absolute / previous) * 100 : 0;

  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (Math.abs(percentage) > 0.1) {
    direction = absolute > 0 ? 'up' : 'down';
  }

  return {
    absolute,
    percentage,
    direction,
    displayMode: 'percent',
  };
}

/**
 * Extract headline from text (first sentence or first N words)
 * Useful for creating clean titles from narrative text
 */
export function extractHeadline(text: string, maxWords: number = 8): string {
  if (!text) return '';

  // Get first sentence
  const sentences = text.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim() || '';

  // If first sentence is short enough, return it
  if (firstSentence.split(/\s+/).length <= maxWords) {
    return firstSentence;
  }

  // Otherwise, limit to maxWords
  const words = firstSentence.split(/\s+/);
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }

  return firstSentence;
}

/**
 * Deduplicate time series points by year
 * When multiple values exist for the same year (e.g., different metrics),
 * keep only the first occurrence to avoid confusion
 */
export function dedupTimeSeriesByYear(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
  const seen = new Set<string>();
  return points.filter(p => {
    if (seen.has(p.year)) {
      return false;
    }
    seen.add(p.year);
    return true;
  });
}

/**
 * Get trend emoji based on direction and context
 */
export function getTrendEmoji(direction: 'up' | 'down' | 'neutral', isGood?: boolean): string {
  if (direction === 'neutral') return '─';

  // If isGood is specified, use it to determine emoji
  if (isGood !== undefined) {
    if (direction === 'up') return isGood ? '↗' : '⬆';
    if (direction === 'down') return isGood ? '⬇' : '↘';
  }

  // Default emojis
  if (direction === 'up') return '↗';
  if (direction === 'down') return '⬇';

  return '─';
}
