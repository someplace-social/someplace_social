import { Event } from '../lib/google-sheets';

export function parseHour(timeStr: string): number {
  if (!timeStr) return 18;
  const cleaned = timeStr.trim().toLowerCase();
  const match = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridian = match[3];
    if (meridian) {
      const isPm = meridian.startsWith('p');
      const isAm = meridian.startsWith('a');
      if (isPm && hour < 12) hour += 12;
      if (isAm && hour === 12) hour = 0;
    } else {
      if (hour >= 1 && hour <= 6) {
        hour += 12;
      }
    }
    return hour + minute / 60;
  }
  const numMatch = cleaned.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 18;
}

export function formatTimeLabel(timeStr: string): string {
  if (!timeStr) return '';
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);
  if (match) {
    const hour = match[1];
    const minute = match[2] && match[2] !== '00' ? `:${match[2]}` : '';
    const meridian = (match[3] || 'p').toLowerCase().startsWith('a') ? 'a' : 'p';
    return `${hour}${minute}${meridian}`;
  }
  return cleaned;
}

export function formatTimeRange(
  startTime: string,
  endTime: string
): { start: string; end?: string } {
  const start = formatTimeLabel(startTime);
  const end = endTime ? formatTimeLabel(endTime) : undefined;
  return { start, end };
}

export function isFreePrice(price: string): boolean {
  if (!price) return true;
  const p = price.trim().toLowerCase();
  return p.startsWith('free') || p.startsWith('gratis') || p === '0' || p === '$0';
}

const DAY_ALIAS_MAP: Record<string, string[]> = {
  sun: ['sun', 'sunday'],
  sunday: ['sun', 'sunday'],
  mon: ['mon', 'monday'],
  monday: ['mon', 'monday'],
  tue: ['tue', 'tues', 'tuesday'],
  tuesday: ['tue', 'tues', 'tuesday'],
  wed: ['wed', 'weds', 'wednesday'],
  wednesday: ['wed', 'weds', 'wednesday'],
  thu: ['thu', 'thur', 'thurs', 'thursday'],
  thursday: ['thu', 'thur', 'thurs', 'thursday'],
  fri: ['fri', 'friday'],
  friday: ['fri', 'friday'],
  sat: ['sat', 'saturday'],
  saturday: ['sat', 'saturday'],
};

export function normalizeDayOfWeek(dayStr: string): string {
  if (!dayStr) return '';
  const trimmed = dayStr.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('daily') || lower.includes('everyday') || lower.includes('every day')) {
    return 'Daily';
  }
  const tokens = trimmed.split(/[^a-zA-Z]+/).filter(Boolean);
  const DAY_TO_SHORT: Record<string, string> = {
    sun: 'Sun',
    sunday: 'Sun',
    mon: 'Mon',
    monday: 'Mon',
    tue: 'Tue',
    tues: 'Tue',
    tuesday: 'Tue',
    wed: 'Wed',
    weds: 'Wed',
    wednesday: 'Wed',
    thu: 'Thu',
    thur: 'Thu',
    thurs: 'Thu',
    thursday: 'Thu',
    fri: 'Fri',
    friday: 'Fri',
    sat: 'Sat',
    saturday: 'Sat',
  };
  const normalized: string[] = [];
  for (const token of tokens) {
    const short = DAY_TO_SHORT[token.toLowerCase()];
    if (short && !normalized.includes(short)) {
      normalized.push(short);
    }
  }
  return normalized.length > 0 ? normalized.join(', ') : trimmed;
}

export function matchesDay(eventDays: string, targetDayName: string): boolean {
  if (!eventDays || !targetDayName) return false;
  const targetKey = targetDayName.trim().toLowerCase();
  const aliases = DAY_ALIAS_MAP[targetKey] || [targetKey];
  const rawLower = eventDays.toLowerCase();
  if (rawLower.includes('daily') || rawLower.includes('everyday') || rawLower.includes('every day')) {
    return true;
  }
  if (rawLower.includes(targetKey)) {
    return true;
  }
  const tokens = rawLower.split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.some((token) => aliases.includes(token));
}

const MONTH_NAME_TO_NUM: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function parseMonthIndex(str: string): number | null {
  const cleaned = str.trim().toLowerCase();
  return MONTH_NAME_TO_NUM[cleaned] ?? null;
}

export function isMonthActive(frequencyNotes: string, targetDate: Date): boolean {
  if (!frequencyNotes) return true;
  const cleaned = frequencyNotes.trim();
  if (!cleaned) return true;

  if (/^irregular/i.test(cleaned)) {
    return false;
  }

  const targetMonth = targetDate.getMonth() + 1; // 1-12

  if (/months?,\s*even/i.test(cleaned)) {
    return targetMonth % 2 === 0;
  }
  if (/months?,\s*odd/i.test(cleaned)) {
    return targetMonth % 2 !== 0;
  }

  const rangeMatch = cleaned.match(/months?,\s*([a-zA-Z]+)\s*[\u2013\u2014\-]\s*([a-zA-Z]+)/i);
  if (rangeMatch) {
    const startMonth = parseMonthIndex(rangeMatch[1]);
    const endMonth = parseMonthIndex(rangeMatch[2]);
    if (startMonth && endMonth) {
      if (startMonth <= endMonth) {
        return targetMonth >= startMonth && targetMonth <= endMonth;
      }
      return targetMonth >= startMonth || targetMonth <= endMonth;
    }
  }

  return true;
}

export function getWeekdayOccurrence(targetDate: Date): {
  occurrence: number;
  isLast: boolean;
} {
  const dayOfMonth = targetDate.getDate();
  const occurrence = Math.ceil(dayOfMonth / 7);
  const daysInMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0
  ).getDate();
  const isLast = dayOfMonth + 7 > daysInMonth;
  return { occurrence, isLast };
}

function getWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function isEventActiveOnDate(event: Event, targetDate: Date): boolean {
  const notes = (event.frequencyNotes || '').trim();
  if (/^irregular/i.test(notes)) {
    return false;
  }

  if (!isMonthActive(notes, targetDate)) {
    return false;
  }

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayName = DAY_NAMES[targetDate.getDay()];

  const daySpec = `${event.dayOfWeek || ''} ${event.frequency || ''}`;
  if (!matchesDay(daySpec, targetDayName)) {
    return false;
  }

  const rawFreq = (event.frequency || '').trim();
  if (!rawFreq) {
    return true;
  }

  const parts = rawFreq.split(',').map((p) => p.trim());
  const cadence = parts[0]?.toLowerCase() || 'weekly';
  const pattern = (parts.slice(1).join(',') || '').toLowerCase();

  const { occurrence, isLast } = getWeekdayOccurrence(targetDate);

  const ordinalMatches: boolean[] = [];
  if (/\b1st\b/.test(pattern)) ordinalMatches.push(occurrence === 1);
  if (/\b2nd\b/.test(pattern)) ordinalMatches.push(occurrence === 2);
  if (/\b3rd\b/.test(pattern)) ordinalMatches.push(occurrence === 3);
  if (/\b4th\b/.test(pattern)) ordinalMatches.push(occurrence === 4);
  if (/\b5th\b/.test(pattern)) ordinalMatches.push(occurrence === 5);
  if (/\blast\b/.test(pattern)) ordinalMatches.push(isLast);

  if (cadence.includes('monthly') || cadence.includes('bi-monthly')) {
    if (ordinalMatches.length > 0) {
      return ordinalMatches.some(Boolean);
    }
    return true;
  }

  if (cadence.includes('bi-weekly')) {
    if (ordinalMatches.length > 0) {
      return ordinalMatches.some(Boolean);
    }
    const weekNum = getWeekNumber(targetDate);
    return weekNum % 2 === 0;
  }

  return true;
}

export function formatFrequencyBadge(frequency: string, frequencyNotes?: string): string {
  const freq = (frequency || '').trim();
  const notes = (frequencyNotes || '').trim();

  if (!freq && !notes) return '';
  if (/^irregular/i.test(notes)) {
    return 'Irregular';
  }

  const notesParts: string[] = [];
  if (notes) {
    const rangeMatch = notes.match(/months?,\s*([a-zA-Z]+[\u2013\u2014\-][a-zA-Z]+)/i);
    if (rangeMatch) {
      notesParts.push(rangeMatch[1]);
    } else if (/months?,\s*even/i.test(notes)) {
      notesParts.push('Even months');
    } else if (/months?,\s*odd/i.test(notes)) {
      notesParts.push('Odd months');
    }
  }

  let cadenceBadge = '';
  if (freq) {
    const parts = freq.split(',').map((p) => p.trim());
    const cadence = parts[0];
    const pattern = parts.slice(1).join(', ');
    if (cadence.toLowerCase() !== 'weekly') {
      cadenceBadge = pattern ? `${cadence} (${pattern})` : cadence;
    } else if (pattern) {
      cadenceBadge = pattern;
    }
  }

  if (cadenceBadge && notesParts.length > 0) {
    return `${cadenceBadge} · ${notesParts.join(', ')}`;
  }
  return cadenceBadge || (notesParts.length > 0 ? notesParts.join(', ') : '');
}

export function ensureExternalUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getTagStyle(tag: string): { color: string; background: string } {
  const t = (tag || '').trim().toLowerCase();
  if (t.includes('science')) {
    return { color: '#0f5c5c', background: '#d3efec' };
  }
  if (t.includes('craft')) {
    return { color: '#8a3d0c', background: '#fde4cf' };
  }
  if (t.includes('food') || t.includes('drink')) {
    return { color: '#6b5200', background: '#f4eab8' };
  }
  if (t.includes('community') || t.includes('social')) {
    return { color: '#3b4a54', background: '#e1e7ea' };
  }
  if (t.includes('music') || t.includes('bluegrass')) {
    return { color: '#5b2a86', background: '#ecdcf7' };
  }
  if (t.includes('trivia')) {
    return { color: '#2d3f7a', background: '#dde4f7' };
  }
  if (t.includes('open mic') || t.includes('mic') || t.includes('comedy')) {
    return { color: '#8a1f4f', background: '#fbdce9' };
  }
  if (t.includes('dance') || t.includes('salsa') || t.includes('bachata')) {
    return { color: '#852b2b', background: '#f9dede' };
  }
  if (t.includes('sport') || t.includes('fitness') || t.includes('yoga') || t.includes('walk')) {
    return { color: '#1f6a42', background: '#d7f0df' };
  }
  if (t.includes('language') || t.includes('english') || t.includes('spanish')) {
    return { color: '#2c4f7c', background: '#dbe5f7' };
  }
  return { color: '#4f483e', background: '#f3ead4' };
}