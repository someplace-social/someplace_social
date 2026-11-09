export type CityPriceConfig = {
  currencyCode: string;
  currencySymbol: string;
  unitSuffix: string;
  maxPrice: number;
  step: number;
  underValue: number;
  underLabel: string;
  midLabel: string;
};

export type CityAlertBanner = {
  message: string;
  linkText?: string;
  linkHref?: string;
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
  alertBanner?: CityAlertBanner;
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
      unitSuffix: 'k',
      maxPrice: 100,
      step: 5,
      underValue: 40,
      underLabel: 'Under 40k',
      midLabel: '50k',
    },
    alertBanner: {
      message: 'Much of this info is likely out of date. Working on a new verification method. Check back soon.',
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
      unitSuffix: '',
      maxPrice: 50,
      step: 5,
      underValue: 10,
      underLabel: 'Under $10',
      midLabel: '$25',
    },
    alertBanner: {
      message: 'Nov 8, 2026: This page is new! Info may not be correct yet. Having issues?',
      linkText: 'Contact.',
      linkHref: '/contact',
    },
  },
};

export const DEFAULT_USD_PRICE_CONFIG: CityPriceConfig = {
  currencyCode: 'USD',
  currencySymbol: '$',
  unitSuffix: '',
  maxPrice: 50,
  step: 5,
  underValue: 10,
  underLabel: 'Under $10',
  midLabel: '$25',
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