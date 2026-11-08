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

const POSSIBLE_SPREADSHEET_IDS = [
  '1dl6clB28uxBDz9Vq6B4H9l2N2iu1ayTBkPDCkiWsHsU',
  '1dI6cIB28uxBDz9Vq6B4H9l2N2iu1ayTBkPDCkiWsHsU',
  '1dI6cIB28uxBDz9Vq6B4H912N2iu1ayTBkPDCkiWsHsU',
  '1dl6clB28uxBDz9Vq6B4H912N2iu1ayTBkPDCkiWsHsU',
];

const BASE_PUB_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2zEDH8-8__S6s0_a0evopp5lh0e34Tv0_fPcPQetnhed1kXHCCGNhIsXen_za-xB8SpS9CIdZaH9C/pub';

function getCandidateUrls(city: CityConfig): string[] {
  if (city.csvUrl) return [city.csvUrl];

  const targetId = city.spreadsheetId || POSSIBLE_SPREADSHEET_IDS[0];
  const ids = Array.from(new Set([targetId, ...POSSIBLE_SPREADSHEET_IDS]));

  const tabs = [city.sheetTab];
  if (city.sheetTab.toLowerCase() === 'medellin') {
    tabs.push('Medellín');
  } else if (city.sheetTab.toLowerCase() === 'fort collins') {
    tabs.push('FortCollins');
  }

  const urls: string[] = [];

  for (const id of ids) {
    for (const tab of tabs) {
      const encodedTab = encodeURIComponent(tab);
      urls.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodedTab}`);
      urls.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?sheet=${encodedTab}`);
    }
    if (city.sheetGid) {
      urls.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${city.sheetGid}`);
      urls.push(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${city.sheetGid}`);
    }
  }

  if (city.sheetGid) {
    urls.push(`${BASE_PUB_URL}?gid=${city.sheetGid}&single=true&output=csv`);
  }
  urls.push(`${BASE_PUB_URL}?sheet=${encodeURIComponent(city.sheetTab)}&single=true&output=csv`);

  return urls;
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

function parseSheetData(rawText: string): string[][] {
  const trimmed = rawText.trim();
  if (trimmed.includes('google.visualization.Query.setResponse') || trimmed.startsWith('/*O_o*/')) {
    try {
      const startIdx = trimmed.indexOf('{');
      const endIdx = trimmed.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = trimmed.substring(startIdx, endIdx + 1);
        const data = JSON.parse(jsonStr);
        if (data.status === 'error') {
          return [];
        }
        if (data.table) {
          const cols: { label?: string; id?: string }[] = data.table.cols || [];
          const headerRow: string[] = cols.map((col) => col.label || col.id || '');
          const dataRows: string[][] = (data.table.rows || []).map((row: { c?: ({ v?: unknown; f?: string } | null)[] }) => {
            return (row.c || []).map((cell) => {
              if (!cell || cell.v === null || cell.v === undefined) return '';
              return String(cell.f || cell.v).trim();
            });
          });
          if (headerRow.some((h: string) => Boolean(h && !h.match(/^[A-Z]$/)))) {
            return [headerRow, ...dataRows];
          } else if (dataRows.length > 0) {
            return dataRows;
          }
        }
      }
    } catch (e) {
      console.warn('[Someplace Social] Failed to parse GViz JSON, falling back to CSV parser:', e);
    }
  }
  return parseCsv(rawText);
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
  preRegistration: ['preregistration', 'prereg', 'registration', 'rsvp', 'preregister'],
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
    let rows: string[][] = [];

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'text/csv, application/json, text/plain, */*',
          },
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
            !trimmed.includes('accounts.google.com') &&
            !trimmed.includes('"status":"error"') &&
            !trimmed.includes('INVALID_QUERY')
          ) {
            const parsed = parseSheetData(trimmed);
            if (parsed.length >= 2) {
              rows = parsed;
              break;
            }
          }
        }
      } catch (fetchErr) {
        console.warn(`[Someplace Social] Fetch error on ${url}:`, fetchErr);
      }
    }

    if (rows.length < 2) {
      console.warn(`[Someplace Social] No sheet data found for ${cityConfig.sheetTab}`);
      return [];
    }

    const headerRow = rows[0].map((h: string) => normalizeHeader(h));
    const headerIndexMap: Record<string, number> = {};

    Object.keys(HEADER_ALIASES).forEach((field) => {
      const aliases = HEADER_ALIASES[field];
      const foundIdx = headerRow.findIndex((h: string) => aliases.includes(h));
      if (foundIdx !== -1) {
        headerIndexMap[field] = foundIdx;
      }
    });

    const cleanCell = (cell: string): string => {
      const trimmed = (cell || '').trim();
      return trimmed.toLowerCase() === 'x' ? '' : trimmed;
    };

    const dataRows = rows.slice(1);
    const events = dataRows.map((row): Event | null => {
      if (row.length === 0 || row.every(cell => cleanCell(cell) === '')) return null;

      const getValue = (field: string): string => {
        const colIdx = headerIndexMap[field] ?? DEFAULT_INDEX_FALLBACK[field];
        if (colIdx !== undefined && colIdx < row.length) {
          return cleanCell(row[colIdx]);
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

    return events.filter((event) => Boolean(event.title));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}