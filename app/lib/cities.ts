export type CityConfig = {
  slug: string;
  name: string;
  region: string;
  heroLocation: string;
  sheetTab: string;
  sheetGid?: string;
  spreadsheetId?: string;
  csvUrl?: string;
};

export const MAIN_SPREADSHEET_ID = '1dl6clB28uxBDz9Vq6B4H9l2N2iu1ayTBkPDCkiWsHsU';

export const CITIES: Record<string, CityConfig> = {
  'medellin-colombia': {
    slug: 'medellin-colombia',
    name: 'Medellín',
    region: 'Colombia',
    heroLocation: 'Medellín, Colombia',
    sheetTab: 'Medellin',
    sheetGid: '0',
    spreadsheetId: MAIN_SPREADSHEET_ID,
  },
  'fort-collins-colorado': {
    slug: 'fort-collins-colorado',
    name: 'Fort Collins',
    region: 'Colorado',
    heroLocation: 'Fort Collins, Colorado',
    sheetTab: 'Fort Collins',
    sheetGid: '466758538',
    spreadsheetId: MAIN_SPREADSHEET_ID,
  },
};

export function getCityBySlug(slug: string): CityConfig | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return CITIES[normalized];
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITIES);
}

export function getAllCities(): CityConfig[] {
  return Object.values(CITIES);
}