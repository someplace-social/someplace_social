import { Event } from '../lib/google-sheets';
import {
  CityConfig,
  SITE_URL,
  getCityPriceConfig,
  getCityTimeZone,
} from '../lib/cities';
import {
  ensureExternalUrl,
  formatRecurrenceText,
  formatTimeRange,
  isEventActiveOnDate,
  isFreeOrDonation,
  parseEventPrice,
  parseHour,
} from './utils';

export type EventResolutionResult = {
  event: Event;
  canonicalSlug: string;
  isCanonical: boolean;
};

export type NextOccurrenceResult = {
  date: Date;
  offsetDays: number;
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
};

export type EventDisplayDetails = {
  displayVenue: string;
  venueUrl: string;
  showDistinctAddress: boolean;
  organizerName: string;
  organizerUrl: string;
  showOrganizer: boolean;
  recurrenceText: string;
  preRegistrationText: string;
  registrationUrl: string;
  needsSignupIcon: boolean;
  mapsHref: string;
};

export function getEventDisplayDetails(
  event: Event,
  cityName: string
): EventDisplayDetails {
  const displayVenue = (event.venue || event.location || '').trim();
  const venueUrl =
    displayVenue && event.venueUrl ? ensureExternalUrl(event.venueUrl) : '';
  const showDistinctAddress = Boolean(
    event.venue.trim() &&
      event.location.trim() &&
      event.venue.trim().toLowerCase() !== event.location.trim().toLowerCase()
  );
  const organizerName = (event.organization || '')
    .trim()
    .replace(/^hosted\s+by\s+/i, '')
    .trim();
  const organizerUrl =
    organizerName && event.organizerUrl
      ? ensureExternalUrl(event.organizerUrl)
      : '';
  const showOrganizer = Boolean(
    organizerName &&
      organizerName.toLowerCase() !== displayVenue.toLowerCase()
  );
  const recurrenceText = formatRecurrenceText(
    event.frequency,
    event.frequencyNotes
  );
  const rawPreReg = (event.preRegistration || '').trim();
  const registrationUrl = event.registrationUrl
    ? ensureExternalUrl(event.registrationUrl)
    : '';
  const preRegistrationText = rawPreReg || (registrationUrl ? 'Registration' : '');
  const regLower = preRegistrationText.toLowerCase();
  const isDropInOrNoReg =
    regLower.startsWith('drop') ||
    regLower.startsWith('no ') ||
    regLower.includes('no rsvp') ||
    regLower.includes('no registration') ||
    regLower.includes('not required') ||
    regLower.includes('not needed');
  const needsSignupIcon =
    Boolean(registrationUrl) ||
    (!isDropInOrNoReg &&
      /\b(reg|register|registration|pre-?registration|rsvp|ticket|ticketed|pre-?pay|required|recommended|sign[\s-]?up)\b/i.test(
        regLower
      ));
  const mapsHref =
    (event.map ? ensureExternalUrl(event.map) : '') ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${displayVenue || event.title}, ${cityName}`
    )}`;
  return {
    displayVenue,
    venueUrl,
    showDistinctAddress,
    organizerName,
    organizerUrl,
    showOrganizer,
    recurrenceText,
    preRegistrationText,
    registrationUrl,
    needsSignupIcon,
    mapsHref,
  };
}

export function slugifyText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeEventId(id?: string): string {
  if (!id) return '';
  return id
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function getEventSlug(event: Pick<Event, 'id' | 'title'>): string {
  const titleSlug = slugifyText(event.title);
  const idPart = normalizeEventId(event.id);
  if (idPart && titleSlug) {
    return `${titleSlug}-${idPart}`;
  }
  if (idPart) {
    return `event-${idPart}`;
  }
  return titleSlug || 'event';
}

export function getEventPath(citySlug: string, event: Pick<Event, 'id' | 'title'>): string {
  return `/${citySlug}/events/${getEventSlug(event)}`;
}

export function getEventAbsoluteUrl(
  citySlug: string,
  event: Pick<Event, 'id' | 'title'>
): string {
  return `${SITE_URL}${getEventPath(citySlug, event)}`;
}

export function resolveEventBySlug(
  events: Event[],
  rawSlug: string
): EventResolutionResult | null {
  if (!rawSlug || events.length === 0) return null;
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {
  }
  const normalizedSlug = decoded.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  if (!normalizedSlug) return null;
  for (const ev of events) {
    const canonicalSlug = getEventSlug(ev);
    if (canonicalSlug === normalizedSlug) {
      return { event: ev, canonicalSlug, isCanonical: true };
    }
  }
  for (const ev of events) {
    const normId = normalizeEventId(ev.id);
    if (!normId) continue;
    if (normId === normalizedSlug) {
      const canonicalSlug = getEventSlug(ev);
      return { event: ev, canonicalSlug, isCanonical: false };
    }
  }
  const lastDashIdx = normalizedSlug.lastIndexOf('-');
  if (lastDashIdx !== -1 && lastDashIdx < normalizedSlug.length - 1) {
    const trailingId = normalizedSlug.slice(lastDashIdx + 1);
    const exactTrailingMatch = events.find(
      (ev) => normalizeEventId(ev.id) === trailingId
    );
    if (exactTrailingMatch) {
      const canonicalSlug = getEventSlug(exactTrailingMatch);
      return {
        event: exactTrailingMatch,
        canonicalSlug,
        isCanonical: canonicalSlug === normalizedSlug,
      };
    }
  }
  let bestHyphenatedMatch: Event | null = null;
  let bestIdLen = 0;
  for (const ev of events) {
    const normId = normalizeEventId(ev.id);
    if (!normId || !normId.includes('-')) continue;
    if (normalizedSlug.endsWith(`-${normId}`) && normId.length > bestIdLen) {
      bestHyphenatedMatch = ev;
      bestIdLen = normId.length;
    }
  }
  if (bestHyphenatedMatch) {
    const canonicalSlug = getEventSlug(bestHyphenatedMatch);
    return {
      event: bestHyphenatedMatch,
      canonicalSlug,
      isCanonical: canonicalSlug === normalizedSlug,
    };
  }
  const barePrefixMatch = events.find((ev) => {
    const normId = normalizeEventId(ev.id);
    return Boolean(normId) && normId.startsWith(`${normalizedSlug}-`);
  });
  if (barePrefixMatch) {
    const canonicalSlug = getEventSlug(barePrefixMatch);
    return {
      event: barePrefixMatch,
      canonicalSlug,
      isCanonical: false,
    };
  }
  if (lastDashIdx !== -1 && lastDashIdx < normalizedSlug.length - 1) {
    const trailingId = normalizedSlug.slice(lastDashIdx + 1);
    const trailingPrefixMatch = events.find((ev) => {
      const normId = normalizeEventId(ev.id);
      return Boolean(normId) && normId.startsWith(`${trailingId}-`);
    });
    if (trailingPrefixMatch) {
      const canonicalSlug = getEventSlug(trailingPrefixMatch);
      return {
        event: trailingPrefixMatch,
        canonicalSlug,
        isCanonical: false,
      };
    }
  }
  const idLessEvents = events.filter((ev) => !normalizeEventId(ev.id));
  const idLessTitleMatch = idLessEvents.find(
    (ev) => slugifyText(ev.title) === normalizedSlug
  );
  if (idLessTitleMatch) {
    const canonicalSlug = getEventSlug(idLessTitleMatch);
    return {
      event: idLessTitleMatch,
      canonicalSlug,
      isCanonical: canonicalSlug === normalizedSlug,
    };
  }
  const hasTrailingNumericId = /-\d+$/.test(normalizedSlug);
  if (!hasTrailingNumericId) {
    const titleMatch = events.find((ev) => slugifyText(ev.title) === normalizedSlug);
    if (titleMatch) {
      const canonicalSlug = getEventSlug(titleMatch);
      return {
        event: titleMatch,
        canonicalSlug,
        isCanonical: canonicalSlug === normalizedSlug,
      };
    }
  }
  return null;
}

export function getCityToday(timeZone: string, now: Date = new Date()): Date {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(now);
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  } catch {
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function formatOccurrenceLabel(date: Date, offsetDays: number): string {
  if (offsetDays === 0) return 'Today';
  if (offsetDays === 1) return 'Tomorrow';
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `Next: ${formatted}`;
}

export function getNextEventOccurrence(
  event: Event,
  timeZone: string,
  maxDays: number = 90,
  now: Date = new Date()
): NextOccurrenceResult | null {
  const startDay = getCityToday(timeZone, now);
  for (let offset = 0; offset <= maxDays; offset++) {
    const candidate = new Date(startDay);
    candidate.setDate(startDay.getDate() + offset);
    if (isEventActiveOnDate(event, candidate)) {
      return {
        date: candidate,
        offsetDays: offset,
        label: formatOccurrenceLabel(candidate, offset),
        isToday: offset === 0,
        isTomorrow: offset === 1,
      };
    }
  }
  return null;
}

export function buildScheduleLine(event: Event): string {
  const { start, end } = formatTimeRange(event.startTime, event.endTime);
  const timePart = start && end ? `${start} – ${end}` : start || '';
  const freqRaw = (event.frequency || '').trim();
  const notesRaw = (event.frequencyNotes || '').trim();
  const isPlainWeekly = /^weekly$/i.test(freqRaw) && !notesRaw;
  const recurrencePart = formatRecurrenceText(freqRaw, notesRaw);
  const dayRaw = (event.dayOfWeek || '').trim();
  let whenPart = '';
  if (dayRaw && recurrencePart && !isPlainWeekly) {
    if (recurrencePart.toLowerCase().includes(dayRaw.toLowerCase())) {
      whenPart = recurrencePart;
    } else {
      whenPart = `${dayRaw} (${recurrencePart})`;
    }
  } else {
    whenPart = dayRaw || recurrencePart;
  }
  return [whenPart, timePart].filter(Boolean).join(' · ');
}

export function buildEventInviteText(event: Event, citySlug: string): string {
  const url = getEventAbsoluteUrl(citySlug, event);
  const title = event.title.trim();
  const scheduleLine = buildScheduleLine(event);
  const venue = (event.venue || event.location || '').trim();
  const area = (event.area || '').trim();
  let placePart = '';
  if (venue && area && venue.toLowerCase() !== area.toLowerCase()) {
    placePart = `${venue} (${area})`;
  } else {
    placePart = venue || area;
  }
  const pricePart = (event.price || '').trim();
  const detailsLine = [placePart, pricePart].filter(Boolean).join(' · ');
  return [title, scheduleLine, detailsLine, url].filter(Boolean).join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  } catch {
  }
  return false;
}

export function buildEventMetaDescription(event: Event, city: CityConfig): string {
  const schedule = buildScheduleLine(event);
  const venue = (event.venue || event.location || '').trim();
  const area = (event.area || '').trim();
  const price = (event.price || '').trim();
  const about = (event.about || event.notes || '').replace(/\s+/g, ' ').trim();
  let locationPhrase = '';
  if (venue && area && venue.toLowerCase() !== area.toLowerCase()) {
    locationPhrase = `${venue} (${area})`;
  } else {
    locationPhrase = venue || area || city.heroLocation;
  }
  const headParts: string[] = [];
  if (schedule && locationPhrase) {
    headParts.push(`${schedule} at ${locationPhrase}`);
  } else if (schedule) {
    headParts.push(schedule);
  } else if (locationPhrase) {
    headParts.push(`${locationPhrase}, ${city.name}`);
  }
  if (price) {
    headParts.push(price);
  }
  const headerSummary = headParts.join(' · ');
  const full = [headerSummary ? `${headerSummary}.` : '', about]
    .filter(Boolean)
    .join(' ');
  if (full.length <= 160) return full;
  const sliced = full.slice(0, 157);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = lastSpace > 90 ? sliced.slice(0, lastSpace) : sliced;
  return `${trimmed.replace(/[.,;:\s]+$/, '')}…`;
}

function getTimeZoneOffsetString(date: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const match = tzName.match(/GMT([+-]\d{2}):?(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    if (tzName === 'GMT') return 'Z';
  } catch {
  }
  return timeZone === 'America/Bogota' ? '-05:00' : '-07:00';
}

function formatLocalIsoDateTime(
  date: Date,
  decimalHour: number,
  timeZone: string
): string {
  const totalMinutes = Math.round(decimalHour * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const min = String(minutes).padStart(2, '0');
  const offset = getTimeZoneOffsetString(
    new Date(Date.UTC(yyyy, date.getMonth(), date.getDate(), 12, 0, 0)),
    timeZone
  );
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00${offset}`;
}

function formatLocalIsoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function buildEventJsonLd(
  event: Event,
  city: CityConfig,
  canonicalUrl: string,
  occurrence: NextOccurrenceResult | null
): Record<string, unknown> | null {
  const venueName = (event.venue || event.location || '').trim();
  if (!occurrence || (!venueName && !city.name)) {
    return null;
  }
  const timeZone = getCityTimeZone(city);
  const hasStartTime = Boolean((event.startTime || '').trim());
  const startHour = parseHour(event.startTime);
  const startDate = hasStartTime
    ? formatLocalIsoDateTime(occurrence.date, startHour, timeZone)
    : formatLocalIsoDate(occurrence.date);
  let endDate: string | undefined;
  if (hasStartTime && (event.endTime || '').trim()) {
    const endHour = parseHour(event.endTime);
    const endDay = new Date(occurrence.date);
    if (endHour < startHour) {
      endDay.setDate(endDay.getDate() + 1);
    }
    endDate = formatLocalIsoDateTime(endDay, endHour, timeZone);
  }
  const cleanOrg = (event.organization || '')
    .trim()
    .replace(/^hosted\s+by\s+/i, '')
    .trim();
  const venueUrl =
    venueName && event.venueUrl ? ensureExternalUrl(event.venueUrl) : '';
  const organizerUrl =
    cleanOrg && event.organizerUrl ? ensureExternalUrl(event.organizerUrl) : '';
  const registrationUrl = event.registrationUrl
    ? ensureExternalUrl(event.registrationUrl)
    : '';
  const priceConfig = getCityPriceConfig(city);
  const freeOrDonation = isFreeOrDonation(event.price);
  const numericPrice = freeOrDonation
    ? 0
    : parseEventPrice(event.price, priceConfig.currencyCode);
  const resolvedOfferPrice =
    numericPrice !== null
      ? priceConfig.currencyCode === 'COP' && !freeOrDonation
        ? Math.round(numericPrice * 1000)
        : numericPrice
      : null;
  const description = (event.about || event.notes || '').trim();
  const streetAddress = (event.location || '').trim();
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title.trim(),
    startDate,
    ...(endDate ? { endDate } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: canonicalUrl,
    location: {
      '@type': 'Place',
      name: venueName || city.heroLocation,
      ...(venueUrl ? { url: venueUrl } : {}),
      address: {
        '@type': 'PostalAddress',
        ...(streetAddress ? { streetAddress } : {}),
        addressLocality: city.name,
        ...(city.region ? { addressRegion: city.region } : {}),
      },
    },
    ...(description ? { description } : {}),
    ...(cleanOrg
      ? {
          organizer: {
            '@type': 'Organization',
            name: cleanOrg,
            ...(organizerUrl ? { url: organizerUrl } : {}),
          },
        }
      : {}),
    ...(resolvedOfferPrice !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: resolvedOfferPrice,
            priceCurrency: priceConfig.currencyCode,
            availability: 'https://schema.org/InStock',
            url: registrationUrl || canonicalUrl,
          },
        }
      : {}),
  };
  return jsonLd;
}