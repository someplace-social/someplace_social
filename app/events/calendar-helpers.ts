import type { CityConfig } from '../lib/cities';
import { getCityTimeZone } from '../lib/cities';
import type { Event } from '../lib/google-sheets';
import { ensureExternalUrl, formatTimeRange, parseHour } from './utils';
import {
  getEventAbsoluteUrl,
  getEventDisplayDetails,
  getNextEventOccurrence,
  slugifyText,
} from './event-helpers';

export type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type CalendarEventDetails = {
  title: string;
  location: string;
  description: string;
  url: string;
  uid: string;
  timeZone: string;
  isAllDay: boolean;
  startLocal: LocalDateTimeParts;
  endLocal: LocalDateTimeParts;
  copySummary: string;
};

type CalendarCityInput = Pick<
  CityConfig,
  'slug' | 'name' | 'heroLocation' | 'timeZone'
>;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function dateToParts(date: Date, hour: number, minute: number): LocalDateTimeParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour,
    minute,
  };
}

function formatCompactDate(parts: LocalDateTimeParts): string {
  return `${parts.year}${pad2(parts.month)}${pad2(parts.day)}`;
}

function formatCompactLocalDateTime(parts: LocalDateTimeParts): string {
  return `${formatCompactDate(parts)}T${pad2(parts.hour)}${pad2(parts.minute)}00`;
}

function formatCompactUtcDateTime(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
    `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
  );
}

function getTimeZoneOffsetMs(utcTimestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(utcTimestamp));

  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = Number(part.value);
    }
  }

  const hour = values.hour === 24 ? 0 : values.hour;
  const zonedAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    hour,
    values.minute,
    values.second
  );
  return zonedAsUtc - utcTimestamp;
}

export function zonedLocalToUtc(
  local: LocalDateTimeParts,
  timeZone: string
): Date {
  const utcGuess = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    0
  );
  try {
    const offset1 = getTimeZoneOffsetMs(utcGuess, timeZone);
    const candidate = utcGuess - offset1;
    const offset2 = getTimeZoneOffsetMs(candidate, timeZone);
    if (offset2 !== offset1) {
      return new Date(utcGuess - offset2);
    }
    return new Date(candidate);
  } catch {
    return new Date(utcGuess);
  }
}

function buildCalendarLocation(
  event: Event,
  city: CalendarCityInput
): string {
  const { displayVenue, showDistinctAddress } = getEventDisplayDetails(
    event,
    city.name
  );
  const parts: string[] = [];
  if (displayVenue) {
    parts.push(displayVenue);
  }
  if (showDistinctAddress) {
    parts.push(event.location.trim());
  } else if (!displayVenue && event.area.trim()) {
    parts.push(event.area.trim());
  }
  if (parts.length === 0) {
    return '';
  }
  const combined = normalizeForMatch(parts.join(', '));
  const cityNormalized = normalizeForMatch(city.name);
  if (!combined.includes(cityNormalized)) {
    parts.push(city.heroLocation || city.name);
  }
  return parts.join(', ');
}

function buildCalendarDescription(
  event: Event,
  city: CalendarCityInput,
  canonicalUrl: string
): string {
  const {
    organizerName,
    showOrganizer,
    recurrenceText,
    preRegistrationText,
    registrationUrl,
  } = getEventDisplayDetails(event, city.name);

  const aboutText = (event.about || event.notes || '').trim();
  const detailLines: string[] = [];

  const priceText = (event.price || '').trim();
  if (priceText) {
    detailLines.push(`Price: ${priceText}`);
  }

  if (preRegistrationText && registrationUrl) {
    if (preRegistrationText.toLowerCase() === 'registration') {
      detailLines.push(`RSVP: ${registrationUrl}`);
    } else {
      detailLines.push(`RSVP: ${preRegistrationText} (${registrationUrl})`);
    }
  } else if (registrationUrl) {
    detailLines.push(`RSVP: ${registrationUrl}`);
  } else if (preRegistrationText) {
    detailLines.push(`RSVP: ${preRegistrationText}`);
  }

  if (recurrenceText) {
    detailLines.push(`Schedule: ${recurrenceText}`);
  }

  if (showOrganizer) {
    detailLines.push(`Hosted by: ${organizerName}`);
  }

  const rawContact = (event.contact || '').trim();
  if (rawContact && rawContact.toLowerCase() !== 'x') {
    detailLines.push(`Contact: ${rawContact}`);
  }

  const rawMap = (event.map || '').trim();
  const mapUrl = rawMap ? ensureExternalUrl(rawMap) : '';
  if (mapUrl) {
    detailLines.push(`Map: ${mapUrl}`);
  }

  detailLines.push(`Event info: ${canonicalUrl}`);

  return [aboutText, detailLines.join('\n')].filter(Boolean).join('\n\n');
}

function formatPreviewDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function resolveCalendarOccurrence(
  event: Event,
  city: CalendarCityInput,
  selectedDate?: Date | null
): CalendarEventDetails | null {
  const timeZone = getCityTimeZone(city as CityConfig);
  const occurrenceDate =
    selectedDate ?? getNextEventOccurrence(event, timeZone, 90)?.date ?? null;

  if (!occurrenceDate) {
    return null;
  }

  const dayDate = new Date(
    occurrenceDate.getFullYear(),
    occurrenceDate.getMonth(),
    occurrenceDate.getDate()
  );

  const rawStart = (event.startTime || '').trim();
  const rawEnd = (event.endTime || '').trim();
  const hasStartTime = Boolean(rawStart && /\d/.test(rawStart));
  const hasEndTime = Boolean(rawEnd && /\d/.test(rawEnd));

  let isAllDay = false;
  let startLocal: LocalDateTimeParts;
  let endLocal: LocalDateTimeParts;
  let timeSummary = '';

  if (!hasStartTime) {
    isAllDay = true;
    startLocal = dateToParts(dayDate, 0, 0);
    endLocal = dateToParts(addCalendarDays(dayDate, 1), 0, 0);
  } else {
    const startDec = parseHour(rawStart);
    const startTotalMins = Math.round(startDec * 60);
    const startHour = Math.floor(startTotalMins / 60) % 24;
    const startMin = startTotalMins % 60;
    startLocal = dateToParts(dayDate, startHour, startMin);

    let endDay = dayDate;
    let endHour: number;
    let endMin: number;

    if (hasEndTime) {
      const rawEndMins = Math.round(parseHour(rawEnd) * 60);
      if (rawEndMins === startTotalMins) {
        const fallbackTotal = startTotalMins + 60;
        endDay = addCalendarDays(dayDate, Math.floor(fallbackTotal / 1440));
        const wrapped = fallbackTotal % 1440;
        endHour = Math.floor(wrapped / 60);
        endMin = wrapped % 60;
      } else {
        if (rawEndMins < startTotalMins) {
          endDay = addCalendarDays(dayDate, 1);
        }
        endHour = Math.floor(rawEndMins / 60) % 24;
        endMin = rawEndMins % 60;
      }
    } else {
      const fallbackTotal = startTotalMins + 60;
      endDay = addCalendarDays(dayDate, Math.floor(fallbackTotal / 1440));
      const wrapped = fallbackTotal % 1440;
      endHour = Math.floor(wrapped / 60);
      endMin = wrapped % 60;
    }

    endLocal = dateToParts(endDay, endHour, endMin);
    const { start, end } = formatTimeRange(rawStart, rawEnd);
    timeSummary = start && end ? `${start}–${end}` : start;
  }

  const title = event.title.trim();
  const { displayVenue } = getEventDisplayDetails(event, city.name);
  const venueName = displayVenue || event.area.trim();
  const whenPart = [formatPreviewDate(dayDate), timeSummary]
    .filter(Boolean)
    .join(' ');
  const includeVenue =
    Boolean(venueName) &&
    !normalizeForMatch(title).includes(normalizeForMatch(venueName));
  const whatWhere = includeVenue ? `${title} at ${venueName}` : title;
  const copySummary = `${whenPart}: ${whatWhere}`;

  const canonicalUrl = getEventAbsoluteUrl(city.slug, event);
  const uidBase = slugifyText(event.id || title) || 'event';
  const uid = `${uidBase}-${formatCompactDate(startLocal)}@someplacesocial.org`;

  return {
    title,
    location: buildCalendarLocation(event, city),
    description: buildCalendarDescription(event, city, canonicalUrl),
    url: canonicalUrl,
    uid,
    timeZone,
    isAllDay,
    startLocal,
    endLocal,
    copySummary,
  };
}

export function buildGoogleCalendarUrl(details: CalendarEventDetails): string {
  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', details.title);

  if (details.isAllDay) {
    params.set(
      'dates',
      `${formatCompactDate(details.startLocal)}/${formatCompactDate(details.endLocal)}`
    );
  } else {
    params.set(
      'dates',
      `${formatCompactLocalDateTime(details.startLocal)}/${formatCompactLocalDateTime(
        details.endLocal
      )}`
    );
    params.set('ctz', details.timeZone);
  }

  if (details.location) {
    params.set('location', details.location);
  }

  if (details.description) {
    const maxLen = 1500;
    const safeDesc =
      details.description.length > maxLen
        ? `${details.description.slice(0, maxLen - 1).trimEnd()}…`
        : details.description;
    params.set('details', safeDesc);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) {
    return line;
  }

  const lines: string[] = [];
  let current = '';
  let currentBytes = 0;
  const maxBytes = 75;

  for (const ch of line) {
    const chBytes = encoder.encode(ch).length;
    if (currentBytes + chBytes > maxBytes && current.length > 0) {
      lines.push(current);
      current = ` ${ch}`;
      currentBytes = 1 + chBytes;
    } else {
      current += ch;
      currentBytes += chBytes;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.join('\r\n');
}

export function buildIcsContent(
  details: CalendarEventDetails,
  now: Date = new Date()
): string {
  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Someplace Social//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${details.uid}`,
    `DTSTAMP:${formatCompactUtcDateTime(now)}`,
  ];

  if (details.isAllDay) {
    rawLines.push(`DTSTART;VALUE=DATE:${formatCompactDate(details.startLocal)}`);
    rawLines.push(`DTEND;VALUE=DATE:${formatCompactDate(details.endLocal)}`);
  } else {
    const startUtc = zonedLocalToUtc(details.startLocal, details.timeZone);
    const endUtc = zonedLocalToUtc(details.endLocal, details.timeZone);
    rawLines.push(`DTSTART:${formatCompactUtcDateTime(startUtc)}`);
    rawLines.push(`DTEND:${formatCompactUtcDateTime(endUtc)}`);
  }

  rawLines.push(`SUMMARY:${escapeIcsText(details.title)}`);
  if (details.location) {
    rawLines.push(`LOCATION:${escapeIcsText(details.location)}`);
  }
  if (details.description) {
    rawLines.push(`DESCRIPTION:${escapeIcsText(details.description)}`);
  }
  rawLines.push(`URL:${details.url}`);
  rawLines.push('STATUS:CONFIRMED');
  rawLines.push('END:VEVENT');
  rawLines.push('END:VCALENDAR');

  return `${rawLines.map(foldIcsLine).join('\r\n')}\r\n`;
}

export function getIcsFilename(details: CalendarEventDetails): string {
  const base = slugifyText(details.title) || 'event';
  const datePart = `${details.startLocal.year}-${pad2(
    details.startLocal.month
  )}-${pad2(details.startLocal.day)}`;
  return `${base}-${datePart}.ics`;
}

export function downloadIcsFile(filename: string, content: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 10_000);
}