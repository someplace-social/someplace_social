import { CityConfig, CITIES, MAIN_SPREADSHEET_ID } from './cities';
import { normalizeDayOfWeek } from '../events/utils';
export type Event = {
  id: string;
  title: string;
  venue: string;
  organization: string;
  location: string;
  area: string;
  activity: string;
  activities: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  frequency: string;
  frequencyNotes: string;
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
function getFetchOptions(revalidateSeconds: number = 30): RequestInit {
  if (process.env.NODE_ENV === 'development') {
    return { cache: 'no-store' };
  }
  return { next: { revalidate: revalidateSeconds } };
}
function getCandidateUrls(city: CityConfig, discoveredGid: string | null): string[] {
  if (city.csvUrl) return [city.csvUrl];
  const targetId = city.spreadsheetId || MAIN_SPREADSHEET_ID;
  const urls: string[] = [];
  const addUrl = (url: string) => {
    if (!urls.includes(url)) {
      urls.push(url);
    }
  };
  if (discoveredGid) {
    addUrl(
      `https://docs.google.com/spreadsheets/d/${targetId}/export?format=csv&gid=${discoveredGid}`
    );
  }
  if (city.sheetGid) {
    addUrl(
      `https://docs.google.com/spreadsheets/d/${targetId}/export?format=csv&gid=${city.sheetGid}`
    );
  }
  addUrl(
    `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      city.sheetTab
    )}`
  );
  const fallbackGid = discoveredGid || city.sheetGid;
  if (fallbackGid) {
    addUrl(
      `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&gid=${fallbackGid}`
    );
  }
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
          const dataRows: string[][] = (data.table.rows || []).map(
            (row: { c?: ({ v?: unknown; f?: string } | null)[] }) => {
              return (row.c || []).map((cell) => {
                if (!cell || (cell.v === null && !cell.f) || (cell.v === undefined && !cell.f)) {
                  return '';
                }
                return String(cell.f ?? cell.v ?? '').trim();
              });
            }
          );
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
async function fetchValidSheetText(url: string, revalidateSeconds: number = 30): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/csv, application/json, text/plain, */*',
      },
      ...getFetchOptions(revalidateSeconds),
    });
    if (!response.ok) {
      console.warn(`[Someplace Social] Sheet request returned HTTP ${response.status} for ${url}`);
      return null;
    }
    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed) {
      console.warn(`[Someplace Social] Empty sheet response from ${url}`);
      return null;
    }
    const lowerPrefix = trimmed.slice(0, 200).toLowerCase();
    if (
      lowerPrefix.startsWith('<!doctype html') ||
      lowerPrefix.startsWith('<html') ||
      trimmed.includes('accounts.google.com')
    ) {
      console.warn(
        `[Someplace Social] Received HTML/sign-in page for ${url}. Verify spreadsheet ID and "Anyone with the link" sharing.`
      );
      return null;
    }
    if (trimmed.includes('"status":"error"') || trimmed.includes('INVALID_QUERY')) {
      console.warn(`[Someplace Social] GViz query error for ${url}`);
      return null;
    }
    return trimmed;
  } catch (fetchErr) {
    console.warn(`[Someplace Social] Fetch error on ${url}:`, fetchErr);
  }
  return null;
}
async function fetchSheetRows(candidateUrls: string[], revalidateSeconds: number = 30): Promise<string[][]> {
  for (const url of candidateUrls) {
    const text = await fetchValidSheetText(url, revalidateSeconds);
    if (!text) continue;
    const parsed = parseSheetData(text);
    if (parsed.length >= 2) {
      return parsed;
    }
  }
  return [];
}
const normalizeHeader = (header: string): string =>
  header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
const normalizeCityKey = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
function formatSheetDate(value: string): string {
  const gvizDateMatch = value.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)$/);
  if (gvizDateMatch) {
    const year = parseInt(gvizDateMatch[1], 10);
    const month = parseInt(gvizDateMatch[2], 10);
    const day = parseInt(gvizDateMatch[3], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return value;
}
function parseLastUpdatedRows(rows: string[][]): Map<string, string> | null {
  if (rows.length < 2) return null;
  const headerRow = rows[0].map((h) => normalizeHeader(h));
  const dateColIdx = headerRow.findIndex((h) =>
    ['lastupdateddate', 'lastupdated', 'updateddate', 'lastupdate'].includes(h)
  );
  const cityColIdx = headerRow.findIndex((h) => h === 'city');
  if (dateColIdx === -1 || cityColIdx === -1) {
    return null;
  }
  const map = new Map<string, string>();
  for (const row of rows.slice(1)) {
    const rawDate = (row[dateColIdx] || '').trim();
    const rawCity = (row[cityColIdx] || '').trim();
    if (!rawDate || !rawCity || rawDate.toLowerCase() === 'x') continue;
    map.set(normalizeCityKey(rawCity), formatSheetDate(rawDate));
  }
  return map.size > 0 ? map : null;
}
function findTabGidInHtml(html: string, tabNames: string[]): string | null {
  const targets = new Set(tabNames.map((n) => normalizeHeader(n)));
  const itemNameFirstRegex = /\{[^{}]*?name:\s*["']([^"']+)["'][^{}]*?gid:\s*["'](\d+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = itemNameFirstRegex.exec(html)) !== null) {
    if (targets.has(normalizeHeader(match[1]))) {
      return match[2];
    }
  }
  const itemGidFirstRegex = /\{[^{}]*?gid:\s*["'](\d+)["'][^{}]*?name:\s*["']([^"']+)["']/gi;
  while ((match = itemGidFirstRegex.exec(html)) !== null) {
    if (targets.has(normalizeHeader(match[2]))) {
      return match[1];
    }
  }
  const buttonRegex = /id=["']sheet-button-(\d+)["'][^>]*>[\s\S]{0,120}?<a[^>]*>([^<]+)<\/a>/gi;
  while ((match = buttonRegex.exec(html)) !== null) {
    if (targets.has(normalizeHeader(match[2]))) {
      return match[1];
    }
  }
  return null;
}
async function discoverTabGid(
  targetId: string,
  tabNames: string[],
  revalidateSeconds: number = 30
): Promise<string | null> {
  const htmlviewUrl = `https://docs.google.com/spreadsheets/d/${targetId}/htmlview`;
  try {
    const response = await fetch(htmlviewUrl, getFetchOptions(revalidateSeconds));
    if (!response.ok) {
      console.warn(`[Someplace Social] htmlview returned HTTP ${response.status} for ${targetId}`);
      return null;
    }
    const html = await response.text();
    if (!html || html.includes('accounts.google.com')) {
      console.warn(
        `[Someplace Social] htmlview redirected to Google login for ${targetId}. Verify "Anyone with the link" sharing.`
      );
      return null;
    }
    return findTabGidInHtml(html, tabNames);
  } catch (err) {
    console.warn(`[Someplace Social] Failed to inspect sheet tabs for ${targetId}:`, err);
    return null;
  }
}
const HEADER_ALIASES: Record<string, string[]> = {
  id: ['id'],
  title: ['title', 'eventname', 'name'],
  venue: ['venue', 'place'],
  organization: ['organization', 'organizer', 'host', 'hostedby', 'organizerhost', 'hostorganization'],
  location: ['location', 'address'],
  area: ['area', 'neighborhood'],
  activity: ['activity', 'activities'],
  activity1: ['activity1', 'activity'],
  activity2: ['activity2'],
  activity3: ['activity3'],
  dayOfWeek: ['dayofweek', 'day', 'days', 'daysofweek'],
  startTime: ['starttime', 'start'],
  endTime: ['endtime', 'end'],
  frequency: ['frequency', 'cadence', 'recurrence', 'howoften'],
  frequencyNotes: [
    'frequencynotes',
    'frequencynote',
    'frequency_notes',
    'freqnotes',
    'freqnote',
    'frequencynot',
    'recurrencenotes',
  ],
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
  activity: 5,
  dayOfWeek: 6,
  startTime: 7,
  endTime: 8,
  frequency: 9,
  frequencyNotes: 10,
  price: 11,
  preRegistration: 12,
  map: 13,
  social: 14,
  website: 15,
  contact: 16,
  about: 17,
  notes: 18,
};
export async function getLastUpdated(
  city: CityConfig,
  revalidateSeconds: number = 30
): Promise<string | null> {
  try {
    const targetId = city.spreadsheetId || MAIN_SPREADSHEET_ID;
    const tabNames = ['LastUpdate', 'Last Update'];
    const discoveredGid = await discoverTabGid(targetId, tabNames, revalidateSeconds);
    const candidateUrls: string[] = [];
    if (discoveredGid) {
      candidateUrls.push(
        `https://docs.google.com/spreadsheets/d/${targetId}/export?format=csv&gid=${discoveredGid}`,
        `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&gid=${discoveredGid}`
      );
    }
    for (const tabName of tabNames) {
      candidateUrls.push(
        `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
          tabName
        )}`
      );
    }
    let cityDateMap: Map<string, string> | null = null;
    for (const url of candidateUrls) {
      const text = await fetchValidSheetText(url, revalidateSeconds);
      if (!text) continue;
      const parsedMap = parseLastUpdatedRows(parseSheetData(text));
      if (parsedMap) {
        cityDateMap = parsedMap;
        break;
      }
    }
    if (!cityDateMap) {
      return null;
    }
    return (
      cityDateMap.get(normalizeCityKey(city.sheetTab)) ??
      cityDateMap.get(normalizeCityKey(city.name)) ??
      cityDateMap.get(normalizeCityKey(city.slug)) ??
      null
    );
  } catch (error) {
    console.error('Error fetching last updated date:', error);
    return null;
  }
}
export async function getEvents(
  cityOrTab?: CityConfig | string,
  revalidateSeconds: number = 30
): Promise<Event[]> {
  try {
    let cityConfig: CityConfig;
    if (typeof cityOrTab === 'string') {
      cityConfig = CITIES[cityOrTab] || {
        slug: cityOrTab.toLowerCase().replace(/\s+/g, '-'),
        name: cityOrTab,
        region: '',
        heroLocation: cityOrTab,
        timeZone: 'America/Denver',
        sheetTab: cityOrTab,
      };
    } else if (cityOrTab) {
      cityConfig = cityOrTab;
    } else {
      cityConfig = CITIES['medellin-colombia'];
    }
    const targetId = cityConfig.spreadsheetId || MAIN_SPREADSHEET_ID;
    const discoveredGid = cityConfig.csvUrl
      ? null
      : await discoverTabGid(targetId, [cityConfig.sheetTab], revalidateSeconds);
    const candidateUrls = getCandidateUrls(cityConfig, discoveredGid);
    const rows = await fetchSheetRows(candidateUrls, revalidateSeconds);
    if (rows.length < 2) {
      console.error(`[Someplace Social] No live sheet data found for ${cityConfig.sheetTab} (${targetId})`);
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
    const hasHeaderMap = Object.keys(headerIndexMap).length > 0;
    const cleanCell = (cell: string): string => {
      const trimmed = (cell || '').trim();
      return trimmed.toLowerCase() === 'x' ? '' : trimmed;
    };
    const dataRows = rows.slice(1);
    const events = dataRows
      .map((row): Event | null => {
        if (row.length === 0 || row.every((cell) => cleanCell(cell) === '')) return null;
        const getValue = (field: string): string => {
          const colIdx = hasHeaderMap ? headerIndexMap[field] : DEFAULT_INDEX_FALLBACK[field];
          if (colIdx !== undefined && colIdx < row.length) {
            return cleanCell(row[colIdx]);
          }
          return '';
        };
        const venueVal = getValue('venue');
        const orgVal = getValue('organization');
        const locVal = getValue('location');
        const rawActivity = getValue('activity');
        const act1 = getValue('activity1');
        const act2 = getValue('activity2');
        const act3 = getValue('activity3');
        let parsedActivities: string[] = [];
        if (rawActivity) {
          parsedActivities = rawActivity.split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (parsedActivities.length === 0) {
          parsedActivities = [act1, act2, act3]
            .flatMap((s) => (s ? s.split(',').map((x) => x.trim()) : []))
            .filter(Boolean);
        }
        const uniqueActs: string[] = [];
        for (const act of parsedActivities) {
          if (!uniqueActs.some((u) => u.toLowerCase() === act.toLowerCase())) {
            uniqueActs.push(act);
          }
        }
        const activityStr = uniqueActs.join(', ');
        const rawDay = getValue('dayOfWeek');
        const dayOfWeekStr = normalizeDayOfWeek(rawDay);
        return {
          id: getValue('id'),
          title: getValue('title'),
          venue: venueVal,
          organization: orgVal || venueVal,
          location: locVal || venueVal,
          area: getValue('area'),
          activity: activityStr,
          activities: uniqueActs,
          dayOfWeek: dayOfWeekStr,
          startTime: getValue('startTime'),
          endTime: getValue('endTime'),
          frequency: getValue('frequency'),
          frequencyNotes: getValue('frequencyNotes'),
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
      })
      .filter((event): event is Event => event !== null);
    return events.filter((event) => Boolean(event.title));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}