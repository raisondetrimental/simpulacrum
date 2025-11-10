/**
 * Currency Mappings Utility
 * Maps country slugs to their currency codes for FX rate lookup
 */

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  armenia: 'AMD',
  mongolia: 'MNT',
  turkiye: 'TRY',
  uzbekistan: 'UZS',
  vietnam: 'VND',
};

/**
 * Get currency code for a country
 */
export const getCurrencyCode = (countrySlug: string): string | null => {
  return COUNTRY_CURRENCY_MAP[countrySlug.toLowerCase()] || null;
};

/**
 * Get currency display name
 */
export const getCurrencyName = (currencyCode: string): string => {
  const currencyNames: Record<string, string> = {
    AMD: 'Armenian Dram',
    MNT: 'Mongolian Tugrik',
    TRY: 'Turkish Lira',
    UZS: 'Uzbek Som',
    VND: 'Vietnamese Dong',
  };
  return currencyNames[currencyCode] || currencyCode;
};

/**
 * Format currency rate for display
 */
export const formatCurrencyRate = (rate: number, currencyCode: string): string => {
  // For currencies with large rates (like VND), show fewer decimal places
  const decimals = rate > 1000 ? 2 : rate > 10 ? 4 : 6;
  return rate.toFixed(decimals);
};
