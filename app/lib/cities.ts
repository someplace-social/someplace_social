export type CityPriceConfig = {
  currencyCode: string;
  currencySymbol: string;
  maxPrice: number;
  step: number;
  underValue: number;
  underLabel: string;
  midLabel: string;
  formatValue: (val: number) => string;
  formatReadout: (val: number) => string;
};

export type CityConfig = {
  slug: string;
  name: string;
  region: string;
  heroLocation: string;
  sheetTab: string;
  sheetGid?: string;
  spreadsheetId?: string;
  csvUrl?: string;
  introTitle?: string;
  introDescription?: string;
  priceConfig?: CityPriceConfig;
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
    introTitle: 'Medellin Community Listings',
    introDescription:
      'Community supported events, group activities, and weekly classes all in one place. Find traveler friendly language exchanges, free salsa classes, fun parties, and other stuff to do in Medellin, Colombia.',
    priceConfig: {
      currencyCode: 'COP',
      currencySymbol: '$',
      maxPrice: 100,
      step: 5,
      underValue: 40,
      underLabel: 'Under 40k',
      midLabel: '50k',
      formatValue: (val: number) => (val === 0 ? 'Free' : `${val}k`),
      formatReadout: (val: number) =>
        val === 0
          ? 'Free / donation'
          : val === 40
          ? 'Under 40k'
          : val >= 100
          ? 'Any price'
          : `Up to ${val}k`,
    },
  },
  'fort-collins-colorado': {
    slug: 'fort-collins-colorado',
    name: 'Fort Collins',
    region: 'Colorado',
    heroLocation: 'Fort Collins, Colorado',
    sheetTab: 'Fort Collins',
    sheetGid: '466758538',
    spreadsheetId: MAIN_SPREADSHEET_ID,
    introTitle: 'Fort Collins Community Listings',
    introDescription:
      'Community supported events, group activities, and weekly classes all in one place. Find local pub trivia, live music jams, board game nights, open mics, and other stuff to do in Fort Collins, Colorado.',
    priceConfig: {
      currencyCode: 'USD',
      currencySymbol: '$',
      maxPrice: 50,
      step: 5,
      underValue: 10,
      underLabel: 'Under $10',
      midLabel: '$25',
      formatValue: (val: number) => (val === 0 ? 'Free' : `$${val}`),
      formatReadout: (val: number) =>
        val === 0
          ? 'Free / donation'
          : val === 10
          ? 'Under $10'
          : val >= 50
          ? 'Any price'
          : `Up to $${val}`,
    },
  },
};

export const DEFAULT_USD_PRICE_CONFIG: CityPriceConfig = {
  currencyCode: 'USD',
  currencySymbol: '$',
  maxPrice: 50,
  step: 5,
  underValue: 10,
  underLabel: 'Under $10',
  midLabel: '$25',
  formatValue: (val: number) => (val === 0 ? 'Free' : `$${val}`),
  formatReadout: (val: number) =>
    val === 0
      ? 'Free / donation'
      : val === 10
      ? 'Under $10'
      : val >= 50
      ? 'Any price'
      : `Up to $${val}`,
};

export function getCityPriceConfig(city?: CityConfig): CityPriceConfig {
  if (city?.priceConfig) return city.priceConfig;
  if (city?.region?.toLowerCase().includes('colombia') || city?.slug?.includes('colombia')) {
    return CITIES['medellin-colombia'].priceConfig!;
  }
  return DEFAULT_USD_PRICE_CONFIG;
}

export function getCityBySlug(slug: string): CityConfig | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return CITIES[normalized];
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITIES);
}

export function getAllCities(): CityConfig[] {
  return Object.values(CITIES).sort((a, b) => a.name.localeCompare(b.name));
}