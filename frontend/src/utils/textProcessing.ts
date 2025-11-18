/**
 * Text Processing Utilities
 * Functions for parsing, extracting, and formatting text content
 */

import { CONTENT_THRESHOLDS } from '../constants/typography';

/**
 * Content type for adaptive rendering
 */
export type ContentType = 'number' | 'short-text' | 'long-text';

/**
 * Detected metric with numeric value and context
 */
export interface ExtractedMetric {
  value: number;
  unit: string;
  context: string;
  rawText: string;
}

/**
 * Detect the type of content for adaptive rendering
 */
export const detectContentType = (value: any): ContentType => {
  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return 'short-text';
    }

    // Check for patterns that should always be long-text regardless of length
    // 1. Multiple commas (lists): "-, -, -3.1% (2023 proj), -3.1% (2024 proj)..."
    const commaCount = (trimmed.match(/,/g) || []).length;
    if (commaCount >= 3) {
      return 'long-text';
    }

    // 2. Multiple parentheses (time series): "(2023)", "(2024)", "(2025)"
    const parenCount = (trimmed.match(/\(/g) || []).length;
    if (parenCount >= 3) {
      return 'long-text';
    }

    // 3. Very long sequences of dashes/values
    if (/(?:[-\d.]+\s*,\s*){3,}/.test(trimmed)) {
      return 'long-text';
    }

    // 4. Multiple percentage values in sequence
    const percentCount = (trimmed.match(/%/g) || []).length;
    if (percentCount >= 3) {
      return 'long-text';
    }

    // 5. Year patterns repeated multiple times
    if (/\d{4}.*\d{4}.*\d{4}/.test(trimmed)) {
      return 'long-text';
    }

    // 6. Projection/forecast keywords with commas (typically time series)
    if ((trimmed.includes('proj') || trimmed.includes('forecast') || trimmed.includes('est')) && commaCount >= 2) {
      return 'long-text';
    }

    // Regular length-based detection
    if (trimmed.length <= CONTENT_THRESHOLDS.shortTextMaxLength) {
      return 'short-text';
    }
    return 'long-text';
  }

  return 'short-text';
};

/**
 * Extract key numeric values from narrative text
 * Finds patterns like "18%", "$5.3 billion", "4.5", etc.
 */
export const extractKeyNumbers = (text: string): ExtractedMetric[] => {
  const metrics: ExtractedMetric[] = [];

  // Pattern: number followed by % (e.g., "18.5%", "~18%")
  const percentageRegex = /~?\s*(\d+\.?\d*)\s*%/g;
  let match;

  while ((match = percentageRegex.exec(text)) !== null) {
    metrics.push({
      value: parseFloat(match[1]),
      unit: '%',
      context: extractContext(text, match.index, 50),
      rawText: match[0],
    });
  }

  // Pattern: currency values (e.g., "$5.3 billion", "USD 100 million")
  const currencyRegex = /(?:USD?|\$|€|£)\s*(\d+\.?\d*)\s*(billion|million|bn|mn)?/gi;

  while ((match = currencyRegex.exec(text)) !== null) {
    let value = parseFloat(match[1]);
    const multiplier = match[2]?.toLowerCase();

    if (multiplier === 'billion' || multiplier === 'bn') {
      value *= 1000; // Convert to millions for consistency
    }

    metrics.push({
      value,
      unit: match[2] ? `${match[2].toUpperCase()}` : 'USD',
      context: extractContext(text, match.index, 50),
      rawText: match[0],
    });
  }

  // Pattern: standalone numbers in context (e.g., "growth of 5.3", "ratio of 12")
  const numberRegex = /(\d+\.?\d+)/g;
  const numbers = text.match(numberRegex);

  if (numbers && metrics.length === 0) {
    // Only use standalone numbers if no other patterns found
    const firstNumber = parseFloat(numbers[0]);
    metrics.push({
      value: firstNumber,
      unit: '',
      context: extractContext(text, text.indexOf(numbers[0]), 50),
      rawText: numbers[0],
    });
  }

  return metrics;
};

/**
 * Extract context around a position in text
 */
const extractContext = (text: string, position: number, radius: number): string => {
  const start = Math.max(0, position - radius);
  const end = Math.min(text.length, position + radius);
  let context = text.substring(start, end);

  // Trim to word boundaries
  if (start > 0) {
    const firstSpace = context.indexOf(' ');
    if (firstSpace > 0) {
      context = '...' + context.substring(firstSpace);
    }
  }

  if (end < text.length) {
    const lastSpace = context.lastIndexOf(' ');
    if (lastSpace > 0) {
      context = context.substring(0, lastSpace) + '...';
    }
  }

  return context.trim();
};

/**
 * Extract the first N sentences from text
 */
export const extractSummary = (
  text: string,
  sentenceCount: number = CONTENT_THRESHOLDS.defaultSummarySentences
): string => {
  if (!text) return '';

  // Split by sentence boundaries (., !, ?)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length <= sentenceCount) {
    return text;
  }

  return sentences.slice(0, sentenceCount).join(' ').trim();
};

/**
 * Detect and convert text with list patterns into bullet array
 * Handles patterns like:
 * - "(1) Item one (2) Item two"
 * - "First; Second; Third"
 * - Line breaks
 */
export const convertToBullets = (text: string): string[] => {
  if (!text) return [];

  // Pattern 1: Numbered items like "(1)", "(i)", "1.", "a."
  const numberedPattern = /\(?\d+\)?\.?\s+|\([ivxlc]+\)\s+|[a-z]\.\s+/gi;
  if (numberedPattern.test(text)) {
    const bullets = text
      .split(numberedPattern)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (bullets.length > 1) {
      return bullets;
    }
  }

  // Pattern 2: Semicolon-separated items
  if (text.includes(';')) {
    const bullets = text
      .split(';')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (bullets.length > 1) {
      return bullets;
    }
  }

  // Pattern 3: Line breaks
  if (text.includes('\n')) {
    const bullets = text
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (bullets.length > 1) {
      return bullets;
    }
  }

  // No list pattern detected
  return [];
};

/**
 * Smart text truncation at sentence boundaries
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Try to truncate at sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentenceEnd > maxLength * 0.7) {
    // Use sentence boundary if it's not too early
    return text.substring(0, lastSentenceEnd + 1).trim();
  }

  // Otherwise truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return text.substring(0, lastSpace).trim() + '...';
  }

  return truncated.trim() + '...';
};

/**
 * Check if text is likely a narrative description vs a short value
 */
export const isNarrative = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;

  const trimmed = text.trim();

  // Check for sentence indicators
  const hasSentences = /[.!?]/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;

  return hasSentences && wordCount > 10;
};

/**
 * Format a number with appropriate precision
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(decimals);
};

/**
 * Extract the most relevant metric from text
 * Returns the first percentage found, or first number if no percentage
 */
export const extractPrimaryMetric = (text: string): ExtractedMetric | null => {
  const metrics = extractKeyNumbers(text);

  if (metrics.length === 0) {
    return null;
  }

  // Prefer percentages
  const percentage = metrics.find(m => m.unit === '%');
  if (percentage) {
    return percentage;
  }

  // Otherwise return first metric
  return metrics[0];
};
