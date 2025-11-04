/**
 * Utility functions for country image paths
 * Handles mapping between country slugs and image asset folders
 */

interface CountryImagePaths {
  flag: string;
  map: string;
  capital: string;
}

interface CountryMetadata {
  folderName: string;
  flagFileName: string;
  mapFileName: string;
  capitalFileName: string;
}

/**
 * Mapping of country slugs to their image metadata
 * Note: Turkey uses 'turkey' folder but 'turkiye' slug
 */
const COUNTRY_IMAGE_METADATA: Record<string, CountryMetadata> = {
  armenia: {
    folderName: 'armenia',
    flagFileName: 'Armenia Flag.png',
    mapFileName: 'armenia map.png',
    capitalFileName: 'Yerevan.jpg'
  },
  mongolia: {
    folderName: 'mongolia',
    flagFileName: 'Mongolia Flag.png',
    mapFileName: 'mongolia map.png',
    capitalFileName: 'Ulaanbatar.jpg'
  },
  turkiye: {
    folderName: 'turkey', // Folder is 'turkey' but slug is 'turkiye'
    flagFileName: 'Turkiye Flag.png',
    mapFileName: 'turkiye map.png',
    capitalFileName: 'Ankara.jpg'
  },
  uzbekistan: {
    folderName: 'uzbekistan',
    flagFileName: 'Uzbekistan Flag.jpg', // Note: JPG format
    mapFileName: 'uzbekistan map.png',
    capitalFileName: 'Tashkent.jpg'
  },
  vietnam: {
    folderName: 'vietnam',
    flagFileName: 'Vietnam Flag.png',
    mapFileName: 'vietnam map.png',
    capitalFileName: 'Hanoi.jpg'
  }
};

/**
 * Get image paths for a specific country
 * @param countrySlug - The country slug (e.g., 'armenia', 'turkiye')
 * @returns Object containing paths to flag, map, and capital images
 */
export const getCountryImages = (countrySlug: string): CountryImagePaths => {
  const metadata = COUNTRY_IMAGE_METADATA[countrySlug.toLowerCase()];

  if (!metadata) {
    console.warn(`No image metadata found for country: ${countrySlug}`);
    return {
      flag: '',
      map: '',
      capital: ''
    };
  }

  const baseFolder = `/assets/countries/${metadata.folderName}`;

  return {
    flag: `${baseFolder}/${metadata.flagFileName}`,
    map: `${baseFolder}/${metadata.mapFileName}`,
    capital: `${baseFolder}/${metadata.capitalFileName}`
  };
};

/**
 * Get the capital city name for a country
 * @param countrySlug - The country slug
 * @returns The capital city name
 */
export const getCapitalName = (countrySlug: string): string => {
  const metadata = COUNTRY_IMAGE_METADATA[countrySlug.toLowerCase()];

  if (!metadata) {
    return '';
  }

  // Extract capital name from filename (remove .jpg extension)
  return metadata.capitalFileName.replace('.jpg', '');
};
