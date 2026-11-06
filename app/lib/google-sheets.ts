export type Event = {
  database: string;
  title: string;
  organization: string;
  activity1: string;
  activity2: string;
  activity3: string;
  startTime: string;
  endTime: string;
  price: string;
  location: string;
  area: string;
  map: string;
  social: string;
  website: string;
  contact: string;
  dayOfWeek: string;
  id: string;
  notes: string;
};

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2zEDH8-8__S6s0_a0evopp5lh0e34Tv0_fPcPQetnhed1kXHCCGNhIsXen_za-xB8SpS9CIdZaH9C/pub?gid=0&single=true&output=csv';

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

const HEADER_ALIASES: Record<keyof Event, string[]> = {
  database: ['database', 'db'],
  title: ['title', 'eventname', 'name'],
  organization: ['organization', 'organizer', 'host'],
  activity1: ['activity1', 'activity'],
  activity2: ['activity2'],
  activity3: ['activity3'],
  startTime: ['starttime', 'start'],
  endTime: ['endtime', 'end'],
  price: ['price', 'cost'],
  location: ['location', 'venue'],
  area: ['area', 'neighborhood'],
  map: ['map', 'googlemap', 'googlemaplink', 'maps'],
  social: ['social', 'socialmedia', 'socialmedialink', 'instagram'],
  website: ['website', 'site', 'url'],
  contact: ['contact', 'whatsapp', 'phone'],
  dayOfWeek: ['dayofweek', 'day', 'days'],
  id: ['id'],
  notes: ['notes', 'note'],
};

const DEFAULT_INDEX_FALLBACK: Record<keyof Event, number> = {
  database: 0,
  title: 1,
  organization: 2,
  activity1: 3,
  activity2: 4,
  activity3: 5,
  startTime: 6,
  endTime: 7,
  price: 8,
  location: 9,
  area: 10,
  map: 11,
  social: 12,
  website: 13,
  contact: 14,
  dayOfWeek: 15,
  id: 16,
  notes: 17,
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
    const headerIndexMap: Partial<Record<keyof Event, number>> = {};

    (Object.keys(HEADER_ALIASES) as (keyof Event)[]).forEach((field) => {
      const aliases = HEADER_ALIASES[field];
      const foundIdx = headerRow.findIndex(h => aliases.includes(h));
      if (foundIdx !== -1) {
        headerIndexMap[field] = foundIdx;
      }
    });

    const dataRows = rows.slice(1);
    const events = dataRows.map((row): Event | null => {
      if (row.length === 0 || row.every(cell => cell.trim() === '')) return null;

      const getValue = (field: keyof Event): string => {
        const colIdx = headerIndexMap[field] ?? DEFAULT_INDEX_FALLBACK[field];
        if (colIdx !== undefined && colIdx < row.length) {
          return (row[colIdx] || '').trim();
        }
        return '';
      };

      return {
        database: getValue('database'),
        title: getValue('title'),
        organization: getValue('organization'),
        activity1: getValue('activity1'),
        activity2: getValue('activity2'),
        activity3: getValue('activity3'),
        startTime: getValue('startTime'),
        endTime: getValue('endTime'),
        price: getValue('price'),
        location: getValue('location'),
        area: getValue('area'),
        map: getValue('map'),
        social: getValue('social'),
        website: getValue('website'),
        contact: getValue('contact'),
        dayOfWeek: getValue('dayOfWeek'),
        id: getValue('id'),
        notes: getValue('notes'),
      };
    }).filter((event): event is Event => event !== null);

    return events.filter(
      event => event.database.toLowerCase().trim() === 'medellin' && event.title
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}