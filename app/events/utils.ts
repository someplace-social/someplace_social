import { Event } from '../lib/google-sheets';
import { CityPriceConfig } from '../lib/cities';

export type IndexedEvent = Event & {
  parsedHour: number;
  parsedPrice: number | null;
  isFreeOrDonationPrice: boolean;
  searchCorpus: string;
  activeDays: boolean[];
};

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

export function formatRecurrenceText(
  frequency?: string,
  frequencyNotes?: string
): string {
  const freq = (frequency || '').trim();
  const notes = (frequencyNotes || '').trim();
  if (freq && notes) {
    if (notes.startsWith(',') || notes.startsWith('.')) {
      return `${freq}${notes}`;
    }
    if (
      notes.startsWith('(') ||
      notes.startsWith('·') ||
      notes.startsWith('•') ||
      notes.startsWith('-')
    ) {
      return `${freq} ${notes}`;
    }
    return `${freq} · ${notes}`;
  }
  return freq || notes || '';
}

export function isFreePrice(price: string): boolean {
  if (!price) return true;
  const p = price.trim().toLowerCase();
  return p.startsWith('free') || p.startsWith('gratis') || p === '0' || p === '$0';
}

export function isFreeOrDonation(price: string): boolean {
  if (!price) return true;
  const p = price.trim().toLowerCase();
  return (
    isFreePrice(p) ||
    p.includes('donation') ||
    p.includes('aporte') ||
    p.includes('voluntari') ||
    p === '0k'
  );
}

export function parseEventPrice(priceStr: string, currencyCode: string = 'USD'): number | null {
  if (!priceStr) return 0;
  const cleaned = priceStr.trim().toLowerCase();
  if (isFreeOrDonation(cleaned)) return 0;
  if (currencyCode === 'COP') {
    const kMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*k/i);
    if (kMatch) {
      return parseFloat(kMatch[1]);
    }
    const thousandSepMatch = cleaned.match(/(\d{1,3})[.,](\d{3})/);
    if (thousandSepMatch) {
      const whole = parseInt(thousandSepMatch[1], 10);
      const frac = parseInt(thousandSepMatch[2], 10) / 1000;
      return whole + frac;
    }
    const bigNumMatch = cleaned.match(/\b(\d{4,6})\b/);
    if (bigNumMatch) {
      return parseInt(bigNumMatch[1], 10) / 1000;
    }
    const smallNumMatch = cleaned.match(/\b(\d{1,3})\b/);
    if (smallNumMatch) {
      return parseInt(smallNumMatch[1], 10);
    }
    return null;
  }
  const usdMatch = cleaned.match(/\$?\s*(\d+(?:\.\d+)?)/);
  if (usdMatch) {
    return parseFloat(usdMatch[1]);
  }
  return null;
}

export function formatPriceValue(val: number, config: CityPriceConfig): string {
  if (val === 0) return 'Free';
  if (config.unitSuffix) {
    return `${val}${config.unitSuffix}`;
  }
  return `${config.currencySymbol}${val}`;
}

export function formatPriceReadout(val: number, config: CityPriceConfig): string {
  if (val === 0) return 'Free / donation';
  if (val === config.underValue) return config.underLabel;
  if (val >= config.maxPrice) return 'Any price';
  return `Up to ${formatPriceValue(val, config)}`;
}

const DAY_ALIAS_MAP: Record<string, string[]> = {
  sun: ['sun', 'sunday', 'sundays'],
  sunday: ['sun', 'sunday', 'sundays'],
  mon: ['mon', 'monday', 'mondays'],
  monday: ['mon', 'monday', 'mondays'],
  tue: ['tue', 'tues', 'tuesday', 'tuesdays'],
  tuesday: ['tue', 'tues', 'tuesday', 'tuesdays'],
  wed: ['wed', 'weds', 'wednesday', 'wednesdays'],
  wednesday: ['wed', 'weds', 'wednesday', 'wednesdays'],
  thu: ['thu', 'thur', 'thurs', 'thursday', 'thursdays'],
  thursday: ['thu', 'thur', 'thurs', 'thursday', 'thursdays'],
  fri: ['fri', 'friday', 'fridays'],
  friday: ['fri', 'friday', 'fridays'],
  sat: ['sat', 'saturday', 'saturdays'],
  saturday: ['sat', 'saturday', 'saturdays'],
};

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

export const DAY_TOKEN_TO_SHORT: Record<string, string> = {
  sun: 'Sun',
  sunday: 'Sun',
  sundays: 'Sun',
  mon: 'Mon',
  monday: 'Mon',
  mondays: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  tuesdays: 'Tue',
  wed: 'Wed',
  weds: 'Wed',
  wednesday: 'Wed',
  wednesdays: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  thursdays: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  fridays: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  saturdays: 'Sat',
};

export function normalizeDayOfWeek(dayStr: string): string {
  if (!dayStr) return '';
  const trimmed = dayStr.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'varies' || lower.startsWith('varies')) {
    return 'Varies';
  }
  if (lower.includes('daily') || lower.includes('everyday') || lower.includes('every day')) {
    return 'Daily';
  }
  const rangeMatch = trimmed.match(/^([a-zA-Z]+)\s*(?:[\u2013\u2014\-]|\bto\b)\s*([a-zA-Z]+)$/i);
  if (rangeMatch) {
    const startShort = DAY_TOKEN_TO_SHORT[rangeMatch[1].toLowerCase()];
    const endShort = DAY_TOKEN_TO_SHORT[rangeMatch[2].toLowerCase()];
    if (startShort && endShort) {
      return `${startShort}-${endShort}`;
    }
  }
  const tokens = trimmed.split(/[^a-zA-Z]+/).filter(Boolean);
  const normalized: string[] = [];
  for (const token of tokens) {
    const short = DAY_TOKEN_TO_SHORT[token.toLowerCase()];
    if (short && !normalized.includes(short)) {
      normalized.push(short);
    }
  }
  return normalized.length > 0 ? normalized.join(', ') : trimmed;
}

export function matchesDay(eventDays: string, targetDayName: string): boolean {
  if (!eventDays || !targetDayName) return false;
  const targetKey = targetDayName.trim().toLowerCase();
  const targetIndex = DAY_INDEX[targetKey];
  const aliases = DAY_ALIAS_MAP[targetKey] || [targetKey];
  const rawLower = eventDays.toLowerCase();
  if (rawLower.includes('varies')) {
    return false;
  }
  if (rawLower.includes('daily') || rawLower.includes('everyday') || rawLower.includes('every day')) {
    return true;
  }
  if (rawLower.includes(targetKey)) {
    return true;
  }
  const tokens = rawLower.split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.some((token) => aliases.includes(token))) {
    return true;
  }
  const rangeMatch = rawLower.match(/([a-zA-Z]+)\s*(?:[\u2013\u2014\-]|to)\s*([a-zA-Z]+)/);
  if (rangeMatch && targetIndex !== undefined) {
    const d1 = DAY_INDEX[rangeMatch[1].toLowerCase()];
    const d2 = DAY_INDEX[rangeMatch[2].toLowerCase()];
    if (d1 !== undefined && d2 !== undefined) {
      if (d1 <= d2) {
        return targetIndex >= d1 && targetIndex <= d2;
      }
      return targetIndex >= d1 || targetIndex <= d2;
    }
  }
  return false;
}

const MONTH_NAME_TO_NUM: Record<string, number> = {
  jan: 1, january: 1, enero: 1, ene: 1,
  feb: 2, february: 2, febrero: 2,
  mar: 3, march: 3, marzo: 3,
  apr: 4, april: 4, abril: 4, abr: 4,
  may: 5, mayo: 5,
  jun: 6, june: 6, junio: 6,
  jul: 7, july: 7, julio: 7,
  aug: 8, august: 8, agosto: 8, ago: 8,
  sep: 9, sept: 9, september: 9, septiembre: 9, setiembre: 9, set: 9,
  oct: 10, october: 10, octubre: 10,
  nov: 11, november: 11, noviembre: 11,
  dec: 12, december: 12, diciembre: 12, dic: 12,
};

const BIMONTHLY_REGEX =
  /\b(?:bi[-\s]?monthly|every\s+other\s+month|every\s+(?:2|two)\s+months?)\b/i;

const ORDINAL_TOKEN_PATTERN =
  '(?:1st|first|primer[oa]?|2nd|second|segund[oa]|3rd|third|tercer[oa]?|4th|fourth|cuart[oa]|5th|fifth|quint[oa]|last|final|ultimo|últim[oa])';

const WEEKDAY_TOKEN_PATTERN =
  '(?:sun(?:days?|s)?|mon(?:days?|s)?|tue(?:sdays?|s)?|wed(?:nesdays?|s)?|thu(?:rsdays?|rs?|s)?|fri(?:days?|s)?|sat(?:urdays?|s)?)';

const DAY_PAIRED_ORDINAL_REGEX = new RegExp(
  `\\b((?:${ORDINAL_TOKEN_PATTERN})(?:\\s*(?:,\\s*(?:and\\b|&|y\\b)?|&|/|\\band\\b|\\by\\b)\\s*(?:${ORDINAL_TOKEN_PATTERN}))*)\\s+(?:of\\s+)?(${WEEKDAY_TOKEN_PATTERN})\\b`,
  'gi'
);

export type DateOfMonthPattern = {
  isDateOfMonth: boolean;
  days: number[];
  isLastDay: boolean;
};

export function parseDateOfMonthPattern(
  frequency?: string,
  frequencyNotes?: string
): DateOfMonthPattern {
  const combined = [frequency, frequencyNotes].filter(Boolean).join(' ').trim();
  if (!combined) {
    return { isDateOfMonth: false, days: [], isLastDay: false };
  }
  const hasWeekday = new RegExp(`\\b${WEEKDAY_TOKEN_PATTERN}\\b`, 'i').test(combined);
  if (hasWeekday) {
    return { isDateOfMonth: false, days: [], isLastDay: false };
  }
  const isMonthlyStyle =
    /\b(?:monthly|every\s+month|once\s+(?:a|per)\s+month|cada\s+mes|mensual)\b/i.test(combined);
  const isLastDay = /\b(?:last|final|ultimo|último)\s+day\b/i.test(combined);
  const days: number[] = [];
  for (const m of combined.matchAll(/\b([1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\b/gi)) {
    const num = parseInt(m[1], 10);
    if (num >= 1 && num <= 31 && !days.includes(num)) {
      days.push(num);
    }
  }
  const isDateOfMonth = isMonthlyStyle || isLastDay || days.length > 0;
  return { isDateOfMonth, days, isLastDay };
}

export function isDateRecurringEvent(
  event: Pick<Event, 'dayOfWeek' | 'frequency' | 'frequencyNotes'>
): boolean {
  const dayStr = (event.dayOfWeek || '').trim().toLowerCase();
  if (dayStr === 'varies' || dayStr.startsWith('varies')) {
    return true;
  }
  const parsed = parseDateOfMonthPattern(event.frequency, event.frequencyNotes);
  if (parsed.isDateOfMonth && (dayStr === '' || dayStr === 'varies')) {
    return true;
  }
  return false;
}

type OrdinalFlags = {
  has1st: boolean;
  has2nd: boolean;
  has3rd: boolean;
  has4th: boolean;
  has5th: boolean;
  hasLast: boolean;
};

function parseOrdinalFlags(text: string, numericWeeks?: Set<number>): OrdinalFlags {
  return {
    has1st: /\b(1st|first|primer[oa]?)\b/i.test(text) || Boolean(numericWeeks?.has(1)),
    has2nd: /\b(2nd|second|segund[oa])\b/i.test(text) || Boolean(numericWeeks?.has(2)),
    has3rd: /\b(3rd|third|tercer[oa]?)\b/i.test(text) || Boolean(numericWeeks?.has(3)),
    has4th: /\b(4th|fourth|cuart[oa])\b/i.test(text) || Boolean(numericWeeks?.has(4)),
    has5th: /\b(5th|fifth|quint[oa])\b/i.test(text) || Boolean(numericWeeks?.has(5)),
    hasLast: /\b(last|final|ultimo|últim[oa])\b/i.test(text),
  };
}

function matchesOrdinalFlags(flags: OrdinalFlags, occurrence: number, isLast: boolean): boolean {
  return (
    (flags.has1st && occurrence === 1) ||
    (flags.has2nd && occurrence === 2) ||
    (flags.has3rd && occurrence === 3) ||
    (flags.has4th && occurrence === 4) ||
    (flags.has5th && occurrence === 5) ||
    (flags.hasLast && isLast)
  );
}

export function isMonthActive(frequencyNotes?: string, targetDate: Date = new Date()): boolean {
  if (!frequencyNotes) return true;
  const cleaned = frequencyNotes.trim();
  if (!cleaned) return true;
  if (/\b(?:irregular|hiatus|paused|cancelled|canceled|on hold|inactive|tbd)\b/i.test(cleaned)) {
    return false;
  }
  const targetMonth = targetDate.getMonth() + 1;
  const exceptMatch = cleaned.match(
    /\b(?:except|excluding|no meetings? in|off in)\s+([a-zA-Z]+)(?:\s*(?:and|&|,)\s*([a-zA-Z]+))?\b/i
  );
  if (exceptMatch) {
    const m1 = MONTH_NAME_TO_NUM[exceptMatch[1].toLowerCase()];
    const m2 = exceptMatch[2] ? MONTH_NAME_TO_NUM[exceptMatch[2].toLowerCase()] : null;
    if (m1 && targetMonth === m1) return false;
    if (m2 && targetMonth === m2) return false;
  }

  const ranges: [number, number][] = [];
  for (const rangeMatch of cleaned.matchAll(
    /\b([a-zA-Z]{3,10})\s*(?:[\u2013\u2014\-]|--|\bto\b|\bthrough\b|\bthru\b|\ba\b)\s*([a-zA-Z]{3,10})\b/gi
  )) {
    const startMonth = MONTH_NAME_TO_NUM[rangeMatch[1].toLowerCase()];
    const endMonth = MONTH_NAME_TO_NUM[rangeMatch[2].toLowerCase()];
    if (startMonth && endMonth) {
      ranges.push([startMonth, endMonth]);
    }
  }

  if (ranges.length > 0) {
    const inAnyRange = ranges.some(([startMonth, endMonth]) =>
      startMonth <= endMonth
        ? targetMonth >= startMonth && targetMonth <= endMonth
        : targetMonth >= startMonth || targetMonth <= endMonth
    );
    if (!inAnyRange) return false;
  } else {
    const singleMonthMatch = cleaned.match(/\b([a-zA-Z]{3,10})\s+only\b/i);
    if (singleMonthMatch) {
      const m = MONTH_NAME_TO_NUM[singleMonthMatch[1].toLowerCase()];
      if (m && targetMonth !== m) {
        return false;
      }
    }
  }

  if (/\bsummer\b/i.test(cleaned) && (targetMonth < 6 || targetMonth > 8)) {
    return false;
  }
  if (/\bwinter\b/i.test(cleaned) && targetMonth !== 12 && targetMonth > 2) {
    return false;
  }
  if (/\bspring\b/i.test(cleaned) && (targetMonth < 3 || targetMonth > 5)) {
    return false;
  }
  if (/\b(?:fall|autumn)\b/i.test(cleaned) && (targetMonth < 9 || targetMonth > 11)) {
    return false;
  }
  const hasEvenMonths = /\b(?:even\s*months?|months?[\s,]+even|meses\s*pares)\b/i.test(cleaned);
  const hasOddMonths = /\b(?:odd\s*months?|months?[\s,]+odd|meses\s*impares)\b/i.test(cleaned);
  if (hasEvenMonths && !hasOddMonths) {
    return targetMonth % 2 === 0;
  }
  if (hasOddMonths && !hasEvenMonths) {
    return targetMonth % 2 !== 0;
  }
  if (!hasEvenMonths && !hasOddMonths && BIMONTHLY_REGEX.test(cleaned)) {
    return targetMonth % 2 === 0;
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
  const combinedText = [event.frequency, event.frequencyNotes]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' | ');
  if (/\b(?:irregular|hiatus|paused|cancelled|canceled|on hold|inactive|tbd)\b/i.test(combinedText)) {
    return false;
  }
  if (!isMonthActive(combinedText, targetDate)) {
    return false;
  }

  if (isDateRecurringEvent(event)) {
    const pattern = parseDateOfMonthPattern(event.frequency, event.frequencyNotes);
    if (!pattern.isDateOfMonth) {
      return false;
    }
    const dayNum = targetDate.getDate();
    const daysInMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    ).getDate();
    const isLastDay = dayNum === daysInMonth;
    return pattern.days.includes(dayNum) || (pattern.isLastDay && isLastDay);
  }

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_SHORT_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayIdx = targetDate.getDay();
  const targetDayName = DAY_NAMES[dayIdx];
  const targetDayShort = DAY_SHORT_NAMES[dayIdx];
  const daySpec =
    (event.dayOfWeek || '').trim() ||
    (event.frequency || '').trim() ||
    (event.frequencyNotes || '').trim();
  if (!matchesDay(daySpec, targetDayName)) {
    return false;
  }
  const hasEvenWeeks = /\b(?:even\s*weeks?|weeks?[\s,]+even)\b/i.test(combinedText);
  const hasOddWeeks = /\b(?:odd\s*weeks?|weeks?[\s,]+odd)\b/i.test(combinedText);
  if (hasEvenWeeks || hasOddWeeks) {
    const weekNum = getWeekNumber(targetDate);
    if (hasEvenWeeks && !hasOddWeeks) return weekNum % 2 === 0;
    if (hasOddWeeks && !hasEvenWeeks) return weekNum % 2 !== 0;
  }
  const { occurrence, isLast } = getWeekdayOccurrence(targetDate);
  const dayRules = new Map<string, OrdinalFlags>();
  for (const match of combinedText.matchAll(DAY_PAIRED_ORDINAL_REGEX)) {
    const dayKey = match[2].slice(0, 3).toLowerCase();
    const flags = parseOrdinalFlags(match[1]);
    const existing = dayRules.get(dayKey);
    if (existing) {
      existing.has1st = existing.has1st || flags.has1st;
      existing.has2nd = existing.has2nd || flags.has2nd;
      existing.has3rd = existing.has3rd || flags.has3rd;
      existing.has4th = existing.has4th || flags.has4th;
      existing.has5th = existing.has5th || flags.has5th;
      existing.hasLast = existing.hasLast || flags.hasLast;
    } else {
      dayRules.set(dayKey, flags);
    }
  }
  if (dayRules.size > 0) {
    const rule = dayRules.get(targetDayShort);
    if (rule) {
      return matchesOrdinalFlags(rule, occurrence, isLast);
    }
  }
  const weekNumMatches = new Set<number>();
  for (const m of combinedText.matchAll(
    /\b(?:weeks?|wks?|occurrences?)\s+(?:#\s*)?([1-5](?:\s*(?:,\s*(?:and\b|&|y\b)?|&|\/|\band\b|\by\b)\s*[1-5])*)\b/gi
  )) {
    for (const d of m[1].match(/[1-5]/g) || []) {
      weekNumMatches.add(Number(d));
    }
  }
  for (const m of combinedText.matchAll(
    /(?:^|[\s,(|])([1-5](?:\s*(?:,\s*(?:and\b|&|y\b)?|&|\/|\band\b|\by\b)\s*[1-5])+)(?![\d:/-])/gi
  )) {
    for (const d of m[1].match(/[1-5]/g) || []) {
      weekNumMatches.add(Number(d));
    }
  }
  const globalFlags = parseOrdinalFlags(combinedText, weekNumMatches);
  if (
    globalFlags.has1st ||
    globalFlags.has2nd ||
    globalFlags.has3rd ||
    globalFlags.has4th ||
    globalFlags.has5th ||
    globalFlags.hasLast
  ) {
    return matchesOrdinalFlags(globalFlags, occurrence, isLast);
  }
  const isBiMonthly = BIMONTHLY_REGEX.test(combinedText);
  const isPlainMonthly =
    !isBiMonthly &&
    !/\b(?:twice|semi)[-\s]?monthly\b/i.test(combinedText) &&
    /\b(?:monthly|once\s+a\s+month|every\s+month)\b/i.test(combinedText);
  if (isPlainMonthly) {
    return occurrence === 1;
  }
  return true;
}

export function ensureExternalUrl(url: string): string {
  if (!url) return '';
  const cleaned = url.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!cleaned || cleaned.toLowerCase() === 'x') return '';

  if (/^(mailto|tel|sms):/i.test(cleaned)) {
    const colonIdx = cleaned.indexOf(':');
    const scheme = cleaned.slice(0, colonIdx).toLowerCase();
    const rest = cleaned.slice(colonIdx + 1).trim();
    const target = rest.split('?')[0];
    if (!target || /[<>"'`\s]/.test(target)) return '';
    return `${scheme}:${rest}`;
  }

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsed = new URL(cleaned);
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        parsed.hostname
      ) {
        return cleaned;
      }
    } catch {
      return '';
    }
    return '';
  }

  if (cleaned.startsWith('//')) {
    if (cleaned.startsWith('///')) return '';
    const candidate = `https:${cleaned}`;
    try {
      const parsed = new URL(candidate);
      if (
        parsed.hostname &&
        parsed.hostname.includes('.') &&
        !parsed.hostname.startsWith('.') &&
        !parsed.hostname.endsWith('.')
      ) {
        return candidate;
      }
    } catch {
      return '';
    }
    return '';
  }

  if (/^[a-zA-Z][a-zA-Z0-9+-]*:/.test(cleaned)) {
    return '';
  }

  const candidate = `https://${cleaned}`;
  try {
    const parsed = new URL(candidate);
    if (
      parsed.hostname &&
      parsed.hostname.includes('.') &&
      !parsed.hostname.startsWith('.') &&
      !parsed.hostname.endsWith('.')
    ) {
      return candidate;
    }
  } catch {
    return '';
  }
  return '';
}

export function getTagStyle(tag: string): { color: string; background: string } {
  const t = (tag || '').trim().toLowerCase();
  if (t.includes('science')) {
    return { color: 'var(--tag-science-ink, #0f5c5c)', background: 'var(--tag-science-bg, #d3efec)' };
  }
  if (t.includes('craft')) {
    return { color: 'var(--tag-craft-ink, #8a3d0c)', background: 'var(--tag-craft-bg, #fde4cf)' };
  }
  if (t.includes('food') || t.includes('drink')) {
    return { color: 'var(--tag-food-ink, #6b5200)', background: 'var(--tag-food-bg, #f4eab8)' };
  }
  if (t.includes('community') || t.includes('social')) {
    return { color: 'var(--tag-community-ink, #3b4a54)', background: 'var(--tag-community-bg, #e1e7ea)' };
  }
  if (t.includes('music') || t.includes('bluegrass')) {
    return { color: 'var(--tag-music-ink, #5b2a86)', background: 'var(--tag-music-bg, #ecdcf7)' };
  }
  if (t.includes('trivia')) {
    return { color: 'var(--tag-trivia-ink, #2d3f7a)', background: 'var(--tag-trivia-bg, #dde4f7)' };
  }
  if (t.includes('open mic') || t.includes('mic') || t.includes('comedy')) {
    return { color: 'var(--tag-comedy-ink, #8a1f4f)', background: 'var(--tag-comedy-bg, #fbdce9)' };
  }
  if (t.includes('dance') || t.includes('salsa') || t.includes('bachata')) {
    return { color: 'var(--tag-dance-ink, #852b2b)', background: 'var(--tag-dance-bg, #f9dede)' };
  }
  if (t.includes('sport') || t.includes('fitness') || t.includes('yoga') || t.includes('walk')) {
    return { color: 'var(--tag-sport-ink, #1f6a42)', background: 'var(--tag-sport-bg, #d7f0df)' };
  }
  if (t.includes('language') || t.includes('english') || t.includes('spanish')) {
    return { color: 'var(--tag-language-ink, #2c4f7c)', background: 'var(--tag-language-bg, #dbe5f7)' };
  }
  return { color: 'var(--tag-default-ink, #4f483e)', background: 'var(--tag-default-bg, #f3ead4)' };
}

export function indexEvents(
  events: Event[],
  rollingWeek: Date[],
  currencyCode: string = 'USD'
): IndexedEvent[] {
  return events.map((ev) => {
    const parsedHour = parseHour(ev.startTime);
    const freeOrDonation = isFreeOrDonation(ev.price);
    const parsedPrice = freeOrDonation ? 0 : parseEventPrice(ev.price, currencyCode);
    const activityList = Array.isArray(ev.activities) ? ev.activities : [];
    const searchCorpus = [
      ev.title,
      ev.venue,
      ev.organization,
      ev.location,
      ev.area,
      ev.activity,
      ...activityList,
      ev.about,
      ev.notes,
      ev.frequency,
      ev.frequencyNotes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const isDateRec = isDateRecurringEvent(ev);
    const activeDays = isDateRec
      ? [false, false, false, false, false, false, false]
      : rollingWeek.map((day) => isEventActiveOnDate(ev, day));
    return {
      ...ev,
      activities: activityList,
      parsedHour,
      parsedPrice,
      isFreeOrDonationPrice: freeOrDonation,
      searchCorpus,
      activeDays,
    };
  });
}

export function filterAndCountEvents(
  indexedEvents: IndexedEvent[],
  activeDayIdx: number,
  maxPrice: number,
  priceConfig: CityPriceConfig,
  selectedTimes: string[],
  selectedActivities: string[],
  selectedAreas: string[],
  searchQuery: string,
  timeGroups: { name: string; predicate: (h: number) => boolean }[]
): { currentList: IndexedEvent[]; dayCounts: number[]; allCount: number } {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0, 0];
  const currentList: IndexedEvent[] = [];
  const queryTerms = searchQuery.trim()
    ? searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean)
    : null;
  const selectedActivitiesLower =
    selectedActivities.length > 0
      ? selectedActivities.map((a) => a.toLowerCase())
      : null;
  const selectedAreasLower =
    selectedAreas.length > 0
      ? selectedAreas.map((a) => a.toLowerCase())
      : null;
  const isPriceFiltered = maxPrice < priceConfig.maxPrice;
  const isAllEvents = activeDayIdx === 7;
  let allCount = 0;

  for (let i = 0; i < indexedEvents.length; i++) {
    const ev = indexedEvents[i];
    if (isPriceFiltered) {
      if (maxPrice === 0) {
        if (!ev.isFreeOrDonationPrice) continue;
      } else if (!ev.isFreeOrDonationPrice) {
        if (ev.parsedPrice === null || ev.parsedPrice > maxPrice) continue;
      }
    }
    if (selectedTimes.length > 0) {
      const matchesTime = selectedTimes.some((tgName) => {
        const group = timeGroups.find((g) => g.name === tgName);
        return group ? group.predicate(ev.parsedHour) : false;
      });
      if (!matchesTime) continue;
    }
    if (selectedActivitiesLower) {
      const activityList = Array.isArray(ev.activities) ? ev.activities : [];
      const hasActivityMatch = activityList.some((act) =>
        selectedActivitiesLower.includes(act.trim().toLowerCase())
      );
      if (!hasActivityMatch) continue;
    }
    if (selectedAreasLower) {
      const evAreaLower = (ev.area || '').trim().toLowerCase();
      if (!selectedAreasLower.includes(evAreaLower)) continue;
    }
    if (queryTerms) {
      const matchesSearch = queryTerms.every((term) =>
        ev.searchCorpus.includes(term)
      );
      if (!matchesSearch) continue;
    }

    allCount++;
    dayCounts[7]++;
    for (let d = 0; d < 7; d++) {
      if (ev.activeDays[d]) {
        dayCounts[d]++;
      }
    }
    const isDateRec = isDateRecurringEvent(ev);
    if (isAllEvents || (queryTerms !== null && isDateRec) || ev.activeDays[activeDayIdx]) {
      currentList.push(ev);
    }
  }
  currentList.sort((a, b) => a.parsedHour - b.parsedHour);
  return { currentList, dayCounts, allCount };
}