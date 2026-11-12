import { Event } from '../lib/google-sheets';
import { CityPriceConfig } from '../lib/cities';
export type IndexedEvent = Event & {
  parsedHour: number;
  parsedPrice: number | null;
  isFreeOrDonationPrice: boolean;
  searchCorpus: string;
  activeDays: boolean[];
};
export type ContactInfo =
  | {
      type: 'email';
      email: string;
      mailtoUrl: string;
      gmailUrl: string;
      androidIntentUrl: string;
    }
  | {
      type: 'phone';
      displayPhone: string;
      telUrl: string;
      rawPhone: string;
    }
  | {
      type: 'url';
      url: string;
    }
  | {
      type: 'none';
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
export function matchesPriceFilter(
  eventPrice: string,
  maxPriceFilter: number,
  priceConfig: CityPriceConfig
): boolean {
  if (maxPriceFilter >= priceConfig.maxPrice) {
    return true;
  }
  if (isFreeOrDonation(eventPrice)) {
    return true;
  }
  if (maxPriceFilter === 0) {
    return isFreeOrDonation(eventPrice);
  }
  const num = parseEventPrice(eventPrice, priceConfig.currencyCode);
  if (num === null) {
    return false;
  }
  return num <= maxPriceFilter;
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
export function formatPriceTriggerLabel(val: number, config: CityPriceConfig): string {
  if (val >= config.maxPrice) return 'All prices';
  if (val === 0) return 'Free / donation';
  if (val === config.underValue) return config.underLabel;
  return `Up to ${formatPriceValue(val, config)}`;
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
  const targetIndex = DAY_INDEX[targetKey];
  const aliases = DAY_ALIAS_MAP[targetKey] || [targetKey];
  const rawLower = eventDays.toLowerCase();
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
export function isMonthActive(frequencyNotes?: string, targetDate: Date = new Date()): boolean {
  if (!frequencyNotes) return true;
  const cleaned = frequencyNotes.trim();
  if (!cleaned) return true;
  if (/\b(?:irregular|hiatus|paused|cancelled|canceled|on hold|inactive|tbd)\b/i.test(cleaned)) {
    return false;
  }
  const targetMonth = targetDate.getMonth() + 1;
  if (/\b(?:even\s*months?|months?[\s,]+even|meses\s*pares)\b/i.test(cleaned)) {
    return targetMonth % 2 === 0;
  }
  if (/\b(?:odd\s*months?|months?[\s,]+odd|meses\s*impares)\b/i.test(cleaned)) {
    return targetMonth % 2 !== 0;
  }
  const exceptMatch = cleaned.match(
    /\b(?:except|excluding|no meetings? in|off in)\s+([a-zA-Z]+)(?:\s*(?:and|&|,)\s*([a-zA-Z]+))?\b/i
  );
  if (exceptMatch) {
    const m1 = MONTH_NAME_TO_NUM[exceptMatch[1].toLowerCase()];
    const m2 = exceptMatch[2] ? MONTH_NAME_TO_NUM[exceptMatch[2].toLowerCase()] : null;
    if (m1 && targetMonth === m1) return false;
    if (m2 && targetMonth === m2) return false;
  }
  const rangeMatch = cleaned.match(
    /\b([a-zA-Z]{3,9})\s*(?:[\u2013\u2014\-]|--|\bto\b|\bthrough\b|\bthru\b|\ba\b)\s*([a-zA-Z]{3,9})\b/i
  );
  if (rangeMatch) {
    const startMonth = MONTH_NAME_TO_NUM[rangeMatch[1].toLowerCase()];
    const endMonth = MONTH_NAME_TO_NUM[rangeMatch[2].toLowerCase()];
    if (startMonth && endMonth) {
      if (startMonth <= endMonth) {
        return targetMonth >= startMonth && targetMonth <= endMonth;
      }
      return targetMonth >= startMonth || targetMonth <= endMonth;
    }
  }
  const singleMonthMatch = cleaned.match(/\b([a-zA-Z]{3,9})\s+only\b/i);
  if (singleMonthMatch) {
    const m = MONTH_NAME_TO_NUM[singleMonthMatch[1].toLowerCase()];
    if (m) {
      return targetMonth === m;
    }
  }
  if (/\bsummer\b/i.test(cleaned)) {
    return targetMonth >= 6 && targetMonth <= 8;
  }
  if (/\bwinter\b/i.test(cleaned)) {
    return targetMonth === 12 || targetMonth <= 2;
  }
  if (/\bspring\b/i.test(cleaned)) {
    return targetMonth >= 3 && targetMonth <= 5;
  }
  if (/\b(?:fall|autumn)\b/i.test(cleaned)) {
    return targetMonth >= 9 && targetMonth <= 11;
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
  const combinedText = `${event.frequency || ''} ${event.frequencyNotes || ''}`.trim();
  if (/\b(?:irregular|hiatus|paused|cancelled|canceled|on hold|inactive|tbd)\b/i.test(combinedText)) {
    return false;
  }
  if (!isMonthActive(event.frequencyNotes, targetDate) || !isMonthActive(event.frequency, targetDate)) {
    return false;
  }
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayName = DAY_NAMES[targetDate.getDay()];
  const daySpec = `${event.dayOfWeek || ''} ${event.frequency || ''}`;
  if (!matchesDay(daySpec, targetDayName)) {
    return false;
  }
  if (/\b(?:even\s*weeks?|weeks?[\s,]+even)\b/i.test(combinedText)) {
    const weekNum = getWeekNumber(targetDate);
    if (weekNum % 2 !== 0) return false;
  }
  if (/\b(?:odd\s*weeks?|weeks?[\s,]+odd)\b/i.test(combinedText)) {
    const weekNum = getWeekNumber(targetDate);
    if (weekNum % 2 === 0) return false;
  }
  const { occurrence, isLast } = getWeekdayOccurrence(targetDate);
  const has1st = /\b(1st|first|primer[oa]?)\b/i.test(combinedText);
  const has2nd = /\b(2nd|second|segund[oa])\b/i.test(combinedText);
  const has3rd = /\b(3rd|third|tercer[oa]?)\b/i.test(combinedText);
  const has4th = /\b(4th|fourth|cuart[oa])\b/i.test(combinedText);
  const has5th = /\b(5th|fifth|quint[oa])\b/i.test(combinedText);
  const hasLast = /\b(last|ultimo|últim[oa])\b/i.test(combinedText);
  if (has1st || has2nd || has3rd || has4th || has5th || hasLast) {
    const matchesOrdinal =
      (has1st && occurrence === 1) ||
      (has2nd && occurrence === 2) ||
      (has3rd && occurrence === 3) ||
      (has4th && occurrence === 4) ||
      (has5th && occurrence === 5) ||
      (hasLast && isLast);
    return matchesOrdinal;
  }
  const cadence = (event.frequency || '').toLowerCase();
  if (cadence.includes('bi-weekly')) {
    const weekNum = getWeekNumber(targetDate);
    return weekNum % 2 === 0;
  }
  return true;
}
export function ensureExternalUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:|sms:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
export function parseContactInfo(rawContact?: string): ContactInfo {
  if (!rawContact) return { type: 'none' };
  const trimmed = rawContact.trim();
  if (!trimmed || trimmed.toLowerCase() === 'x') {
    return { type: 'none' };
  }
  const createEmailContact = (cleanEmail: string): ContactInfo => {
    const encoded = encodeURIComponent(cleanEmail);
    return {
      type: 'email',
      email: cleanEmail,
      mailtoUrl: `mailto:${cleanEmail}`,
      gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encoded}`,
      androidIntentUrl: `intent:${encoded}#Intent;scheme=mailto;package=com.google.android.gm;action=android.intent.action.SENDTO;S.browser_fallback_url=${encodeURIComponent(`mailto:${cleanEmail}`)};end`,
    };
  };
  if (/^mailto:/i.test(trimmed)) {
    const email = trimmed.replace(/^mailto:/i, '').split('?')[0].trim();
    if (email) {
      return createEmailContact(email);
    }
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return createEmailContact(trimmed);
  }
  if (/^tel:/i.test(trimmed)) {
    const rawNumber = trimmed.replace(/^tel:/i, '').trim();
    const displayPhone = formatPhoneNumber(rawNumber);
    const cleanDigits = rawNumber.replace(/[^\d+]/g, '');
    const telDigits = cleanDigits.startsWith('+')
      ? cleanDigits
      : cleanDigits.length === 10
      ? `+1${cleanDigits}`
      : cleanDigits;
    return {
      type: 'phone',
      displayPhone,
      telUrl: `tel:${telDigits}`,
      rawPhone: rawNumber,
    };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      type: 'url',
      url: trimmed,
    };
  }
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount >= 7 && !/[a-zA-Z]/.test(trimmed)) {
    const displayPhone = formatPhoneNumber(trimmed);
    const cleanDigits = trimmed.replace(/[^\d+]/g, '');
    const telDigits = cleanDigits.startsWith('+')
      ? cleanDigits
      : cleanDigits.length === 10
      ? `+1${cleanDigits}`
      : cleanDigits;
    return {
      type: 'phone',
      displayPhone,
      telUrl: `tel:${telDigits}`,
      rawPhone: trimmed,
    };
  }
  if (trimmed.includes('.') && !trimmed.includes(' ') && trimmed.length > 3) {
    return {
      type: 'url',
      url: ensureExternalUrl(trimmed),
    };
  }
  return { type: 'none' };
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
    const searchCorpus = [
      ev.title,
      ev.venue,
      ev.organization,
      ev.location,
      ev.area,
      ev.activity,
      ...ev.activities,
      ev.about,
      ev.notes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const activeDays = rollingWeek.map((day) => isEventActiveOnDate(ev, day));
    return {
      ...ev,
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
): { currentList: IndexedEvent[]; dayCounts: number[] } {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
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
      const hasActivityMatch = ev.activities.some((act) =>
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
    for (let d = 0; d < 7; d++) {
      if (ev.activeDays[d]) {
        dayCounts[d]++;
      }
    }
    if (ev.activeDays[activeDayIdx]) {
      currentList.push(ev);
    }
  }
  currentList.sort((a, b) => a.parsedHour - b.parsedHour);
  return { currentList, dayCounts };
}