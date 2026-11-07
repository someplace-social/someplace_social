import { CityConfig, CITIES } from './cities';

export type Event = {
  id: string;
  title: string;
  venue: string;
  organization: string;
  location: string;
  area: string;
  activity1: string;
  activity2: string;
  activity3: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  frequency: string;
  price: string;
  preRegistration: string;
  map: string;
  social: string;
  website: string;
  contact: string;
  about: string;
  notes: string;
  database: string;
};

const DEFAULT_SPREADSHEET_ID = '1dI6cIB28uxBDz9Vq6B4H912N2iu1ayTBkPDCkiWsHsU';

function getCandidateUrls(city: CityConfig): string[] {
  if (city.csvUrl) return [city.csvUrl];

  const gid = city.sheetGid || '0';
  const spreadsheetId = city.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const tabName = encodeURIComponent(city.sheetTab);

  return [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${tabName}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`,
  ];
}

function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      if (inQuotes && csvText[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
    } else {
      currentField += char;
    }
  }
  currentRow.push(currentField);
  rows.push(currentRow);
  return rows;
}

const normalizeHeader = (header: string): string => header.toLowerCase().replace(/[^a-z0-9]/g, '');

const HEADER_ALIASES: Record<string, string[]> = {
  id: ['id'],
  title: ['title', 'eventname', 'name'],
  venue: ['venue', 'place'],
  organization: ['organization', 'organizer', 'host'],
  location: ['location', 'address'],
  area: ['area', 'neighborhood'],
  activity1: ['activity1', 'activity'],
  activity2: ['activity2'],
  activity3: ['activity3'],
  dayOfWeek: ['dayofweek', 'day', 'days'],
  startTime: ['starttime', 'start'],
  endTime: ['endtime', 'end'],
  frequency: ['frequency'],
  price: ['price', 'cost'],
  preRegistration: ['preregistration', 'prereg'],
  map: ['map', 'googlemap', 'googlemaplink', 'maps'],
  social: ['social', 'socialmedia', 'socialmedialink', 'instagram'],
  website: ['website', 'site', 'url'],
  contact: ['contact', 'whatsapp', 'phone'],
  about: ['about', 'description'],
  notes: ['notes', 'note'],
  database: ['database', 'db', 'sheet'],
};

const DEFAULT_INDEX_FALLBACK: Record<string, number> = {
  id: 0,
  title: 1,
  venue: 2,
  organization: 2,
  location: 3,
  area: 4,
  activity1: 5,
  activity2: 6,
  activity3: 7,
  dayOfWeek: 8,
  startTime: 9,
  endTime: 10,
  frequency: 11,
  price: 12,
  preRegistration: 13,
  map: 14,
  social: 15,
  website: 16,
  contact: 17,
  about: 18,
  notes: 19,
};

export async function getEvents(cityOrTab?: CityConfig | string): Promise<Event[]> {
  try {
    let cityConfig: CityConfig;
    if (typeof cityOrTab === 'string') {
      cityConfig = CITIES[cityOrTab] || {
        slug: cityOrTab.toLowerCase().replace(/\s+/g, '-'),
        name: cityOrTab,
        region: '',
        heroLocation: cityOrTab,
        sheetTab: cityOrTab,
      };
    } else if (cityOrTab) {
      cityConfig = cityOrTab;
    } else {
      cityConfig = CITIES['medellin-colombia'];
    }

    const candidateUrls = getCandidateUrls(cityConfig);
    const isDev = process.env.NODE_ENV === 'development';
    let csvText = '';

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          cache: isDev ? 'no-store' : 'default',
          next: isDev ? { revalidate: 0 } : { revalidate: 3600 },
        });

        if (response.ok) {
          const text = await response.text();
          const trimmed = text.trim();

          if (
            trimmed &&
            !trimmed.startsWith('<!DOCTYPE html') &&
            !trimmed.startsWith('<html') &&
            !trimmed.includes('accounts.google.com')
          ) {
            csvText = text;
            break;
          }
        }
      } catch (fetchErr) {
        console.warn(`[Someplace Social] Could not fetch from ${url}:`, fetchErr);
      }
    }

    if (!csvText) {
      console.warn(`[Someplace Social] No CSV data available for ${cityConfig.name}`);
      return [];
    }

    const rows = parseCsv(csvText);
    if (rows.length < 2) return [];

    const headerRow = rows[0].map(h => normalizeHeader(h));
    const headerIndexMap: Record<string, number> = {};

    Object.keys(HEADER_ALIASES).forEach((field) => {
      const aliases = HEADER_ALIASES[field];
      const foundIdx = headerRow.findIndex(h => aliases.includes(h));
      if (foundIdx !== -1) {
        headerIndexMap[field] = foundIdx;
      }
    });

    const dataRows = rows.slice(1);
    const events = dataRows.map((row): Event | null => {
      if (row.length === 0 || row.every(cell => cell.trim() === '')) return null;

      const getValue = (field: string): string => {
        const colIdx = headerIndexMap[field] ?? DEFAULT_INDEX_FALLBACK[field];
        if (colIdx !== undefined && colIdx < row.length) {
          return (row[colIdx] || '').trim();
        }
        return '';
      };

      const venueVal = getValue('venue');
      const orgVal = getValue('organization');
      const locVal = getValue('location');

      return {
        id: getValue('id'),
        title: getValue('title'),
        venue: venueVal,
        organization: orgVal || venueVal,
        location: locVal || venueVal,
        area: getValue('area'),
        activity1: getValue('activity1'),
        activity2: getValue('activity2'),
        activity3: getValue('activity3'),
        dayOfWeek: getValue('dayOfWeek'),
        startTime: getValue('startTime'),
        endTime: getValue('endTime'),
        frequency: getValue('frequency'),
        price: getValue('price'),
        preRegistration: getValue('preRegistration'),
        map: getValue('map'),
        social: getValue('social'),
        website: getValue('website'),
        contact: getValue('contact'),
        about: getValue('about'),
        notes: getValue('notes'),
        database: getValue('database'),
      };
    }).filter((event): event is Event => event !== null);

    return events.filter((event) => {
      const db = (event.database || '').toLowerCase().trim();
      const targetName = cityConfig.name.toLowerCase();
      const targetTab = cityConfig.sheetTab.toLowerCase();
      const targetSlug = cityConfig.slug.toLowerCase();

      if (db) {
        const matchesCity =
          db === targetName ||
          db === targetTab ||
          db === targetSlug ||
          targetSlug.includes(db) ||
          db.includes(targetName);
        if (!matchesCity) return false;
      }

      return Boolean(event.title);
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}