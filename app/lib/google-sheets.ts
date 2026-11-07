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

const CSV_URL = process.env.GOOGLE_SHEETS_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2zEDH8-8__S6s0_a0evopp5lh0e34Tv0_fPcPQetnhed1kXHCCGNhIsXen_za-xB8SpS9CIdZaH9C/pub?gid=0&single=true&output=csv';

function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    const csvText = await response.text();
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
      const matchesDb = !db || db === 'medellin' || db === 'colombia';
      return matchesDb && Boolean(event.title);
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}