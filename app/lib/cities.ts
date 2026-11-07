export type CityConfig = {
  slug: string;
  name: string;
  region: string;
  heroLocation: string;
  sheetTab: string;
  sheetGid?: string;
  csvUrl?: string;
};

export const CITIES: Record<string, CityConfig> = {
  'medellin-colombia': {
    slug: 'medellin-colombia',
    name: 'Medellín',
    region: 'Colombia',
    heroLocation: 'Medellín, Colombia',
    sheetTab: 'Medellin',
    sheetGid: '0',
  },
  'fort-collins-colorado': {
    slug: 'fort-collins-colorado',
    name: 'Fort Collins',
    region: 'Colorado',
    heroLocation: 'Fort Collins, Colorado',
    sheetTab: 'Fort Collins',
  },
  'fortcollins-colorado': {
    slug: 'fort-collins-colorado',
    name: 'Fort Collins',
    region: 'Colorado',
    heroLocation: 'Fort Collins, Colorado',
    sheetTab: 'Fort Collins',
  },
};

export function getCityBySlug(slug: string): CityConfig | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return CITIES[normalized];
}

export function getAllCitySlugs(): string[] {
  return ['medellin-colombia', 'fort-collins-colorado'];
}